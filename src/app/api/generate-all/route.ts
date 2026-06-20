import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 注意：Vercel 免費版 (Hobby) 強制限制為 10-15 秒，此行在免費版雖無實質作用，但留著明確表達意圖
export const maxDuration = 60; 

// ==========================================
// 🌟 核心功能：模型降級輪替機制
// ==========================================
async function fetchWithModelFallback(prompt: string, options: { useSearch?: boolean } = {}) {
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

      // 判斷是否需要開啟 Google Search (第一階段專用)
      if (options.useSearch) {
        modelParams.tools = [{ googleSearch: {} }];
      } else {
        // 第二階段：確保長文本輸出的 Token 上限，並【強制開啟官方 JSON 模式】 🌟
        // 這能大幅加快生成速度，且絕對不會產生 ```json 標籤
        modelParams.generationConfig = { 
          maxOutputTokens: 8192,
          responseMimeType: "application/json" 
        };
      }

      const model = genAI.getGenerativeModel(modelParams);
      console.log(`[API 呼叫] 嘗試使用模型: ${modelName}`);

      const result = await model.generateContent(prompt);
      
      // 成功生成，回傳結果與「最終成功使用的模型名稱」
      return { result, modelUsed: modelName };

    } catch (err: any) {
      const errorMsg = err.message || "";
      console.warn(`[API 警告] 模型 ${modelName} 發生錯誤 (${errorMsg})`);

      // 判斷是否為可以重試/切換的錯誤 (429 額度不足 或 503 伺服器忙碌)
      const shouldFallback = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("503");

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

export async function POST(req: Request) {
  try {
    const { theme, customDocText, startFromStep = 1, existingData = {} } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: "Missing theme" }, { status: 400 });
    }

    let verifiedContext = customDocText || "";

    // ==========================================
    // Stage 1: 專注事實查核 (只有當沒有自訂文獻時才執行)
    // ==========================================
    if (!verifiedContext && startFromStep <= 1) {
      const researchPrompt = `
你是一位嚴謹的台灣民俗與歷史學家。請使用 Google Search 徹底調查主題：「${theme}」。
請注意，這類名詞常有字面誤導（例如數字不代表數量，姓氏不代表特定歷史名人）。
請提供一份約 800 字的精確事實報告，必須涵蓋：
1. 該信仰/名詞的「真實定義」與「數量」（如：五年千歲實際上是幾位？五年代表什麼？）。
2. 該神祇的歷史起源、生平背景（切勿與民間小說人物混淆，若無明確文獻請說明「由來不可考或具多種說法」）。
3. 核心精神、獨特科儀（如：馬鳴山鎮安宮的吃飯擔、建醮，請確認是否真的有王船祭）。
4. 藝術表徵。
請絕對基於搜尋到的客觀事實撰寫，嚴禁任何 AI 腦補。`;
      
      console.log("[Stage 1] 開始查核...");
      const { result: researchResult } = await fetchWithModelFallback(researchPrompt, { useSearch: true });
      verifiedContext = researchResult.response.text();
      console.log("[Stage 1] 事實查核完成");
    }

    // ==========================================
    // Stage 2: 專注格式化與創意生成
    // ==========================================
    let keysRequired = [];
    for (let i = startFromStep; i <= 10; i++) {
      keysRequired.push(`"${i}"`);
    }
    const keysString = keysRequired.join(", ");

    let prompt = `你是一位「世代銘印」頻道的專屬文化策展人與內容生成專家。現在我們要為主題「${theme}」進行一個 10 步驟的內容生產流程。\n\n`;
    
    prompt += `【⚠️ 絕對真實性指令】：\n以下是經過專家查核的「基礎背景文獻」。你在後續所有步驟中，**無論是生平、數量、科儀、神話，都必須 100% 遵守這份文獻的設定，絕對不可自行延伸小說情節或修改名詞定義**。\n\n---\n${verifiedContext}\n---\n\n`;

    if (startFromStep > 1) {
      prompt += `請注意，使用者已經確認了前 ${startFromStep - 1} 步的內容如下（作為後續步驟的背景參考）：\n---已確認內容---\n${JSON.stringify(existingData, null, 2)}\n------\n\n`;
      prompt += `現在請你基於上述已確認內容與背景，接續完成第 ${startFromStep} 到 10 步。\n`;
    }

    prompt += `請嚴格依照邏輯順序進行生成，後續步驟必須參考前面的產出。
你必須直接輸出 JSON 格式的物件，包含 ${11 - startFromStep} 個 key：${keysString}。每個 key 對應的 value **必須是純文字字串** (可用 Markdown 格式排版)，**絕對不可使用巢狀 JSON 物件或陣列**。
⚠️ **極度重要：所有的換行符號都必須使用 "\\n" (跳脫字元)，絕對不可在 JSON 字串中產生真實的換行。**

【步驟的要求如下】：`;	

    // 🌟 已移除原本程式碼中重複拼接二次的 Bug，優化 Token 與速度
    if (startFromStep <= 1) {
      prompt += `\n步驟 1：根據上方提供的【基礎背景文獻】，將內容整理並擴寫成一篇 1500 字深入、結構清晰的背景研究報告。嚴格禁止加入文獻中沒有的鄉野奇談。`;
    }
    if (startFromStep <= 2) {
      prompt += `\n步驟 2：根據${customDocText ? "上述文獻背景" : "步驟 1 的背景資料"}，撰寫一份 5-10 分鐘的 YouTube 長影片腳本。包含引人入勝的開場、深度內容解析、以及總結與互動引導。`;
    }
    if (startFromStep <= 3) {
      prompt += `\n步驟 3：根據步驟 2 的腳本，生成 5 個吸引人的標題、一組關鍵字標籤、以及一段包含時間軸建議的影片說明欄。`;
    }
    if (startFromStep <= 4) {
      prompt += `\n步驟 4：根據${customDocText ? "上述文獻背景" : "步驟 1 的背景資料"}，為主題撰寫 60 秒的 YouTube Shorts 短影片腳本。需求：節奏明快，前 3 秒必須有鉤子 (Hook)，內容精簡有力。`;
    }
    if (startFromStep <= 5) {
      prompt += `\n步驟 5：根據步驟 4 的短影音腳本，生成 3 個衝擊力強的短影片標題與 10 個 Hashtags。`;
    }
    if (startFromStep <= 6) {
      prompt += `\n步驟 6：根據步驟 2 的腳本，生成 3 組長影音 YouTube 縮圖設計 (16:9)。包含：縮圖名稱、高點擊文案、中英雙語 AI 繪圖提示詞 (風格必須包含 colorful ink wash, vivid diffusion, eastern fantasy, golden particles 等東方美學元素)。`;
    }
    if (startFromStep <= 7) {
      prompt += `\n步驟 7：生成 3 組短影音 YouTube 縮圖設計 (9:16)。包含與步驟 6 相似的內容，但針對直式螢幕構圖。`;
    }
    if (startFromStep <= 8) {
      prompt += `\n步驟 8：針對主題生成 3 組 16:9 彩墨風格意象圖的中英雙語繪圖提示詞，並各搭配一首七言四句詩詞。`;
    }
    if (startFromStep <= 9) {
      prompt += `\n步驟 9：針對主題生成 3 組 Suno AI 音樂生成提示詞 (1.史詩感、2.敘事感、3.活力感)，需包含 Music Style 等參數。`;
    }
    if (startFromStep <= 10) {
      prompt += `\n步驟 10：社群推播懶人包。請嚴格輸出三部分內容，務必以「### 🎨 視覺 Prompt」、「### 🖼️ 圖卡排版字卡」、「### 📱 社群發布正文」作為小標題：
(1) ### 🎨 視覺 Prompt：請【直接套用以下文字模板】，並根據史料將中括號內的變數替換為真實內容：
**16:9 動態分割構圖提示詞：**
以「${theme}」為核心主角，從前面的「步驟 1：背景研究」史料萃取五個【蒙太奇資訊】生成16:9 彩墨風格,五組畫格以【動態分割構圖（Dynamic Segmented Layout）】以及【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】組合併接成【蒙太奇資訊圖表（Montage Infographic）】

**主標題：**[請填入主標題]
1. **畫格 1：** [蒙太奇資訊名稱 1]
 **視覺描述：**[請填入視覺描述中文 Prompt]
2. **畫格 2：** [蒙太奇資訊名稱 2]
 **視覺描述：**[請填入視覺描述中文 Prompt]
3. **畫格 3：** [蒙太奇資訊名稱 3]
 **視覺描述：**[請填入視覺描述中文 Prompt]
4. **畫格 4：** [蒙太奇資訊名稱 4]
 **視覺描述：**[請填入視覺描述中文 Prompt]
5. **畫格 5：** [蒙太奇資訊名稱 5]
 **視覺描述：**[請填入視覺描述中文 Prompt]

**9:16 動態分割構圖提示詞：**
(內容與上方完全相同，但請替換為 9:16 的直式需求，並同樣根據史料填入變數)
(2) ### 🖼️ 圖卡排版字卡：為 4~5 個高光時刻設計適合放在圖片上的短標題與一句話說明；
(3) ### 📱 社群發布正文：包含 Hook 開場白、3-5點亮點解析、互動提問、祈福導流與 Hashtags。`;
    }

    prompt += `\n\n請現在開始生成。注意：因為已開啟 JSON Mode，請直接回傳符合上述結構的 JSON 格式物件即可。`;

    console.log("[Stage 2] 開始生成格式化內容...");
    
    // ✅ 呼叫輪替函數，自動處理 429 降級與 JSON Mode
    const { result, modelUsed } = await fetchWithModelFallback(prompt, { useSearch: false });
    let text = result.response.text().trim();
    
    try {
      // 由於開啟了 responseMimeType: "application/json"，回傳的 text 必然是純 JSON
      const parsedData = JSON.parse(text);
      
      // 確保所有 Value 都是字串格式
      for (const key in parsedData) {
        if (typeof parsedData[key] === "object" && parsedData[key] !== null) {
          parsedData[key] = JSON.stringify(parsedData[key], null, 2);
        } else if (typeof parsedData[key] !== "string") {
          parsedData[key] = String(parsedData[key]);
        }
      }

      return NextResponse.json({ 
        data: parsedData, 
        modelUsed: modelUsed,
        contextUsed: verifiedContext 
      });

    } catch (parseError) {
      console.error("JSON 解析失敗，原始文本：", text);
      throw parseError;
    }

  } catch (error: any) {
    console.error("API Error:", error);
    const errorMsg = error.message || "";
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      return NextResponse.json({ error: "Google API 額度已達上限。請稍後再試！" }, { status: 429 });
    }
    return NextResponse.json({ error: errorMsg || "Generation failed" }, { status: 500 });
  }
}