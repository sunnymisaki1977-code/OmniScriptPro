import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { names, apiKey } = await req.json();

    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: "Missing names array" }, { status: 400 });
    }
    
    const finalApiKey = apiKey || process.env.GEMINI_API_KEY || "";
    if (!finalApiKey) {
      return NextResponse.json({ error: "API Key is missing or invalid" }, { status: 401 });
    }

    const genAI = new GoogleGenerativeAI(finalApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const results = [];

    for (const name of names) {
     // 重新設計 Prompt：將判斷結果與原因直接整合進 JSON 中，要求 AI 只能回傳 JSON
      const prompt = `你是一位台灣民俗文化、宗教信仰、歷史研究與節氣文化專屬策展人與內容生成專家，請務必優先使用 Google 搜尋查證最準確的文獻再回答。

請針對主題「${name}」進行分析，判斷它屬於哪一種類型：
1. 神佛/歷史人物
2. 民俗/節氣/宮廟

【絕對不可】包含任何 Markdown 語法 (如 \`\`\`json) 或其他多餘的解釋文字，只能回傳一個完整的 JSON 物件。請嚴格根據判斷結果輸出對應的格式：

如果判斷為【第一類：神佛/歷史人物】，請輸出：
{
  "category": "神佛/歷史人物",
  "reason": "請簡述判斷為此類的原因",
  "name": "神明聖號（由上到下由右到左不要標點符號）",
  "organization": "組織，只能填入 佛、道、儒 其中一個",
  "title": "10-15 字的精煉副標題，需點出其神格或象徵（由上到下由右到左不要標點符號）",
  "desc": "35-50 字的簡介。需以『考證文獻、文化脈絡、社會現象』的角度切入（由上到下由右到左不要標點符號）",
  "poem": "一句符合主題詩詞（由上到下由右到左不要標點符號）",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "imagePrompt": "請針對主題「${name}」以色彩鮮艷視覺描述特徵形象,壯闊河山、山水、名勝古蹟為背景,周圍特效,充滿意境史詩感的氛圍。"
}

如果判斷為【第二類：民俗/節氣/宮廟】，請輸出：
{
  "category": "民俗/節氣/宮廟",
  "reason": "請簡述判斷為此類的原因",
  "name": "節氣或民俗名稱（由上到下由右到左不要標點符號）",
  "organization": "特性",
  "title": "10-15 字的精煉副標題，點出節令意涵（由上到下由右到左不要標點符號）",
  "desc": "35-50 字的簡介。需以『歷史起源、儀式特徵、社會意義』的角度切入（由上到下由右到左不要標點符號）",
  "poem": "一句符合主題的相關俗諺或詩詞（由上到下由右到左不要標點符號）",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "imagePrompt": "請針對主題「${name}」以色彩鮮艷視覺描述意境，充滿在地人文或節令氛圍。"
}`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      try {
        // 提取 JSON 字串，避免 AI 偶爾還是加上了 markdown 或其他文字
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          results.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            ...parsed,
            imageUrl: "" // Placeholder for future image generation
          });
        }
      } catch (e) {
        console.error("Failed to parse JSON for", name, text, e);
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: error.message || "生成失敗" }, { status: 500 });
  }
}
