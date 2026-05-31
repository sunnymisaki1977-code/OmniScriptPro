import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { theme } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: "Missing theme" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
      }
    });

    // --- BATCH 1: Steps 1 to 5 ---
    const prompt1 = `你是一位「世代銘印」頻道的專屬文化策展人與內容生成專家。
現在我們要為主題「${theme}」進行內容生產流程的前 5 個步驟。

請嚴格依照邏輯順序進行生成，後續步驟必須參考前面的產出。
你必須直接輸出 JSON 格式的結果，包含 5 個 key："1", "2", "3", "4", "5"。每個 key 對應的 value 必須是純文字字串 (可用 Markdown)。不可使用巢狀 JSON 物件或陣列。請保持內容精簡有力以避免超出長度限制。

【前 5 個步驟的要求如下】：
步驟 1：針對主題「${theme}」進行深入的文化、歷史或背景資料彙整。包含：文化由來、核心意義、相關傳說或歷史紀錄。
步驟 2：根據步驟 1 的背景資料，撰寫一份 5-10 分鐘的 YouTube 長影片腳本。包含引人入勝的開場、深度內容解析、以及總結與互動引導。
步驟 3：根據步驟 2 的腳本，生成 5 個吸引人的標題、一組關鍵字標籤、以及一段包含時間軸建議的影片說明欄。
步驟 4：根據步驟 1 的背景資料，為主題撰寫 60 秒的 YouTube Shorts 短影片腳本。需求：節奏明快，前 3 秒必須有鉤子 (Hook)，內容精簡有力。
步驟 5：根據步驟 4 的短影音腳本，生成 3 個衝擊力強的短影片標題與 10 個 Hashtags。

請回傳嚴格的 JSON 物件。`;

    let data1: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt1);
        const text = await result.response.text();
        data1 = JSON.parse(text);
        break;
      } catch (err: any) {
        if ((err.message?.includes("503") || err instanceof SyntaxError || err.name === 'SyntaxError') && attempt < 3) {
          await new Promise(res => setTimeout(res, 3000));
          continue;
        }
        throw new Error(`Batch 1 failed: ${err.message}`);
      }
    }

    // --- BATCH 2: Steps 6 to 10 ---
    const prompt2 = `你是一位「世代銘印」頻道的專屬文化策展人與內容生成專家。
現在我們要為主題「${theme}」進行內容生產流程的後 5 個步驟 (6 到 10)。

以下是前 5 個步驟的產出結果作為你的參考背景：
${JSON.stringify(data1)}

請參考上述背景，嚴格依照邏輯順序生成後續步驟。
你必須直接輸出 JSON 格式的結果，包含 5 個 key："6", "7", "8", "9", "10"。每個 key 對應的 value 必須是純文字字串 (可用 Markdown)。不可使用巢狀 JSON 物件或陣列。請保持內容精簡有力以避免超出長度限制。

【後 5 個步驟的要求如下】：
步驟 6：生成 3 組長影音 YouTube 縮圖設計 (16:9)。包含：縮圖名稱、高點擊文案、中英雙語 AI 繪圖提示詞 (風格必須包含 colorful ink wash, vivid diffusion, eastern fantasy, golden particles 等東方美學元素)。
步驟 7：生成 3 組短影音 YouTube 縮圖設計 (9:16)。包含與步驟 6 相似的內容，但針對直式螢幕構圖。
步驟 8：針對主題生成 3 組 16:9 彩墨風格意象圖的中英雙語繪圖提示詞，並各搭配一首七言四句詩詞。
步驟 9：針對主題生成 3 組 Suno AI 音樂生成提示詞 (1.史詩感、2.敘事感、3.活力感)，需包含 Music Style 等參數。
步驟 10：針對主題生成跨平台的社群圖文推播文案，包含 FB 社群 (深度長文) 與 LINE 官方帳號 (早安問候短文)。

請回傳嚴格的 JSON 物件。`;

    let data2: any = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt2);
        const text = await result.response.text();
        data2 = JSON.parse(text);
        break;
      } catch (err: any) {
        if ((err.message?.includes("503") || err instanceof SyntaxError || err.name === 'SyntaxError') && attempt < 3) {
          await new Promise(res => setTimeout(res, 3000));
          continue;
        }
        throw new Error(`Batch 2 failed: ${err.message}`);
      }
    }

    // Merge results
    const parsedData = { ...data1, ...data2 };
    
    // Ensure all values are strings
    for (const key in parsedData) {
      if (typeof parsedData[key] === "object" && parsedData[key] !== null) {
        parsedData[key] = JSON.stringify(parsedData[key], null, 2);
      }
    }
    
    return NextResponse.json({ data: parsedData });
  } catch (error: any) {
    console.error("Gemini API Error (Batch):", error);
    return NextResponse.json({ error: error.message || "AI Batch Generation failed" }, { status: 500 });
  }
}
