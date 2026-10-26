"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "katex/dist/katex.min.css";
import type {
  CourseSubject,
  SeuGraphNode,
  SeuGraphEdge,
  DiagnoseResponse,
} from "@/types/seu-mvp";
import { GraphCanvas } from "@/components/seu-graph/GraphCanvas";
import { InteractiveMicroClassModal } from "@/components/seu-graph/InteractiveMicroClassModal";
import { MathText } from "@/components/seu-graph/MathText";
import { SeuIntroSplash } from "@/components/seu-graph/SeuIntroSplash";
import { SeuCampusBanner } from "@/components/seu-graph/SeuCampusBanner";
import {
  Sparkles,
  Stethoscope,
  RotateCcw,
  Home,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Loader2,
  Atom,
  Film,
} from "lucide-react";

export default function SeuGraphPage() {
  const [nodes, setNodes] = useState<SeuGraphNode[]>([]);
  const [edges, setEdges] = useState<SeuGraphEdge[]>([]);
  const [selectedSubject, setSelectedSubject] =
    useState<CourseSubject>("math-analysis");
  const [selectedNode, setSelectedNode] = useState<SeuGraphNode | null>(null);

  // 诊断面板状态
  const [questionInput, setQuestionInput] = useState<string>("");
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);
  const [diagnoseResult, setDiagnoseResult] =
    useState<DiagnoseResponse | null>(null);

  // 微课交互弹窗状态
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeModalNode, setActiveModalNode] = useState<SeuGraphNode | null>(
    null
  );

  // 东大校园动图开场动画状态 (首次访问自动展现，支持路演一键重播)
  const [showSplash, setShowSplash] = useState<boolean>(false);

  useEffect(() => {
    // 首次进入自动播放震撼开场动画
    const seen = sessionStorage.getItem("seu_splash_seen");
    if (!seen) {
      setShowSplash(true);
    }
  }, []);

  // 1. 初始化读取图谱数据与本地持久化缓存
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/seu-data/graph-data.json");
        const json = await res.json();
        const initialNodes: SeuGraphNode[] = json.nodes || [];
        const initialEdges: SeuGraphEdge[] = json.edges || [];

        const cached = localStorage.getItem("seu_graph_nodes_cache");
        if (cached) {
          try {
            const parsedCache = JSON.parse(cached) as Record<
              string,
              SeuGraphNode["status"]
            >;
            const restored = initialNodes.map((n) => ({
              ...n,
              status: parsedCache[n.id] || n.status,
            }));
            setNodes(restored);
            setEdges(initialEdges);
            const first = restored.find((n) => n.subject === selectedSubject);
            if (first) setSelectedNode(first);
            return;
          } catch (e) {
            console.warn("Failed to parse cached nodes", e);
          }
        }

        setNodes(initialNodes);
        setEdges(initialEdges);
        const first = initialNodes.find((n) => n.subject === selectedSubject);
        if (first) setSelectedNode(first);
      } catch (err) {
        console.error("Failed to load seu graph data:", err);
      }
    }
    loadData();
  }, []);

  // 切换学科
  const handleSubjectChange = (subject: CourseSubject) => {
    setSelectedSubject(subject);
    const first = nodes.find((n) => n.subject === subject);
    if (first) setSelectedNode(first);
  };

  // 持久化节点状态更新
  const updateNodeStatus = (
    nodeId: string,
    newStatus: "unlearned" | "weak" | "mastered"
  ) => {
    setNodes((prev) => {
      const updated = prev.map((n) =>
        n.id === nodeId ? { ...n, status: newStatus } : n
      );
      const cache: Record<string, SeuGraphNode["status"]> = {};
      updated.forEach((n) => {
        cache[n.id] = n.status;
      });
      localStorage.setItem("seu_graph_nodes_cache", JSON.stringify(cache));
      return updated;
    });

    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    if (activeModalNode && activeModalNode.id === nodeId) {
      setActiveModalNode((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    }
  };

  const handleMasterNode = (nodeId: string) => {
    updateNodeStatus(nodeId, "mastered");
  };

  const handleResetState = async () => {
    localStorage.removeItem("seu_graph_nodes_cache");
    const res = await fetch("/seu-data/graph-data.json");
    const json = await res.json();
    setNodes(json.nodes || []);
    setEdges(json.edges || []);
    setDiagnoseResult(null);
    const first = (json.nodes || []).find(
      (n: SeuGraphNode) => n.subject === selectedSubject
    );
    if (first) setSelectedNode(first);
  };

  const handleDiagnose = async () => {
    if (!questionInput.trim() || isDiagnosing) return;
    setIsDiagnosing(true);
    setDiagnoseResult(null);

    try {
      const res = await fetch("/api/seu-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionInput,
          currentSubject: selectedSubject,
        }),
      });
      const data: DiagnoseResponse = await res.json();
      setDiagnoseResult(data);

      if (data.weakNodeId) {
        updateNodeStatus(data.weakNodeId, "weak");
        const targetNode = nodes.find((n) => n.id === data.weakNodeId);
        if (targetNode) {
          if (targetNode.subject !== selectedSubject) {
            setSelectedSubject(targetNode.subject);
          }
          setSelectedNode(targetNode);
        }
      }
    } catch (err) {
      console.error("Diagnosis error:", err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const currentSubjectNodes = nodes.filter((n) => n.subject === selectedSubject);
  const masteredCount = currentSubjectNodes.filter(
    (n) => n.status === "mastered"
  ).length;
  const progressPercent =
    currentSubjectNodes.length > 0
      ? Math.round((masteredCount / currentSubjectNodes.length) * 100)
      : 0;

  const handleOpenMicroClass = (node: SeuGraphNode) => {
    setActiveModalNode(node);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#080d19] text-slate-100 overflow-hidden font-sans">
      {/* 顶部品牌与控制 Header (防挤压防换行单行排布) */}
      <header className="h-14 flex items-center justify-between px-4 lg:px-6 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-md z-30 shrink-0 gap-3">
        {/* 左侧东大品牌校训标识 */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0">
            <span className="text-amber-400 font-extrabold text-xs tracking-widest">
              至善
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-sm lg:text-base tracking-wide whitespace-nowrap bg-gradient-to-r from-emerald-300 via-emerald-100 to-amber-200 bg-clip-text text-transparent">
              SEU-OpenMAIC · 东大基础课图谱
            </span>
            <span className="hidden xl:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono whitespace-nowrap">
              Solo Master Edition
            </span>
          </div>
        </div>

        {/* 中间双核课程丝滑切换器 Tabs (防折行) */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner shrink-0">
          <button
            onClick={() => handleSubjectChange("math-analysis")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedSubject === "math-analysis"
                ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📘 《工科数学分析（上册）》</span>
          </button>
          <button
            onClick={() => handleSubjectChange("geo-algebra")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              selectedSubject === "geo-algebra"
                ? "bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📐 《几何与代数（周建华第二版）》</span>
          </button>
        </div>

        {/* 右侧掌握度与快捷操作 (防折行与断字) */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* 掌握度指示器 */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800 shrink-0">
            <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
              点亮率:
            </span>
            <div className="w-16 lg:w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 shrink-0">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold font-mono text-emerald-400 whitespace-nowrap">
              {progressPercent}%
            </span>
          </div>

          {/* 🎬 重播开场动画按钮 */}
          <button
            onClick={() => setShowSplash(true)}
            title="重播东南大学全屏开场动画"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition whitespace-nowrap shrink-0"
          >
            <Film className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">开场动图</span>
          </button>

          {/* 重置演示状态 */}
          <button
            onClick={handleResetState}
            title="重置图谱演示状态"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="whitespace-nowrap">重置状态</span>
          </button>

          {/* 返回首页 */}
          <Link
            href="/"
            className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition whitespace-nowrap shrink-0"
          >
            <Home className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">工作台</span>
          </Link>
        </div>
      </header>

      {/* 主体三栏工作台 (各栏固定高度独立平滑滚动) */}
      <div className="flex-1 flex h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* 左侧：🩺 AI 错题靶向诊断中心 (独立纵向滚动) */}
        <section className="w-[340px] flex flex-col bg-slate-950/70 border-r border-slate-800/80 overflow-y-auto p-4 space-y-4 shrink-0 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wide whitespace-nowrap">
              <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI 错题靶向诊断中心</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono whitespace-nowrap">
              四牌楼老教授在诊
            </span>
          </div>

          {/* 3 个一键填入真题胶囊 */}
          <div className="space-y-1.5 shrink-0">
            <span className="text-[11px] text-slate-400 block whitespace-nowrap">
              🎯 快速载入东大高频易错真题：
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() =>
                  setQuestionInput(
                    "【工数真题】求极限 $\\lim_{x \\to 0} \\frac{e^x - 1 - x - \\frac{1}{2}x^2}{x - \\sin x}$。我用泰勒公式把分子展开到了 $x^2$，分母展开到了 $x^3$，结果算出来是 $0$，到底哪里错了？"
                  )
                }
                className="text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-[11px] text-slate-300 hover:text-emerald-300 transition line-clamp-1"
              >
                🔥 [工数] 泰勒展开求高阶无穷小极限错题
              </button>
              <button
                onClick={() =>
                  setQuestionInput(
                    "【几代真题】已知三阶矩阵 $A$ 的特征值为 $1, 2, 3$，求行列式 $|A^2 - 2A + E|$。我不知道怎么把矩阵多项式化为特征值求解，硬算乘法算崩了，可对角化条件也不清楚。"
                  )
                }
                className="text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-[11px] text-slate-300 hover:text-amber-300 transition line-clamp-1"
              >
                🔥 [几代] 周建华教材·矩阵特征值与对角化错题
              </button>
              <button
                onClick={() =>
                  setQuestionInput(
                    "【几代真题】求空间直线 $L: \\frac{x-1}{1} = \\frac{y}{2} = \\frac{z-1}{0}$ 绕 $z$ 轴旋转一周所得空间二次曲面方程，我在消去参数时公式搞错了，不知道如何画截痕草图。"
                  )
                }
                className="text-left p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-[11px] text-slate-300 hover:text-sky-300 transition line-clamp-1"
              >
                🔥 [几代] 空间旋转单叶双曲面方程求解错题
              </button>
            </div>
          </div>

          {/* 错题输入区域 */}
          <div className="space-y-2 shrink-0">
            <textarea
              rows={4}
              placeholder="在此粘贴题目、支持 LaTeX 公式（如 $\lim_{x\to 0}\dots$）..."
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none font-sans"
            />
            <button
              onClick={handleDiagnose}
              disabled={!questionInput.trim() || isDiagnosing}
              className={`w-full py-2 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition active:scale-98 whitespace-nowrap ${
                questionInput.trim() && !isDiagnosing
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/40"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isDiagnosing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>四牌楼老教授正在深入会诊中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>⚡ AI 靶向诊断薄弱节点</span>
                </>
              )}
            </button>
          </div>

          {/* 诊断结果报告卡片 */}
          {diagnoseResult && (
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/60 shadow-lg space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5 whitespace-nowrap">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> 诊断薄弱卡点已锁定
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/60 text-rose-200 font-mono whitespace-nowrap">
                  {diagnoseResult.weakNodeId}
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-200">
                出处：
                <span className="text-emerald-300 font-mono">
                  {diagnoseResult.textbookSource}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-900/40 text-xs text-rose-200 leading-relaxed font-sans">
                <strong className="text-rose-400 block mb-0.5">错因本质：</strong>
                <MathText text={diagnoseResult.reason} />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-900/40 text-xs text-amber-200 leading-relaxed font-sans">
                <strong className="text-amber-400 block mb-0.5">学长防坑秘籍：</strong>
                <MathText text={diagnoseResult.seniorAdvice} />
              </div>

              <button
                onClick={() => {
                  const nodeToOpen = nodes.find(
                    (n) => n.id === diagnoseResult.weakNodeId
                  );
                  if (nodeToOpen) handleOpenMicroClass(nodeToOpen);
                }}
                className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 mt-1 whitespace-nowrap"
              >
                <span>🚀 立即进入 3 页靶向急救微课</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          )}
        </section>

        {/* 中间：🌌 交互式知识图谱可视化画布与校园风物横幅 */}
        <section className="flex-1 relative flex flex-col overflow-hidden bg-slate-950">
          {/* 东南大学校园风物与教材名片横幅 */}
          <SeuCampusBanner
            selectedSubject={selectedSubject}
            onReplayIntro={() => setShowSplash(true)}
          />

          {/* 图谱画布主区 */}
          <div className="flex-1 relative p-3 overflow-hidden">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              selectedSubject={selectedSubject}
              selectedNodeId={selectedNode?.id || null}
              onSelectNode={setSelectedNode}
              onOpenMicroClass={handleOpenMicroClass}
            />
          </div>
        </section>

        {/* 右侧：📖 节点详情与靶向通关舱 (独立纵向滚动，底部秘籍不截断) */}
        <section className="w-[380px] flex flex-col bg-slate-950/70 border-l border-slate-800/80 overflow-y-auto p-4 space-y-4 shrink-0 scrollbar-thin scrollbar-thumb-slate-800">
          {selectedNode ? (
            <div className="flex flex-col space-y-4">
              {/* 头部标题与教材章节 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono whitespace-nowrap">
                    {selectedNode.textbookRef}
                  </span>
                  <span className="text-xs text-amber-400 font-mono whitespace-nowrap">
                    难度：{"★".repeat(selectedNode.difficulty)}
                  </span>
                </div>
                <h2 className="text-base lg:text-lg font-bold text-white tracking-wide">
                  {selectedNode.label}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedNode.englishLabel}
                </p>
              </div>

              {/* 状态徽标 */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shrink-0">
                <span className="text-slate-400 whitespace-nowrap">掌握状态：</span>
                {selectedNode.status === "mastered" ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> 已掌握点亮 (Mastered)
                  </span>
                ) : selectedNode.status === "weak" ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1 animate-pulse whitespace-nowrap">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> 薄弱卡点 (Weak Spot)
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium whitespace-nowrap">
                    待解锁学习 (Unlearned)
                  </span>
                )}
              </div>

              {/* 定理精要 (KaTeX 真实渲染) */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                <div className="text-emerald-400 font-semibold flex items-center gap-1 whitespace-nowrap">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>核心定理精要</span>
                </div>
                <MathText text={selectedNode.summary} className="text-slate-200" />
              </div>

              {/* 关联期末真题 (KaTeX 真实渲染) */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                <div className="text-amber-400 font-semibold flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>东大历年期末真题</span>
                </div>
                <MathText text={selectedNode.examQuestion} className="text-amber-200/95" />
              </div>

              {/* 智能体伴学点拨与口诀 (KaTeX 真实渲染) */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
                <div>
                  <span className="text-emerald-400 font-semibold block mb-1 whitespace-nowrap">
                    👨‍🏫 四牌楼老教授：
                  </span>
                  <MathText text={selectedNode.professorTip} className="text-slate-300" />
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-amber-400 font-semibold block mb-1 whitespace-nowrap">
                    🧑‍🎓 九龙湖学长秘籍：
                  </span>
                  <MathText text={selectedNode.seniorSecret} className="text-slate-300" />
                </div>
              </div>

              {/* 核心操作按钮 */}
              <div className="pt-2 space-y-2 pb-4">
                <button
                  onClick={() => handleOpenMicroClass(selectedNode)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition active:scale-98 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Atom className="w-4 h-4 shrink-0" />
                  <span>🎓 开启多智能体仿真微课（含 HTML 实验）</span>
                </button>

                <button
                  onClick={() => handleMasterNode(selectedNode.id)}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-900/60 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>✅ 一键模拟变式通关（点亮为东大绿）</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600" />
              <span>点击画布上的任意节点查看考点精要</span>
            </div>
          )}
        </section>
      </div>

      {/* 内置多智能体微课剧场弹窗 */}
      <InteractiveMicroClassModal
        node={activeModalNode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMasterNode={handleMasterNode}
      />

      {/* 沉浸式东南大学全屏开场动画 (Splash Intro) */}
      {showSplash && (
        <SeuIntroSplash
          onEnter={() => {
            sessionStorage.setItem("seu_splash_seen", "true");
            setShowSplash(false);
          }}
          forceShow={showSplash}
        />
      )}
    </div>
  );
}
