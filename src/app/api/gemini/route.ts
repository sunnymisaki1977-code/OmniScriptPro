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

// GET: 回傳指定主題的 Prompt Configs (包含 subParts)，供前端 Canvas 初始化
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const audienceTheme = url.searchParams.get('audienceTheme') || 'heritage';
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');

    const promptConfigs = WORKFLOW_STEPS.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      dependsOn: step.dependsOn,
      promptStr: step.prompt.toString(),
      subParts: (step as any).subParts ? (step as any).subParts.map((sp: any) => ({
        id: sp.id,
        title: sp.title,
        description: sp.description,
        dependsOn: sp.dependsOn,
        promptStr: sp.prompt.toString()
      })) : undefined
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

// POST:
// 1. 若傳入 currentStepId：只負責組裝 Prompt 字串回傳給前端 (Gemini Canvas 環境由前端直接向 Google API 發出請求)
// 2. 若未傳入 currentStepId：回傳整套 Prompt Configs (序列化 function 字串，包含 subParts)
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

    // 情況 A：前端請求單一步驟（或子步驟，如 2.1, 2.2）組裝好的 Prompt
    if (currentStepId !== undefined && currentStepId !== null) {
      // 支援查找主步驟或 subParts (例如 2.1, 2.2)
      let step: any = WORKFLOW_STEPS.find(s => String(s.id) === String(currentStepId) || s.id === Number(currentStepId));
      if (!step) {
        for (const s of WORKFLOW_STEPS) {
          if ((s as any).subParts) {
            const sub = (s as any).subParts.find((sp: any) => String(sp.id) === String(currentStepId));
            if (sub) {
              step = {
                ...sub,
                type: s.type,
                dependsOn: sub.dependsOn || s.dependsOn
              };
              break;
            }
          }
        }
      }

      if (!step) {
        return setCorsHeaders(NextResponse.json({ error: `找不到步驟編號 ${currentStepId}` }, { status: 400 }));
      }

      // 提取前置背景資料
      let verifiedContext = customDocText 
        || existingData.step1 
        || existingData['1'] 
        || existingData.customContext 
        || "";

      if (!verifiedContext && typeof existingData === 'object' && existingData !== null) {
        for (const val of Object.values(existingData)) {
          if (typeof val === 'string' && val.length > 50 && !val.includes('等待從 Vercel')) {
            verifiedContext = val;
            break;
          }
        }
      }

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
        step2Part1: existingData.step2Part1 || existingData['step2Part1'] || "",
        customContext: existingData.customContext || customDocText || verifiedContext || "",
      };

      // 依據 promptConfigs 核心定義組裝 Prompt
      let finalPrompt = step.prompt(stepContext);
      if (Number(step.id) > 1 && verifiedContext && !finalPrompt.includes(verifiedContext.slice(0, 30))) {
        finalPrompt = `【⚠️ 絕對真實性指令】：以下是前置步驟已查核之「基礎背景文獻」，後續產出請以此為基準：\n---\n${verifiedContext}\n---\n\n${finalPrompt}`;
      }

      // 注入台灣即時時間錨點
      const localCurrentDate = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
      if (!finalPrompt.includes('當前台灣時間為')) {
        finalPrompt += `\n\n【系統即時資訊】：當前台灣時間為 ${localCurrentDate}。請以此時間點作為基準，確保所有數據、時事或情境描述皆符合當下最新時空。`;
      }

      return setCorsHeaders(NextResponse.json({
        success: true,
        stepId: step.id,
        title: step.title,
        prompt: finalPrompt,
        isSearchEnabled: Number(step.id) === 1 || String(step.id).startsWith('0')
      }));
    }

    // 情況 B：回傳整套 Prompt Configs (序列化 function 字串，包含 subParts)
    const promptConfigs = WORKFLOW_STEPS.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      dependsOn: step.dependsOn,
      promptStr: step.prompt.toString(),
      subParts: (step as any).subParts ? (step as any).subParts.map((sp: any) => ({
        id: sp.id,
        title: sp.title,
        description: sp.description,
        dependsOn: sp.dependsOn,
        promptStr: sp.prompt.toString()
      })) : undefined
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
