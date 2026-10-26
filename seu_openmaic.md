# 东南大学“硬核基础课交互式知识图谱与多智能体伴学平台”
## —— Antigravity 单人全栈极速复刻提示词手册 (Solo Master Edition)

> **适用场景**：单人使用 **Antigravity Pro** 在本地一次性打通 **OpenMAIC 基底 + 东大双核知识图谱高颜值前端 + DeepSeek 错题诊断 API + 内置多智能体互动仿真微课沙盒**。  
> **使用方式**：
> 1. **模式 A（推荐·稳健分段式）**：在已克隆的 OpenMAIC 项目（或任意 Next.js App Router 项目）中，按顺序将 **Step 1 ~ Step 4** 复制给 Antigravity 执行，每步仅需 1~2 分钟，10分钟内 100% 跑通。
> 2. **模式 B（一键大师级 Prompt）**：直接复制文末的 **【终极单次全栈生成 Prompt】** 喂给 Antigravity，一次性生成所有文件。

---

## 🛠️ 前置准备（终端 30 秒搞定）

在打开 Antigravity 之前，确保你处于 OpenMAIC 项目根目录下（若还未拉取代码，可在终端执行）：
```bash
git clone https://github.com/THU-MAIC/OpenMAIC.git
cd OpenMAIC
pnpm install
# 启动本地数据库并运行开发服务器
pnpm db:up
pnpm dev
```
*(注：本提示词内置了**高保真互动微课模拟器与 API 智能兜底机制**，即便你暂时还没配置 `.env.local` 中的 `DEEPSEEK_API_KEY` 或还没在后台生成课程，前端的所有图谱动画、AI 错题诊断、四牌楼教授白板推导、HTML 拖拽仿真实验和变式题通关点亮也全部可以**100% 离线丝滑交互演示**！)*

---

## 🚀 模式 A：Antigravity 四步稳健执行流（直接复制对应代码块）

### Step 1：建立核心类型契约与东大《工数/几代》10 节点高保真图谱数据
**复制以下全部内容发送给 Antigravity：**

```text
你现在是顶级全栈工程师。我们正在基于 Next.js (App Router) + TypeScript + Tailwind CSS 开发“东南大学硬核基础课交互式知识图谱与多智能体伴学平台（SEU-OpenMAIC）”。
请执行第 1 步任务，仅创建以下 2 个文件，不要修改任何现有文件，也不要安装额外 npm 包：

### 1. 创建 `types/seu-mvp.ts`
定义以下完整的 TypeScript 接口：
```typescript
export type CourseSubject = "math-analysis" | "geo-algebra"; // 工科数学分析 | 几何与代数

export interface SeuSimulationConfig {
  type: "taylor-approx" | "matrix-eigen" | "quadric-surface";
  title: string;
  description: string;
}

export interface SeuQuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SeuGraphNode {
  id: string;
  subject: CourseSubject;
  label: string;
  englishLabel: string;
  textbookRef: string;        // 东大教材精确章节出处
  category: "core" | "basic" | "hard";
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: "unlearned" | "weak" | "mastered"; // 灰 / 呼吸红 / 东大绿
  classroomId: string;        // 绑定的 OpenMAIC 课堂 ID
  position: { x: number; y: number }; // 在 1000x560 画布上的预设精美坐标
  summary: string;            // 核心定理精要
  examQuestion: string;       // 东大历年期末真题示例
  professorTip: string;       // 四牌楼老教授点拨
  seniorSecret: string;       // 九龙湖满绩学长防坑口诀
  simulationType: "taylor-approx" | "matrix-eigen" | "quadric-surface";
  quiz: SeuQuizItem;          // 随堂通关变式题
}

export interface SeuGraphEdge {
  id: string;
  source: string;
  target: string;
  subject: CourseSubject;
  relation: string;           // 如 "前置基础" | "高阶推广" | "几何映射"
}

