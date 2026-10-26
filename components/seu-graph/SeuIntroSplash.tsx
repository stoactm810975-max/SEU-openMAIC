"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ChevronRight,
  Play,
  Volume2,
  VolumeX,
  Compass,
  GraduationCap,
  Trees,
  Landmark,
  Building2,
  Film,
  X,
} from "lucide-react";

interface SeuIntroSplashProps {
  onEnter: () => void;
  forceShow?: boolean;
}

export function SeuIntroSplash({ onEnter, forceShow = false }: SeuIntroSplashProps) {
  const [sceneIndex, setSceneIndex] = useState<number>(0);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [skipCountdown, setSkipCountdown] = useState<number>(8);
  const [useRealPhoto, setUseRealPhoto] = useState<boolean>(true);
  const [imgLoadFailed, setImgLoadFailed] = useState<Record<string, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 场景定义
  const scenes = [
    {
      id: "sipailou",
      name: "四牌楼·大礼堂光影",
      enName: "Sipailou Auditorium & Spring Pool",
      photoSrc: "/seu-assets/sipailou.jpg",
      introSrc: "/seu-assets/seu-intro.jpg",
      quote: "以科学名世，以人才报国 · 六朝松下推演微积分真谛",
      tag: "🏛️ 国家重点文保建筑 · 罗马式大穹顶与涌泉池",
    },
    {
      id: "jiulonghu",
      name: "九龙湖·李文正馆全景",
      enName: "Jiulonghu Li Wenzheng Library",
      photoSrc: "/seu-assets/jiulonghu.jpg",
      introSrc: "/seu-assets/jiulonghu-gym.jpg",
      quote: "止于至善 · 现代建筑几何构筑代数空间",
      tag: "🌊 亚洲单体最大高校图书馆之一 · 湖畔全息智慧",
    },
    {
      id: "trees",
      name: "六朝松与中央大道梧桐",
      enName: "Millennium Pine & Plane Tree Avenue",
      photoSrc: "/seu-assets/sipailou-trees.jpg",
      introSrc: "/seu-assets/sipailou.jpg",
      quote: "千载文脉传古今 · 梧桐树荫下的国家一流课",
      tag: "🌲 千年六朝松灵秀 · 中央大道金秋梧桐雨",
    },
  ];

  // 自动轮播场景
  useEffect(() => {
    const timer = setInterval(() => {
      setSceneIndex((prev) => (prev + 1) % scenes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [scenes.length]);

  // 倒计时
  useEffect(() => {
    if (skipCountdown <= 0) {
      handleTriggerEnter();
      return;
    }
    const cd = setInterval(() => {
      setSkipCountdown((c) => c - 1);
    }, 1000);
    return () => clearInterval(cd);
  }, [skipCountdown]);

  // Canvas 背景微积分曲线与矩阵网格流动粒子
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 粒子群
    const particles: { x: number; y: number; speed: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 0.7,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.6,
      });
    }

    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制流动的微积分曲线 (sin/cos 复合波浪，东大金与东大绿发光)
      const cy = canvas.height * 0.75;

      // 曲线 1: 工科高数微积分波
      ctx.beginPath();
      ctx.strokeStyle = "rgba(16, 185, 129, 0.18)";
      ctx.lineWidth = 2;
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = cy + Math.sin(x * 0.004 + t) * 45 + Math.cos(x * 0.008 - t * 0.5) * 25;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 曲线 2: 几何与代数特征流动波
      ctx.beginPath();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.18)";
      ctx.lineWidth = 2;
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = cy + Math.cos(x * 0.005 - t * 0.8) * 40 + Math.sin(x * 0.003 + t) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 飘落的金色梧桐叶粒子
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += Math.sin(t + p.y * 0.02) * 0.5;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = `rgba(243, 152, 0, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 执行进入转场动画
  const handleTriggerEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 700);
  };

  const currentScene = scenes[sceneIndex];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-[#002b15] via-[#051810] to-[#020806] text-slate-100 transition-all duration-700 select-none ${
        isExiting
          ? "opacity-0 scale-105 pointer-events-none filter blur-sm"
          : "opacity-100 scale-100"
      }`}
    >
      {/* 背景动态 Canvas 流光 */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* 四角传统古典金色折线装饰边框 */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 pointer-events-none z-10" />
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-400/60 pointer-events-none z-10" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-400/60 pointer-events-none z-10" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 pointer-events-none z-10" />

      {/* 顶部状态栏与跳过倒计时按钮 */}
      <div className="w-full max-w-6xl px-6 pt-5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          {/* 精致东南大学双环校徽 SVG */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-950/80 border-2 border-amber-400/70 shadow-[0_0_15px_rgba(243,152,0,0.4)]">
            <svg viewBox="0 0 100 100" className="w-7 h-7">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#F39800" strokeWidth="3" />
              <circle cx="50" cy="50" r="38" fill="none" stroke="#006633" strokeWidth="2" strokeDasharray="4 2" />
              <polygon points="50,18 20,74 80,74" fill="none" stroke="#F39800" strokeWidth="3" />
              <circle cx="50" cy="38" r="6" fill="#F39800" />
              <rect x="42" y="50" width="16" height="18" fill="none" stroke="#F39800" strokeWidth="2.5" />
              <text x="50" y="87" fill="#F39800" fontSize="10" textAnchor="middle" fontFamily="serif" fontWeight="bold">
                1902
              </text>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold tracking-widest text-white flex items-center gap-2">
              <span>SOUTHEAST UNIVERSITY</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-mono">
                止于至善
              </span>
            </div>
            <div className="text-[11px] text-amber-400/90 tracking-wider font-mono">
              国家“双一流”建设高校 · 百廿学府名师微课
            </div>
          </div>
        </div>

        <button
          onClick={handleTriggerEnter}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-400/50 hover:border-amber-400 text-xs font-mono text-amber-300 shadow-lg backdrop-blur-md transition group"
        >
          <span>跳过动画 ({skipCountdown}s)</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 核心视觉中心：东大校园动图与光影预览画框 (16:9) */}
      <div className="w-full max-w-4xl px-4 flex flex-col items-center z-20 my-auto">
        {/* 画框顶部胶片切换标签 */}
        <div className="flex items-center gap-2 mb-3 bg-slate-950/70 p-1 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md">
          {scenes.map((s, idx) => {
            const active = sceneIndex === idx;
            return (
              <button
                key={s.id}
                onClick={() => setSceneIndex(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold shadow-md scale-102"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                {idx === 0 && <Landmark className="w-3.5 h-3.5 text-amber-300" />}
                {idx === 1 && <Building2 className="w-3.5 h-3.5 text-sky-300" />}
                {idx === 2 && <Trees className="w-3.5 h-3.5 text-emerald-300" />}
                <span>{s.name}</span>
              </button>
            );
          })}

          <div className="w-[1px] h-4 bg-slate-800 mx-1" />

          {/* 模式切换：实景照片 vs 动态艺术画卷 */}
          <button
            onClick={() => setUseRealPhoto(!useRealPhoto)}
            title="切换真实照片与动态艺术画卷"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-500/30"
          >
            <Film className="w-3.5 h-3.5" />
            <span>{useRealPhoto ? "📷 实景照片" : "🎨 艺术画卷"}</span>
          </button>
        </div>

        {/* 16:9 光影预览画框 */}
        <div className="relative w-full aspect-[16/9] max-h-[420px] rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-[0_0_50px_rgba(243,152,0,0.25)] bg-[#03110a] group">
          {/* 模式 A：展示东大真实照片/动图 */}
          {useRealPhoto && !imgLoadFailed[currentScene.id] ? (
            <div className="relative w-full h-full">
              <img
                src={currentScene.photoSrc}
                alt={currentScene.name}
                onError={() => {
                  setImgLoadFailed((prev) => ({ ...prev, [currentScene.id]: true }));
                }}
                className="w-full h-full object-cover animate-in fade-in duration-700 transform group-hover:scale-105 transition-transform duration-1000"
              />
              {/* 电影级微光暗角滤镜 */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 pointer-events-none" />
            </div>
          ) : (
            /* 模式 B：超精细纯 SVG + CSS 动态校园艺术动图 (Cinemagraph) */
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#021d10] to-[#040e08]">
              {sceneIndex === 0 && <SipailouAuditoriumSvg />}
              {sceneIndex === 1 && <JiulonghuLibrarySvg />}
              {sceneIndex === 2 && <MillenniumPineSvg />}
            </div>
          )}

          {/* 画框左下角：地标名牌与名言 */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between z-10 pointer-events-none">
            <div className="p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-amber-400/40 shadow-xl max-w-[85%]">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentScene.tag}</span>
              </div>
              <div className="text-xs text-slate-200 tracking-wide font-sans leading-relaxed">
                “{currentScene.quote}”
              </div>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-1 rounded-md border border-emerald-500/30">
                SEU · CAMPUS SCENE {sceneIndex + 1}/3
              </span>
            </div>
          </div>
        </div>

        {/* 电影字幕级大字：止于至善与主副标题 */}
        <div className="mt-5 text-center space-y-2">
          <div className="text-amber-400 text-xl md:text-2xl font-extrabold tracking-[0.4em] drop-shadow-[0_0_20px_rgba(243,152,0,0.6)] font-serif animate-pulse">
            止 于 至 善
          </div>
          <div className="text-[10px] text-amber-200/70 tracking-[0.3em] font-mono">
            STRIVE FOR PERFECTION · SINCE 1902
          </div>
          <h1 className="text-base md:text-xl font-bold tracking-wider text-white">
            东南大学 · 硬核基础课交互式知识图谱与多智能体伴学平台
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono">
              🏛️ 四牌楼 × 九龙湖双校区
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono">
              📘 《工科数学分析（上册）》
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono">
              📐 周建华《几何与代数（第二版）》
            </span>
          </div>
        </div>
      </div>

      {/* 底部交互大按钮：步入东大伴学中枢 */}
      <div className="w-full max-w-md px-6 pb-6 z-20">
        <button
          onClick={handleTriggerEnter}
          className="w-full group relative flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white font-bold text-sm tracking-wider shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-98 overflow-hidden"
        >
          {/* 金色流光扫光特效 */}
          <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
          <GraduationCap className="w-5 h-5 text-amber-200" />
          <span>步入东大智慧伴学中枢 (Enter SEU Classroom)</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 动态艺术画卷 1：四牌楼大礼堂与爱奥尼克柱式
// ==========================================
function SipailouAuditoriumSvg() {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full">
      <defs>
        <radialGradient id="sky-glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#0a3d24" />
          <stop offset="100%" stopColor="#021208" />
        </radialGradient>
        <linearGradient id="dome-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#006633" />
        </linearGradient>
      </defs>

      <rect width="800" height="450" fill="url(#sky-glow)" />

      {/* 远景金色微积分光环 */}
      <circle cx="400" cy="180" r="160" fill="none" stroke="#f39800" strokeWidth="1" opacity="0.25" strokeDasharray="6 4" />
      <circle cx="400" cy="180" r="190" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.2" />

      {/* 大礼堂穹顶 */}
      <path d="M 280 200 C 280 110, 520 110, 520 200 Z" fill="url(#dome-gold)" opacity="0.85" />
      {/* 穹顶顶端小亭 */}
      <rect x="388" y="90" width="24" height="25" fill="#f39800" />
      <polygon points="384,90 400,75 416,90" fill="#ffd700" />

      {/* 三角形山墙 */}
      <polygon points="250,200 400,150 550,200" fill="#032616" stroke="#f39800" strokeWidth="2.5" />
      {/* 门头文字 */}
      <text x="400" y="190" fill="#f39800" fontSize="11" textAnchor="middle" fontFamily="serif" fontWeight="bold">
        SEU AUDITORIUM · 四牌楼大礼堂
      </text>

      {/* 爱奥尼克大柱廊 */}
      {[290, 335, 380, 420, 465, 510].map((x, i) => (
        <g key={i}>
          <rect x={x - 8} y="200" width="16" height="110" fill="#083822" stroke="#10b981" strokeWidth="1.5" />
          {/* 柱头涡卷 */}
          <circle cx={x - 7} cy="204" r="3.5" fill="#f39800" />
          <circle cx={x + 7} cy="204" r="3.5" fill="#f39800" />
        </g>
      ))}

      {/* 礼堂基座台阶 */}
      <rect x="230" y="310" width="340" height="25" fill="#042013" stroke="#f39800" strokeWidth="1.5" />

      {/* 前景涌泉池 (水波微澜动画) */}
      <ellipse cx="400" cy="385" rx="280" ry="45" fill="#052c1a" stroke="#10b981" strokeWidth="2" opacity="0.9" />
      <ellipse cx="400" cy="385" rx="240" ry="32" fill="#0a442a" opacity="0.6" />
      <ellipse cx="400" cy="385" rx="180" ry="20" fill="#125937" opacity="0.4" />

      {/* 涌泉喷水柱 */}
      <path d="M 400 370 Q 385 300 400 280 Q 415 300 400 370 Z" fill="#6ee7b7" opacity="0.8" />
      <circle cx="400" cy="275" r="4" fill="#a7f3d0" />
    </svg>
  );
}

// ==========================================
// 动态艺术画卷 2：九龙湖李文正图书馆
// ==========================================
function JiulonghuLibrarySvg() {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full">
      <defs>
        <radialGradient id="lib-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#052438" />
          <stop offset="100%" stopColor="#020e17" />
        </radialGradient>
      </defs>

      <rect width="800" height="450" fill="url(#lib-bg)" />

      {/* 现代几何折线全息光 */}
      <polygon points="180,310 220,180 580,180 620,310" fill="#083049" stroke="#38bdf8" strokeWidth="2.5" />
      <polygon points="250,180 280,130 520,130 550,180" fill="#0e4466" stroke="#f59e0b" strokeWidth="2" />

      {/* 几何百叶窗矩阵 */}
      {[240, 300, 360, 420, 480, 540].map((x, i) => (
        <line key={i} x1={x} y1="190" x2={x} y2="300" stroke="#0ea5e9" strokeWidth="2" opacity="0.6" />
      ))}

      {/* 九龙湖水面投影倒影 */}
      <rect x="0" y="320" width="800" height="130" fill="#041824" />
      <ellipse cx="400" cy="370" rx="350" ry="40" fill="#072b40" opacity="0.8" />
      <text x="400" y="420" fill="#38bdf8" fontSize="12" textAnchor="middle" fontFamily="mono" opacity="0.7">
        JIULONGHU · LI WENZHENG LIBRARY
      </text>
    </svg>
  );
}

// ==========================================
// 动态艺术画卷 3：六朝松文脉与梧桐
// ==========================================
function MillenniumPineSvg() {
  return (
    <svg viewBox="0 0 800 450" className="w-full h-full">
      <rect width="800" height="450" fill="#082215" />
      {/* 千年六朝松古朴躯干 */}
      <path
        d="M 380 430 Q 370 280 430 200 T 470 90"
        fill="none"
        stroke="#854d0e"
        strokeWidth="28"
        strokeLinecap="round"
      />
      {/* 苍翠松柏松针树冠 */}
      <circle cx="470" cy="90" r="55" fill="#14532d" opacity="0.9" />
      <circle cx="420" cy="130" r="50" fill="#166534" opacity="0.8" />
      <circle cx="340" cy="180" r="60" fill="#15803d" opacity="0.85" />
      <circle cx="500" cy="160" r="55" fill="#166534" opacity="0.8" />

      {/* 金色光晕与精神字样 */}
      <text x="400" y="380" fill="#facc15" fontSize="14" textAnchor="middle" fontFamily="serif" fontWeight="bold">
        六朝松下 · 千载学府根深叶茂
      </text>
    </svg>
  );
}
