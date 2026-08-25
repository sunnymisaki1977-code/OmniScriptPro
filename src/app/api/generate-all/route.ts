import { GoogleGenAI, Type } from "@google/genai";
import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

// 💡 優化 1：長影音腳本生成極易超過 60 秒，若您使用 Vercel Pro，建議拉長至 120-300 秒。
// 若為免費版 (Hobby)，最高只能設為 60 秒，此時模型需選擇生成速度更快的 flash-lite。
export const maxDuration = 120; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { theme, customDocText, currentStepId, existingData = {}, audienceTheme, apiKey, returnPromptOnly } = body;

    if (!theme || !currentStepId) {
      return NextResponse.json({ error: "缺少必要參數：theme 或 currentStepId" }, { status: 400 });
    }

    const apiKeyRaw = req.headers.get("x-gemini-api-key") || apiKey || process.env.GEMINI_API_KEY;
    if (!apiKeyRaw) {
      return NextResponse.json({ error: "未設定 Gemini API 金鑰。" }, { status: 500 });
    }
    
    const apiKeys = apiKeyRaw.split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    let currentKeyIndex = Math.floor(Math.random() * apiKeys.length);
    let ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

    // 💡 優化 2：將速度最快的 flash-lite 放在首位，或確保長文案優先使用 2.5-flash
    const MODELS = ["gemini-2.5-flash",  "gemini-2.5-flash-lite"];
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    
    const step = WORKFLOW_STEPS.find(s => s.id === Number(currentStepId));
    if (!step) {
      return NextResponse.json({ error: `找不到步驟編號 ${currentStepId}` }, { status: 400 });
    }

    let verifiedContext = customDocText || existingData.step1 || existingData['1'] || "";
    const invalidPlaceholders = ["等待從 Vercel 伺服器獲取資料", "Loading", "載入中"];
    if (invalidPlaceholders.some(text => verifiedContext.includes(text))) {
      verifiedContext = ""; 
    }

    if (Number(currentStepId) !== 1 && !verifiedContext) {
      return NextResponse.json(
        { error: "Step 1 基礎資料尚未載入完成，請等待資料獲取後再執行此步驟。" }, 
        { status: 400 }
      );
    }
    const stepContext = {
      theme: theme,
      step1: verifiedContext || "【缺乏 Step 1 背景資料】",
      step2: existingData.step2 || existingData['2'] || "【缺乏 Step 2 資料】",
      step3: existingData.step3 || existingData['3'] || "【缺乏 Step 3 資料】",
      step4: existingData.step4 || existingData['4'] || "【缺乏 Step 4 資料】",
      step5: existingData.step5 || existingData['5'] || "【缺乏 Step 5 資料】",
    };

    let finalPrompt = "";
    if (step.id === 1 && !verifiedContext) {
      finalPrompt = step.prompt({ theme });
    } else {
      finalPrompt = `你現在是頂尖的企劃 AI 助理。請針對主題「${theme}」產出【步驟 ${step.id}：${step.title}】的內容。\n`;
      if (verifiedContext) {
        finalPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止自創與腦補。\n---\n${verifiedContext}\n---\n`;
      }
      // 💡 優化 3：明確告知模型「直接輸出純文本 (Markdown)」，不需要自己包裝成 JSON
      finalPrompt += `\n執行指令：\n${step.prompt(stepContext)}\n\n請直接輸出 Markdown 文本內容，不要將結果包裝在任何 JSON 結構中。`;
    }

    const nowTw = new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei", hour12: false });
    finalPrompt += `\n\n【系統即時資訊】：當前台灣時間為 ${nowTw}。請以此時間點作為基準，確保所有數據、時事或情境描述皆符合當下最新時空。`;
    if (returnPromptOnly) {
      return NextResponse.json({
        success: true,
        stepId: step.id,
        prompt: finalPrompt,
        isSearchEnabled: (step.id === 1 || (typeof step.id === 'string' && step.id.startsWith('0_'))) && !verifiedContext
      });
    }

    const MAX_RETRIES = 3;
    let lastError: any = null;
    let disableSearch = false;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const wantsSearch = (step.id === 1 || (typeof step.id === 'string' && step.id.startsWith('0_'))) && !verifiedContext;
      const isSearchEnabled = (wantsSearch && attempt < 3 && !disableSearch);
      
      const currentDate = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
      
      const geminiPayload: any = {
          systemInstruction: {
              parts: [{ text: `你是一位專業的資料分析師與企劃。現在真實台灣時間是 ${currentDate}。請嚴格以這個時間點作為基準。` }]
          },
          contents: [{ parts: [{ text: finalPrompt }] }], // finalPrompt 已經在前面加過 timeInjected 邏輯
          generationConfig: {
              maxOutputTokens: 8192
          }
      };

      if (isSearchEnabled) {
          console.log(`[Google Search] 🌐 Step ${step.id} 已強制啟動 Google 搜尋功能！`);
          geminiPayload.tools = [{ "googleSearch": {} }];
      }
      
      const targetModel = isSearchEnabled ? 'gemini-2.5-flash' : 'gemini-2.5-pro';
      const finalApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;

      try {
        console.log(`[後端日誌] 正在使用 ${targetModel} 生成步驟 ${step.id}...`);
        
        const aiResponse = await fetch(finalApiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKeys[currentKeyIndex]
            },
            body: JSON.stringify(geminiPayload)
        });

        if (!aiResponse.ok) {
            const errData = await aiResponse.json().catch(() => ({}));
            throw new Error(`Google API 錯誤: ${aiResponse.status} - ${errData.error?.message || JSON.stringify(errData)}`);
        }
        
        const data = await aiResponse.json();
        let outputText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // 💡 優化 5：防呆機制，若模型還是手癢輸出了 JSON (Markdown 程式碼區塊)，則將其剝除
        outputText = outputText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/i, "").trim();

        // 如果模型自作聰明還是輸出了純 JSON 格式的字串，嘗試解析它提取內容
        if (outputText.startsWith("{") && outputText.endsWith("}")) {
          try {
            const parsedData = JSON.parse(outputText);
            if (parsedData && parsedData[step.id.toString()]) {
              outputText = parsedData[step.id.toString()];
            }
          } catch (e) {
            // 解析失敗代表這只是剛好用大括號包住的普通文本，不予理會
          }
        }

        // 💡 優化 6：由後端 API 直接在回傳時將文字包裝成您前端需要的乾淨 JSON 結構
        return NextResponse.json({ 
          success: true,
          stepId: step.id,
          output: outputText, // 這裡已經是乾淨的 Markdown 換行字串，不會再有滿坑滿谷的 \n
          modelUsed: targetModel
        });

      } catch (err) {
        lastError = err;
        const errorMessage = (err as any).message || String(err);
        console.warn(`[API 警告] 步驟 ${step.id} 使用 ${targetModel} 失敗。進行重試... 錯誤: ${errorMessage}`);
        
        if (errorMessage.includes("403") || errorMessage.includes("400") || errorMessage.includes("Tool")) {
            console.warn(`[API 警告] 偵測到搜尋權限錯誤，下次重試將關閉 Google Search 工具`);
            disableSearch = true;
        }

        if (apiKeys.length > 1) {
          currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
          ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }

    throw lastError || new Error("未知生成錯誤");

  } catch (error) {
    const errObj = error as any;
    console.error(`後端步驟生成致命錯誤:`, errObj);
    return NextResponse.json({ error: errObj.message || "單步生成失敗" }, { status: 500 });
  }
}
