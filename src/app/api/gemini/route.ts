import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";
import { Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audienceTheme, theme, currentStepId, existingData = {}, returnPromptOnly } = body;
    
    console.log("📥 [API Request] 收到前端送出的主題:", {
      audienceTheme,
      theme
    });

    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');

    // 處理已經存在的上下文資料
    const verifiedContext = existingData[1] || "";
    const stepContext = {
      theme: theme || '自訂企劃 (未命名)',
      step1: verifiedContext || "【缺乏 Step 1 背景資料】",
      step2: existingData[2] || "【缺乏 Step 2 資料】",
      step3: existingData[3] || "【缺乏 Step 3 資料】",
      step4: existingData[4] || "【缺乏 Step 4 資料】",
      step5: existingData[5] || "【缺乏 Step 5 資料】",
    };

    // 統一的 Prompt 編譯邏輯 (避免重複寫兩次)
    const compilePrompt = (step: any) => {
      let finalPrompt = "";
      // Step 1 且沒有歷史文獻時，啟用 Google Search 強力查核
      const needsSearch = step.id === 1 && !verifiedContext;

      if (needsSearch) {
        finalPrompt = `${step.prompt({ theme })}\n\n【⚠️ 格式絕對要求】：請務必只輸出 JSON 格式的字串。`;
      } else {
        finalPrompt = `你現在是頂尖的企劃 AI 助理。請針對主題「${theme}」產出【步驟 ${step.id}：${step.title}】的內容。\n`;
        if (verifiedContext) {
          finalPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止自創與腦補。\n---\n${verifiedContext}\n---\n`;
        }
        finalPrompt += `\n執行指令：\n${step.prompt(stepContext)}
\n【⚠️ 格式絕對要求】：請務必在輸出的 JSON 字串中保留適當的換行符號（\\n）來進行排版，確保段落分明，絕對不可將所有文字擠在同一行！`;
      }
      return finalPrompt;
    };

    // 情況 A：前端只要「單一特定步驟」的 Prompt (用來發送給 Gemini)
    if (returnPromptOnly && currentStepId) {
      const step = WORKFLOW_STEPS.find(s => s.id === Number(currentStepId));
      if (!step) {
        return NextResponse.json({ error: `找不到步驟編號 ${currentStepId}` }, { status: 400 });
      }

      const finalPrompt = compilePrompt(step);
      const isSearchEnabled = step.id === 1 && !verifiedContext;

      // 定義該步驟的 JSON Schema
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          [step.id.toString()]: { type: Type.STRING }
        },
        required: [step.id.toString()]
      };

      return NextResponse.json({
        success: true,
        stepId: step.id,
        prompt: finalPrompt,
        schema: responseSchema,
        isSearchEnabled: isSearchEnabled // 回傳給前端判斷是否啟動 Search
      });
    }
    
    // 情況 B：回傳整個工作流設定檔 (已預先填入主題)
    const promptConfigs = WORKFLOW_STEPS.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      dependsOn: step.dependsOn,
      promptStr: compilePrompt(step)
    }));

    return NextResponse.json({ success: true, prompt: promptConfigs });
  } catch (error: any) {
    console.error("❌ [API Error] 流水線發生錯誤:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
