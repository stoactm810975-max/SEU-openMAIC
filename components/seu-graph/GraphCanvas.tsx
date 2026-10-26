"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { SeuGraphNode, SeuGraphEdge, CourseSubject } from "@/types/seu-mvp";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Maximize2,
} from "lucide-react";

interface GraphCanvasProps {
  nodes: SeuGraphNode[];
  edges: SeuGraphEdge[];
  selectedSubject: CourseSubject;
  selectedNodeId: string | null;
  onSelectNode: (node: SeuGraphNode) => void;
  onOpenMicroClass: (node: SeuGraphNode) => void;
}

const NODE_WIDTH = 210;
const NODE_HEIGHT = 86;

export function GraphCanvas({
  nodes,
  edges,
  selectedSubject,
  selectedNodeId,
  onSelectNode,
  onOpenMicroClass,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 画布视口缩放与平移
  const [scale, setScale] = useState<number>(0.9);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 30, y: 30 });
  const [isPanning, setIsPanning] = useState(false);

  // 节点动态坐标映射
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // 交互状态跟踪 Refs（避免频繁 re-render 导致拖拽抖动）
  const panStartRef = useRef<{ clientX: number; clientY: number; initialPanX: number; initialPanY: number } | null>(null);
  const nodeDragRef = useRef<{
    nodeId: string;
    startClientX: number;
    startClientY: number;
    startNodeX: number;
    startNodeY: number;
    hasMoved: boolean;
  } | null>(null);

  // 初始化节点坐标
  useEffect(() => {
    const posMap: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      posMap[n.id] = { ...n.position };
    });
    setNodePositions(posMap);
  }, [nodes]);

  // 当前学科节点与连线
  const currentNodes = nodes.filter((n) => n.subject === selectedSubject);
  const currentNodeIds = new Set(currentNodes.map((n) => n.id));
  const currentEdges = edges.filter(
    (e) =>
      e.subject === selectedSubject &&
      currentNodeIds.has(e.source) &&
      currentNodeIds.has(e.target)
  );

  // ==========================================
  // 视口自适应居中算法 (Fit View)
  // ==========================================
  const handleFitView = useCallback(() => {
    if (!containerRef.current || currentNodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cWidth = rect.width;
    const cHeight = rect.height;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    currentNodes.forEach((n) => {
      const pos = nodePositions[n.id] || n.position;
      if (pos.x < minX) minX = pos.x;
      if (pos.x + NODE_WIDTH > maxX) maxX = pos.x + NODE_WIDTH;
      if (pos.y < minY) minY = pos.y;
      if (pos.y + NODE_HEIGHT > maxY) maxY = pos.y + NODE_HEIGHT;
    });

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    // 预留边距
    const margin = 50;
    const availableW = Math.max(100, cWidth - margin * 2);
    const availableH = Math.max(100, cHeight - margin * 2);

    const fitScale = Math.min(
      1.15,
      Math.max(0.65, Math.min(availableW / contentW, availableH / contentH))
    );

    const fitPanX = (cWidth - contentW * fitScale) / 2 - minX * fitScale;
    const fitPanY = (cHeight - contentH * fitScale) / 2 - minY * fitScale;

    setScale(Number(fitScale.toFixed(2)));
    setPanOffset({ x: Math.round(fitPanX), y: Math.round(fitPanY) });
  }, [currentNodes, nodePositions]);

  // 当切换学科或容器尺寸改变时，执行自适应居中
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitView();
    }, 60);
    return () => clearTimeout(timer);
  }, [selectedSubject]);

  // ==========================================
  // 画布平移 (Pan) 状态机
  // ==========================================
  const handleBgMouseDown = (e: React.MouseEvent) => {
    // 仅响应鼠标左键且在空白背景处按下
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y,
    };
  };

  // ==========================================
  // 单个节点拖拽 (Node Drag) 状态机
  // ==========================================
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation(); // 阻止背景画布平移
    if (e.button !== 0) return;

    const currentPos = nodePositions[nodeId] || { x: 0, y: 0 };
    nodeDragRef.current = {
      nodeId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startNodeX: currentPos.x,
      startNodeY: currentPos.y,
      hasMoved: false,
    };
  };

  // 全局 Window MouseMove / MouseUp 监听，确保鼠标滑出组件依然平滑跟手
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      // 1. 处理节点拖拽
      if (nodeDragRef.current) {
        const drag = nodeDragRef.current;
        const dx = e.clientX - drag.startClientX;
        const dy = e.clientY - drag.startClientY;

        if (Math.hypot(dx, dy) > 4) {
          drag.hasMoved = true;
        }

        if (drag.hasMoved) {
          // 关键算法：位移增量必须除以 scale，确保在任何缩放比例下 100% 像素级对齐跟手
          const actualDx = dx / scale;
          const actualDy = dy / scale;
          setNodePositions((prev) => ({
            ...prev,
            [drag.nodeId]: {
              x: Math.round(drag.startNodeX + actualDx),
              y: Math.round(drag.startNodeY + actualDy),
            },
          }));
        }
        return;
      }

      // 2. 处理画布平移
      if (panStartRef.current) {
        const pan = panStartRef.current;
        const dx = e.clientX - pan.clientX;
        const dy = e.clientY - pan.clientY;
        setPanOffset({
          x: Math.round(pan.initialPanX + dx),
          y: Math.round(pan.initialPanY + dy),
        });
      }
    };

    const handleWindowMouseUp = () => {
      // 若处于节点点击，且未产生拖拽移动（位移 < 4px），触发选中操作
      if (nodeDragRef.current) {
        const drag = nodeDragRef.current;
        if (!drag.hasMoved) {
          const targetNode = nodes.find((n) => n.id === drag.nodeId);
          if (targetNode) {
            onSelectNode(targetNode);
          }
        }
        nodeDragRef.current = null;
      }

      setIsPanning(false);
      panStartRef.current = null;
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [scale, nodes, onSelectNode]);

  // ==========================================
  // 鼠标滚轮以光标为中心缩放 (Zoom toward Cursor)
  // ==========================================
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newScale = Math.min(1.8, Math.max(0.5, Number((scale * zoomFactor).toFixed(2))));

    // 以鼠标光标位置为不动点进行缩放计算
    const newPanX = cursorX - (cursorX - panOffset.x) * (newScale / scale);
    const newPanY = cursorY - (cursorY - panOffset.y) * (newScale / scale);

    setScale(newScale);
    setPanOffset({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  // 缩放按钮交互
  const handleZoomIn = () => setScale((s) => Math.min(1.8, Number((s + 0.15).toFixed(2))));
  const handleZoomOut = () => setScale((s) => Math.max(0.5, Number((s - 0.15).toFixed(2))));

  return (
    <div
      ref={containerRef}
      onMouseDown={handleBgMouseDown}
      onWheel={handleWheel}
      className={`relative w-full h-full min-h-[500px] bg-[#070b14] overflow-hidden rounded-2xl border border-slate-800/80 select-none ${
        isPanning ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(0, 102, 51, 0.09) 0%, transparent 65%),
          radial-gradient(circle, #1e293b 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 28px 28px",
      }}
    >
      {/* 动态受控视口容器（平移与缩放） */}
      <div
        className="absolute top-0 left-0 w-full h-full origin-top-left pointer-events-none"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
        }}
      >
        {/* SVG 有向连线层 */}
        <svg className="absolute inset-0 w-[2000px] h-[1500px] overflow-visible pointer-events-none">
          <defs>
            <marker
              id="arrow-green"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker
              id="arrow-rose"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>

            <filter id="glow-edge" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 绘制动态贝塞尔连线 */}
          {currentEdges.map((edge) => {
            const srcPos = nodePositions[edge.source] || { x: 0, y: 0 };
            const tgtPos = nodePositions[edge.target] || { x: 0, y: 0 };

            // 动态锚点计算：根据两节点相对位置选择最优连线锚点
            const isTargetRight = tgtPos.x >= srcPos.x;
            const sx = isTargetRight ? srcPos.x + NODE_WIDTH : srcPos.x;
            const sy = srcPos.y + NODE_HEIGHT / 2;
            const tx = isTargetRight ? tgtPos.x : tgtPos.x + NODE_WIDTH;
            const ty = tgtPos.y + NODE_HEIGHT / 2;

            const dx = Math.max(35, Math.abs(tx - sx) * 0.45);
            const pathD = `M ${sx} ${sy} C ${sx + (isTargetRight ? dx : -dx)} ${sy}, ${
              tx + (isTargetRight ? -dx : dx)
            } ${ty}, ${tx} ${ty}`;

            const midX = (sx + tx) / 2;
            const midY = (sy + ty) / 2 - 12;

            const targetNode = nodes.find((n) => n.id === edge.target);
            const isWeakTarget = targetNode?.status === "weak";

            return (
              <g key={edge.id}>
                {/* 发光底纹 */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isWeakTarget ? "rgba(244, 63, 94, 0.25)" : "rgba(16, 185, 129, 0.2)"}
                  strokeWidth="5"
                />
                {/* 动态虚线流动动画 */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isWeakTarget ? "#f43f5e" : "#10b981"}
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  markerEnd={isWeakTarget ? "url(#arrow-rose)" : "url(#arrow-green)"}
                  filter="url(#glow-edge)"
                  className="animate-[dash_25s_linear_infinite]"
                  style={{ strokeDashoffset: 100 }}
                />
                {/* 连线关系胶囊标签：置于连线上方，带有高对比度底色防遮挡 */}
                <foreignObject
                  x={midX - 55}
                  y={midY - 11}
                  width={110}
                  height={24}
                  className="overflow-visible pointer-events-none"
                >
                  <div className="flex items-center justify-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#070b14] border border-emerald-500/40 text-[10px] text-emerald-300 font-mono shadow-xl backdrop-blur-md whitespace-nowrap">
                      {edge.relation}
                    </span>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* 节点 DOM 卡片层 */}
        {currentNodes.map((node) => {
          const pos = nodePositions[node.id] || node.position;
          const isSelected = selectedNodeId === node.id;
          const isWeak = node.status === "weak";
          const isMastered = node.status === "mastered";

          let cardBorder = "border-slate-800 bg-slate-900/90 hover:border-slate-700";
          let badgeColor = "bg-slate-800 text-slate-400";

          if (isWeak) {
            cardBorder =
              "border-rose-500 bg-rose-950/75 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse ring-2 ring-rose-500/40";
            badgeColor = "bg-rose-500/20 text-rose-300 border border-rose-500/50";
          } else if (isMastered) {
            cardBorder =
              "border-emerald-500/80 bg-emerald-950/55 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:border-emerald-400";
            badgeColor = "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
          }

          if (isSelected) {
            cardBorder += " ring-2 ring-amber-400";
          }

          return (
            <div
              key={node.id}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                position: "absolute",
                width: `${NODE_WIDTH}px`,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              className={`pointer-events-auto rounded-xl border p-3 cursor-move backdrop-blur-md transition-shadow select-none shadow-xl ${cardBorder}`}
            >
              {/* 薄弱卡点警示徽标 */}
              {isWeak && (
                <div className="absolute -top-3.5 left-3 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-lg flex items-center gap-1 animate-bounce">
                  <AlertTriangle className="w-3 h-3" />
                  <span>薄弱卡点·急需突破</span>
                </div>
              )}

              {/* 已点亮徽标 */}
              {isMastered && (
                <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-semibold flex items-center gap-0.5 shadow">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>已点亮</span>
                </div>
              )}

              {/* 章节与难度星级 */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium truncate max-w-[130px] ${badgeColor}`}
                >
                  {node.textbookRef.split("》")[1] || node.textbookRef}
                </span>
                <span className="text-[10px] text-amber-400 font-mono tracking-tighter">
                  {"★".repeat(node.difficulty)}
                </span>
              </div>

              {/* 知识点名称 */}
              <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                {node.label}
              </div>

              {/* 卡片底栏：微课按钮 */}
              <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">
                  {node.englishLabel}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMicroClass(node);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 transition-colors"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span>微课</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 左下角视口悬浮控制栏 */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-1.5 rounded-xl shadow-2xl">
        <button
          onClick={handleZoomIn}
          title="放大画布"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="缩小画布"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitView}
          title="居中自适应视图 (Fit View)"
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-800 mx-1" />
        <span className="text-[11px] font-mono text-emerald-400 px-1.5 font-bold">
          {Math.round(scale * 100)}%
        </span>
      </div>

      {/* 右下角图例 */}
      <div className="absolute bottom-4 right-4 z-20 hidden md:flex items-center gap-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span className="text-emerald-300">已点亮掌握</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
          <span className="text-rose-300 font-bold">薄弱卡点</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span>
          <span className="text-slate-400">待解锁</span>
        </div>
      </div>
    </div>
  );
}
