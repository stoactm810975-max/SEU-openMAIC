# 东南大学·硬核基础课交互式知识图谱与多智能体伴学平台
## SEU-OpenMAIC: Interactive Knowledge Graph & Multi-Agent Tutoring Platform

<p align="center">
  <img src="https://img.shields.io/badge/%E4%B8%9C%E5%8D%97%E5%A4%A7%E5%AD%A6-SEU%20Edition-007A3D?style=for-the-badge&logo=mortarboard" alt="SEU Edition"/>
  <img src="https://img.shields.io/badge/Next.js-16%20Turbopack-black?style=for-the-badge&logo=next.js" alt="Next.js 16"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19"/>
  <img src="https://img.shields.io/badge/KaTeX-LaTeX%20Math-00D6B9?style=for-the-badge" alt="KaTeX"/>
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License: MIT"/>
</p>

<p align="center">
  <b>面向东南大学“四牌楼 · 九龙湖 · 丁家桥”教研底蕴，针对全校最具挑战性的硬核基础课打造的智能化伴学闭环。</b>
  <br/>
  动态图谱溯源 · AI 归因诊断 · 电子黑板推演 · 原生 Canvas 数理仿真 · 随堂 Quiz 变式点亮
</p>

---

## 🌟 核心特色与系统功能

### 1. 🎓 两门东大硬核基础课全量知识图谱
- **《工科数学分析（上册）》**（东南大学数学学院编写 / 东南大学出版社）
  - 覆盖极限与连续、导数与微分、微分中值定理（罗尔/拉格朗日/柯西）、洛必达法则、泰勒公式与多项式逼近等核心考点。
- **《几何与代数（周建华第二版）》**（周建华编 / 高等教育出版社）
  - 覆盖矩阵秩与齐次线性方程组解空间、向量空间与过渡矩阵基变换、特征值与相似对角化、二次型正定性检验、空间旋转曲面与截痕法等难点。

### 2. 🧮 KaTeX 印刷体数学公式渲染引擎
- 全局封装通用 `<MathText />` 解析组件，支持行内公式 `$ ... $` 与块级独立公式 `$$ ... $$`；
- 所有定理公式、辅助函数构造推演、历年真题及学长点拨均以标准印刷体排版展示，严禁裸文本数学表达式。

### 3. 🗺️ 高性能交互式知识图谱画布 (Graph Canvas)
- **严格分离平移与拖拽状态机**：空白画布按压拖动平移，节点卡片独立拖拽；
- **防缩放跟手漂移**：采用 `node.x += dx / scale` 实时补偿算法；
- **视口自适应居中 (`fitView`)**：初始化与切换学科时，全量节点自动居中，杜绝边界截断；
- **60fps 平滑 SVG 贝塞尔曲线连线**：锚点随节点拖动实时刷新，连线标签高层级显示。

### 4. 🤖 双轨制 AI 错题归因诊断微服务 (`/api/seu-diagnose`)
- **在线推理**：接入 DeepSeek LLM，根据学生输入的模糊疑问智能溯源薄弱知识节点；
- **专家兜底引擎**：内置 8 秒超时熔断与东大考点启发式规则库，在离线或无 API Key 状态下仍能 100% 顺畅诊断并输出《九龙湖学长秘籍》。

### 5. 🧪 三大原生 HTML5 Canvas 动态实验沙盒
- **泰勒多项式逼近实验**：动态滑块调节展开阶数 $n \in [1, 9]$，实时绘制 $\sin(x), e^x$ 等逼近曲线与余项误差；
- **矩阵特征变换沙盒**：自由调节 $2 \times 2$ 变换矩阵元素，实时直观呈现网格形变与特征向量 $\vec{v}_1, \vec{v}_2$ 的拉伸与方向不变性；
- **空间二次曲面截痕法沙盒**：支持单叶双曲面、旋转抛物面与马鞍面，动态升降截平面 $z = z_0$ 观察交线椭圆/圆的变化。

### 6. 🏛️ 东南大学专属视觉体系与开场动画
- **微积分流光大门动画**：双环校徽微积分流光粒子 Canvas，配以“止于至善”校训大门开启转场；
- **校园风物多图轮播与 3D 书封**：集成四牌楼大礼堂、六朝松、九龙湖李文正图书馆实景图集与立体教材卡片。

---

## 🚀 极速启动指南 (Quick Start)