export interface DiagnoseResponse {
  weakNodeId: string;
  textbookSource: string;
  reason: string;
  seniorAdvice: string;
  recommendedClassroomId: string;
}
```

### 2. 创建 `public/seu-data/graph-data.json`
请写入完整、详实的 10 个核心知识点节点（`nodes`）和 8 条有向连接边（`edges`）：
- **前 5 个节点 (`subject: "math-analysis"`)** 严格依据东南大学《工科数学分析（上册）》第1~3章：
  1. `ma-limit-01`：海涅定理与夹逼准则（坐标 x:140, y:280，`status: "mastered"`，出处：《工科数学分析(上)》第1章 1.4节）
  2. `ma-equiv-02`：等价无穷小替换与阶的比较（坐标 x:360, y:150，`status: "mastered"`，出处：《工科数学分析(上)》第1章 1.6节，真题含加减法替换陷阱 $\lim_{x\to 0}\frac{\tan x - \sin x}{x^3}$）
  3. `ma-lhopital-03`：洛必达法则与失效振荡项（坐标 x:580, y:150，`status: "unlearned"`，出处：《工科数学分析(上)》第3章 3.2节，真题含 $\lim_{x\to \infty}\frac{x+\sin x}{x}$）
  4. `ma-mvt-04`：拉格朗日与柯西中值定理（坐标 x:460, y:410，`status: "unlearned"`，出处：《工科数学分析(上)》第3章 3.1节，辅助函数构造法）
  5. `ma-taylor-05`：皮亚诺与拉格朗日余项泰勒公式（坐标 x:820, y:280，`status: "weak"`，出处：《工科数学分析(上)》第3章 3.3节，绑定 `simulationType: "taylor-approx"`，真题：求 $\lim_{x\to 0}\frac{e^x - 1 - x - \frac{1}{2}x^2}{x - \sin x}$）
- **后 5 个节点 (`subject: "geo-algebra"`)** 严格依据东南大学周建华《几何与代数（第二版）》与《北大高等代数（第六版）》：
  6. `ga-surface-01`：空间曲面与二次曲面旋转生成（坐标 x:150, y:180，`status: "mastered"`，出处：周建华《几何与代数(第二版)》第3章 3.4节，绑定 `simulationType: "quadric-surface"`，真题：求直线绕 $z$ 轴旋转所得单叶双曲面方程）
  7. `ga-rank-02`：矩阵初等变换与秩的Sylvester不等式（坐标 x:150, y:400，`status: "mastered"`，出处：周建华《几何与代数》第2章 / 《北大高代》第4章）
  8. `ga-space-03`：向量空间基变换与极大无关组（坐标 x:440, y:290，`status: "unlearned"`，出处：周建华《几何与代数(第二版)》第4章 4.2节）
  9. `ga-eigen-04`：矩阵特征值、特征向量与相似对角化（坐标 x:700, y:170，`status: "weak"`，出处：周建华《几何与代数(第二版)》第5章 5.2节，绑定 `simulationType: "matrix-eigen"`，真题：已知三阶矩阵 $A$ 特征值为 $1,2,3$，求 $|A^2 - 2A + E|$ 及可对角化条件）
  10. `ga-quad-05`：实对称矩阵正交化与二次型正定判别（坐标 x:840, y:390，`status: "unlearned"`，出处：周建华《几何与代数(第二版)》第6章 / 《北大高代》第5章，绑定 `simulationType: "quadric-surface"`）

请确保每个节点的 `summary`、`examQuestion`、`professorTip`（四牌楼教授口吻）、`seniorSecret`（九龙湖学长口诀）和 `quiz`（含4个选项、正确索引及解析）内容真实、硬核且丰富！完成后停止。
```

---

### Step 2：开发 DeepSeek 错题靶向诊断 API 与服务端免配置 `openmaic.yml`
**等 Step 1 完成后，复制以下内容发送给 Antigravity：**

```text
请继续执行第 2 步任务，配置服务端并创建 AI 错题靶向诊断 API：

### 1. 创建或更新根目录下的 `openmaic.yml`（如果项目存在 `openmaic.example.yml` 则参考其结构，否则直接新建）：
配置 DeepSeek 作为核心推理引擎，关闭昂贵的视频与图片生成，采用纯文本代码渲染 SVG 白板与 HTML 交互实验：
```yaml
providers:
  deepseek:
    preset: deepseek
    apiKey: ${DEEPSEEK_API_KEY}

