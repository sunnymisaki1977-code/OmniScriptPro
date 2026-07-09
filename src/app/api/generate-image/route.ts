import { NextResponse } from "next/server";

// 🎯 排定官方圖像模型的優先順序
const IMAGE_MODELS = [
  "gemini-3.1-flash-image",      // 1. 首選：最泛用，支援多圖參考
  "gemini-3.1-flash-lite-image", // 2. 備用：速度最快
  "gemini-3-pro-image",          // 3. 備用：複雜提示詞首選
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 💡 相容兩種前端傳參欄位名稱
    const rawPrompt = body.promptText || body.prompt;
    const aspectRatio = body.aspectRatio || "16:9";
    const mainTitle = body.mainTitle || "";
    const subTitle = body.subTitle || "";
    const poetry = body.poetry || "";
    const customApiKey = body.apiKey || "";
    const requestedEngine = body.imageEngine;

    if (!rawPrompt) {
      return NextResponse.json({ error: "缺少提示詞 prompt" }, { status: 400 });
    }

    const apiKeyToUse = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKeyToUse) {
      return NextResponse.json({ error: "伺服器未設定 Gemini API 金鑰" }, { status: 500 });
    }

    let lastGoogleError: any = null;

    // ==========================================
    // 🔄 階段一：嘗試呼叫 Google Gemini 圖像模型
    // ==========================================
    const modelsToTry = requestedEngine ? 
      [requestedEngine, ...IMAGE_MODELS.filter(m => m !== requestedEngine)] : 
      IMAGE_MODELS;

    const isOAuth = apiKeyToUse.startsWith("ya29.");
    const keyQuery = isOAuth ? "" : `?key=${apiKeyToUse}`;
    
    const headers: any = { 'Content-Type': 'application/json' };
    if (isOAuth) {
        headers['Authorization'] = `Bearer ${apiKeyToUse}`;
    }

    for (const currentModel of modelsToTry) {
      try {
        console.log(`🎨 正在嘗試使用官方模型 [${currentModel}] 生成圖片...`);
        
        const fullPrompt = `[${currentModel}] Masterpiece, extremely detailed, highest quality, ultra-high definition, 8k resolution. Theme: ${mainTitle}. ${subTitle}. Context: ${poetry}. ${rawPrompt} --ar ${aspectRatio}`;

        // 🚀 使用 REST API 呼叫 Imagen / Gemini Image 模型
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:predict${keyQuery}`;
        
        // 為了相容 Google 圖像模型的標準 payload
        const requestBody = {
            instances: [
                { prompt: fullPrompt }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio
            }
        };

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(JSON.stringify(errData.error || errData));
        }

        const data = await res.json();
        
        // 成功拿到圖片資料 (Base64) - 解析 predict API 的回傳
        let generatedImageBase64 = null;
        if (data.predictions && data.predictions.length > 0) {
            // Vertex / Imagen 標準格式
            generatedImageBase64 = data.predictions[0].bytesBase64Encoded;
        } else if (data.candidates && data.candidates[0] && data.candidates[0].content?.parts?.[0]?.inlineData?.data) {
            // Gemini 標準格式
            generatedImageBase64 = data.candidates[0].content.parts[0].inlineData.data;
        }
  
        if (generatedImageBase64) {
          console.log(`✅ 成功使用 ${currentModel} 生成圖片！`);
          
          return NextResponse.json({
            success: true,
            modelUsed: currentModel,
            image: `data:image/jpeg;base64,${generatedImageBase64}`,
            isFallback: false
          });
        }
        
        throw new Error("API 未回傳有效的圖片格式");

      } catch (err) {
        const errorMessage = (err as any).message || String(err);
        console.warn(`⚠️ 模型 [${currentModel}] 呼叫失敗，原因: ${errorMessage}`);
        lastGoogleError = err;
        // 如果不是最後一個模型，等待 1 秒後輪替下一個
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // ==========================================
    // 備援機制：當 Google 模型全滅，啟動 Pollinations 墊底
    // ==========================================
    console.warn("🚨 所有 Google Gemini 圖像模型皆失敗。啟動 Pollinations 備援機制...", (lastGoogleError as any)?.message);
    
    // 依長寬比設定解析度
    const width = aspectRatio === "16:9" ? 1024 : 576;
    const height = aspectRatio === "16:9" ? 576 : 1024;

    // 清理並過濾提示詞，避免特殊符號導致 URL 帶入錯誤
    let simplePrompt = rawPrompt.replace(/[^a-zA-Z0-9\s,.-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!simplePrompt || simplePrompt.length < 5) {
      simplePrompt = "Eastern fantasy ink wash painting, cinematic lighting, masterpiece";
    } else {
      simplePrompt = simplePrompt.substring(0, 500);
    }
    
    const seed = Math.floor(Math.random() * 1000000);
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplePrompt)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
    
    console.log("備援圖片網址:", fallbackUrl);

    return NextResponse.json({
      success: true,
      modelUsed: "pollinations-ai-fallback",
      image: fallbackUrl,
      isFallback: true
    });

  } catch (error) {
    console.error("生成圖片發生錯誤:", error);
    return NextResponse.json({ error: "生成圖片失敗，且備援機制亦無法啟動" }, { status: 500 });
  }
}