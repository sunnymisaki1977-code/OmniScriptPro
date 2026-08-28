import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // 接收資料 (globalSecondVariable 預留給未來若您真的加了第二個輸入框時使用)
    const { names, secondVariable: globalSecondVariable } = await req.json();

    if (!names || !Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ error: "Missing names array" }, { status: 400 });
    }

    const prompts = names.map(rawName => {
      // 1. 🌟 智慧解析邏輯：攔截「+」號
      let name = rawName.trim();
      let localSecondVariable = globalSecondVariable ? globalSecondVariable.trim() : "";

      // 如果輸入的字串中包含「+」，就自動將其拆分為「主體」與「情境變數」
      let extraVariables: string[] = [];
      if (name.includes('+')) {
        const parts = name.split('+');
        name = parts[0].trim(); // 取得 "+" 前面的字 (例：湄洲臺北北后宮)
        // 支援 A+B+C+... 將後方所有變數組合起來
        extraVariables = parts.slice(1).map((p: string) => p.trim()).filter((p: string) => p);
        localSecondVariable = extraVariables.join('與'); // 用於文案理解
      }

      // 2. 動態判斷：套用解析出來的變數
      const combineInstruction = localSecondVariable
        ? `請將核心主題「${name}」與情境/節氣「${localSecondVariable}」進行完美融合，貫穿於文案與視覺設計中。`
        : `請針對主題「${name}」進行分析。`;

      const titleInstruction = localSecondVariable
        ? `需點出其神格特色並完美融合「${localSecondVariable}」的意涵`
        : `需點出其神格、節令或信仰特色`;

      const poemInstruction = localSecondVariable
        ? `一句完美結合『${name}』與『${localSecondVariable}』的祝福詩詞或對聯`
        : `一句符合主題的祝福詩詞或對聯`;

      // 視覺圖層文字：動態疊加第二變數的藝術字，多個變數以換行分隔，直行書寫
      const visualVariablesText = extraVariables.length > 0 ? extraVariables.join('\\n') : localSecondVariable;
      
      const imageTextInstruction1 = visualVariablesText
        ? `[藝術書法文字：神明聖號（由上到下，由右到左，不要標點符號）][藝術書法文字：${visualVariablesText}（由上到下，由右到左，不要標點符號）]`
        : `[藝術書法文字：神明聖號（由上到下，由右到左，不要標點符號）]`;

      const imageTextInstruction3 = visualVariablesText
        ? `[藝術書法文字：宮廟名稱（由上到下，由右到左，不要標點符號）][藝術書法文字：${visualVariablesText}（由上到下，由右到左，不要標點符號）]`
        : `[藝術書法文字：宮廟名稱（由上到下，由右到左，不要標點符號）]`;

      return `你是一位台灣民俗文化、宗教信仰、歷史研究與節氣文化專屬策展人與內容生成專家，請務必優先使用 Google 搜尋查證最準確的文獻再回答。

${combineInstruction}
判斷主要核心「${name}」屬於哪一種類型：
1. 神佛/歷史人物
2. 節氣
3. 宮廟

【絕對不可】包含任何 Markdown 語法 (如 \`\`\`json) 或其他多餘的解釋文字，只能回傳一個完整的 JSON 物件。請嚴格根據判斷結果輸出對應的格式：

如果判斷為【第一類：神佛/歷史人物】，請輸出：
{
  "category": "神佛/歷史人物",
  "reason": "請簡述判斷為此類的原因",
  "name": "神明聖號（由上到下，由右到左，不要標點符號）",
  "organization": "組織，只能填入 佛、道、儒 其中一個",
  "title": "10-15 字的精煉副標題，${titleInstruction}（由上到下，由右到左，不要標點符號）",
  "desc": "35-50 字的簡介。需以『考證文獻、文化脈絡、社會現象』的角度切入（由上到下，由右到左，不要標點符號）",
  "poem": "${poemInstruction}（由上到下，由右到左，不要標點符號）",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "imagePrompt": "「${name}」形象特徵、充滿禪意或史詩感的氛圍,壯闊河山、山水、名勝古蹟為背景,周圍特效,充滿意境史詩感的氛圍，[${poemInstruction}（由上到下，由右到左，不要標點符號）]
${imageTextInstruction1}。"
}

如果判斷為【第二類：節氣】，請輸出：
{
  "category": "節氣",
  "reason": "請簡述判斷為此類的原因",
  "name": "節氣名稱（由上到下，由右到左，不要標點符號）",
  "organization": "特性",
  "title": "10-15 字的精煉副標題，${titleInstruction}（由上到下，由右到左，不要標點符號）",
  "desc": "35-50 字的簡介。（由上到下，由右到左，不要標點符號）",
  "poem": "${poemInstruction}（由上到下，由右到左，不要標點符號）",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "imagePrompt": "請針對此節氣生成『純無人風景與靜物微距特寫』的視覺描述，[藝術書法文字：節氣名稱（由上到下，由右到左，不要標點符號）]${localSecondVariable ? `[藝術書法文字：${localSecondVariable}（由上到下，由右到左，不要標點符號）]` : ''}[${poemInstruction}（由上到下，由右到左，不要標點符號）][10-15 字的精煉副標題，${titleInstruction}（由上到下，由右到左，不要標點符號）]。強烈要求：畫面絕對禁止出現任何人物、人類輪廓、剪影或人造物。請將畫面視覺焦點 100% 集中於『特定植物、天候光影變化、自然地貌或空景』，並可加上 --no humans, people, person 參數。"
}

如果判斷為【第三類：宮廟】，
請輸出：
{
  "category": "宮廟",
  "reason": "請簡述判斷為此類的原因",
  "name": "宮廟名稱（由上到下，由右到左，不要標點符號）",
  "organization": "主祀神尊或信仰流派",
  "title": "10-15 字的精煉副標題，${titleInstruction}（由上到下，由右到左，不要標點符號）",
  "desc": "35-50 字的簡介。需以『建廟歷史、建築特色、在地信仰意義』的角度切入（由上到下，由右到左，不要標點符號）",
  "solar_term": "${localSecondVariable ? localSecondVariable : '請填入最適合該廟宇主要祭典的節氣名稱（由上到下，由右到左，不要標點符號）'}",
  "poem": "${poemInstruction}（由上到下，由右到左，不要標點符號）",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "imagePrompt": "「${name}」的視覺描述，無人物、充滿禪意或史詩感的氛圍，${imageTextInstruction3}[${poemInstruction}（由上到下，由右到左，不要標點符號）][10-15 字的精煉副標題，${titleInstruction}（由上到下，由右到左，不要標點符號）]。"
}`;
    });

    return NextResponse.json({ prompts });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: error.message || "生成失敗" }, { status: 500 });
  }
}
