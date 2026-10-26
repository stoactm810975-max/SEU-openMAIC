# 东南大学·硬核基础课交互式知识图谱与多智能体伴学平台 (SEU-OpenMAIC)
> **开发者与 AI Agent 架构说明书及维护指南 (Agent Continuity & System Spec)**

---

## 一、项目愿景与背景 (Vision & Background)

本项目深度依托东南大学（SEU）“四牌楼 · 九龙湖 · 丁家桥”三校区教研底蕴，针对全校大一/大二最具挂科挑战性的两大硬核基础课：
1. **《工科数学分析（上册）》**（东南大学数学学院编写 / 东南大学出版社）
2. **《几何与代数（周建华第二版）》**（周建华编 / 高等教育出版社）

将原本静态的 PPT/课本升级为“**动态知识图谱溯源 + AI 智能弱项诊断 + 电子黑板推演 + HTML5 动态数学物理仿真 + 教授/学长双智能体伴学**”的完整闭环教学产品。

---

## 二、模式 A 全流程交付架构 (MVP Architecture)

```mermaid
flowchart TD
    subgraph S1["Step 1: 数据契约与图谱"]
        A["types/seu-mvp.ts"] --> B["public/seu-data/graph-data.json"]
        B --> B1["10 个高保真硬核知识点"]
        B --> B2["9 条有向关系演进边"]
        B --> B3["标准 LaTeX 印刷体公式与历年真题"]
    end

    subgraph S2["Step 2: AI 智能诊断微服务"]
        C["app/api/seu-diagnose/route.ts"] --> D{"DeepSeek API 状态"}
        D -- "配置有效" --> E["DeepSeek-V3 链式推理归因"]
        D -- "超时(8s) / 离线" --> F["东大考点规则兜底引擎"]
        E --> G["诊断结果 (弱项节点 / 关联教材 / 学长秘籍)"]
        F --> G
    end

    subgraph S3["Step 3: 伴学微课与动态仿真"]
        H["InteractiveMicroClassModal.tsx"] --> I1["电子黑板分步推演"]
        H --> I2["3 大 HTML5 Canvas 动态仿真沙盒"]
        H --> I3["随堂变式题 Quiz 与真题点亮"]
        H --> I4["四牌楼教授 & 九龙湖学长双智能体互动"]
    end

    subgraph S4["Step 4: 图谱主控台与画布状态机"]
        J["app/seu-graph/page.tsx"] --> K1["GraphCanvas.tsx (SVG + dx/scale 防漂移)"]
        J --> K2["MathText.tsx (KaTeX 印刷体渲染引擎)"]
        J --> K3["SeuIntroSplash.tsx (大门开启微积分流光动画)"]
        J --> K4["SeuCampusBanner.tsx (风物轮播与3D立体书卡)"]
    end

    G --> J
    J --> H
```

---

## 三、文件清单与核心职责 (Directory & File Manifest)

