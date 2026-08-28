import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });
    }

    const apiKeyRaw = process.env.GEMINI_API_KEY;
    if (!apiKeyRaw) {
      return NextResponse.json({ error: "伺服器未設定 GEMINI_API_KEY" }, { status: 500 });
    }

    const apiKeys = apiKeyRaw.split(",").map(k => k.trim()).filter(k => k.length > 0);
    const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    
    // We use fetch instead of SDK because the frontend expects a specific JSON format
    const targetModel = 'gemini-2.5-flash';
    const finalApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent`;

    const aiResponse = await fetch(finalApiUrl, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': randomKey
        },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
        })
    });

    const apiData = await aiResponse.json();
    
    if (!aiResponse.ok) {
        return NextResponse.json({ error: apiData.error || "生成失敗" }, { status: aiResponse.status });
    }

    return NextResponse.json(apiData);
  } catch (error: any) {
    console.error("Proxy Generate Error:", error);
    return NextResponse.json({ error: error.message || "伺服器內部錯誤" }, { status: 500 });
  }
}
