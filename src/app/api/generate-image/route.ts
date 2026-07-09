import { GoogleGenAI } from "@google/genai";
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

    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

    let lastGoogleError: any = null;

    // ==========================================
    // 🔄 階段一：嘗試呼叫 Google Gemini 圖像模型
    // ==========================================
    const modelsToTry = requestedEngine ? 
      [requestedEngine, ...IMAGE_MODELS.filter(m => m !== requestedEngine)] : 
      IMAGE_MODELS;

    for (const currentModel of modelsToTry) {
      try {
        console.log(`🎨 正在嘗試使用官方模型 [${currentModel}] 生成圖片...`);

        const fullPrompt = `[${currentModel}] Masterpiece, extremely detailed, highest quality, ultra-high definition, 8k resolution. Theme: ${mainTitle}. ${subTitle}. Context: ${poetry}. ${rawPrompt} --ar ${aspectRatio}`;

        // 🚀 使用最新版的 Interactions API
        const interaction = await ai.interactions.create({
          model: currentModel,
          input: fullPrompt,
        });

        // 成功拿到圖片資料 (Base64)
        const generatedImage = interaction.output_image;
  
        if (generatedImage && generatedImage.data) {
          console.log(`✅ 成功使用 ${currentModel} 生成圖片！`);
          
          return NextResponse.json({
            success: true,
            modelUsed: currentModel,
            image: `data:image/jpeg;base64,${generatedImage.data}`,
            isFallback: false
          });
        }

      } catch (err) {
        // 💡 在內部作轉型，避免 catch 報錯
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
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(simplePrompt)}?width=${width}&height=${height}&nologo=true&seed=${seed}`;
    
    try {
      const imgRes = await fetch(fallbackUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "image/jpeg,image/png,*/*"
        }
      });

      if (imgRes.ok) {
        const arrayBuffer = await imgRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Fallback = buffer.toString('base64');
        
        console.log(`🎉 成功透過 Pollinations.ai 備援生成圖片！`);
        return NextResponse.json({ 
          success: true, 
          image: `data:image/jpeg;base64,${base64Fallback}`,
          modelUsed: "Pollinations.ai (Flux/SDXL)",
          isFallback: true
        });
      }
    } catch (err) {
      const errorMessage = (err as any).message || String(err);
      console.error("❌ 備援生圖引擎也失敗:", errorMessage);
    }

    // 如果連備援都掛了，拋出最終錯誤
    throw new Error(
      (lastGoogleError as any)?.message || "無法透過 Google 模型或備援引擎生成圖像。"
    );

  } catch (error) {
    const errObj = error as any;
    console.error("💥 圖像生成終端致命錯誤:", errObj);
    return NextResponse.json({ error: errObj.message || "生圖失敗" }, { status: 500 });
  }
}