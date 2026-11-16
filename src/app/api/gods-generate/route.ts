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
      
      // 定義新中式質感書法與篆刻印章排版指令
      const calligraphyStyleSpec = "字體為典雅深墨色毛筆行書（直排、由上到下、由右到左、無標點符號），字旁點綴一枚精緻的朱紅色小篆印章，文字穩重融入畫面留白處，嚴禁發光特效或立體描邊";

      const imageTextInstruction1 = visualVariablesText
        ? `[直排書法主標：神明聖號] [直排書法副標：${visualVariablesText}]（${calligraphyStyleSpec}）`
        : `[直排書法主標：神明聖號]（${calligraphyStyleSpec}）`;

      const imageTextInstruction3 = visualVariablesText
        ? `[直排書法主標：宮廟名稱] [直排書法副標：${visualVariablesText}]（${calligraphyStyleSpec}）`
        : `[直排書法主標：宮廟名稱]（${calligraphyStyleSpec}）`;

      // 共用高質感視覺基底（宋代留白美學 + 低飽和傳統色）
      const aestheticBase = "宋代美學極簡留白構圖（畫面保留 40% 乾淨宣紙米白或天際留白供題字呼吸），低飽和度中國傳統色調（赭石、黛藍、竹青、淡金），細膩宣紙肌理與柔和自然光影，高級文創藝術海報質感，無雜亂背景，無現代商業廣告字體";

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
  "imagePrompt": "東方文創美學與新中式靜物攝影，描繪象徵「${name}」的核心法器或精神器物，背景為水墨暈染的遠山雲霧與溫潤晨曦微光。${aestheticBase}。畫面右側配置直排題字：${imageTextInstruction1}，搭配細宋體直排詩詞「[${poemInstruction}（無標點符號）]」。""
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
  "imagePrompt": "東方禪意靜物與日系空氣感（Kinfolk 風格）微距攝影，精準捕捉「${name}」時節的特定植物枝葉、露水霜雪或自然光影變化，柔和淺景深（Bokeh）。${aestheticBase}。畫面配置直排題字：[直排書法主標：節氣名稱]${localSecondVariable ? `[直排書法副標：${localSecondVariable}]` : ''}（${calligraphyStyleSpec}），並以細宋體直排點綴「[${poemInstruction}（無標點符號）]」與「[10-15 字的精煉副標題（無標點符號）]」。強烈要求：畫面絕對禁止出現任何人物、人類輪廓、剪影或現代人造物，並加上 --no humans, people, person, neon, 3d render。"
}

如果判斷為【第三類：宮廟】，請輸出：
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
  "imagePrompt": "東方建築幾何美學與人文紀實攝影，取景「${name}」極具代表性的傳統建築局部（如交趾陶剪黏飛簷仰望天際、斑駁紅磚牆上的光影、或晨光穿透線香裊裊青煙的丁達爾效應），空靈寧靜且避開雜亂電線與人潮。${aestheticBase}。畫面配置直排題字：${imageTextInstruction3}，搭配細宋體直排詩詞「[${poemInstruction}（無標點符號）]」與「[10-15 字的精煉副標題（無標點符號）]」，--no humans, crowd, neon。"
}`;
    });

    return NextResponse.json({ prompts });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: error.message || "生成失敗" }, { status: 500 });
  }
}
