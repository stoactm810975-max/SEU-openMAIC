import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { DiagnoseResponse, SeuGraphNode } from "@/types/seu-mvp";

interface DiagnoseRequestBody {
  question?: string;
  currentSubject?: string;
}

export async function POST(req: NextRequest) {
  let body: DiagnoseRequestBody = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const question = (body.question || "").trim();
  const currentSubject = body.currentSubject;

  // 1. 读取本地知识图谱节点数据
  let nodes: SeuGraphNode[] = [];
  try {
    const filePath = path.join(process.cwd(), "public", "seu-data", "graph-data.json");
    const rawData = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(rawData);
    nodes = parsed.nodes || [];
  } catch (err) {
    console.error("[seu-diagnose] Failed to read graph-data.json:", err);
  }

  // 辅助函数：根据 weakNodeId 补全 classroomId
  const getRecommendClassroomId = (nodeId: string): string => {
    const found = nodes.find((n) => n.id === nodeId);
    return found?.classroomId || (nodeId.startsWith("ga-") ? "seu-ga-04" : "seu-ma-05");
  };

  // 2. 尝试调用 DeepSeek API（若配置了有效密钥）
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (apiKey && apiKey.trim().length > 0 && question.length > 0) {
    try {
      const candidateList = nodes.map((n) => ({
        id: n.id,
        label: n.label,
        subject: n.subject,
        textbookRef: n.textbookRef,
        summary: n.summary,
      }));

      const systemPrompt =
        "你是东南大学数学学院执教30年的四牌楼资深教授，精通东大《工科数学分析》与周建华版《几何与代数》。" +
        "请分析学生提交的错题，从给定的 10 个图谱节点中选出最核心的前置薄弱节点 weakNodeId，" +
        "给出精确到章节定理的 textbookSource、一针见血的错因分析 reason（60字内），以及九龙湖满绩学长的防坑建议 seniorAdvice（50字内）。" +
        "返回格式必须是 JSON 对象，包含字段：weakNodeId, textbookSource, reason, seniorAdvice, recommendedClassroomId。";

      const userPrompt = JSON.stringify({
        studentQuestion: question,
        currentSubjectPreference: currentSubject || "auto",
        candidateNodes: candidateList,
      });

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
        signal: AbortSignal.timeout(8000), // 8 秒超时
      });

      if (response.ok) {
        const json = await response.json();
        const contentStr = json.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsedRes = JSON.parse(contentStr) as Partial<DiagnoseResponse>;
          if (parsedRes.weakNodeId && parsedRes.reason) {
            const matchedNode = nodes.find((n) => n.id === parsedRes.weakNodeId);
            const finalResult: DiagnoseResponse = {
              weakNodeId: parsedRes.weakNodeId,
              textbookSource: parsedRes.textbookSource || matchedNode?.textbookRef || "东南大学精品基础课教材",
              reason: parsedRes.reason,
              seniorAdvice: parsedRes.seniorAdvice || "回归教材基础推导，勤练真题掌握化归技巧！",
              recommendedClassroomId: parsedRes.recommendedClassroomId || getRecommendClassroomId(parsedRes.weakNodeId),
            };
            return NextResponse.json(finalResult, { status: 200 });
          }
        }
      }
    } catch (apiError) {
      console.warn("[seu-diagnose] DeepSeek API call failed or timed out, switching to smart fallback:", apiError);
    }
  }

  // 3. 关键防翻车智能兜底逻辑（Fallback）
  // 根据题目关键词及学科上下文进行精准规则匹配
  const qLower = question.toLowerCase();

  const isGeoAlgebra =
    currentSubject === "geo-algebra" ||
    qLower.includes("特征值") ||
    qLower.includes("特征向量") ||
    qLower.includes("矩阵") ||
    qLower.includes("秩") ||
    qLower.includes("二次型") ||
    qLower.includes("对角化") ||
    qLower.includes("空间曲面") ||
    qLower.includes("双曲面") ||
    qLower.includes("正定") ||
    qLower.includes("向量空间") ||
    qLower.includes("基变换") ||
    qLower.includes("无关组") ||
    qLower.includes("周建华");

  let fallbackResult: DiagnoseResponse;

  if (isGeoAlgebra) {
    if (qLower.includes("曲面") || qLower.includes("双曲面") || qLower.includes("旋转") || qLower.includes("马鞍面")) {
      fallbackResult = {
        weakNodeId: "ga-surface-01",
        textbookSource: "周建华《几何与代数(第二版)》第3章 3.4节",
        reason: "未能准确掌握空间旋转曲面的生成法则，截痕法中坐标消元与投影方程推导混乱。",
        seniorAdvice: "绕哪轴转哪轴不变，余下坐标平方和开根号，抓住直母线旋转特征！",
        recommendedClassroomId: "seu-ga-01",
      };
    } else if (qLower.includes("秩") || qLower.includes("sylvester") || qLower.includes("初等变换") || qLower.includes("ab=0")) {
      fallbackResult = {
        weakNodeId: "ga-rank-02",
        textbookSource: "周建华《几何与代数(第二版)》第2章 / 《北大高代》第4章",
        reason: "未能理解 AB=0 时 B 的列向量组落在齐次方程组解空间内的维数约束本质。",
        seniorAdvice: "看到 AB=0 秒反应解空间维数公式 n - r(A)，西尔维斯特不等式直接出分！",
        recommendedClassroomId: "seu-ga-02",
      };
    } else if (qLower.includes("二次型") || qLower.includes("正定") || qLower.includes("主子式") || qLower.includes("正交")) {
      fallbackResult = {
        weakNodeId: "ga-quad-05",
        textbookSource: "周建华《几何与代数(第二版)》第6章 / 《北大高代》第5章",
        reason: "混淆了正定二次型的充要判据，在主子式符号检验与特征值正负判定中出现失误。",
        seniorAdvice: "判正定牢记顺序主子式全正，半正定才看所有主子式非负，配方法保平安！",
        recommendedClassroomId: "seu-ga-05",
      };
    } else if (qLower.includes("基变换") || qLower.includes("过渡矩阵") || qLower.includes("坐标变换") || qLower.includes("无关组")) {
      fallbackResult = {
        weakNodeId: "ga-space-03",
        textbookSource: "周建华《几何与代数(第二版)》第4章 4.2节",
        reason: "混淆了基变换过渡矩阵 P 的右乘关系与向量坐标变换的逆矩阵左乘关系。",
        seniorAdvice: "记住口诀：基变右乘 P，坐标变左乘 P 的逆，行初等变换一并求出！",
        recommendedClassroomId: "seu-ga-03",
      };
    } else {
      // 默认几何与代数核心薄弱点：特征值与相似对角化
      fallbackResult = {
        weakNodeId: "ga-eigen-04",
        textbookSource: "周建华《几何与代数(第二版)》第5章 5.2节",
        reason: "混淆了矩阵多项式特征值映射法则，未能依据几何重数判定重根的可对角化条件。",
        seniorAdvice: "互异特征值必可对角化！遇到矩阵多项式 f(A)，特征值直接取 f(λ) 秒算！",
        recommendedClassroomId: "seu-ga-04",
      };
    }
  } else {
    // 工科数学分析
    if (qLower.includes("海涅") || qLower.includes("夹逼") || qLower.includes("振荡") && qLower.includes("不存在")) {
      fallbackResult = {
        weakNodeId: "ma-limit-01",
        textbookSource: "《工科数学分析(上)》第1章 1.4节",
        reason: "未掌握海涅定理归结原则，无法通过构造不同趋向子列证明未定型极限不存在。",
        seniorAdvice: "遇夹逼定放缩，首尾两头向中靠；证明极限不存在，奇偶二列见分晓！",
        recommendedClassroomId: "seu-ma-01",
      };
    } else if (qLower.includes("等价无穷小") || qLower.includes("tan x - sin x") || (qLower.includes("替换") && !qLower.includes("泰勒"))) {
      fallbackResult = {
        weakNodeId: "ma-equiv-02",
        textbookSource: "《工科数学分析(上)》第1章 1.6节",
        reason: "在加减法中误用等价无穷小导致主部被抵消，违背了同阶相减高阶余项法则。",
        seniorAdvice: "乘除任意换，加减慎代入！tan x - sin x ~ x³/2 必须刻在脑子里！",
        recommendedClassroomId: "seu-ma-02",
      };
    } else if (qLower.includes("洛必达") || qLower.includes("失效") || (qLower.includes("导数") && qLower.includes("振荡"))) {
      fallbackResult = {
        weakNodeId: "ma-lhopital-03",
        textbookSource: "《工科数学分析(上)》第3章 3.2节",
        reason: "在导数极限振荡发散时盲目使用洛必达法则，忽视了导数比极限必须存在的前提条件。",
        seniorAdvice: "未定型先定型，导数极限若振荡果断放弃洛必达，拆项化简保平安！",
        recommendedClassroomId: "seu-ma-03",
      };
    } else if (qLower.includes("中值定理") || qLower.includes("拉格朗日") || qLower.includes("柯西") || qLower.includes("辅助函数") || qLower.includes("罗尔")) {
      fallbackResult = {
        weakNodeId: "ma-mvt-04",
        textbookSource: "《工科数学分析(上)》第3章 3.1节",
        reason: "微分中值定理证明中未能准确反推构造出辅助函数，导致罗尔定理无法应用。",
        seniorAdvice: "待证式移项为零反向积分找辅助函数，验证端点同值直接套罗尔！",
        recommendedClassroomId: "seu-ma-04",
      };
    } else {
      // 默认工科数学分析核心薄弱点：泰勒公式展开阶数
      fallbackResult = {
        weakNodeId: "ma-taylor-05",
        textbookSource: "《工科数学分析(上)》第3章 3.3节",
        reason: "泰勒公式展开阶数与分母主部未对齐（分子少展了一阶），导致有效项被抵消为零。",
        seniorAdvice: "上下齐平定展开，分母低位指航标！分母若是 3 阶，分子绝不能停在 2 阶！",
        recommendedClassroomId: "seu-ma-05",
      };
    }
  }

  return NextResponse.json(fallbackResult, { status: 200 });
}