slots:
  llm: deepseek:deepseek-chat
  course.outline: deepseek:deepseek-chat
  course.content: deepseek:deepseek-chat
  tts: null
  image: null
  video: null
```

### 2. 创建 `app/api/seu-diagnose/route.ts`：
编写一个高可靠性的 Next.js POST 接口：
- 接收请求体 `{ question: string, currentSubject?: string }`。
- 读取 `public/seu-data/graph-data.json` 中的全部节点。
- 如果环境变量 `process.env.DEEPSEEK_API_KEY` 存在且有效，使用 `fetch` 请求 `https://api.deepseek.com/v1/chat/completions`（模型 `deepseek-chat`，设置 `response_format: { type: "json_object" }`，超时时间 8 秒）。
  - System Prompt：“你是东南大学数学学院执教30年的四牌楼资深教授，精通东大《工科数学分析》与周建华版《几何与代数》。请分析学生提交的错题，从给定的 10 个图谱节点中选出最核心的前置薄弱节点 `weakNodeId`，给出精确到章节定理的 `textbookSource`、一针见血的错因分析 `reason`（60字内），以及九龙湖满绩学长的防坑建议 `seniorAdvice`（50字内）。”
- **关键防翻车兜底逻辑（Fallback）**：如果未配置 `DEEPSEEK_API_KEY` 或网络请求报错/超时，请根据输入题目中的关键词（如包含“特征值/矩阵/秩/二次型/曲面/向量”或 `geo-algebra`）进行智能规则匹配：
  - 若匹配线性代数/几何：精准返回 `ga-eigen-04`（或对应节点）及详尽的周建华《几何与代数》第5章定理溯源分析；
  - 若匹配高数/极限/导数/泰勒：精准返回 `ma-taylor-05`（或对应节点）及《工科数学分析（上册）》第3章皮亚诺余项阶数匹配分析。
- 确保接口在任何环境下 100% 返回 200 状态码和符合 `DiagnoseResponse` 结构的 JSON！
```

---

### Step 3：打造“内置多智能体微课剧场 + 3 大 HTML 动态可拖拽数学仿真沙盒”组件
**等 Step 2 完成后，复制以下内容发送给 Antigravity（这是让评委眼前一亮的核心交互亮点）：**

```text
请执行第 3 步任务：为了确保点击知识图谱上的任意节点都能立即体验“四牌楼老教授白板推演 + 九龙湖学长互动 + HTML 可拖拽数学仿真实验 + 变式题通关点亮”的完整闭环，请新建 `components/seu-graph/InteractiveMicroClassModal.tsx` 文件。

要求使用 React + Tailwind CSS + HTML5 Canvas/SVG 编写一个全屏/大尺寸沉浸式多智能体微课弹窗组件，包含以下高颜值设计与真实可交互功能：

1. **顶部课堂导航栏**：
   - 显示东南大学校徽标识、当前微课标题、教材出处徽章（`node.textbookRef`）。
   - 右侧提供“🔗 跳转 OpenMAIC 原生完整剧场 (`/classroom/${node.classroomId}`)”按钮和关闭按钮。
   - 顶部中央提供 **3 页靶向急救包（Scene 切换器）**：
     - `Scene 1: 📐 四牌楼教授·定理溯源与白板推导`
     - `Scene 2: 🔬 交互式 HTML 数学仿真实验室（核心互动）`
     - `Scene 3: 🎯 东大期末同考点变式通关 Quiz`

2. **底部/侧边“双智能体伴学剧场栏”（全场景常驻或联动）**：
   - **👨‍🏫 四牌楼严谨老教授 Agent**：展示 `node.professorTip`，带有打字机或语音波形动效，支持点击“🎙️ 朗读讲解”（调用浏览器原生 `window.speechSynthesis` 中文语音播报，零成本免配置发声！）。
   - **🧑‍🎓 九龙湖满绩学长 Agent**：展示 `node.seniorSecret` 期末防坑口诀。
   - 提供一个课堂实时追问输入框（预设快捷提问按钮：“为什么这里等价无穷小不能直接加减替换？”、“特征向量为什么不能是零向量？”），点击后智能体即时给出东大教材风格解答。

