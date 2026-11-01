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

      // 尊重 promptConfigs.ts 的專屬角色與規格設計，以 step.prompt(stepContext) 為核心
      let finalPrompt = step.prompt(stepContext);
      if (Number(step.id) > 1 && verifiedContext && !finalPrompt.includes(verifiedContext.slice(0, 30))) {
        finalPrompt = `【⚠️ 絕對真實性指令】：以下是前置步驟已查核之「基礎背景文獻」，後續產出請以此為基準：\n---\n${verifiedContext}\n---\n\n${finalPrompt}`;
      }

      return setCorsHeaders(NextResponse.json({
        success: true,
        stepId: step.id,
        title: step.title,
        prompt: finalPrompt,
        // 恢復原搜尋設計：Step 1 或 Step 0 步驟一律啟用 Google Search，掌握最新市場動態
        isSearchEnabled: Number(step.id) === 1 || String(step.id).startsWith('0')
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
