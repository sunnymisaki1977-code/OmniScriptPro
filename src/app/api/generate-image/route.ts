import { NextResponse } from "next/server";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const modelsToTry = [
  "gemini-3.1-flash-image",       // 1. 首選：Nano Banana 2 (最泛用，支援多圖參考與 4K)
  "gemini-3.1-flash-lite-image",  // 2. 備用：Nano Banana 2 Lite (如果上一個塞車，用這個最快頂上)
  "gemini-3-pro-image",           // 3. 備用：Nano Banana Pro (如果遇到複雜提示詞，交給它)
  "gemini-2.5-flash-image"        // 4. 最後防線：Nano Banana (前代穩定版)
];

    let lastGoogleError = null;
    let base64Image = null;

    for (const modelName of modelsToTry) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict`;
        const body = {
          instances: [
            { prompt: prompt }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio === "16:9" ? "16:9" : "9:16"
          }
        };

// 建立一個幫 fetch 加上 Timeout 的小工具
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};        


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
