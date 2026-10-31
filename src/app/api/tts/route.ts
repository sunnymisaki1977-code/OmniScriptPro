import { NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  "cn-female": "zh-CN-XiaoxiaoNeural",    // 曉曉女聲
  "cn-male-mature": "zh-CN-YunjianNeural" // 雲健解說 (大氣沈穩成熟男聲)
};

function sanitizeTextForSpeech(text: string): string {
  return text
    // 移除 Markdown 粗體、斜體、刪除線與行內代碼
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    // 移除 Markdown 標題符號
    .replace(/^#+\s+/gm, "")
    // 轉換容易破壞 SSML XML 語法或口播不順的關鍵符號為自然中文口播
    .replace(/&/g, "與")
    .replace(/>/g, "大於")
    .replace(/</g, "小於")
    // 移除常見 Emoji 與無聲圖示（避免微軟語音引擎混亂，相容標準 ES5 正則）
    .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF\u2600-\u26FF\u2700-\u27BF]/g, "")
    // XML 實體保護（防止任何殘留 XML 特殊字元破壞 SSML）
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

const FALLBACK_VOICE_MAP: Record<string, string> = {
  // 微軟伺服器若對特定節點拒絕連線 (Stream closed)，無縫降級回退到同性別的高可用穩健模型
  "zh-TW-YunJheNeural": "zh-CN-YunjianNeural" // 台灣雲哲連線中斷時，無縫回退至同樣極致沉穩大氣的雲健男聲
};

async function synthesizeSingleChunk(voiceName: string, textChunk: string, rate: string, pitch: string): Promise<Buffer> {
  const sanitized = sanitizeTextForSpeech(textChunk);
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 30000, synthesisTimeoutMs: 90000 });
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(sanitized, {
    rate: rate || "+0%",
    pitch: pitch || "+0Hz"
  });

  const chunks: Buffer[] = [];
  return new Promise<Buffer>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Edge TTS 單一片段合成超時 (30s)"));
    }, 30000);

    audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    audioStream.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks));
    });
    audioStream.on("error", (err: any) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function synthesizeText(voiceName: string, text: string, rate: string, pitch: string): Promise<Buffer> {
  const isYunJhe = voiceName === "zh-TW-YunJheNeural";
  // 台灣雲哲節點承載力較低，限制單段 ~100 字；其他高速神經語音支援至 800 字
  const maxChunk = isYunJhe ? 100 : 800;

  // 若文字小於等於限制，直接單次合成
  if (text.length <= maxChunk) {
    try {
      return await synthesizeSingleChunk(voiceName, text, rate, pitch);
    } catch (err: any) {
      const fallbackVoice = FALLBACK_VOICE_MAP[voiceName];
      if (fallbackVoice) {
        console.warn(`[TTS] ${voiceName} 合成異常，自動平滑回退至 ${fallbackVoice}`);
        return await synthesizeSingleChunk(fallbackVoice, text, rate, pitch);
      }
      throw err;
    }
  }

  // 超過門檻進行自然標點分段
  const chunks: string[] = [];
  let current = "";
  const sentences = text.split(/(?<=[。！？\n；…])/);
  for (const s of sentences) {
    if ((current + s).length > maxChunk) {
      if (current.trim()) chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // 採用批次合成 (雲哲跑單線避開微軟限流，高速語音跑 2 並行)
  const BATCH_SIZE = isYunJhe ? 1 : 2;
  const audioBuffers: Buffer[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.map(async (chunk) => {
      let retries = 2;
      let currentVoice = voiceName;
      while (retries >= 0) {
        try {
          return await synthesizeSingleChunk(currentVoice, chunk, rate, pitch);
        } catch (err: any) {
          retries--;
          // 若為雲哲遇到斷線，立即嘗試 fallback 語音 (雲健大氣成熟男聲)
          if (FALLBACK_VOICE_MAP[currentVoice]) {
            currentVoice = FALLBACK_VOICE_MAP[currentVoice];
            retries = Math.max(retries, 1);
          }
          if (retries < 0) throw err;
          await new Promise(r => setTimeout(r, 400));
        }
      }
      throw new Error("無法合成語音片段");
    });

    const batchResults = await Promise.all(batchPromises);
    audioBuffers.push(...batchResults);
  }

  return Buffer.concat(audioBuffers);
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

    const audioBuffer = await synthesizeText(voiceName, targetText, rate, pitch);
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
