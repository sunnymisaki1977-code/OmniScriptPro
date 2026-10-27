import { NextResponse } from 'next/server';
import { getWorkflowSteps } from "@/utils/promptConfigs";

export const dynamic = 'force-dynamic';

function setCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-api-key');
  return res;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      theme, 
      currentStepId, 
      existingData = {}, 
      audienceTheme = 'heritage', 
      customDocText 
    } = body;

    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');

    // 🌟 若請求包含 currentStepId，代表前端要求組裝特定步驟的 Prompt (供 OmniScript PRO_os_gemini 使用)
    if (currentStepId !== undefined && currentStepId !== null) {
      const step = WORKFLOW_STEPS.find(s => String(s.id) === String(currentStepId) || s.id === Number(currentStepId));
      if (!step) {
        return setCorsHeaders(NextResponse.json({ error: `找不到步驟編號 ${currentStepId}` }, { status: 400 }));
      }

      let verifiedContext = customDocText || existingData.step1 || existingData['1'] || "";
      const invalidPlaceholders = ["等待從 Vercel 伺服器獲取資料", "Loading", "載入中"];
      if (invalidPlaceholders.some(text => verifiedContext.includes(text))) {
        verifiedContext = ""; 
      }

      const stepContext = {
        theme: theme || "未命名企劃主題",
        step1: verifiedContext || "【缺乏 Step 1 背景資料】",
        step2: existingData.step2 || existingData['2'] || "【缺乏 Step 2 資料】",
        step3: existingData.step3 || existingData['3'] || "【缺乏 Step 3 資料】",
        step4: existingData.step4 || existingData['4'] || "【缺乏 Step 4 資料】",
        step5: existingData.step5 || existingData['5'] || "【缺乏 Step 5 資料】",
        customContext: existingData.customContext || customDocText || verifiedContext || "",
      };

      let finalPrompt = "";
      if (step.id === 1) {
        finalPrompt = step.prompt(stepContext);
      } else {
        finalPrompt = `你現在是頂尖的企劃 AI 助理。請針對主題「${theme}」產出【步驟 ${step.id}：${step.title}】的內容。\n`;
        if (verifiedContext) {
          finalPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止自創與腦補。\n---\n${verifiedContext}\n---\n`;
        }
        finalPrompt += `\n執行指令：\n${step.prompt(stepContext)}\n\n請直接輸出 Markdown 文本內容，不要將結果包裝在任何 JSON 結構中。`;
      }

      const nowTw = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });
      finalPrompt += `\n\n【系統即時資訊】：當前台灣時間為 ${nowTw}。請以此時間點作為基準，確保所有數據、時事或情境描述皆符合當下最新時空。`;

      return setCorsHeaders(NextResponse.json({
        success: true,
        stepId: step.id,
        title: step.title,
        prompt: finalPrompt,
        isSearchEnabled: (step.id === 1 || (typeof (step.id as any) === 'string' && (step.id as any).startsWith('0_'))) && !stepContext.customContext
      }));
    }

    // 🌟 相容舊版邏輯：若無 currentStepId，序列化所有 steps
    const promptConfigs = WORKFLOW_STEPS.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      dependsOn: step.dependsOn,
      promptStr: step.prompt.toString()
    }));

    return setCorsHeaders(NextResponse.json({ 
      success: true,
      configs: promptConfigs, 
      prompt: promptConfigs 
    }));
  } catch (error: any) {
    return setCorsHeaders(NextResponse.json({ error: error.message }, { status: 500 }));
  }
}
