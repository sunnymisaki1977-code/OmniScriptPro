import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { names } = await req.json();

    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: "Missing names array" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const results = [];

    for (const name of names) {
      const prompt = `請以客觀的台灣民間信仰與文化人類學角度，考證神明「${name}」。
      絕不可使用迷信或降乩語氣。語氣需完全客觀、學術。
      
      請嚴格按照以下 JSON 格式回傳，不可有其他多餘文字：
      {
        "name": "神明聖號（如：天上聖母）",
        "organization": "組織，只能填入 佛、道、儒 其中一個",
        "title": "10-15 字的精煉副標題，需點出其神格或象徵",
        "desc": "35-50 字的簡介。需以『考證文獻、文化脈絡、社會現象』的角度切入",
        "poem": "一句符合主題詩詞",
        "tags": ["標籤1", "標籤2", "標籤3"],
        "imagePrompt": "生成圖像的Prompt：請結合『神明的形象描述』與這句『Poem』，寫出一段適合交給 AI 繪圖工具（如 Midjourney）生成水墨風格(ink wash painting)神像的英文提示詞"
      }`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          results.push({
            id: `god-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...parsed,
            imageUrl: "" // Placeholder for future image generation
          });
        }
      } catch (e) {
        console.error("Failed to parse JSON for", name, e);
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Gods Generate API Error:", error);
    return NextResponse.json({ error: error.message || "生成失敗" }, { status: 500 });
  }
}
