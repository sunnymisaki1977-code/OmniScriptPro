import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { theme, customDocText } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: "Missing theme" }, { status: 1500 });
    }

    const MODELS = [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite"
    ];

    let prompt = "";

    if (customDocText) {
      prompt = `你是一位「世代銘印」頻道的專屬文化策展人與內容生成專家。我們已經有一份關於「${theme}」的聖蹟文獻（基礎背景）如下：
---
${customDocText}
---

現在我們要基於上述文獻，繼續完成一個 10 步驟內容生產流程的第 2 到 10 步。

請嚴格依照邏輯順序進行生成，後續步驟必須參考前面的產出。
你必須直接輸出 JSON 格式的結果，包含 9 個 key："2", "3", "4", "5", "6", "7", "8", "9", "10"。每個 key 對應的 value **必須是純文字字串** (可用 Markdown 格式排版)，**絕對不可使用巢狀 JSON 物件或陣列**。
⚠️ **極度重要：所有的換行符號都必須使用 "\\n" (跳脫字元)，絕對不可在 JSON 字串中產生真實的換行，否則會導致 JSON 解析失敗 (Unterminated string)。**

【步驟的要求如下】：
步驟 2：根據上述文獻背景，撰寫一份 5-10 分鐘的 YouTube 長影片腳本。包含引人入勝的開場、深度內容解析、以及總結與互動引導。
步驟 3：根據步驟 2 的腳本，生成 5 個吸引人的標題、一組關鍵字標籤、以及一段包含時間軸建議的影片說明欄。
步驟 4：根據上述文獻背景，為主題撰寫 60 秒的 YouTube Shorts 短影片腳本。需求：節奏明快，前 3 秒必須有鉤子 (Hook)，內容精簡有力。
步驟 5：根據步驟 4 的短影音腳本，生成 3 個衝擊力強的短影片標題與 10 個 Hashtags。
步驟 6：根據步驟 2 的腳本，生成 3 組長影音 YouTube 縮圖設計 (16:9)。包含：縮圖名稱、高點擊文案、中英雙語 AI 繪圖提示詞 (風格必須包含 colorful ink wash, vivid diffusion, eastern fantasy, golden particles 等東方美學元素)。
步驟 7：生成 3 組短影音 YouTube 縮圖設計 (9:16)。包含與步驟 6 相似的內容，但針對直式螢幕構圖。
步驟 8：針對主題生成 3 組 16:9 彩墨風格意象圖的中英雙語繪圖提示詞，並各搭配一首七言四句詩詞。
步驟 9：針對主題生成 3 組 Suno AI 音樂生成提示詞 (1.史詩感、2.敘事感、3.活力感)，需包含 Music Style 等參數。
步驟 10：社群推播懶人包。請提供三部分內容，務必以「### 🎨 視覺 Prompt」、「### 🖼️ 圖卡排版字卡」、「### 📱 社群發布正文」作為小標題：(1) ### 🎨 視覺 Prompt：請提供 16:9 與 9:16 的動態分割構圖提示詞，必須包含中文解說與英文 Prompt (結合 Dynamic Segmented Layout, Comic Book Splash Page with Insets, Montage Infographic)；(2) ### 🖼️ 圖卡排版字卡：為 4~5 個高光時刻設計適合放在圖片上的短標題與一句話說明；(3) ### 📱 社群發布正文：包含 Hook 開場白、3-5點亮點解析、互動提問、祈福導流與 Hashtags。

請現在開始生成，並只回傳嚴格的 JSON 物件。`;
    } else {
      prompt = `你是一位「世代銘印」頻道的專屬文化策展人與內容生成專家。
現在我們要為主題「${theme}」進行一個 10 步驟的內容生產流程。

請嚴格依照這 10 個步驟的邏輯順序進行生成，後續步驟必須參考前面的產出。
你必須直接輸出 JSON 格式的結果，包含 10 個 key："1", "2", "3", "4", "5", "6", "7", "8", "9", "10"。每個 key 對應的 value **必須是純文字字串** (可用 Markdown 格式排版)，**絕對不可使用巢狀 JSON 物件或陣列**。
⚠️ **極度重要：所有的換行符號都必須使用 "\\n" (跳脫字元)，絕對不可在 JSON 字串中產生真實的換行，否則會導致 JSON 解析失敗 (Unterminated string)。**

【10 個步驟的要求如下】：
步驟 1：針對主題「${theme}」進行1500字深入的背景研究。內容需包含：文化與歷史起源神明、生平/由來、核心精神與當代象徵意義、經典神話、民間傳說或歷史史料記載、獨特的台灣民俗科儀、藝術表徵。嚴禁任何無根據的鄉野奇談或 AI 隨意編造的情節。
步驟 2：根據步驟 1 的背景資料，撰寫一份 5-10 分鐘的 YouTube 長影片腳本。包含引人入勝的開場、深度內容解析、以及總結與互動引導。
步驟 3：根據步驟 2 的腳本，生成 5 個吸引人的標題、一組關鍵字標籤、以及一段包含時間軸建議的影片說明欄。
步驟 4：根據步驟 1 的背景資料，為主題撰寫 60 秒的 YouTube Shorts 短影片腳本。需求：節奏明快，前 3 秒必須有鉤子 (Hook)，內容精簡有力。
步驟 5：根據步驟 4 的短影音腳本，生成 3 個衝擊力強的短影片標題與 10 個 Hashtags。
步驟 6：生成 3 組長影音 YouTube 縮圖設計 (16:9)。包含：縮圖名稱、高點擊文案、中英雙語 AI 繪圖提示詞 (風格必須包含 colorful ink wash, vivid diffusion, eastern fantasy, golden particles 等東方美學元素)。
步驟 7：生成 3 組短影音 YouTube 縮圖設計 (9:16)。包含與步驟 6 相似的內容，但針對直式螢幕構圖。
步驟 8：針對主題生成 3 組 16:9 彩墨風格意象圖的中英雙語繪圖提示詞，並各搭配一首七言四句詩詞。
步驟 9：針對主題生成 3 組 Suno AI 音樂生成提示詞 (1.史詩感、2.敘事感、3.活力感)，需包含 Music Style 等參數。
步驟 10：社群推播懶人包。請提供三部分內容，務必以「### 🎨 視覺 Prompt」、「### 🖼️ 圖卡排版字卡」、「### 📱 社群發布正文」作為小標題：(1) ### 🎨 視覺 Prompt：請提供 16:9 與 9:16 的動態分割構圖提示詞，必須包含中文解說與英文 Prompt (結合 Dynamic Segmented Layout, Comic Book Splash Page with Insets, Montage Infographic)；(2) ### 🖼️ 圖卡排版字卡：為 4~5 個高光時刻設計適合放在圖片上的短標題與一句話說明；(3) ### 📱 社群發布正文：包含 Hook 開場白、3-5點亮點解析、互動提問、祈福導流與 Hashtags。

請現在開始生成，並只回傳嚴格的 JSON 物件。`;
    }

    let text = "";
    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const modelName = MODELS[attempt - 1] || MODELS[0];
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        }
      });

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        const parsedData = JSON.parse(text);
        
        // Ensure all values are strings to prevent React rendering errors
        for (const key in parsedData) {
          if (typeof parsedData[key] === "object" && parsedData[key] !== null) {
            parsedData[key] = JSON.stringify(parsedData[key], null, 2);
          }
        }
        
        return NextResponse.json({ data: parsedData, modelUsed: modelName });
      } catch (err: any) {
        const errorMsg = err.message || "";
        const shouldRetry = errorMsg.includes("503") || errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("not found") || err instanceof SyntaxError || err.name === 'SyntaxError';
        
        if (shouldRetry && attempt < MAX_RETRIES) {
          console.warn(`[Gemini API] Error (${errorMsg}) with model ${modelName}. Retrying attempt ${attempt + 1}...`);
          const delay = Math.pow(2, attempt) * 1500; // Exponential backoff: 3s, 6s, 12s, 24s
          await new Promise(res => setTimeout(res, delay));
          continue;
        }
        throw err;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error (Batch):", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      return NextResponse.json({ error: "Google API 免費額度已達上限 (429 Too Many Requests)。請等待約 1 分鐘後再重新嘗試！" }, { status: 429 });
    }
    return NextResponse.json({ error: errorMsg || "AI Batch Generation failed" }, { status: 500 });
  }
}
