import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stepId, context, audienceTheme } = await req.json();

    if (!stepId) {
      return NextResponse.json({ error: "Missing stepId" }, { status: 400 });
    }

    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    const step = WORKFLOW_STEPS.find(s => s.id === stepId);
    if (!step) {
      return NextResponse.json({ error: "Invalid stepId" }, { status: 400 });
    }


    // 將 context 的內容組合成大師級 Prompt
    let masterPrompt = `你現在是頂尖的全域企劃 AI 助理。請針對主題「${context?.theme || '未命名主題'}」產出指定步驟的內容。\n`;
    
    // 如果有已經生成的背景資料
    if (context?.step1) {
      masterPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止腦補。\n---\n${context.step1}\n---\n`;
    }

    masterPrompt += `
【絕對要求】：
1. 你必須直接回傳最終的內容，絕對不要使用 JSON 格式。
2. 請根據該步驟的需求，直接輸出對應的 Markdown 排版內容即可，不需要任何前後問候語。

====================
任務 ID: "${step.id}" (${step.title})
要求說明：
${step.prompt(context || {})}
====================`;

    return NextResponse.json({ prompt: masterPrompt });
  } catch (error: any) {
    console.error("API Error in /api/gemini:", error);
    return NextResponse.json({ error: error.message || "伺服器錯誤" }, { status: 500 });
  }
}
