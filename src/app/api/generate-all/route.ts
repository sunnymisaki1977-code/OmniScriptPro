import { GoogleGenAI } from "@google/genai";
import { getWorkflowSteps } from "@/utils/promptConfigs";
import { NextResponse } from "next/server";

export const maxDuration = 60; // 延長 Vercel Pro/付費版預設截斷時間

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
      const researchPrompt = `你是一位嚴謹的台灣民俗與歷史學家。請使用 Google Search 徹底調查主題：「${theme}」。
請注意，這類名詞常有字面誤導（姓氏不代表特定歷史名人）。
請提供一份約 1500 字的精確事實報告：
請絕對基於搜尋到的客觀事實撰寫，嚴禁任何 AI 腦補。

## 🗂️ 詳細架構與撰寫指南

### 一、 導言：與祂的初次見面
    破題引言：   用一句話總結這位神佛在民間最深入人心的形象（例如：「在臺灣，每逢農曆三月，總有一股熱潮席捲全島，那就是...」）。
    現代社會影響力：   簡述祂在現代社會、海內外信仰圈的普及程度與信仰人口分布。

### 二、 神格定位與尊號系統
    正式尊稱與歷代封號：
     官方或朝廷敕封：[例如：護國庇民妙靈昭應弘仁普濟天上聖母]
      民間親切俗稱：[例如：媽祖婆、婆姐、聖母]
      不同宗教/派別的稱呼：[例如：關公在道教尊為「三界伏魔大帝」，在佛教尊為「伽藍菩薩」]
    宗教職能與階級：   屬於哪一個宗教體系？在神界行政體系中擔任什麼職位？（例如：地方最高主宰、地府掌管者、行業祖師爺）。

### 三、 凡人身世與成神傳奇（祂從哪裡來？）
> 💡   撰寫提示：   若該神明為「先天神」（如：玉皇大帝、太陽星君、西王母），此段可調整為「宇宙誕生、自然化育與神話源流」。

    降生背景與異象：   誕生於哪個朝代、地理位置？俗名為何？出生時是否有天降紅光、滿室異香、百鳥朝鳳等神異現象？
    凡間修持與人格特質：   祂在人間時展現了哪些不凡的特質？（如：過人的智慧、精湛的醫術、極致的孝行、保家衛國的英勇事蹟）。
    得道 / 昇天契機：      關鍵轉折：  經歷了什麼重大的考驗、修行、頓悟或拜師經歷？
       羽化登仙：  祂是如何離開人世並被尊為神的？（如：為救百姓而犧牲、白日飛升、遇難後靈魂顯聖庇護鄉里）。

### 四、 經典神蹟與民間傳說（祂做了什麼？）
    核心神蹟（精選 1-2 則）：   挑選最具代表性、最廣為人知且具備文學色彩的故事（如：保生大帝「點龍眼、醫虎喉」、濟公活佛「古井運木」）。
    平定災難與庇護地方：   祂曾幫助民間解決過什麼重大災難？（如：平定瘟疫、驅逐妖怪、乾旱求雨、戰亂中顯靈護國）。
    神魔鬥法或收服隨從：   是否有與其他神魔鬥法，或是感化、收服部將的傳奇故事？

### 五、 法相特徵與隨身法器（祂長什麼樣子？）
    金身法相解析：      面容與神情：  膚色（如黑面媽祖代表威赫、粉面代表親和）、神情（慈祥、威嚴、憤怒降魔尊）。
       服飾與冠冕：  身穿文袍、武冠、龍袍或一襲白衣？
       坐騎：  是否有專屬坐騎？（如：文殊菩薩騎獅、普賢菩薩騎象、玄天上帝腳踏龜蛇）。
    法器與隨身物件的寓意：   祂手上拿著什麼？這些物件背後代表什麼權力、願力或功能？（如：文昌帝君的毛筆與功名簿、觀音菩薩的淨瓶柳枝、托塔天王的寶塔）。
    左右護法與隨從神將：   祂的身邊常伴隨哪些神將、童子或部屬？（如：媽祖與千里眼/順風耳、關聖帝君與關平/周倉）。

### 六、 職能守護與信仰群體（誰去拜祂？）
    主要掌管職務：   現代人遇到生活中的哪些疑難雜症會特別去祈求這位神佛？
       祈福範疇：  求財運、求子嗣、求功名考試、求身體健康、求航海與交通安全等。
    特定崇拜行業與群體：   哪些行業特別奉祂為守護神、祖師爺？（如：警察、商人拜關公；木工、建築業拜魯班；醫藥界拜保生大帝與神農大帝）。

### 七、 現代信仰文化與祭祀儀式
    重要聖誕與重要節慶：   祂的聖誕千秋（生日）或得道昇天日是農曆哪一天？當天民間與宮廟有何特殊的慶祝方式？
    海內外代表性廟宇：     歷史悠久的發源祖廟（如：湄洲媽祖祖廟、解州關帝廟）。
      現今香火最鼎盛、最具指標性的代表宮廟。
    獨特民俗與宗教儀式：   與祂緊密相關的特殊民俗活動（如：遶境進香、割香、建醮祈安、王爺信仰的「燒王船」、特殊的民俗陣頭）。

### 八、小說演義 / 民間傳說 對比：  
正史《三國志》與 小說《三國演義》的差異，這樣的介紹既具備學術公信力，又充滿引人入勝的文學趣味！

### 九、 結語：神格精神的現代啟示
    核心價值的現代轉化：   這位神佛的核心精神（如：媽祖的無私慈悲、關公的誠信忠義）對現代人的生活、職場或道德操守有何指引與啟發？
    文化傳承與反思：   總結祂如何從歷史記載或遠古神話，一步步走入現代人的心靈，成為跨越時代的精神寄託。

`;
      
      try {
        const searchResponse = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: researchPrompt,
          config: {
            tools: [{ googleSearch: {} }] // 開啟搜尋
          }
        });
        verifiedContext = searchResponse.text || "";
        console.log("[Stage 1] 事實查核完成");
      } catch (err) {
        console.warn("事實查核發生錯誤，將使用空字串繼續...", err);
      }
    }

    // ==========================================
    // Stage 2: 模組化批次生成內容
    // ==========================================
    // 1. 篩選出本次請求需要生成的步驟
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'CultureTech');
    const targetSteps = WORKFLOW_STEPS.filter(step => step.id >= startFromStep && step.id <= endStep);
    if (targetSteps.length === 0) {
      return NextResponse.json({ error: "無效的步驟範圍" }, { status: 400 });
    }

    const keysRequired = targetSteps.map(step => `"${step.id}"`); // 修改為直接使用 "${step.id}" 符合前端預期
    
    // 2. 建立大師級「自我參考」與「史料」上下文
    const stepContext = {
      theme: theme,
      step1: verifiedContext ? verifiedContext : "【請基於你在 Step 1 產出的內容】",
      step2: existingData[2] || "【請基於你在 Step 2 產出的內容】",
      step3: existingData[3] || "【請基於你在 Step 3 產出的內容】",
      step4: existingData[4] || "【請基於你在 Step 4 產出的內容】",
      step5: existingData[5] || "【請基於你在 Step 5 產出的內容】",
    };

    // 3. 組裝 Master Prompt
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
2. 本次只需輸出 ${targetSteps.length} 個 key：${keysRequired.join(", ")}。
3. 每個 key 的 value 請填入對應步驟生成的完整純文字內容（可用 Markdown 排版，換行請用 "\\n" 跳脫，絕對禁止巢狀物件或陣列）。

