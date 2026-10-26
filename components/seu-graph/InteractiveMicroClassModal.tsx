"use client";

import React, { useState, useEffect, useRef } from "react";
import type { SeuGraphNode } from "@/types/seu-mvp";
import { MathText } from "@/components/seu-graph/MathText";
import {
  X,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Send,
  RotateCcw,
  Sliders,
  Layers,
  GraduationCap,
  Atom,
} from "lucide-react";

interface InteractiveMicroClassModalProps {
  node: SeuGraphNode | null;
  isOpen: boolean;
  onClose: () => void;
  onMasterNode: (nodeId: string) => void;
}

export function InteractiveMicroClassModal({
  node,
  isOpen,
  onClose,
  onMasterNode,
}: InteractiveMicroClassModalProps) {
  const [activeScene, setActiveScene] = useState<1 | 2 | 3>(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [boardStep, setBoardStep] = useState<number>(1);

  // 双智能体实时追问对话
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { sender: "user" | "professor" | "senior"; text: string }[]
  >([]);

  // 随堂 Quiz 状态
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isQuizCorrect, setIsQuizCorrect] = useState(false);
  const [hasMastered, setHasMastered] = useState(false);

  // 当节点切换或弹窗打开时重置状态
  useEffect(() => {
    if (node) {
      setActiveScene(1);
      setBoardStep(1);
      setSelectedOption(null);
      setIsQuizSubmitted(false);
      setIsQuizCorrect(false);
      setHasMastered(node.status === "mastered");
      setChatMessages([
        {
          sender: "professor",
          text: `同学你好！我是四牌楼老教授。我们今天重点突破《${node.label}》。请仔细推敲其在${node.textbookRef}中的严谨数学构造。`,
        },
        {
          sender: "senior",
          text: `九龙湖学长提醒：${node.seniorSecret}`,
        },
      ]);
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [node, isOpen]);

  // 语音播报老教授点拨
  const handleToggleSpeech = () => {
    if (!("speechSynthesis" in window) || !node) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `四牌楼教授点拨：${node.professorTip}。九龙湖学长防坑口诀：${node.seniorSecret}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "zh-CN";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // 发送追问
  const handleSendQuestion = (text: string) => {
    const q = text.trim();
    if (!q) return;

    const userMsg = { sender: "user" as const, text: q };
    let replyMsg: { sender: "professor" | "senior"; text: string } = {
      sender: "professor",
      text: "四牌楼老教授：该问题涉及到定理的前提假设与邻域微积分性质。请注意看黑板上的定义域去心邻域约束！",
    };

    if (q.includes("等价无穷小") || q.includes("加减")) {
      replyMsg = {
        sender: "professor",
        text: "老教授点拨：加减法能否替换取决于相减后的主部是否相互抵消。若相减后相差高阶无穷小，必须改用泰勒展开以保证精度！",
      };
    } else if (q.includes("特征向量") || q.includes("零向量")) {
      replyMsg = {
        sender: "senior",
        text: "学长解惑：线性方程组 (λE - A)x = 0 的非零解才是特征向量！若允许零向量，任何数 λ 都能满足，特征值就失去分类意义了！",
      };
    } else if (q.includes("截痕") || q.includes("曲面")) {
      replyMsg = {
        sender: "professor",
        text: "老教授点拨：用水平面 z = h 去切曲面，研究所得截线方程在 Oxy 面上的投影曲线族，这是周建华教材中解析空间几何最强有力的工具！",
      };
    }

    setChatMessages((prev) => [...prev, userMsg, replyMsg]);
    setChatInput("");
  };

  // 提交 Quiz
  const handleSubmitQuiz = () => {
    if (selectedOption === null || !node) return;
    const correct = selectedOption === node.quiz.correctIndex;
    setIsQuizCorrect(correct);
    setIsQuizSubmitted(true);
  };

  // 确认掌握点亮节点
  const handleConfirmMaster = () => {
    if (!node) return;
    setHasMastered(true);
    onMasterNode(node.id);
  };

  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[860px] flex flex-col bg-slate-950 border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden text-slate-100">
        {/* 顶部课堂导航栏 */}
        <header className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold shadow-inner">
              止
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-wide text-white">
                  {node.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono">
                  {node.textbookRef}
                </span>
                {hasMastered && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 已掌握
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">{node.englishLabel}</p>
            </div>
          </div>

          {/* Scene 切换器 */}
          <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveScene(1)}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeScene === 1
                  ? "bg-emerald-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              📐 Scene 1: 白板推导
            </button>
            <button
              onClick={() => setActiveScene(2)}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeScene === 2
                  ? "bg-amber-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🔬 Scene 2: 交互仿真沙盒
            </button>
            <button
              onClick={() => setActiveScene(3)}
              className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                activeScene === 3
                  ? "bg-purple-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🎯 Scene 3: 随堂变式通关
            </button>
          </div>

          {/* 右侧控制 */}
          <div className="flex items-center space-x-2">
            <a
              href={`/classroom/${node.classroomId}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title="前往 OpenMAIC 原生剧场"
            >
              <span>🔗 OpenMAIC 剧场</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* 主体双栏区域：左侧 3 页剧场内容，右侧双智能体伴学栏 */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* 左侧主要互动场景 (Scene 1 / 2 / 3) */}
          <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto bg-slate-900/50 p-4 md:p-6 border-r border-slate-800/80">
            {activeScene === 1 && (
              <Scene1Whiteboard
                node={node}
                boardStep={boardStep}
                onNextStep={() => setBoardStep((prev) => (prev < 3 ? prev + 1 : 1))}
              />
            )}

            {activeScene === 2 && (
              <Scene2SimulationLab
                simulationType={node.simulationType}
                nodeLabel={node.label}
              />
            )}

            {activeScene === 3 && (
              <Scene3QuizPanel
                quiz={node.quiz}
                selectedOption={selectedOption}
                onSelectOption={setSelectedOption}
                isSubmitted={isQuizSubmitted}
                isCorrect={isQuizCorrect}
                onSubmit={handleSubmitQuiz}
                hasMastered={hasMastered}
                onMaster={handleConfirmMaster}
              />
            )}
          </div>

          {/* 右侧双智能体伴学剧场栏 */}
          <div className="lg:col-span-4 flex flex-col h-full bg-slate-950/80 border-t lg:border-t-0 border-slate-800 overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  东大名师 & 学长双智能体伴学
                </span>
              </div>
              <button
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  isSpeaking
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 animate-pulse"
                    : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                    <span>静音</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>🎙️ 朗读讲稿</span>
                  </>
                )}
              </button>
            </div>

            {/* 智能体核心点拨展示卡片 */}
            <div className="p-3.5 space-y-3 bg-slate-900/40 border-b border-slate-800/80 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                  <span>👨‍🏫 四牌楼资深教授点拨</span>
                  {isSpeaking && (
                    <span className="flex items-center gap-0.5">
                      <span className="w-1 h-3 bg-emerald-400 rounded animate-bounce"></span>
                      <span className="w-1 h-4 bg-emerald-300 rounded animate-bounce delay-75"></span>
                      <span className="w-1 h-2 bg-emerald-500 rounded animate-bounce delay-150"></span>
                    </span>
                  )}
                </div>
                <div className="text-slate-300 leading-relaxed">
                  <MathText text={node.professorTip} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                  <span>🧑‍🎓 九龙湖满绩学长防坑口诀</span>
                </div>
                <div className="text-slate-300 leading-relaxed font-mono">
                  <MathText text={node.seniorSecret} />
                </div>
              </div>
            </div>

            {/* 追问与对话历史 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
              <div className="text-[11px] text-slate-500 text-center font-mono my-1">
                — 课堂即时互动推演 —
              </div>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === "user"
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-mono">
                    {msg.sender === "user"
                      ? "我"
                      : msg.sender === "professor"
                      ? "四牌楼老教授"
                      : "九龙湖学长"}
                  </span>
                  <div
                    className={`max-w-[90%] p-2.5 rounded-xl leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none"
                        : msg.sender === "professor"
                        ? "bg-slate-800 text-slate-200 border border-emerald-900/60 rounded-tl-none"
                        : "bg-slate-800/90 text-amber-200 border border-amber-900/60 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* 预设快捷提问胶囊 */}
            <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/70">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  onClick={() =>
                    handleSendQuestion("为什么这里等价无穷小不能直接加减替换？")
                  }
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  ❓ 等价无穷小加减替换
                </button>
                <button
                  onClick={() =>
                    handleSendQuestion("特征向量为什么不能是零向量？")
                  }
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  ❓ 特征向量定义约束
                </button>
                <button
                  onClick={() =>
                    handleSendQuestion("空间二次曲面截痕法怎么快速画草图？")
                  }
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  ❓ 截痕法草图技巧
                </button>
              </div>

              {/* 实时追问输入框 */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="向老教授或学长追问考点..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendQuestion(chatInput);
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSendQuestion(chatInput)}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Scene 1: 四牌楼教授·定理溯源与白板推导
// ==========================================
function Scene1Whiteboard({
  node,
  boardStep,
  onNextStep,
}: {
  node: SeuGraphNode;
  boardStep: number;
  onNextStep: () => void;
}) {
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* 电子黑板容器 */}
      <div className="flex-1 flex flex-col bg-[#0b1712] border-2 border-[#163824] rounded-2xl p-5 shadow-2xl relative overflow-hidden font-sans">
        {/* 黑板顶部标尺与徽标 */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1b432c] text-emerald-400/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>东南大学工科精品课 · 电子仿真推演黑板</span>
          </div>
          <div className="text-slate-400">
            推导步序：<span className="text-emerald-300 font-bold">{boardStep} / 3</span>
          </div>
        </div>

        {/* 黑板板书主体 */}
        <div className="flex-1 py-4 overflow-y-auto space-y-5">
          {/* 阶段 1：核心定理陈述 */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <div className="text-xs font-mono text-emerald-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>【定理严谨陈述 · {node.textbookRef}】</span>
            </div>
            <MathText text={node.summary} className="text-slate-200 text-sm leading-relaxed tracking-wide" />
          </div>

          {/* 阶段 2：关联东大历年期末真题 */}
          {boardStep >= 2 && (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-xs font-mono text-amber-400 font-semibold mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>【东大期末真题示例剖析】</span>
              </div>
              <MathText text={node.examQuestion} className="text-amber-200 text-sm font-mono leading-relaxed" />
            </div>
          )}

          {/* 阶段 3：标准规范推演三步法 */}
          {boardStep >= 3 && (
            <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
              <div className="text-xs font-mono text-blue-400 font-semibold mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>【三步标准化分步推导演示】</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed font-mono">
                <li>
                  <strong className="text-blue-300">定型辨析：</strong>
                  明确待处理式子的代数/几何维度，严格检查邻域条件与可微可导性。
                </li>
                <li>
                  <strong className="text-blue-300">化规映射：</strong>
                  运用对应定理（如泰勒展至分母同阶、构造辅助函数或特征值因式分解），将未知未定型转化为标准型。
                </li>
                <li>
                  <strong className="text-blue-300">余项收敛：</strong>
                  检验余项在极限过程中的收敛速度，确保无阶数抵消或振荡发散漏洞。
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* 黑板底栏交互 */}
        <div className="pt-3 border-t border-[#1b432c] flex items-center justify-between">
          <div className="text-xs text-emerald-400/70 font-mono">
            提示：点击右侧按钮逐步展开黑板步骤
          </div>
          <button
            onClick={onNextStep}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-900/40 transition active:scale-95"
          >
            <span>{boardStep < 3 ? "下一步板书推导演示 →" : "🔄 重新演示板书"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Scene 2: 交互式 HTML 数学仿真实验室
// ==========================================
function Scene2SimulationLab({
  simulationType,
  nodeLabel,
}: {
  simulationType: "taylor-approx" | "matrix-eigen" | "quadric-surface";
  nodeLabel: string;
}) {
  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Atom className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">
            HTML5 动态交互仿真实验室 · {nodeLabel}
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
          仿真引擎：{simulationType}
        </span>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-hidden flex flex-col">
        {simulationType === "taylor-approx" && <TaylorApproxSimulation />}
        {simulationType === "matrix-eigen" && <MatrixEigenSimulation />}
        {simulationType === "quadric-surface" && <QuadricSurfaceSimulation />}
      </div>
    </div>
  );
}

// ------------------------------------------
// 仿真实验 A: 泰勒多项式逼近实验
// ------------------------------------------
function TaylorApproxSimulation() {
  const [order, setOrder] = useState<number>(3);
  const [funcType, setFuncType] = useState<"sin" | "exp">("sin");
  const [x0, setX0] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 清屏
    ctx.clearRect(0, 0, width, height);

    // 绘制深色坐标网格
    const originX = width / 2;
    const originY = height / 2;
    const scale = 50; // 50px = 1 unit

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 坐标轴
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // 目标原函数与泰勒多项式
    const f = (x: number) => (funcType === "sin" ? Math.sin(x) : Math.exp(x));

    const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

    const taylorP = (x: number, n: number, center: number) => {
      const dx = x - center;
      if (funcType === "sin") {
        let sum = 0;
        // sin 围绕 center 的泰勒多项式
        for (let k = 0; k <= n; k++) {
          let deriv = 0;
          const mod = k % 4;
          if (mod === 0) deriv = Math.sin(center);
          else if (mod === 1) deriv = Math.cos(center);
          else if (mod === 2) deriv = -Math.sin(center);
          else deriv = -Math.cos(center);
          sum += (deriv / factorial(k)) * Math.pow(dx, k);
        }
        return sum;
      } else {
        // e^x
        let sum = 0;
        for (let k = 0; k <= n; k++) {
          sum += (Math.exp(center) / factorial(k)) * Math.pow(dx, k);
        }
        return sum;
      }
    };

    // 绘制拉格朗日余项阴影区域 (|f(x) - P_n(x)|)
    ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
    ctx.beginPath();
    let started = false;
    for (let px = 0; px <= width; px += 2) {
      const x = (px - originX) / scale;
      const yTrue = f(x);
      const py = originY - yTrue * scale;
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    for (let px = width; px >= 0; px -= 2) {
      const x = (px - originX) / scale;
      const yApprox = taylorP(x, order, x0);
      const py = originY - yApprox * scale;
      ctx.lineTo(px, Math.max(-200, Math.min(height + 200, py)));
    }
    ctx.closePath();
    ctx.fill();

    // 绘制目标函数曲线 (翡翠绿)
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= width; px += 2) {
      const x = (px - originX) / scale;
      const y = f(x);
      const py = originY - y * scale;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 绘制泰勒多项式曲线 (金黄色)
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    for (let px = 0; px <= width; px += 2) {
      const x = (px - originX) / scale;
      const y = taylorP(x, order, x0);
      const py = originY - y * scale;
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, Math.max(-500, Math.min(height + 500, py)));
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制观察中心点 x0
    const cx = originX + x0 * scale;
    const cy = originY - f(x0) * scale;
    ctx.fillStyle = "#ec4899";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [order, funcType, x0]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 顶部控制排 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">逼近目标函数：</span>
          <button
            onClick={() => setFuncType("sin")}
            className={`px-3 py-1 rounded-lg font-mono font-semibold transition ${
              funcType === "sin"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            f(x) = sin(x)
          </button>
          <button
            onClick={() => setFuncType("exp")}
            className={`px-3 py-1 rounded-lg font-mono font-semibold transition ${
              funcType === "exp"
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            f(x) = e^x
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">展开阶数 n：</span>
            <span className="font-mono text-amber-400 font-bold text-sm w-4">
              {order}
            </span>
            <input
              type="range"
              min="1"
              max="9"
              step="2"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="accent-amber-500 w-28 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">展开点 x₀：</span>
            <span className="font-mono text-pink-400 font-bold text-sm w-6">
              {x0}
            </span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.5"
              value={x0}
              onChange={(e) => setX0(Number(e.target.value))}
              className="accent-pink-500 w-24 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Canvas 画布容器 */}
      <div className="relative flex-1 bg-slate-900/60 rounded-xl overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-full object-contain"
        />

        {/* 图例浮层 */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-emerald-500 rounded"></span>
            <span className="text-emerald-300">原函数 f(x)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-amber-500 rounded border-dashed border-t"></span>
            <span className="text-amber-300">n={order} 阶泰勒多项式 P_n(x)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 bg-rose-500/30 rounded"></span>
            <span className="text-rose-300">拉格朗日余项误差 |R_n(x)|</span>
          </div>
        </div>

        {/* 启发结论 */}
        <div className="absolute bottom-3 right-3 bg-slate-950/85 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-mono">
          💡 阶数越高，红色余项在 x₀ 邻域内迅速趋于 0！
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------
// 仿真实验 B: 矩阵特征值与线性变换仿真
// ------------------------------------------
function MatrixEigenSimulation() {
  const [matrixPreset, setMatrixPreset] = useState<"diag" | "symm" | "shear">(
    "symm"
  );
  const [angleDeg, setAngleDeg] = useState<number>(30);
  const [isEigenDirection, setIsEigenDirection] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 预设矩阵定义
  const matrices = {
    diag: {
      name: "对角矩阵 [[2, 0], [0, 0.5]]",
      m: [
        [2, 0],
        [0, 0.5],
      ],
      eigenAngles: [0, 90, 180, 270, 360],
    },
    symm: {
      name: "实对称矩阵 [[2, 1], [1, 2]]",
      m: [
        [2, 1],
        [1, 2],
      ],
      eigenAngles: [45, 135, 225, 315],
    },
    shear: {
      name: "剪切矩阵 [[1, 1], [0, 1]]",
      m: [
        [1, 1],
        [0, 1],
      ],
      eigenAngles: [0, 180, 360],
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2;
    const scale = 70;

    // 绘制坐标轴
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // 向量 x 计算
    const rad = (angleDeg * Math.PI) / 180;
    const x1 = Math.cos(rad);
    const y1 = Math.sin(rad);

    // 变换后向量 Ax
    const curM = matrices[matrixPreset].m;
    const ax1 = curM[0][0] * x1 + curM[0][1] * y1;
    const ay1 = curM[1][0] * x1 + curM[1][1] * y1;

    // 判定共线（二维叉积 cross product = x1 * ay1 - y1 * ax1）
    const cross = Math.abs(x1 * ay1 - y1 * ax1);
    const isCollinear = cross < 0.12;
    setIsEigenDirection(isCollinear);

    // 绘制背景参考单位圆
    ctx.strokeStyle = "rgba(100, 116, 139, 0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(originX, originY, scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 绘制变换前向量 x (蓝色)
    const px1 = originX + x1 * scale;
    const py1 = originY - y1 * scale;
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(px1, py1);
    ctx.stroke();

    // 箭头
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(px1, py1, 5, 0, Math.PI * 2);
    ctx.fill();

    // 绘制变换后向量 Ax (橙色 / 若共线则金光闪烁)
    const pax1 = originX + ax1 * scale;
    const pay1 = originY - ay1 * scale;
    ctx.strokeStyle = isCollinear ? "#fbbf24" : "#fb923c";
    ctx.lineWidth = isCollinear ? 5 : 3.5;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(pax1, pay1);
    ctx.stroke();

    // 箭头
    ctx.fillStyle = isCollinear ? "#fbbf24" : "#fb923c";
    ctx.beginPath();
    ctx.arc(pax1, pay1, isCollinear ? 7 : 5, 0, Math.PI * 2);
    ctx.fill();
  }, [matrixPreset, angleDeg]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 预设与角度滑动条 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">矩阵预设：</span>
          <button
            onClick={() => setMatrixPreset("symm")}
            className={`px-2.5 py-1 rounded-lg font-mono transition ${
              matrixPreset === "symm"
                ? "bg-amber-600 text-white font-bold"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            实对称阵 (45°/135°)
          </button>
          <button
            onClick={() => setMatrixPreset("diag")}
            className={`px-2.5 py-1 rounded-lg font-mono transition ${
              matrixPreset === "diag"
                ? "bg-amber-600 text-white font-bold"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            对角阵 (0°/90°)
          </button>
          <button
            onClick={() => setMatrixPreset("shear")}
            className={`px-2.5 py-1 rounded-lg font-mono transition ${
              matrixPreset === "shear"
                ? "bg-amber-600 text-white font-bold"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            剪切阵 (0°)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">向量角度 θ：</span>
          <span className="font-mono text-amber-400 font-bold text-sm w-10">
            {angleDeg}°
          </span>
          <input
            type="range"
            min="0"
            max="360"
            value={angleDeg}
            onChange={(e) => setAngleDeg(Number(e.target.value))}
            className="accent-amber-500 w-36 cursor-pointer"
          />
        </div>
      </div>

      {/* Canvas 画布容器 */}
      <div
        className={`relative flex-1 bg-slate-900/60 rounded-xl overflow-hidden flex items-center justify-center transition-all ${
          isEigenDirection
            ? "border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)]"
            : "border border-slate-800"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-full object-contain"
        />

        {/* 图例 */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-sky-400 rounded"></span>
            <span className="text-sky-300">输入单位向量 x</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-1 bg-amber-400 rounded"></span>
            <span className="text-amber-300">变换后向量 Ax</span>
          </div>
        </div>

        {/* 特征方向高亮弹出卡片 */}
        {isEigenDirection ? (
          <div className="absolute bottom-3 bg-amber-500/90 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-lg animate-bounce flex items-center gap-2">
            <span>🎉 捕捉到特征向量方向！</span>
            <span className="font-mono">此时 Ax 与 x 共线（只伸缩不发生旋转）！</span>
          </div>
        ) : (
          <div className="absolute bottom-3 text-slate-400 text-xs font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
            拖动角度滑动条寻找与原向量平行的特征方向
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// 仿真实验 C: 空间二次曲面与截痕法 3D 投影仿真
// ------------------------------------------
function QuadricSurfaceSimulation() {
  const [surfaceType, setSurfaceType] = useState<
    "hyperboloid" | "paraboloid" | "ellipsoid"
  >("hyperboloid");
  const [heightZ, setHeightZ] = useState<number>(0);
  const [yaw, setYaw] = useState<number>(45);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const originX = width / 2;
    const originY = height / 2 + 20;
    const radYaw = (yaw * Math.PI) / 180;
    const pitch = 0.5; // 固定俯视角

    // 简单 3D 投影
    const project = (x: number, y: number, z: number) => {
      // 绕 Z 轴旋转
      const rx = x * Math.cos(radYaw) - y * Math.sin(radYaw);
      const ry = x * Math.sin(radYaw) + y * Math.cos(radYaw);
      // 俯视投影
      const px = originX + rx * 28;
      const py = originY - (z * 24 - ry * 12 * Math.sin(pitch));
      return { px, py };
    };

    // 绘制 3D 坐标轴
    const o = project(0, 0, 0);
    const axX = project(4, 0, 0);
    const axY = project(0, 4, 0);
    const axZ = project(0, 0, 4);

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(o.px, o.py);
    ctx.lineTo(axX.px, axX.py);
    ctx.moveTo(o.px, o.py);
    ctx.lineTo(axY.px, axY.py);
    ctx.moveTo(o.px, o.py);
    ctx.lineTo(axZ.px, axZ.py);
    ctx.stroke();

    // 绘制曲面线框
    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;

    const uSteps = 16;
    const vSteps = 16;

    for (let i = -8; i <= 8; i += 2) {
      const z = i / 2;
      ctx.beginPath();
      let first = true;
      for (let j = 0; j <= vSteps; j++) {
        const theta = (j / vSteps) * Math.PI * 2;
        let r = 1;
        if (surfaceType === "hyperboloid") {
          // x^2 + y^2 - z^2 = 1 => r = sqrt(1 + z^2)
          r = Math.sqrt(1 + z * z);
        } else if (surfaceType === "paraboloid") {
          // z = x^2 - y^2 (马鞍面)
          r = Math.sqrt(Math.abs(z) + 0.2);
        } else {
          // 椭球面 x^2 + y^2 + z^2 = 4
          if (4 - z * z >= 0) r = Math.sqrt(4 - z * z);
          else r = 0;
        }
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        const p = project(x, y, z);
        if (first) {
          ctx.moveTo(p.px, p.py);
          first = false;
        } else {
          ctx.lineTo(p.px, p.py);
        }
      }
      ctx.stroke();
    }

    // 绘制当前截痕截面 z = heightZ (金色高亮)
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    let firstCut = true;
    for (let j = 0; j <= vSteps; j++) {
      const theta = (j / vSteps) * Math.PI * 2;
      let r = 1;
      if (surfaceType === "hyperboloid") {
        r = Math.sqrt(1 + heightZ * heightZ);
      } else if (surfaceType === "paraboloid") {
        r = Math.sqrt(Math.abs(heightZ) + 0.2);
      } else {
        if (4 - heightZ * heightZ >= 0) r = Math.sqrt(4 - heightZ * heightZ);
        else r = 0;
      }
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const p = project(x, y, heightZ);
      if (firstCut) {
        ctx.moveTo(p.px, p.py);
        firstCut = false;
      } else {
        ctx.lineTo(p.px, p.py);
      }
    }
    ctx.stroke();
  }, [surfaceType, heightZ, yaw]);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* 控制栏 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">二次曲面类型：</span>
          <button
            onClick={() => setSurfaceType("hyperboloid")}
            className={`px-2.5 py-1 rounded-lg font-mono transition ${
              surfaceType === "hyperboloid"
                ? "bg-emerald-600 text-white font-bold"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            单叶双曲面
          </button>
          <button
            onClick={() => setSurfaceType("paraboloid")}
            className={`px-2.5 py-1 rounded-lg font-mono transition ${
              surfaceType === "paraboloid"
                ? "bg-emerald-600 text-white font-bold"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            马鞍面 (双曲抛物面)
          </button>
          <button
            onClick={() => setSurfaceType("ellipsoid")}
            className={`px-2.5 py-1 rounded-lg font-mono transition ${
              surfaceType === "ellipsoid"
                ? "bg-emerald-600 text-white font-bold"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            椭球面
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">截面高度 z=h：</span>
            <span className="font-mono text-amber-400 font-bold text-sm w-8">
              {heightZ}
            </span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.2"
              value={heightZ}
              onChange={(e) => setHeightZ(Number(e.target.value))}
              className="accent-amber-500 w-28 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">3D 旋转：</span>
            <input
              type="range"
              min="0"
              max="360"
              value={yaw}
              onChange={(e) => setYaw(Number(e.target.value))}
              className="accent-sky-500 w-24 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 画布 */}
      <div className="relative flex-1 bg-slate-900/60 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
        <canvas
          ref={canvasRef}
          width={640}
          height={320}
          className="w-full h-full object-contain"
        />

        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800 p-2.5 rounded-lg text-[11px] font-mono space-y-1">
          <div className="text-sky-300">空间曲面 3D 线框投影</div>
          <div className="text-amber-400 font-bold">
            金色环形：水平截面 z = {heightZ} 截痕曲线
          </div>
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-950/85 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs text-slate-300 font-mono">
          周建华《几代》截痕法：通过调节高度观察截痕曲线的伸缩与退化！
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Scene 3: 东大期末同考点变式通关 Quiz
// ==========================================
function Scene3QuizPanel({
  quiz,
  selectedOption,
  onSelectOption,
  isSubmitted,
  isCorrect,
  onSubmit,
  hasMastered,
  onMaster,
}: {
  quiz: SeuGraphNode["quiz"];
  selectedOption: number | null;
  onSelectOption: (idx: number) => void;
  isSubmitted: boolean;
  isCorrect: boolean;
  onSubmit: () => void;
  hasMastered: boolean;
  onMaster: () => void;
}) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">
            随堂变式题 · 期末同考点通关靶向检测
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono">
          东大同题变式卷
        </span>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          {/* 题目 */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 text-sm font-medium text-slate-100 leading-relaxed font-mono">
            <MathText text={quiz.question} />
          </div>

          {/* 4 个选项 */}
          <div className="space-y-2.5">
            {quiz.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let itemStyle = "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700";

              if (isSubmitted) {
                if (idx === quiz.correctIndex) {
                  itemStyle = "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold";
                } else if (isSelected && !isCorrect) {
                  itemStyle = "bg-rose-950/60 border-rose-500 text-rose-200";
                }
              } else if (isSelected) {
                itemStyle = "bg-purple-950/60 border-purple-500 text-purple-200 font-semibold";
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => onSelectOption(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${itemStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <MathText inline text={opt} />
                  </div>
                  {isSubmitted && idx === quiz.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* 解析 */}
          {isSubmitted && (
            <div
              className={`p-4 rounded-xl border animate-in fade-in duration-300 text-xs leading-relaxed space-y-1.5 ${
                isCorrect
                  ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
                  : "bg-rose-950/40 border-rose-800/80 text-rose-200"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                {isCorrect ? "🎉 恭喜回答正确！" : "❌ 回答错误，请认真复习解析："}
              </div>
              <MathText text={quiz.explanation} className="text-slate-300 font-mono" />
            </div>
          )}
        </div>

        {/* 底部按钮栏 */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {!isSubmitted ? (
            <button
              disabled={selectedOption === null}
              onClick={onSubmit}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-md transition ${
                selectedOption !== null
                  ? "bg-purple-600 hover:bg-purple-500 text-white"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              提交检验答案
            </button>
          ) : isCorrect ? (
            <button
              onClick={onMaster}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>✅ 确认掌握，点亮知识图谱节点（由红变绿）</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectOption(quiz.correctIndex)}
              className="px-4 py-2 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              重做这道题
            </button>
          )}

          {hasMastered && (
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 本知识点已点亮至图谱！
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
