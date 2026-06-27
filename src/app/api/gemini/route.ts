import { WORKFLOW_STEPS } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { stepId, context, apiKey: clientApiKey } = await req.json();

    if (!stepId) {
      return NextResponse.json({ error: "Missing stepId" }, { status: 400 });
    }

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

    const finalApiKey = clientApiKey || process.env.GEMINI_API_KEY;
    if (!finalApiKey) {
      return NextResponse.json({ error: "API key is missing (both client and server)" }, { status: 500 });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${finalApiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: masterPrompt }] }]
        })
    });

    if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        throw new Error(`Google API 錯誤 (${aiResponse.status}): ${errorText}`);
    }
    
    const data = await aiResponse.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ result: resultText });
  } catch (error: any) {
    console.error("API Error in /api/gemini:", error);
    return NextResponse.json({ error: error.message || "伺服器錯誤" }, { status: 500 });
  }
}