3. **Scene 1（动态电子白板推演）**：
   - 仿真黑板/深色网格背景，分步高亮展示该知识点的核心定理（`node.summary`）与关联真题（`node.examQuestion`）的三步标准推导过程（支持点击“下一步板书演示”逐步浮现推导步骤）。

4. **Scene 2（3 个真实可交互的 HTML/Canvas 数学仿真实验，根据 `node.simulationType` 渲染）**：
   - **实验 A (`taylor-approx` - 泰勒公式多项式逼近仿真)**：
     - 使用 SVG 或 Canvas 绘制精确的坐标系与目标函数 $f(x) = \sin(x)$（或 $e^x$，支持切换）曲线。
     - 提供一个精美的滑动条控制 **泰勒展开阶数 $n \in \{1, 3, 5, 7, 9\}$**，以及观察点 $x_0$ 滑动条。
     - 拖动滑动条时，实时重绘 $n$ 阶泰勒多项式 $P_n(x)$ 逼近原函数的动态曲线，并用半透明红色阴影高亮显示拉格朗日余项误差区域 $|R_n(x)|$，直观展示“阶数越高，局部拟合越完美”！
   - **实验 B (`matrix-eigen` - 矩阵特征值与线性变换几何仿真)**：
     - 在二维网格坐标系中提供矩阵选择器（预设对角阵、对称阵、剪切阵）和角度滑动条 $\theta \in [0^\circ, 360^\circ]$（也支持鼠标在画布上直接拖拽改变输入单位向量 $\vec{x}$ 的方向）。
     - 实时绘制蓝色输入向量 $\vec{x}$ 和橙色变换后向量 $A\vec{x}$。
     - 当向量 $\vec{x}$ 旋转到特征向量方向（$\vec{x}$ 与 $A\vec{x}$ 共线）时，画布触发**金色闪光高亮特效**，并弹出提示：“🎉 捕捉到特征方向！此时 $A\vec{x} = \lambda \vec{x}$，向量只发生 $\lambda$ 倍伸缩而不发生旋转！”
   - **实验 C (`quadric-surface` - 周建华《几代》空间二次曲面与截痕法 3D 投影仿真)**：
     - 使用 Canvas 3D 线框投影算法，支持一键切换 **单叶双曲面** ($\frac{x^2}{a^2}+\frac{y^2}{b^2}-\frac{z^2}{c^2}=1$)、**双曲抛物面（马鞍面）**、**椭球面**。
     - 提供旋转视角滑动条（Pitch / Yaw）和 **水平截面高度 $z = h$ 滑动条**，右侧同步画出截面截痕的 2D 曲线（椭圆/双曲线），完美复刻周建华教材中的“截痕法”教学！

5. **Scene 3（随堂变式题 Quiz 与点亮闭环）**：
   - 渲染 `node.quiz` 的题目与 4 个选项。
   - 学生选择选项并点击“提交检验”后，显示对错反馈与详细解析。
   - 答对后弹出欢呼动效，并提供显眼的绿色发光按钮 **“✅ 确认掌握，点亮知识图谱节点（由红变绿）”**，点击后触发 `onMasterNode(node.id)` 回调，直接将外部图谱上的对应节点变为东大绿（`mastered`）！
```

---

### Step 4：开发极具视觉冲击力的 `/seu-graph` 知识图谱主控台并挂载首页入口
**等 Step 3 完成后，复制以下最后一段内容发送给 Antigravity：**

```text
请执行最后的第 4 步任务：创建知识图谱可视化主页面与画布组件，并在首页添加显著入口。

