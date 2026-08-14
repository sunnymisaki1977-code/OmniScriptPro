import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { names } = await req.json();

    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: "Missing names array" }, { status: 400 });
    }

    const prompts = names.map(name => {
      return `你是一位台灣民俗文化、宗教信仰、歷史研究與節氣文化專屬策展人與內容生成專家，請務必優先使用 Google 搜尋查證最準確的文獻再回答。

請針對主題「${name}」進行分析，判斷它屬於哪一種類型：
1. 神佛/歷史人物
2. 節氣

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
  "imagePrompt": "請針對主題「${name}」以視覺描述特徵形象,壯闊河山、山水、名勝古蹟為背景,周圍特效,充滿意境史詩感的氛圍。"
}

如果判斷為【第二類：節氣】，請輸出：
{
  "category": "節氣",
  "reason": "請簡述判斷為此類的原因",
  "name": "節氣名稱（由上到下，由右到左不要標點符號）",
  "organization": "特性",
  "title": "10-15 字的精煉副標題，點出節令意涵（由上到下，由右到左不要標點符號）",
  "desc": "35-50 字的簡介。（由上到下由，右到左不要標點符號）",
  "poem": "一句符合主題的相關俗諺或詩詞（由上到下，由右到左不要標點符號）",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "imagePrompt": "視覺描述，節氣時令物候現象氛圍（不要人物）。"
}`;
    });

    return NextResponse.json({ prompts });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: error.message || "生成失敗" }, { status: 500 });
  }
}
