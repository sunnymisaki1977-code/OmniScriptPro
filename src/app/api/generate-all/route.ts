import { GoogleGenAI } from "@google/genai";
import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

// 延長 Vercel 預設截斷時間。若為 Vercel Pro 建議設為 300；Hobby 版請注意上限通常為 10~60 秒
export const maxDuration = 300; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 支援前端指定開始與結束步驟，預設為一次跑完 1~10 步
    const { theme, customDocText, startFromStep = 1, endStep = 5, existingData = {}, audienceTheme } = body;

    const apiKeyRaw = req.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY;
    if (!apiKeyRaw) {
      return NextResponse.json({ error: "未設定 Gemini API 金鑰。" }, { status: 500 });
    }
    
    // 支援多把金鑰輪替 (以逗號分隔)
    const apiKeys = apiKeyRaw.split(",").map(k => k.trim()).filter(k => k.length > 0);
    let currentKeyIndex = Math.floor(Math.random() * apiKeys.length);
    let ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });

    if (!theme) {
      return NextResponse.json({ error: "缺少主題 (theme)" }, { status: 400 });
    }
    let verifiedContext = customDocText || "";

    // ==========================================
    // Stage 1: 專注事實查核 (只在第一階段執行)
    // ==========================================
    if (!verifiedContext && startFromStep <= 1) {
      console.log("[Stage 1] 開始事實查核...");
      const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
      const step1Config = WORKFLOW_STEPS.find(s => s.id === 1);
      const researchPrompt = step1Config ? step1Config.prompt({ theme }) : `請調查主題：「${theme}」並提供約 1500 字的事實報告。`;
      
      let searchSuccess = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const searchResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: researchPrompt,
            config: {
              tools: [{ googleSearch: {} }] // 開啟搜尋
            }
          });
          verifiedContext = searchResponse.text || "";
          console.log("[Stage 1] 事實查核完成");
          searchSuccess = true;
          break;
        } catch (err: any) {
          console.warn(`[Stage 1] 事實查核第 ${attempt} 次發生錯誤: ${err.message}`);
          if (attempt < 3) await new Promise(res => setTimeout(res, 2000 * attempt));
        }
      }
      
      if (!searchSuccess) {
        console.warn("事實查核多次失敗，將使用空字串繼續...");
        // 若明確只跑第一步卻全數失敗，直接回傳錯誤，避免前端拿到空資料
        if (endStep === 1) {
          return NextResponse.json({ error: "事實查核階段連線失敗，請稍後再試。" }, { status: 502 });
        }
      }
      
      // 如果只要跑第一步，就直接回傳查核結果
      if (endStep === 1) {
        return NextResponse.json({ 
          data: { "1": verifiedContext }, 
          modelUsed: "gemini-2.5-flash",
          contextUsed: verifiedContext 
        });
      }
    }

    // ==========================================
    // Stage 2: 模組化批次生成內容
    // ==========================================
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    const targetSteps = WORKFLOW_STEPS.filter(step => step.id >= startFromStep && step.id <= endStep);
    
    if (targetSteps.length === 0) {
      return NextResponse.json({ error: "無效的步驟範圍" }, { status: 400 });
    }

    // 建立大師級「自我參考」與「史料」上下文
    const stepContext = {
      theme: theme,
      step1: verifiedContext ? verifiedContext : "【請基於你在 Step 1 產出的內容】",
      step2: existingData[2] || "【請基於你在 Step 2 產出的內容】",
      step3: existingData[3] || "【請基於你在 Step 3 產出的內容】",
      step4: existingData[4] || "【請基於你在 Step 4 產出的內容】",
      step5: existingData[5] || "【請基於你在 Step 5 產出的內容】",
    };

    // 組裝 Master Prompt
    let masterPrompt = `你現在是頂尖的全域企劃 AI 助理。請針對主題「${theme}」產出指定步驟的內容。\n`;

    if (verifiedContext) {
      masterPrompt += `\n【⚠️ 絕對真實性指令】：以下是經過專家查核的「基礎背景文獻」，所有產出必須 100% 遵守此文獻，禁止腦補。\n---\n${verifiedContext}\n---\n`;
    }

    if (startFromStep > 1 && Object.keys(existingData).length > 0) {
      masterPrompt += `\n【⚠️ 上下文參考】：以下是之前已經產出的內容，請作為後續步驟的連貫依據。\n---\n${JSON.stringify(existingData, null, 2)}\n---\n`;
    }

    masterPrompt += `
【絕對要求】：
1. 你必須直接回傳純 JSON 格式，絕對不要包含 markdown 區塊標記 (如 \`\`\`json)。
2. 每個 key 的 value 請填入對應步驟生成的完整純文字內容（可用 Markdown 排版，換行請用 "\\n" 跳脫，絕對禁止巢狀物件或陣列）。

以下是本次需執行的步驟指令：\n\n`;

    for (const step of targetSteps) {
      masterPrompt += `--- [步驟 ${step.id}：${step.title}] ---\n`;
      masterPrompt += step.prompt(stepContext) + "\n\n";
    }

    console.log(`[Stage 2] 開始生成步驟 ${startFromStep} 到 ${endStep}...`);

    // ==========================================
    // 定義強型別 JSON 輸出結構 (Structured Outputs)
    // ==========================================
    const responseSchema = {
      type: "OBJECT",
      properties: targetSteps.reduce((acc, step) => {
        // 動態生成屬性，強制要求模型輸出的值必須是純字串 (STRING)
        acc[step.id.toString()] = { type: "STRING" };
        return acc;
      }, {} as Record<string, { type: "STRING" }>),
      required: targetSteps.map(step => step.id.toString())
    };

    // ==========================================
    // 執行與重試機制 (Exponential Backoff)
    // ==========================================
    // 補齊與 MAX_RETRIES 對應的模型陣列
    const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.5-flash-lite", "gemini-2.5-flash-lite"];
    const MAX_RETRIES = 4;
    let modelUsed = "";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      modelUsed = MODELS[attempt - 1];

      try {
        const response = await ai.models.generateContent({
          model: modelUsed,
          contents: masterPrompt,
          config: {
            responseMimeType: "application/json", 
            responseSchema: responseSchema, // 綁定 Schema，確保輸出格式 100% 正確
            maxOutputTokens: 8192,
          }
        });

        let cleanText = (response.text || "{}").trim();
        
        // 保險起見：去除可能的 markdown 殘留 (雖然綁了 schema，某些邊界情況仍可能帶有標記)
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/i, "").trim();

        const parsedData = JSON.parse(cleanText);

        console.log(`[Stage 2] 成功使用模型 ${modelUsed} 完成生成。`);
        return NextResponse.json({ 
          data: parsedData, 
          modelUsed: modelUsed,
          contextUsed: verifiedContext 
        });

      } catch (err: any) {
        const errorMsg = err.message || "";
        const isSyntaxError = err instanceof SyntaxError || err.name === 'SyntaxError';
        const isRateLimit = err.status === 429 || errorMsg.includes("429") || errorMsg.includes("quota");
        const isServerBusy = err.status === 503 || errorMsg.includes("503") || errorMsg.includes("overloaded");
        const isAuthError = err.status === 403 || err.status === 400 || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("API_KEY_INVALID");
        
        const shouldRetry = isRateLimit || isServerBusy || isSyntaxError || isAuthError;

        if (shouldRetry && attempt < MAX_RETRIES) {
          if ((isRateLimit || isAuthError) && apiKeys.length > 1) {
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
            ai = new GoogleGenAI({ apiKey: apiKeys[currentKeyIndex] });
            console.warn(`[API 警告] 遇到 ${isAuthError ? '金鑰無效/403' : '429 限制'}，已自動切換至下一把備用金鑰...`);
          } else {
            console.warn(`[API 警告] 模型 ${modelUsed} 失敗 (${isSyntaxError ? 'JSON 解析失敗' : errorMsg})。準備進行第 ${attempt + 1} 次重試...`);
          }
          const delay = Math.pow(2, attempt) * 1500; // 3s, 6s, 12s...
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }

  } catch (error: any) {
    console.error("API 致命錯誤:", error);
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      return NextResponse.json({ error: "Google API 額度已達上限，或所有金鑰皆遭限流。請稍後再試！" }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || "生成失敗" }, { status: 500 });
  }
}