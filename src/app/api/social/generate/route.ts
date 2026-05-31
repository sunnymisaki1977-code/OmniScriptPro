import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { theme, step2Content } = await req.json();

    if (!theme || !step2Content) {
      return NextResponse.json({ error: "Missing theme or step2Content" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `你是一位「世代銘印」頻道的專屬文化策展人與內容生成專家。
請針對主題「${theme}」生成跨平台的社群圖文推播文案。
參考影片腳本背景：
${step2Content}

【語氣與排版核心指導原則】：
1. 語氣設定：請以「儒家謙卑、傳統說書人」的口吻撰寫，傳遞文化溫度，切勿使用浮誇、煽情或怪力亂神的詞彙。
2. 視覺純粹性：文案中嚴禁出現任何英文字母或程式標籤（Hashtags 例外，但請精簡）。
3. 互動引導：請在文案最後溫和地引導信眾/讀者點擊連結觀看完整影片或前往網站。

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（**）。

請直接輸出以下格式：

### FB社群 (深度長文)
貼文標題：[請填入具備文化底蘊的標題]
貼文內文：[請填入 150-300 字左右的深度文化解說，段落分明]
互動結語：[請填入溫和的引導語，並附上觀看連結預留位：https://...]
主題標籤：[請填入 3-5 個相關的中文 Hashtag]

### LINE官方帳號 (早安問候短文)
推播主旨：[請填入 20 字以內，適合手機推播預覽的溫暖問候]
推播內文：[請填入 50-80 字左右的精簡問候]
引導點擊：[請填入按鈕文字，例如：點此聆聽神明傳奇 ⬇️]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("Gemini API Error (Social):", error);
    return NextResponse.json({ error: error.message || "AI Generation failed" }, { status: 500 });
  }
}
