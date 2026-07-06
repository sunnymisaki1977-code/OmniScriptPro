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
    let ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

    const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite"];
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    
    // 🔍 抓出當前要執行的那一單個步驟
    const step = WORKFLOW_STEPS.find(s => s.id === Number(currentStepId));
    if (!step) {
      return NextResponse.json({ error: `找不到步驟編號 ${currentStepId}` }, { status: 400 });
    }

    // 彙整目前已有的上下文（真實從前端傳過來的上一步成果）
    const verifiedContext = customDocText || existingData[1] || "";
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

    // 執行與重試機制 (模型輪替)
    const MAX_RETRIES = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelUsed = MODELS[attempt - 1] || MODELS[MODELS.length - 1];

      try {
        const config: any = {
          responseMimeType: "application/json", 
          responseSchema: responseSchema,
          maxOutputTokens: 8192,
        };

        // 只有第一步需要開 Google 搜尋
        if (step.id === 1 && !verifiedContext) {
          config.tools = [{ googleSearch: {} }];
        }

        console.log(`[後端日誌] 正在使用 ${modelUsed} 生成步驟 ${step.id}...`);
        
        const response = await ai.models.generateContent({
          model: modelUsed,
          contents: finalPrompt,
          config: config
        });

        let cleanText = (response.text || "{}").trim();
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/i, "").trim();

        const parsedData = JSON.parse(cleanText);
        let outputText = parsedData[step.id.toString()] || cleanText;

        // 如果輸出了巢狀物件，轉為字串
        if (typeof outputText === "object" && outputText !== null) {
          outputText = JSON.stringify(outputText, null, 2);
        }

        return NextResponse.json({ 
          success: true,
          stepId: step.id,
          output: String(outputText), 
          modelUsed: modelUsed
        });

      } catch (err: any) {
        lastError = err;
        console.warn(`[API 警告] 步驟 ${step.id} 使用 ${modelUsed} 失敗。進行重試...`);
        
        if (apiKeys.length > 1) {
          currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
          ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
        }
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }

    throw lastError || new Error("未知生成錯誤");

  } catch (error: any) {
    console.error(`後端步驟生成致命錯誤:`, error);
    return NextResponse.json({ error: error.message || "單步生成失敗" }, { status: 500 });
  }
}