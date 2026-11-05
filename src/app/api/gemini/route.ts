import { NextResponse } from 'next/server';
import { getWorkflowSteps } from "@/utils/promptConfigs";
import { GoogleGenAI } from "@google/genai";

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 允許足夠時間支援長影音與接力生成

function setCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-api-key');
  return res;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      theme, 
      currentStepId, 
      existingData = {}, 
      audienceTheme = 'heritage', 
      customDocText,
      apiKey,
      returnPromptOnly = true
    } = body;

    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');

    // 🌟 若請求包含 currentStepId，代表前端要求組裝特定步驟的 Prompt (供 OmniScript PRO_os_gemini 使用)
    if (currentStepId !== undefined && currentStepId !== null) {
      // 1. 支援查找主步驟或子步驟 (如 2.1, 2.2)
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

      // 2. 深度且寬容的背景資料萃取
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

      // 如果是子步驟 2.2，允許從 step2Part1 或現有資料中獲取上下文
      const hasPreviousContext = verifiedContext || existingData.step2Part1 || existingData['step2Part1'];
      if (Number(currentStepId) !== 1 && !String(currentStepId).startsWith('0') && !hasPreviousContext) {
        return setCorsHeaders(NextResponse.json(
          { error: "Step 1 基礎資料尚未載入完成 (或格式未正確傳遞)，請確認 Step 1 內容後再執行此步驟。" }, 
          { status: 400 }
        ));
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

      // 3. 尊重 promptConfigs.ts 的專屬角色與規格設計，以 step.prompt(stepContext) 為核心
      let finalPrompt = step.prompt(stepContext);
      if (Number(step.id) > 1 && verifiedContext && !finalPrompt.includes(verifiedContext.slice(0, 30))) {
        finalPrompt = `【⚠️ 絕對真實性指令】：以下是前置步驟已查核之「基礎背景文獻」，後續產出請以此為基準：\n---\n${verifiedContext}\n---\n\n${finalPrompt}`;
      }

      // 注入台灣即時時間錨點
      const localCurrentDate = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
      if (!finalPrompt.includes('當前台灣時間為')) {
        finalPrompt += `\n\n【系統即時資訊】：當前台灣時間為 ${localCurrentDate}。請以此時間點作為基準，確保所有數據、時事或情境描述皆符合當下最新時空。`;
      }

      // 4. 若前端只要求組裝好的 Prompt (Canva App 模式)
      if (returnPromptOnly) {
        return setCorsHeaders(NextResponse.json({
          success: true,
          stepId: step.id,
          title: step.title,
          prompt: finalPrompt,
          isSearchEnabled: Number(step.id) === 1 || String(step.id).startsWith('0')
        }));
      }

      // 5. 若前端要求後端代為生成 (例如使用者未設定個人金鑰)
      const apiKeyRaw = req.headers.get("x-gemini-api-key") || apiKey || process.env.GEMINI_API_KEY;
      if (!apiKeyRaw) {
        return setCorsHeaders(NextResponse.json({ error: "未設定 Gemini API 金鑰。" }, { status: 500 }));
      }

      const apiKeys = apiKeyRaw.split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 0);
      const chosenKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
      const isFintech = audienceTheme === 'fintech';
      const isStep2 = String(step.id).startsWith('2');

      const targetModel = isFintech 
        ? 'gemini-3-flash-thinking' 
        : (isStep2 ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite');

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${chosenKey}`;
      const payload: any = {
        systemInstruction: {
          parts: [{ text: `現在真實台灣時間是 ${localCurrentDate}。請以此時間為基準進行分析。` }]
        },
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
          maxOutputTokens: isFintech ? 32768 : (isStep2 ? 16384 : 8192),
          ...(isFintech ? { thinkingConfig: { thinkingBudget: 16384 } } : {})
        }
      };

      if (Number(step.id) === 1 && !verifiedContext) {
        payload.tools = [{ googleSearch: {} }];
      }

      const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chosenKey },
        body: JSON.stringify(payload)
      });

      if (!aiResponse.ok) {
        const errData = await aiResponse.json().catch(() => ({}));
        throw new Error(`Google API 錯誤: ${aiResponse.status} - ${errData.error?.message || JSON.stringify(errData)}`);
      }

      const data = await aiResponse.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      const outputText = parts.find((p: any) => p.text && !p.thought)?.text || parts[parts.length - 1]?.text || parts[0]?.text || data.candidates?.[0]?.text || "";

      return setCorsHeaders(NextResponse.json({
        success: true,
        stepId: step.id,
        output: outputText,
        modelUsed: targetModel
      }));
    }

    // 🌟 相容舊版邏輯：若無 currentStepId，序列化所有 steps
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