### 1. 创建 `components/seu-graph/GraphCanvas.tsx`
使用原生 SVG + Tailwind CSS 打造一个极具现代科技感与学术美感的交互式知识图谱画布（无需安装 ReactFlow 等重型库，确保零报错秒编译）：
- **背景与视觉**：深邃学术暗色玻璃拟态风格（Dark Slate `#0B1120` 搭配细腻的点阵网格背景、东南大学百廿校庆绿 `#006633` 与鎏金 `#F39800` 点缀）。
- **动态有向连线（SVG Edges）**：
  - 绘制带平滑贝塞尔曲线（Cubic Bezier）和箭头标记（`marker-end`）的连线，连线中点显示关系标签（如“前置基础”、“阶数深化”）。
  - 在连线上添加流动的发光粒子虚线动画（`stroke-dasharray` + CSS 动画），体现知识流动感。
- **高颜值节点卡片（Nodes）**：
  - 支持鼠标拖拽移动节点位置、画布缩放（Zoom In/Out/Reset）。
  - 根据 `status` 呈现三种强烈对比的视觉状态：
    1. `mastered`（已掌握）：翡翠东大绿发光边框（`border-emerald-500/80 bg-emerald-950/40`），带绿色勾选徽章。
    2. `weak`（诊断出的薄弱卡点）：**红色双层呼吸灯脉冲光环**（`animate-pulse border-rose-500 bg-rose-950/60 shadow-[0_0_30px_rgba(244,63,94,0.5)]`），顶部悬浮“🚨 薄弱卡点·急需突破”警示标签。
    3. `unlearned`（待解锁）：深灰磨砂边框（`border-slate-700 bg-slate-900/80`）。
  - 节点卡片内部显示：知识点名称、教材章节胶囊标签（如 `工数 3.3`）、难度星级，以及快捷“▶ 靶向微课”按钮。

### 2. 创建 `app/seu-graph/page.tsx`
打造三栏式“东南大学硬核基础课全景知识图谱与多智能体伴学平台”主工作台：
- **顶部品牌 Header**：
  - 左侧：东南大学校训“止于至善”金色徽章 + 主标题 **“SEU-OpenMAIC · 东大硬核基础课知识图谱与多智能体伴学平台”**。
  - 中间：**双核课程丝滑切换器（Tabs）**：
    - `📘 《工科数学分析（上册）》`
    - `📐 《几何与代数（周建华第二版）》`
  - 右侧：当前学科掌握度环形/条形进度条（实时计算 `mastered` 节点占比，如 `60% 已点亮`）、“🔄 重置演示状态”按钮、“🏠 返回 OpenMAIC 工作台”按钮。
- **左侧面板：🩺 AI 错题靶向诊断中心（宽度约 360px）**：
  - 多行错题输入框，内置 **3 个一键填入的东大高频易错真题胶囊按钮**：
    1. `🔥 [工数真题] 泰勒展开求高阶无穷小极限错题`
    2. `🔥 [几代真题] 周建华教材·矩阵特征值与对角化错题`
    3. `🔥 [几代真题] 空间旋转单叶双曲面方程求解错题`
  - **“⚡ AI 靶向诊断薄弱节点”** 渐变发光按钮：点击后调用 `POST /api/seu-diagnose`，显示加载动效。
  - **诊断结果卡片**：醒目展示 AI 定位到的前置薄弱节点、东大教材定理溯源（`textbookSource`）、四牌楼教授错因剖析（`reason`）、九龙湖学长建议（`seniorAdvice`），并自动将图谱对应节点切换为红色闪烁 `weak` 状态且自动居中选中！底部带 **“🚀 立即进入 3 页靶向急救微课”** 按钮。
- **中间核心区**：嵌入 `GraphCanvas` 组件，底部悬浮图例说明（已掌握 / 薄弱卡点 / 未学习）与“💡 路演提示：点击任意节点或提交错题即可开启多智能体仿真课堂”。
- **右侧滑出抽屉/面板：📖 节点详情与靶向通关舱（宽度约 380px）**：
  - 展示当前选中节点的完整信息：教材章节出处（`textbookRef`）、核心定理摘要（`summary`）、历年真题（`examQuestion`）、四牌楼教授点拨与九龙湖学长防坑口诀。
  - 提供两个核心操作按钮：
    1. **“🎓 开启内置多智能体仿真微课（含 HTML 交互实验）”**：点击打开 `InteractiveMicroClassModal` 弹窗（即 Step 3 制作的含白板、仿真与 Quiz 的完整课堂）。
    2. **“✅ 一键模拟变式通关（点亮为东大绿）”**：路演防翻车快捷键，点击直接将节点状态改为 `mastered`，触发庆祝提示并持久化到 `localStorage`。

