"use client";

import React, { useState } from "react";
import type { CourseSubject } from "@/types/seu-mvp";
import {
  Landmark,
  Building2,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  GraduationCap,
  Trees,
} from "lucide-react";

interface SeuCampusBannerProps {
  selectedSubject: CourseSubject;
  onReplayIntro?: () => void;
}

export function SeuCampusBanner({
  selectedSubject,
  onReplayIntro,
}: SeuCampusBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  // 两个学科对应的不同校区与教材配置
  const config =
    selectedSubject === "math-analysis"
      ? {
          campusName: "四牌楼校区 · 历史文脉中枢",
          landmark: "大礼堂 · 涌泉池 · 六朝松 · 中央大道梧桐",
          badge: "工科数学分析 · 百廿传承",
          quote: "六朝松下听微积，大礼堂前证至善",
          heroImg: "/seu-assets/sipailou.jpg",
          altImg: "/seu-assets/sipailou-trees.jpg",
          textbookTitle: "《工科数学分析（上册）》",
          textbookAuthor: "东南大学数学学院 编 · 高等教育出版社",
          textbookColor: "from-emerald-800 via-emerald-900 to-slate-950",
          agentTitle: "四牌楼资深教授 Agent",
          agentSub: "执教30载 · 严谨推演",
          agentAvatar: "👨‍🏫",
        }
      : {
          campusName: "九龙湖校区 · 现代创新中枢",
          landmark: "李文正图书馆 · 焦廷标馆 · 湖畔数理大厦",
          badge: "几何与代数 · 空间映射",
          quote: "九龙湖畔数理融，矩阵变换通天地",
          heroImg: "/seu-assets/jiulonghu.jpg",
          altImg: "/seu-assets/jiulonghu-gym.jpg",
          textbookTitle: "《几何与代数（第二版）》",
          textbookAuthor: "周建华 等编 · 东南大学出版社",
          textbookColor: "from-amber-800 via-amber-900 to-slate-950",
          agentTitle: "九龙湖满绩学长 Agent",
          agentSub: "高分保研 · 考点防坑",
          agentAvatar: "🧑‍🎓",
        };

  // 折叠时的轻量紧凑条
  if (isCollapsed) {
    return (
      <div className="w-full px-4 py-1.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-emerald-300">东大风物：</span>
          <span className="font-mono text-slate-300">{config.campusName}</span>
          <span className="text-slate-500">|</span>
          <span className="text-amber-400 font-mono">{config.textbookTitle}</span>
        </div>

        <div className="flex items-center gap-2">
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="px-2 py-0.5 rounded text-[11px] bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 flex items-center gap-1"
            >
              <span>🎬 开场动画</span>
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
          >
            <span>展开风物与教材名片</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-[#02180e] via-[#05131c] to-[#0b101c] border-b border-emerald-500/30 px-4 py-2.5 shadow-lg relative overflow-hidden shrink-0">
      {/* 背景微弱暗纹 */}
      <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* 左侧：校园实景视窗与名牌 */}
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          {/* 照片窗口 */}
          <div className="relative w-28 h-18 md:w-36 md:h-20 rounded-xl overflow-hidden border border-amber-400/50 shadow-md bg-slate-900 shrink-0 group">
            {!imgError[config.heroImg] ? (
              <img
                src={activePhotoIdx === 0 ? config.heroImg : config.altImg}
                alt={config.landmark}
                onError={() => setImgError((prev) => ({ ...prev, [config.heroImg]: true }))}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-950/70 p-2 text-center">
                <Landmark className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-[10px] text-emerald-300 font-mono">SEU LANDMARK</span>
              </div>
            )}

            {/* 图片切换小胶囊 */}
            <button
              onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? 1 : 0))}
              title="切换校区实景视角"
              className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] text-amber-300 border border-amber-400/40 opacity-80 hover:opacity-100 transition"
            >
              切图
            </button>
          </div>

          {/* 地标铭牌与寄语 */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                {selectedSubject === "math-analysis" ? (
                  <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{config.campusName}</span>
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono">
                {config.badge}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-sans">
              地标：{config.landmark}
            </div>
            <div className="text-[11px] text-amber-300/90 font-mono italic mt-0.5">
              “{config.quote}”
            </div>
          </div>
        </div>

        {/* 中右侧：3D 立体教材封面与名师伴学陈列 */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-end">
          {/* 立体书封 */}
          <div className="flex items-center gap-2.5 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
            {/* 拟物书脊效果 */}
            <div
              className={`w-10 h-14 rounded-r-md bg-gradient-to-br ${config.textbookColor} border-l-4 border-amber-400 shadow-lg flex flex-col justify-between p-1 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform`}
            >
              <div className="text-[8px] font-bold text-amber-300 leading-tight">
                东大
                <br />
                教材
              </div>
              <div className="text-[7px] text-slate-300 font-mono">SEU</div>
            </div>

            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-emerald-400" />
                <span>{config.textbookTitle}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {config.textbookAuthor}
              </div>
            </div>
          </div>

          {/* 名师智能体徽章 */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
            <span className="text-xl">{config.agentAvatar}</span>
            <div>
              <div className="text-xs font-semibold text-emerald-300">
                {config.agentTitle}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {config.agentSub}
              </div>
            </div>
          </div>

          {/* 操作按钮区 */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition flex items-center gap-1 whitespace-nowrap"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>重播开场</span>
              </button>
            )}

            <button
              onClick={() => setIsCollapsed(true)}
              title="折叠横幅"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
