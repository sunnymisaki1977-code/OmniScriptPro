import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { trackGeminiUsage } from '@/utils/tokenTracker';

export const dynamic = 'force-dynamic';

function setCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-gemini-api-key');
  return res;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      base64, 
      mimeType: inputMimeType, 
      filename = 'document',
      apiKey: clientApiKey,
      instructions
    } = body;

    if (!base64) {
      return setCorsHeaders(NextResponse.json({ error: '請提供檔案 base64 編碼內容' }, { status: 400 }));
    }

    // 金鑰選擇：優先使用請求頭或 Body 傳入的金鑰，次選環境變數
    const headerKey = req.headers.get('x-gemini-api-key');
    const selectedApiKey = headerKey || clientApiKey || process.env.GEMINI_API_KEY;

    if (!selectedApiKey) {
      return setCorsHeaders(NextResponse.json({ 
        error: '系統未設定 GEMINI_API_KEY，且請求未附帶金鑰。請於設定中綁定 Gemini API Key。' 
      }, { status: 401 }));
    }

    // 清理 Base64 前綴與推斷 MIME 類型
    let cleanBase64 = base64;
    let mimeType = inputMimeType || 'application/pdf';

    const dataUriMatch = base64.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      cleanBase64 = dataUriMatch[2];
    }

    // 針對文件與圖表多模態解構的專業 Prompt
    const systemPrompt = `
你是一位世界級的「多模態文件理解與數據架構專家」（Multimodal Document & Chart Deconstruction Specialist）。
請深入解析這份文件或圖片，並執行「高保真度圖文與數據結構化解構」，確保原文件內的所有圖表、表格、數值關係完整保留，絕對不只產出乾癟的純文字。

請嚴格依照下列【四大結構化規範】輸出 Markdown：

---
### 📌 1. 【文件核心概要與章節文本】
* 保留所有核心標題、作者/機構資訊、研究背景與核心論述。
* 條列清晰，保留原文專有名詞與時序脈絡。

### 📊 2. 【數據表格 (Tables) 100% 還原】
* 文件/圖片內的所有表格，必須完整轉換為標準 GitHub Flavored Markdown (GFM) 表格。
* 嚴格保留所有表頭、數據欄位、單位標註，嚴禁簡化或略過任何數據列！

### 📈 3. 【統計圖表 (Charts & Trends) 數據透視】
若原文件包含折線圖、長條圖/柱狀圖、圓餅圖、散布圖或走勢圖，請逐一為每張圖表建立【數據透視區塊】：
> 📊 **【圖表分析：[圖表名稱/主題]】**
> - **圖表類型**：(如：季度營收折線圖 / 成本結構圓餅圖)
> - **坐標軸與維度**：X 軸 [維度與單位]、Y 軸 [維度與單位]
> - **關鍵數據點與極值**：列出圖中明確標註的數值、峰值、谷值、轉折年份/季度
> - **核心趨勢結論**：總結該圖表展示的業務/學術核心意涵

### 🔀 4. 【流程圖、架構圖與模型拓撲 (Flowcharts & Diagrams)】
* 若有流程圖或系統架構圖，請直接轉譯為可渲染的 \`\`\`mermaid 流程語法，或依序以條列步驟樹狀結構展示邏輯關聯。

---
${instructions ? `使用者特定指示：${instructions}\n---\n` : ''}

最後，請在整篇內容的最末尾，附帶一個名為 <!-- ARTIFACTS_SUMMARY --> 的標籤，以 JSON 格式總結本文件抓取到的圖表與表格清單（格式範例）：
\`\`\`json:artifacts
[
  { "type": "table", "title": "表格名稱", "summary": "簡短一句話說明" },
  { "type": "chart", "title": "圖表名稱", "summary": "簡短一句話說明" }
]
\`\`\`
`;

    const genAI = new GoogleGenerativeAI(selectedApiKey);
    // 依序調度：優先使用 gemini-3.1-flash-preview，若額度或環境不支援則自動降級備援
    const candidateModels = ['gemini-3.1-flash-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash'];
    
    let result: any = null;
    let actualModel = candidateModels[0];
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.2 // 低溫確保數據與表格高精確度
          }
        });

        result = await model.generateContent([
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          },
          systemPrompt
        ]);
        actualModel = modelName;
        break; // 成功即跳出
      } catch (err: any) {
        lastError = err;
        console.warn(`[ParseMultimodal] 模型 ${modelName} 調用失敗，嘗試降級備援:`, err.message || err);
      }
    }

    if (!result) {
      throw lastError || new Error('所有可用多模態模型皆調用失敗');
    }

    const response = await result.response;
    const rawText = response.text();
    const durationMs = Date.now() - startTime;
    const usageMetadata = (response as any).usageMetadata || null;

    // 紀錄 Token 消耗
    if (usageMetadata) {
      try {
        trackGeminiUsage({
          model: actualModel,
          endpoint: 'parse-multimodal',
          functionalRole: actualModel.includes('3') ? 'general_content' : 'fallback',
          usage: usageMetadata,
          durationMs: durationMs,
          tags: [filename, mimeType, 'multimodal-doc-parse']
        });
      } catch (trackErr) {
        console.warn('[ParseMultimodal] Token 追蹤警示:', trackErr);
      }
    }

    // 解析末尾的 artifacts 清單
    let artifacts: Array<{ type: string; title: string; summary: string }> = [];
    let cleanMarkdown = rawText;

    const artifactsMatch = rawText.match(/```json:artifacts\s*([\s\S]*?)\s*```/);
    if (artifactsMatch && artifactsMatch[1]) {
      try {
        artifacts = JSON.parse(artifactsMatch[1].trim());
        // 從輸出文字中移除純 metadata 區塊，維持 Markdown 乾淨
        cleanMarkdown = rawText.replace(/```json:artifacts[\s\S]*?```/, '').trim();
      } catch (jsonErr) {
        console.warn('[ParseMultimodal] Artifacts JSON 解析略過:', jsonErr);
      }
    }

    return setCorsHeaders(NextResponse.json({
      success: true,
      filename: filename,
      mimeType: mimeType,
      formattedMarkdown: cleanMarkdown,
      artifacts: artifacts,
      usageMetadata: usageMetadata,
      durationMs: durationMs
    }));

  } catch (error: any) {
    console.error('[ParseMultimodal API Error]:', error);
    return setCorsHeaders(NextResponse.json({ 
      error: error.message || '文件解析失敗',
      details: String(error)
    }, { status: 500 }));
  }
}