| 文件路径 | 模块归属 | 核心职责与关键技术 |
| :--- | :--- | :--- |
| [`types/seu-mvp.ts`](file:///d:/SEU-openMAIC/types/seu-mvp.ts) | 核心契约 | 定义知识节点 `SeuGraphNode`、连线边 `SeuGraphEdge`、诊断响应 `DiagnoseResponse`、仿真沙盒配置等 TypeScript 类型 |
| [`public/seu-data/graph-data.json`](file:///d:/SEU-openMAIC/public/seu-data/graph-data.json) | 模拟数据 | 包含工数与几代 10 大硬核节点坐标、前置/后继关系、KaTeX 语法公式、历年真题及名师解析 |
| [`app/api/seu-diagnose/route.ts`](file:///d:/SEU-openMAIC/app/api/seu-diagnose/route.ts) | 后端路由 | 双轨制诊断 API。支持 DeepSeek 在线推理，具备 8 秒 AbortController 超时保护与离线兜底规则 |
| [`components/seu-graph/MathText.tsx`](file:///d:/SEU-openMAIC/components/seu-graph/MathText.tsx) | 渲染组件 | 通用 LaTeX 渲染器，正则分离 `$$...$$` 块级公式与 `$...\$` 行内公式，直接调用 `katex.renderToString` |
| [`components/seu-graph/GraphCanvas.tsx`](file:///d:/SEU-openMAIC/components/seu-graph/GraphCanvas.tsx) | 画布组件 | 彻底重构的交互画布。严格区分画布平移与节点拖拽，具备 `dx / scale` 防缩放漂移、`fitView` 视口居中、平滑贝塞尔曲线及高层级连线标签 |
| [`components/seu-graph/InteractiveMicroClassModal.tsx`](file:///d:/SEU-openMAIC/components/seu-graph/InteractiveMicroClassModal.tsx) | 伴学微课 | 涵盖电子黑板、随堂 Quiz、双智能体对话、以及三大动态 HTML5 Canvas 仿真沙盒 |
| [`components/seu-graph/SeuIntroSplash.tsx`](file:///d:/SEU-openMAIC/components/seu-graph/SeuIntroSplash.tsx) | 视觉动画 | 东南大学专属开场动画。微积分流光 Canvas、大礼堂动图预览、双环校徽、“止于至善”大门开启转场 |
| [`components/seu-graph/SeuCampusBanner.tsx`](file:///d:/SEU-openMAIC/components/seu-graph/SeuCampusBanner.tsx) | 视觉组件 | 东南大学实景风物自动轮播条、3D 悬浮教材书封卡片 |
| [`app/seu-graph/page.tsx`](file:///d:/SEU-openMAIC/app/seu-graph/page.tsx) | 主控界面 | 三栏独立滚动布局（`h-[calc(100vh-3.5rem)]`）、单行防折行 Header、知识点点亮统计 |
| [`app/page.tsx`](file:///d:/SEU-openMAIC/app/page.tsx) | 平台首页 | 挂载东大专属霓虹光晕呼吸入口横幅 |
| [`public/seu-assets/`](file:///d:/SEU-openMAIC/public/seu-assets/) | 静态资产 | 包含 39+ 张东大高清风物、大礼堂实景、双环校徽、教材书封素材 |
| [`start-seu.bat`](file:///d:/SEU-openMAIC/start-seu.bat) | 启动脚本 | 纯 ASCII Windows 双击启动引导壳，彻底免疫 GBK/UTF-8 乱码 |
| [`start-seu.ps1`](file:///d:/SEU-openMAIC/start-seu.ps1) | 启动引擎 | UTF-8 BOM 现代 PowerShell 脚本，带智能端口冲突探测与就绪后自动拉起浏览器 |

---

## 四、动态仿真沙盒说明 (HTML5 Canvas Interactive Sandboxes)

微课弹窗内置三大基于原生 HTML5 Canvas 编写的数学几何动态仿真：

1. **泰勒多项式逼近动态实验 (`renderTaylorCanvas`)**：
   - 目标函数：$\sin(x)$、$\cos(x)$、$e^x$、$\ln(1+x)$
   - 动态滑块调节展开阶数 $n \in [1, 9]$
   - 实时绘制原函数曲线（绿）与 $n$ 阶泰勒逼近多项式曲线（红虚线），动态量化余项误差 $R_n(x)$。
2. **矩阵特征向量与线性变换沙盒 (`renderMatrixCanvas`)**：
   - 支持调整变换矩阵元素：$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$
   - 实时绘制原始网格、变换后网格、特征向量 $\vec{v}_1, \vec{v}_2$ 及其特征值伸缩倍率 $\lambda$。
3. **空间二次曲面截痕法沙盒 (`renderQuadricSurfaceCanvas`)**：
   - 曲面类型：单叶双曲面（$\frac{x^2}{a^2} + \frac{y^2}{b^2} - \frac{z^2}{c^2} = 1$）、旋转抛物面、双曲抛物面（马鞍面）
   - 动态调节截平面高度 $z = z_0$，实时高亮当前水平截痕椭圆/圆，并以 3D 伪透视坐标投影旋转展示。

---

## 五、环境配置与快速启动 (Quick Start)

### 1. 环境变量 `.env.local`
项目根目录需包含 `.env.local`（若不存在，启动脚本将自动生成默认配置）：
```env
# 本地 PostgreSQL 连接串（用于满足 OpenMAIC 底层 instrumentation 启动契约）
DATABASE_URL=postgres://openmaic:openmaic-dev@127.0.0.1:5432/openmaic

# DeepSeek API 密钥（可留空或填入真实 key，留空时自动启用东大专家智能兜底引擎）
DEEPSEEK_API_KEY=mock-key-for-seu-graph-demo
```

### 2. 启动方式
- **双击启动（最推荐）**：直接在 Windows 文件资源管理器中双击 [`start-seu.bat`](file:///d:/SEU-openMAIC/start-seu.bat)
- **PowerShell 启动**：在终端执行 `.\start-seu.ps1`
- **包管理器命令**：在终端执行 `pnpm seu` 或 `pnpm dev`

服务拉起后将自动打开：**[http://localhost:3000/seu-graph](http://localhost:3000/seu-graph)**。

---

## 六、供后续 AI Agent 协作与扩展指引 (Agent Continuity Guide)

未来的开发 Agent 或新会话在继续本工程时，请遵循以下规范：

### 1. 添加新学科或知识节点
1. 打开 [`public/seu-data/graph-data.json`](file:///d:/SEU-openMAIC/public/seu-data/graph-data.json)；
2. 在 `nodes` 列表中添加符合 [`types/seu-mvp.ts`](file:///d:/SEU-openMAIC/types/seu-mvp.ts) 中 `SeuGraphNode` 接口的对象；
3. **数学公式严格使用 LaTeX**：
   - 行内公式包裹在 `$ ... $` 之间；
   - 块级独立公式包裹在 `$$ ... $$` 之间；
4. 在 `edges` 列表中指定 `source` 与 `target`，设置有向边标签 `label`（如“前置定理”、“矩阵推广”）。

### 2. 修改画布与节点拖拽
- 节点移动增量必须除以缩放比例：`node.x += dx / scale`；
- 误触判断阈值必须保持在 `< 4px`；
- 所有连线端点使用动态锚点计算：
  $$\text{startX} = \text{source.x} + \text{source.width}, \quad \text{startY} = \text{source.y} + \frac{\text{source.height}}{2}$$
  $$\text{endX} = \text{target.x}, \quad \text{endY} = \text{target.y} + \frac{\text{target.height}}{2}$$

### 3. 构建与类型安全检查
每次修改后运行以下命令确保无破坏：
```powershell
pnpm tsc --noEmit
```
确保 TypeScript 编译通过，退出码为 0。
