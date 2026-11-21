import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { trackGeminiUsage } from "@/utils/tokenTracker";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function fetchWithModelFallback(
  prompt: string,
  options: { useSearch?: boolean; endpoint?: string; tags?: string[] } = {}
) {
  // 模型優先順序：Pro -> Flash -> Flash-Lite
  const MODELS = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
  ];

  for (let attempt = 0; attempt < MODELS.length; attempt++) {
    const modelName = MODELS[attempt];
    try {
      const modelParams: any = { model: modelName };

      // 判斷是否需要開啟 Google Search
      if (options.useSearch) {
        modelParams.tools = [{ googleSearch: {} }];
      } else {
        modelParams.generationConfig = { 
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
              "1": { type: SchemaType.STRING, description: "Step 1 text content" },
              "2": { type: SchemaType.STRING, description: "Step 2 text content" },
              "3": { type: SchemaType.STRING, description: "Step 3 text content" },
              "4": { type: SchemaType.STRING, description: "Step 4 text content" },
              "5": { type: SchemaType.STRING, description: "Step 5 text content" },
              "6": { type: SchemaType.STRING, description: "Step 6 text content" },
              "7": { type: SchemaType.STRING, description: "Step 7 text content" },
              "8": { type: SchemaType.STRING, description: "Step 8 text content" },
              "9": { type: SchemaType.STRING, description: "Step 9 text content" },
              "10": { type: SchemaType.STRING, description: "Step 10 text content" }
            }
          }
        };
      }

      const model = genAI.getGenerativeModel(modelParams);
      console.log(`[API 呼叫] 嘗試使用模型: ${modelName}`);

      const startMs = Date.now();
      const result = await model.generateContent(prompt);
      
      // 📊 記錄真實 usageMetadata
      trackGeminiUsage({
        model: modelName,
        endpoint: options.endpoint ?? "modelFallback",
        usage: result.response.usageMetadata,
        durationMs: Date.now() - startMs,
        tags: options.tags,
      });

      // 成功生成，回傳結果與「最終成功使用的模型名稱」
      return { result, modelUsed: modelName };

    } catch (err: any) {
      const errorMsg = err.message || "";
      console.warn(`[API 警告] 模型 ${modelName} 發生錯誤 (${errorMsg})`);

      // 判斷是否為可以重試/切換的錯誤 (429 額度不足 或 503 伺服器忙碌)
      const shouldFallback = errorMsg.includes("429") || errorMsg.includes("503") || errorMsg.includes("quota");

      // 如果已經試到最後一個模型，或者錯誤類型不適合重試 (例如 400 語法錯誤)，則直接拋出錯誤
      if (attempt === MODELS.length - 1 || !shouldFallback) {
        throw err;
      }

      // 切換模型前，稍微暫停 2 秒鐘，避免瞬間連續請求再次被擋
      console.log(`[API 輪替] 準備降級，切換至備用模型...`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  
  throw new Error("所有備用模型皆無法完成請求");
}
