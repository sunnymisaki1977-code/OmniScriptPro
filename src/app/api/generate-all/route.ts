import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

// 既然改為單步執行，時間設為 60 秒便綽綽有餘
export const maxDuration = 60; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 💡 核心改變：每次請求只指定跑「某一個特定步驟 (currentStepId)」
    const { theme, customDocText, currentStepId, existingData = {}, audienceTheme } = body;

    if (!theme || !currentStepId) {
      return NextResponse.json({ error: "缺少必要參數：theme 或 currentStepId" }, { status: 400 });
    }

    const apiKeyRaw = req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY;
    if (!apiKeyRaw) {
      return NextResponse.json({ error: "未設定 Gemini API 金鑰。" }, { status: 500 });
    }
    
    // 多金鑰輪替邏輯
    const apiKeys = apiKeyRaw.split(",").map(k => k.trim()).filter(k => k.length > 0);
    let currentKeyIndex = Math.floor(Math.random() * apiKeys.length);

    const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite"];
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
    if (invalidPlaceholders.some(p => verifiedContext.includes(p))) {
       verifiedContext = ""; 
    }

    // 若非第一步，卻缺乏 Step 1 的基礎資料，則阻擋執行
    if (Number(currentStepId) !== 1 && !verifiedContext) {
      return NextResponse.json(
        { error: "Step 1 基礎資料尚未載入完成，請等待資料獲取後再執行此步驟。" }, 
        { status: 400 }
      );
    }

    // 將歷史資料 (1~i-1) 組裝，給 AI 參考，避免 AI 斷層
    const stepContext = {
      theme,
      verifiedContext,
      visualAssets: {}, // (這版先不傳，如需要可從 existingData 撈)
      existingData,     // 把全部 context 塞進去讓 promptConfigs 自行取用
      audienceTheme
    };

    let finalPrompt = "";
    if (step.id === 1) {
      finalPrompt = step.prompt(stepContext);
    } else {
      finalPrompt = `你是這套 10-Step 內容生產線的專業引擎。\n`;
      finalPrompt += `目前專案主題：【${theme}】\n\n`;
      // 把之前步驟累積下來的產出，通通先餵給它
      if (Object.keys(existingData).length > 0) {
        finalPrompt += `==== 以下是先前的累積產出 (Context) ====\n`;
        for (const k in existingData) {
          if (Number(k) < step.id) {
            finalPrompt += `[Step ${k}]:\n${existingData[k]}\n\n`;
          }
        }
        finalPrompt += `==========================================\n\n`;
      }
      finalPrompt += `\n執行指令：\n${step.prompt(stepContext)}`;
    }

    // 🎯 強制約束輸出的 Schema 格式 (單鍵物件)
    const responseSchema = {
      type: "OBJECT",
      properties: {
        [step.id.toString()]: { type: "STRING" }
      },
      required: [step.id.toString()]
    };

    // 執行與重試機制 (模型輪替)
    const MAX_RETRIES = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelUsed = MODELS[attempt - 1] || MODELS[MODELS.length - 1];
      const currentKey = apiKeys[currentKeyIndex];
      const isOAuth = currentKey.startsWith("ya29.");
      
      try {
        const generationConfig: any = {
          maxOutputTokens: 8192,
        };

        const tools: any[] = [];
        // 只有第一步且沒有歷史背景時，開啟 Google 搜尋 (Gemini 不允許同時使用 tools 與 responseSchema)
        // 💡 降級保護：若遇到 503 等連線異常，在最後一次重試 (attempt 3) 時自動拔除 Google Search 工具以求穩定產出
        if (step.id === 1 && !verifiedContext && attempt < 3) {
          tools.push({ googleSearch: {} });
        } else {
          generationConfig.responseMimeType = "application/json";
          generationConfig.responseSchema = responseSchema;
        }

        console.log(`[後端日誌] 正在使用 ${modelUsed} 生成步驟 ${step.id}...`);
        
        const keyQuery = isOAuth ? "" : `?key=${currentKey}`;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelUsed}:generateContent${keyQuery}`;
        
        const headers: any = { 'Content-Type': 'application/json' };
        if (isOAuth) {
            headers['Authorization'] = `Bearer ${currentKey}`;
        }
        
        const requestBody: any = {
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
            generationConfig
        };
        
        if (tools.length > 0) {
            requestBody.tools = tools;
        }
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(JSON.stringify(errData.error || errData));
        }
        
        const data = await response.json();
        let cleanText = (data.candidates?.[0]?.content?.parts?.[0]?.text || "{}").trim();
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/i, "").trim();

        let outputText = cleanText;
        try {
          const parsedData = JSON.parse(cleanText);
          if (parsedData && parsedData[step.id.toString()]) {
            outputText = parsedData[step.id.toString()];
          }
        } catch (e) {
          // 若無法解析為 JSON（例如 Step 1 使用 Google Search 回傳純文本），則直接使用原始文本
        }

        // 如果輸出了巢狀物件，轉為字串
        if (typeof outputText === "object" && outputText !== null) {
          outputText = JSON.stringify(outputText, null, 2);
        }

        return NextResponse.json({ 
          success: true, 
          stepId: step.id.toString(), 
          data: outputText,
          modelUsed: modelUsed
        });

      } catch (err) {
        // 💡 修正 1：移除 catch (err: any)，改為純 catch (err)
        lastError = err;
        // 為了相容讀取 message 屬性，我們在內部把它斷言轉換為 any
        const errorMessage = (err as any).message || err;
        console.warn(`[API 警告] 步驟 ${step.id} 使用 ${modelUsed} 失敗。進行重試... 錯誤: ${errorMessage}`);
        
        if (apiKeys.length > 1) {
          currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }

    throw lastError || new Error("未知生成錯誤");

  } catch (error) {
    // 💡 修正 2：移除 catch (error: any)，改為純 catch (error)
    const errObj = error as any;
    console.error(`後端步驟生成致命錯誤:`, errObj);
    return NextResponse.json({ error: errObj.message || "單步生成失敗" }, { status: 500 });
  }
}
