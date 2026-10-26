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
