import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { WORKFLOW_STEPS } from "@/utils/promptConfigs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { stepId, context } = await req.json();

    const step = WORKFLOW_STEPS.find((s) => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: "Invalid step ID" }, { status: 1500 });
    }

    const MODELS = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ];

    const prompt = step.prompt(context);

    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelName = MODELS[attempt - 1] || MODELS[0];
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        tools: [{ googleSearch: {} } as any]
      });

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return NextResponse.json({ text, modelUsed: modelName });
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