### 3. 在 OpenMAIC 首页挂载醒目入口
请检查 `app/page.tsx`（如果不确定原文件复杂结构，请在不破坏原有逻辑的前提下，在页面最顶部或显眼位置插入一个高颜值悬浮横幅/导航按钮）：
- 按钮文案：**“🎓 东南大学专项入口：《工科数学分析》&《几何与代数》交互式知识图谱与错题诊断平台 →”**，点击直接路由跳转到 `/seu-graph`。
```

---

## ⚡ 模式 B：终极单次全栈生成 Prompt（想一段话全部跑完用这个）

如果你希望在 Antigravity 中**只发一次指令**就让 Agent 自动规划并生成全套代码，请直接复制下方代码块：

```text
你现在是顶级全栈架构师与 UI/UX 设计师。请在当前 Next.js (App Router) + TypeScript + Tailwind CSS 项目（OpenMAIC）中，一次性完整构建“东南大学硬核基础课交互式知识图谱与多智能体伴学平台（SEU-OpenMAIC）”。

请严格遵循不破坏现有工程依赖的原则（不要安装额外的第三方重型图表库，全部使用原生 React Hooks + SVG + HTML5 Canvas + Tailwind CSS 实现），依次创建并完善以下文件：

1. `types/seu-mvp.ts`：
   定义 `CourseSubject` ('math-analysis' | 'geo-algebra')、`SeuGraphNode`（含 id, subject, label, textbookRef, category, difficulty, status: 'unlearned'|'weak'|'mastered', classroomId, position, summary, examQuestion, professorTip, seniorSecret, simulationType: 'taylor-approx'|'matrix-eigen'|'quadric-surface', quiz）、`SeuGraphEdge` 和 `DiagnoseResponse` 接口。

2. `public/seu-data/graph-data.json`：
   构建东南大学大一理工科两大王牌硬核课的双学科知识图谱数据（共 10 个节点、8 条有向连线）：
   - 《工科数学分析（上册）》5 个节点：海涅定理与夹逼准则、等价无穷小替换陷阱、洛必达法则与失效场景、拉格朗日中值定理、皮亚诺与拉格朗日余项泰勒公式（精确标注《工科数学分析(上)》第1~3章出处、真题、四牌楼教授点拨、九龙湖学长口诀与随堂变式单选题）。
   - 周建华版《几何与代数（第二版）》+《北大高等代数（第六版）》5 个节点：空间二次曲面与旋转生成、矩阵初等变换与秩、向量空间基变换、矩阵特征值与相似对角化、实对称矩阵与二次型正定判别（精确标注周建华《几何与代数(第二版)》对应章节出处与真题）。

3. `openmaic.yml` 与 `app/api/seu-diagnose/route.ts`：
   - 配置 `openmaic.yml` 使用 `deepseek:deepseek-chat` 并关闭 `image` 和 `video` 槽位。
   - 实现 `POST /api/seu-diagnose` 接口：优先调用 DeepSeek API（`process.env.DEEPSEEK_API_KEY`）扮演东大四牌楼数学教授诊断错题并定位薄弱节点 ID 与教材章节；同时内置强大的关键词智能规则兜底（Fallback），确保在未配置 API Key 或断网时也能 100% 毫秒级返回精准的东大教材溯源与错因分析。

