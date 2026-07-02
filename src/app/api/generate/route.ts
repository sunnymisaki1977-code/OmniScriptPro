import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getWorkflowSteps } from "@/utils/promptConfigs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { stepId, context, audienceTheme } = await req.json();

    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    const step = WORKFLOW_STEPS.find((s) => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: "Invalid step ID" }, { status: 400 });
    }

    const MODELS = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ];

    // 取得原始 prompt
    let prompt = step.prompt(context);

    // ✅ 修正 1：移除全域強制 JSON 的指令。
    // 改為提醒模型直接輸出結果，不要有廢話，以符合各步驟的格式要求（純文字或 Markdown）。
    prompt += `\n\n【系統最終指令】：請直接輸出生成的內容，嚴禁任何開場白、問候語或自我介紹。`;

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelName = MODELS[attempt - 1] || MODELS[0];
      
      // 🛠️ 1. 初始化模型參數物件
      const modelParams: any = { model: modelName };

      // 🛠️ 2. 動態判斷是否為步驟 1 (資料搜集員) 
      const isStep1 = stepId === "step1" || stepId === 1 || String(stepId).toLowerCase().includes("step1");
      
      if (isStep1) {
        modelParams.tools = [{ googleSearch: {} }];
        // Step 1 使用 Pro 模型確保查核品質
        modelParams.model = "gemini-2.5-pro"; 
      }
      
      const model = genAI.getGenerativeModel(modelParams);

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // ✅ 修正 2：不需要清理 JSON 標籤了，但可以保留 trim() 確保字串乾淨
        text = text.trim();

        // Next.js 會負責把這個字串包裝成標準的 JSON 回傳給前端
        return NextResponse.json({ text, modelUsed: modelParams.model });
      } catch (err: any) {
        const errorMsg = err.message || "";
        const shouldRetry = errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("not found");
        
        if (shouldRetry && attempt < MAX_RETRIES) {
          console.warn(`[Gemini API] Error (${errorMsg}) on single generate with model ${modelName}. Retrying attempt ${attempt + 1}...`);
          const delay = Math.pow(2, attempt) * 1500;
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      return NextResponse.json({ error: "Google API 免費額度已達上限 (429 Too Many Requests)。請等待約 1 分鐘後再重新嘗試！" }, { status: 429 });
    }
    return NextResponse.json({ error: errorMsg || "AI Generation failed" }, { status: 500 });
  }
}