import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";
import { Type } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { audienceTheme, theme, currentStepId, existingData = {}, returnPromptOnly } = body;
    
    // 🌟 1. 紀錄前端送過來的資料
    console.log("📥 [API Request] 收到前端送出的主題:", {
      audienceTheme: audienceTheme,
      theme: theme
    });

    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');

    // 🌟 2. 紀錄準備回傳給前端的資料
    console.log("📤 [API Response] 成功生成步驟，總數:", WORKFLOW_STEPS.length);

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

    // 如果前端明確指定要拿「某一個步驟的編譯後 Prompt」
    if (returnPromptOnly && currentStepId) {
      const step = WORKFLOW_STEPS.find(s => s.id === Number(currentStepId));
      if (!step) {
        return NextResponse.json({ error: `找不到步驟編號 ${currentStepId}` }, { status: 400 });
      }

      let finalPrompt = "";
      if (step.id === 1 && !verifiedContext) {
        finalPrompt = step.prompt({ theme });
      } else {
        finalPrompt = `你現在是頂尖的企劃 AI 助理。請針對主題「${theme}」產出【步驟 ${step.id}：${step.title}】的內容。\n`;
        if (verifiedContext) {
          finalPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止自創與腦補。\n---\n${verifiedContext}\n---\n`;
        }
        finalPrompt += `\n執行指令：\n${step.prompt(stepContext)}
\n【⚠️ 格式絕對要求】：請務必在輸出的 JSON 字串中保留適當的換行符號（\\n）來進行排版，確保段落分明，絕對不可將所有文字擠在同一行！`;
      }

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
        isSearchEnabled: step.id === 1 && !verifiedContext
      });
    }
    
    // 如果沒有 returnPromptOnly，則將每個 step 的 function 轉換為字串傳給前端
    // 🌟 根據使用者需求：務必將主題加入到 promptConfigs，所以我們直接將編譯(eval)完的結果塞入
    const promptConfigs = WORKFLOW_STEPS.map(step => {
      let finalPromptStr = "";
      if (step.id === 1 && !verifiedContext) {
        finalPromptStr = step.prompt({ theme });
      } else {
        finalPromptStr = `你現在是頂尖的企劃 AI 助理。請針對主題「${theme}」產出【步驟 ${step.id}：${step.title}】的內容。\n`;
        if (verifiedContext) {
          finalPromptStr += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止自創與腦補。\n---\n${verifiedContext}\n---\n`;
        }
        finalPromptStr += `\n執行指令：\n${step.prompt(stepContext)}
\n【⚠️ 格式絕對要求】：請務必在輸出的 JSON 字串中保留適當的換行符號（\\n）來進行排版，確保段落分明，絕對不可將所有文字擠在同一行！`;
      }

      return {
        id: step.id,
        title: step.title,
        description: step.description,
        dependsOn: step.dependsOn,
        promptStr: finalPromptStr // 關鍵：原本是 step.prompt.toString()，現在改為已經加入主題的結果
      };
    });

    return NextResponse.json({ prompt: promptConfigs });
  } catch (error: any) {
    console.error("❌ [API Error] 流水線發生錯誤:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
