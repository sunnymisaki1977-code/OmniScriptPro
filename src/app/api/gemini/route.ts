import { GoogleGenAI, Type } from "@google/genai";
import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
        const { theme, customDocText, currentStepId, existingData = {}, audienceTheme, apiKey, returnPromptOnly } = body;

    if (!theme || !currentStepId) {
      return NextResponse.json({ error: "缺少必要參數：theme 或 currentStepId" }, { status: 400 });
    }
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    
    // 🔍 抓出當前要執行的那一單個步驟
    const step = WORKFLOW_STEPS.find(s => s.id === Number(currentStepId));
    if (!step) {
      return NextResponse.json({ error: `找不到步驟編號 ${currentStepId}` }, { status: 400 });
    }

    // 彙整目前已有的上下文（真實從前端傳過來的上一步成果）
    let verifiedContext = customDocText || existingData[1] || "";

    // 👇 攔截邏輯：排除前端載入中的佔位文字
    const invalidPlaceholders = ["等待從 Vercel 伺服器獲取資料", "Loading", "載入中"];
    if (invalidPlaceholders.some(text => verifiedContext.includes(text))) {
      verifiedContext = ""; // 清空佔位文字，視為無前置資料
    }

    // 若非第一步，卻缺乏 Step 1 的基礎資料，則阻擋執行
    if (Number(currentStepId) !== 1 && !verifiedContext) {
      return NextResponse.json(
        { error: "Step 1 基礎資料尚未載入完成，請等待資料獲取後再執行此步驟。" }, 
        { status: 400 }
      );
    }
    const stepContext = {
      theme: theme,
      step1: verifiedContext || "【缺乏 Step 1 背景資料】",
      step2: existingData[2] || "【缺乏 Step 2 資料】",
      step3: existingData[3] || "【缺乏 Step 3 資料】",
      step4: existingData[4] || "【缺乏 Step 4 資料】",
      step5: existingData[5] || "【缺乏 Step 5 資料】",
    };

    // 組合當前步驟的專屬 Prompt
    let finalPrompt = "";
    if (step.id === 1 && !verifiedContext) {
      // 如果是第一步且沒有傳歷史文本，則啟動原始事實查核 Prompt
      finalPrompt = step.prompt({ theme });
    } else {
      finalPrompt = `你現在是頂尖的企劃 AI 助理。請針對主題「${theme}」產出【步驟 ${step.id}：${step.title}】的內容。\n`;
      if (verifiedContext) {
        finalPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止自創與腦補。\n---\n${verifiedContext}\n---\n`;
      }
      finalPrompt += `\n執行指令：\n${step.prompt(stepContext)}`;
    }

    // 🎯 強制約束輸出的 Schema 格式 (單鍵物件)
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        [step.id.toString()]: { type: Type.STRING }
      },
      required: [step.id.toString()]
    };

    if (returnPromptOnly) {
      return NextResponse.json({
        success: true,
        stepId: step.id,
        prompt: finalPrompt,
        schema: responseSchema,
        isSearchEnabled: step.id === 1 && !verifiedContext
      });
    }

   
    const errObj = error as any;
    console.error(`後端步驟生成致命錯誤:`, errObj);
    return NextResponse.json({ error: errObj.message || "單步生成失敗" }, { status: 500 });
  }
}
