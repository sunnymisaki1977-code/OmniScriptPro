import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// 初始化官方客戶端
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🎯 依據你的設定，排定官方圖像模型的優先順序
const IMAGE_MODELS = [
  "gemini-3.1-flash-image",      // 1. 首選：最泛用，支援多圖參考
  "gemini-3.1-flash-lite-image", // 2. 備用：速度最快
  "gemini-3-pro-image",          // 3. 備用：複雜提示詞首選
  "gemini-2.5-flash-image"       // 4. 最後防線：前代穩定版
];

export async function POST(req: Request) {
  try {
    const { promptText, aspectRatio = "16:9" } = await req.json();

    if (!promptText) {
      return NextResponse.json({ error: "缺少提示詞 promptText" }, { status: 400 });
    }

    let lastError = null;

    // 🔄 自動輪替重試機制
    for (let i = 0; i < IMAGE_MODELS.length; i++) {
      const currentModel = IMAGE_MODELS[i];
      
      try {
        console.log(`🎨 正在嘗試使用官方模型 [${currentModel}] 生成圖片...`);

        // 💡 呼叫官方最新生圖方法
        const response = await ai.models.generateImages({
          model: currentModel,
          prompt: promptText,
          config: {
            numberOfImages: 1,
            aspectRatio: aspectRatio, // 支援 '16:9', '9:16', '1:1' 等
            outputMimeType: "image/jpeg",
          },
        });

        // 🚀 成功拿到圖片資料 (Base64)
        const base64Image = response.generatedImages[0].image.imageBytes;
        
        return NextResponse.json({
          success: true,
          modelUsed: currentModel,
          // 直接包裝成前端 <img> 標籤可以直接讀取的 Base64 格式
          imageUrl: `data:image/jpeg;base64,${base64Image}`
        });

      } catch (err: any) {
        console.warn(`⚠️ 模型 [${currentModel}] 呼叫失敗，原因: ${err.message || err}`);
        lastError = err;
        // 如果不是最後一個模型，就等待 1.5 秒後繼續嘗試下一個備用模型
        if (i < IMAGE_MODELS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
    }

    // 如果所有模型都失敗了，吐出最後的錯誤
    throw lastError || new Error("所有圖像模型皆無法生成");

  } catch (error: any) {
    console.error("❌ 官方 Gemini 圖像生成致命錯誤:", error);
    return NextResponse.json({ error: error.message || "生圖失敗" }, { status: 500 });
  }
}


// 設定等待 Google API 最多 15 秒
const response = await fetchWithTimeout(endpoint, {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    "x-goog-api-key": API_KEY 
  },
  body: JSON.stringify(body),
}, 15000);
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(`Google API error (${modelName}): ${response.status} - ${errorData?.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (data.predictions && data.predictions.length > 0) {
          const prediction = data.predictions[0];
          if (prediction.bytesBase64Encoded) {
            base64Image = prediction.bytesBase64Encoded;
          }
        }

        if (base64Image) {
          console.log(`Successfully generated image using ${modelName}`);
          return NextResponse.json({ 
            success: true, 
            image: `data:image/jpeg;base64,${base64Image}`,
            modelUsed: modelName
          });
        }
      } catch (err: any) {
        console.warn(`Failed to generate with ${modelName}:`, err.message);
        lastGoogleError = err;
        // Continue to the next model in the loop
      }
    }

    // If we reach here, all Google models failed.
    console.warn("All Google Gemini Image models failed. Falling back to free image generation. Last Error:", lastGoogleError?.message);
    
    // Fallback for free tier users or quota errors
    const width = aspectRatio === "16:9" ? 1024 : 576;
    const height = aspectRatio === "16:9" ? 576 : 1024;

    // Sanitize prompt for Pollinations
    let simplePrompt = prompt.replace(/[^a-zA-Z0-9\s,.-]/g, ' ').replace(/\s+/g, ' ').trim();
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
        return NextResponse.json({ 
          success: true, 
          image: `data:image/jpeg;base64,${base64Fallback}`,
          modelUsed: "Pollinations.ai (Flux/SDXL)",
          isFallback: true
        });
      }
    } catch (err) {
      console.error("Fallback image generation failed:", err);
    }

    throw new Error(
      lastGoogleError?.message || "Failed to generate image with all available Google models and fallback engines."
    );
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