4. `components/seu-graph/InteractiveMicroClassModal.tsx`：
   开发内置的“OpenMAIC 多智能体 3 页靶向急救微课”全屏交互沙盒弹窗：
   - 含有“四牌楼老教授”与“九龙湖满绩学长”双智能体伴学对话栏（支持调用浏览器原生 `speechSynthesis` 语音朗读讲稿与实时追问互动）。
   - Scene 1：分步动画展示定理溯源与历年真题白板推导。
   - Scene 2：3 个真实可拖拽的 HTML/Canvas 数学仿真实验室：
     (a) `taylor-approx`：滑动条调节阶数 $n=1..9$，实时在 Canvas/SVG 上绘制泰勒多项式逼近 $\sin(x)$ 或 $e^x$ 的动态曲线及误差阴影；
     (b) `matrix-eigen`：调节向量角度或拖拽二维向量 $\vec{x}$，实时绘制矩阵线性变换后的向量 $A\vec{x}$，共线时触发“捕捉特征向量方向（只伸缩不旋转）”金色高亮提示；
     (c) `quadric-surface`：Canvas 3D 线框实时渲染单叶双曲面/马鞍面/椭球面，支持拖动旋转视角与调整水平截痕平面高度 $z=h$ 观察截痕椭圆/双曲线。
   - Scene 3：东大期末同考点变式题 Quiz，答对后点击“确认掌握并点亮节点”，直接将图谱对应节点由红（weak）变绿（mastered）。

5. `components/seu-graph/GraphCanvas.tsx` 与 `app/seu-graph/page.tsx`：
   - 采用深邃科技学术暗色主题（搭配东大绿 `#006633` 与东大金 `#F39800` 视觉元素），实现支持双学科 Tab 切换、SVG 贝塞尔发光流动连线、节点拖拽缩放、呼吸灯红框薄弱节点高亮、左侧 AI 错题靶向诊断台（含 3 个一键填入东大真题示例按钮）、右侧节点详情抽屉及掌握度进度统计的完整页面。
   - 所有节点状态变更实时持久化到 `localStorage`，并提供“一键重置演示状态”和“一键模拟通关点亮”路演快捷键。

6. 在 `app/page.tsx` 顶部显眼位置挂载跳转到 `/seu-graph` 的东南大学专属入口横幅按钮。

请确保所有 TypeScript 类型严密、Tailwind 样式精美现代、无任何未定义变量或缺失依赖报错。
```

---

## 🎯 跑完后的本地验收与路演演示动线（1分钟自检）

当 Antigravity 执行完毕后，在浏览器打开 `http://localhost:3000/seu-graph`，你将看到完整的东大伴学平台，可按以下黄金动线演示：

1. **展示东大双核知识图谱**：点击顶部 Tab，在 **《工科数学分析（上册）》** 与 **周建华《几何与代数（第二版）》** 之间切换，展示带有流动光效的有向知识图谱与精确到教材小节的节点卡片。
2. **演示 AI 错题靶向诊断（第 1 步：诊断）**：在左侧诊断台点击预设的 **“🔥 [工数真题] 泰勒展开求高阶无穷小极限错题”**（或几何与代数特征值错题），点击 **“⚡ AI 靶向诊断薄弱节点”** $\rightarrow$ 系统立刻溯源至《工科数学分析（上）》第3章3.3节，图谱上的“泰勒公式”节点**瞬间标红并闪烁呼吸灯**。
3. **演示多智能体与 HTML 动态仿真微课（第 2 步：讲授）**：点击红点打开 **“3 页靶向急救微课”**：
   * 听 **四牌楼教授** 与 **九龙湖学长** 的语音点拨与防坑口诀；
   * 切换到 **Scene 2 仿真实验室**，亲手拖动滑动条将泰勒阶数从 $n=1$ 调到 $n=9$，动态展示多项式曲线如何一步步贴合 $\sin(x)$（或切换到《几何与代数》转动向量捕捉矩阵特征方向、旋转 3D 单叶双曲面观察截痕）。
4. **演示变式题通关点亮（第 3 步：检验）**：切换到 **Scene 3 随堂 Quiz**，勾选正确选项提交 $\rightarrow$ 点击 **“✅ 确认掌握，点亮知识图谱节点”** $\rightarrow$ 图谱上的红色薄弱节点**瞬间化为翡翠东大绿（已掌握）**，顶部课程掌握度进度条同步跃升，完美闭环！