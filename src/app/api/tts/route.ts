import { NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const dynamic = "force-dynamic";

const VOICE_MAP: Record<string, string> = {
  // 台灣繁體中文 (zh-TW)
  "tw-female": "zh-TW-HsiaoChenNeural",  // 台灣曉臻
  "tw-male": "zh-TW-YunJheNeural",      // 台灣雲哲
  "tw-female2": "zh-TW-HsiaoYuNeural",   // 台灣曉雨
  // 日本日語語音 (ja-JP)
  "ja-female": "ja-JP-NanamiNeural",    // 日本七海 (溫柔知性女聲)
  "ja-male": "ja-JP-KeitaNeural",       // 日本圭太 (陽光活力男聲)
  "ja-female2": "ja-JP-AoiNeural",      // 日本葵 (清新少女女聲)
  "ja-male2": "ja-JP-DaichiNeural",     // 日本大地 (沉穩磁性男聲)
  // 中文特色說書語音
  "cn-male": "zh-CN-YunxiNeural",       // 雲希說書
  "cn-female": "zh-CN-XiaoxiaoNeural"    // 曉曉女聲
};

function extractNarration(text: string): string {
  const lines = text.split(/\r?\n/);
  const narrations: string[] = [];
  const voPattern = /^(?:旁白配音\s*(?:\(VO\))?|旁白|VO|口播)\s*[:：]\s*(.+)/i;

  const hasVoTags = lines.some(line => voPattern.test(line));
  if (hasVoTags) {
    for (const line of lines) {
      const m = line.trim().match(voPattern);
      if (m) {
        let cleaned = m[1].trim();
        cleaned = cleaned.replace(/\[.*?\]/g, "").replace(/\(.*?\)/g, "").trim();
        if (cleaned) narrations.push(cleaned);
      }
    }
    return narrations.join("\n");
  } else {
    const cleanedLines: string[] = [];
    for (const line of lines) {
      let lineStr = line.trim();
      if (!lineStr || lineStr.startsWith("#") || lineStr.startsWith("---")) continue;
      if (/^(視覺畫面|畫面字卡|時間|⏱️|🎬|📱|💥)/.test(lineStr)) continue;
      let cleaned = lineStr.replace(/\[.*?\]/g, "").trim();
      if (cleaned) cleanedLines.push(cleaned);
    }
    return cleanedLines.join("\n");
  }
}

export async function POST(req: Request) {
  try {
    const { text, voice = "tw-female", rate = "+0%", pitch = "+0Hz", autoExtract = true } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "請提供要合成語音的文字內容" }, { status: 400 });
    }

    let targetText = text.trim();
    if (autoExtract) {
      const extracted = extractNarration(targetText);
      if (extracted.trim()) {
        targetText = extracted.trim();
      }
    }

    const voiceName = VOICE_MAP[voice] || voice || "zh-TW-HsiaoChenNeural";

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(targetText, {
      rate: rate || "+0%",
      pitch: pitch || "+0Hz"
    });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
      audioStream.on("end", () => resolve());
      audioStream.on("error", (err: any) => reject(err));
    });

    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString("base64");

    return NextResponse.json({
      success: true,
      audioBase64: `data:audio/mp3;base64,${audioBase64}`,
      byteSize: audioBuffer.length
    });

  } catch (error: any) {
    console.error("TTS API Error:", error);
    return NextResponse.json({ error: error.message || "TTS 生成失敗" }, { status: 500 });
  }
}
