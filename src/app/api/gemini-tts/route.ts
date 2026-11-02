import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { promptText, voiceName = 'Sadaltager', apiKey } = await req.json();

    if (!promptText || !promptText.trim()) {
      return NextResponse.json({ error: '缺少朗讀文本內容' }, { status: 400 });
    }

    const apiKeyRaw = req.headers.get('x-gemini-api-key') || apiKey || process.env.GEMINI_API_KEY;
    if (!apiKeyRaw) {
      return NextResponse.json({ error: '伺服器未設定 GEMINI_API_KEY，且請求未附帶金鑰' }, { status: 401 });
    }

    const apiKeys = apiKeyRaw.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0);
    const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(selectedKey)}`;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voiceName || 'Sadaltager'
            }
          }
        }
      },
      model: "gemini-2.5-flash-preview-tts"
    };

    const googleRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': selectedKey
      },
      body: JSON.stringify(payload)
    });

    const data = await googleRes.json();
    if (!googleRes.ok) {
      return NextResponse.json({ error: data.error?.message || `Google API 錯誤: ${googleRes.status}` }, { status: googleRes.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Gemini TTS Proxy Error:', error);
    return NextResponse.json({ error: error.message || '伺服器語音代理生成失敗' }, { status: 500 });
  }
}