以下是本次需執行的步驟指令：\n\n`;

    // 4. 動態注入目標步驟的提示詞
    for (const step of targetSteps) {
      masterPrompt += `--- [步驟 ${step.id}：${step.title}] ---\n`;
      masterPrompt += step.prompt(stepContext) + "\n\n";
    }

    console.log(`[Stage 2] 開始生成步驟 ${startFromStep} 到 ${endStep}...`);

    // ==========================================
    // 執行與重試機制 (Exponential Backoff)
    // ==========================================
    const MODELS = ["gemini-2.5-flash", "gemini-2.5-pro",  "gemini-2.5-flash-lite"];
    let modelUsed = "";
    const MAX_RETRIES = 4;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      modelUsed = MODELS[attempt - 1] || MODELS[MODELS.length - 1];

      try {
        const response = await ai.models.generateContent({
          model: modelUsed,
          contents: masterPrompt,
          config: {
            responseMimeType: "application/json", // 強制 JSON 模式
            maxOutputTokens: 8192,
          }
        });

        let cleanText = (response.text || "{}").trim();
        
        // 雙重防禦：去除可能的 markdown 殘留
        cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/i, "").trim();

        const parsedData = JSON.parse(cleanText);

        // 確保所有的值都被轉為字串，避免前端 React 渲染 Error
        for (const key in parsedData) {
          if (typeof parsedData[key] === "object" && parsedData[key] !== null) {
            parsedData[key] = JSON.stringify(parsedData[key], null, 2);
          } else {
            parsedData[key] = String(parsedData[key]);
          }
        }

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
      return NextResponse.json({ error: "Google API 額度已達上限。請稍後再試！" }, { status: 429 });
    }
    return NextResponse.json({ error: error.message || "生成失敗" }, { status: 500 });
  }
}