### 方式一：Windows 双击一键启动（最推荐）
在项目根目录下直接双击：
👉 **[`start-seu.bat`](./start-seu.bat)**
> 采用纯 ASCII 引导壳与带 UTF-8 BOM 的 PowerShell 引擎，彻底杜绝 Windows CMD 乱码与指令中断；内置智能端口探测，编译完成后将**自动在默认浏览器中打开图谱控制台**。

### 方式二：终端命令行启动
```powershell
# 运行 PowerShell 启动脚本
.\start-seu.ps1

# 或使用包管理器快捷别名
pnpm seu
```

启动成功后，浏览器访问：
- **东大图谱伴学主工作台**：[http://localhost:3000/seu-graph](http://localhost:3000/seu-graph)
- **平台主页**：[http://localhost:3000/](http://localhost:3000/)

---

## ⚙️ 环境变量配置 (`.env.local`)

项目根目录的 `.env.local` 文件负责本地运行环境配置（首次双击 `start-seu.bat` 时若缺少该文件，将自动生成默认演示配置）：
```env
# 本地 PostgreSQL 连接串（用于满足底层 instrumentation 启动契约）
DATABASE_URL=postgres://openmaic:openmaic-dev@127.0.0.1:5432/openmaic

# DeepSeek API 密钥（可填入真实密钥；未填或留空时接口将自动启动四牌楼教授智能兜底引擎）
DEEPSEEK_API_KEY=mock-key-for-seu-graph-demo
```

---

## 📁 核心项目结构

```text
SEU-openMAIC/
├── app/
│   ├── seu-graph/page.tsx         # 东南大学知识图谱主工作台页面
│   ├── api/seu-diagnose/route.ts  # 双轨制 AI 错题归因诊断后端接口
│   └── page.tsx                   # 平台主页（已挂载东大专属呼吸光晕横幅入口）
├── components/seu-graph/
│   ├── GraphCanvas.tsx            # 核心 SVG 贝塞尔曲线交互画布 (含防漂移与自适应居中)
│   ├── MathText.tsx               # 通用 KaTeX 印刷体数学公式渲染器
│   ├── InteractiveMicroClassModal.tsx # 伴学微课弹窗 (含三大 Canvas 仿真沙盒与 Quiz 变式题)
│   ├── SeuIntroSplash.tsx         # 东南大学校徽流光粒子与大门开启转场动画
│   └── SeuCampusBanner.tsx        # 校园风物图集轮播卡片与 3D 教材书封
├── types/seu-mvp.ts               # 全量 TypeScript 类型契约定义
├── public/
│   ├── seu-data/graph-data.json   # 10 大硬核节点与 9 条演进边核心数据 (含 LaTeX 公式与真题)
│   └── seu-assets/                # 39+ 张东大高清风物实景与校徽教材素材
├── start-seu.bat                  # 纯 ASCII Windows 双击快速启动脚本
├── start-seu.ps1                  # 现代 PowerShell 智能探测启动引擎
└── SEU_MAIC_AGENT_GUIDE.md        # 开发者与后续 AI Agent 详细架构说明书
```

---

## 📖 开发者与智能体维护规范 (Agent Continuity)

如果您在新会话中继续开发，或指派其他 AI 编码助手（如 Claude、Cursor 等）维护扩展本项目：
请直接将项目根目录下的 **[《SEU_MAIC_AGENT_GUIDE.md》](./SEU_MAIC_AGENT_GUIDE.md)** 作为上下文提供给助手。该文档完整定义了数据契约规范、Canvas 仿真扩展步骤、Prompt 诊断流以及类型校验指令（`pnpm tsc --noEmit`）。

---

## 📜 开源致谢与合规声明 (Open Source Attribution & Compliance)

1. **开源底座致谢**：  
   本项目底层 Web 框架与通用智能体组件基于开源项目 **[THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC)** 进行教研定制与二次开发。在此谨向原作者团队在多智能体教学编排技术领域的开源探索致以诚挚敬意与谢意。
2. **开源许可协议**：  
   本项目严格遵循 [MIT License](./LICENSE) 开源许可证。依据协议条款，原始版权声明在根目录 `LICENSE` 文件中予以完整保留。
3. **教学定制与版权范围**：  
   本项目中新增的东南大学知识图谱数据契约（工数/几代考点归纳与真题点拨）、原生 HTML5 Canvas 数理动态仿真沙盒、KaTeX 数学排版组件、校区视觉风物素材及 Windows 极速启动引擎，均专为东南大学教研场景设计。
