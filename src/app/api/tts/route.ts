import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { text, voice = "tw-female", rate = "+0%", pitch = "+0Hz", autoExtract = true } = await req.json();

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "請提供要合成語音的文字內容" }, { status: 400 });
    }

    const scriptPath = path.join(process.cwd(), "scripts", "text_to_speech.py");
    if (!fs.existsSync(scriptPath)) {
      return NextResponse.json({ error: "找不到 TTS 核心腳本: scripts/text_to_speech.py" }, { status: 500 });
    }

    // 建立臨時輸出檔案
    const tempFileName = `tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    // 寫入臨時文字檔，避免命令行參數長度限制與編碼溢出問題
    const tempTextFileName = `tts_text_${Date.now()}_${Math.random().toString(36).substring(7)}.txt`;
    const tempTextFilePath = path.join(os.tmpdir(), tempTextFileName);
    fs.writeFileSync(tempTextFilePath, text, "utf8");

    const pythonArgs = [
      scriptPath,
      "--file", tempTextFilePath,
      "--output", tempFilePath,
      "--voice", voice,
      "--rate", rate,
      "--pitch", pitch,
    ];

    if (autoExtract) {
      pythonArgs.push("--auto-extract");
    }

    await new Promise((resolve, reject) => {
      const pyProcess = spawn("python", pythonArgs);
      let stderr = "";
      let stdout = "";

      pyProcess.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      pyProcess.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      pyProcess.on("close", (code) => {
        // 清理臨時文字檔案
        if (fs.existsSync(tempTextFilePath)) {
          try { fs.unlinkSync(tempTextFilePath); } catch (e) {}
        }

        if (code === 0 && fs.existsSync(tempFilePath)) {
          resolve(stdout);
        } else {
          reject(new Error(`TTS 生成失敗 (code ${code}): ${stderr || stdout}`));
        }
      });

      pyProcess.on("error", (err) => {
        if (fs.existsSync(tempTextFilePath)) {
          try { fs.unlinkSync(tempTextFilePath); } catch (e) {}
        }
        reject(err);
      });
    });

    // 讀取生成的音訊檔案並轉為 base64
    const audioBuffer = fs.readFileSync(tempFilePath);
    const audioBase64 = audioBuffer.toString("base64");

    // 清理臨時音訊檔案
    try {
      fs.unlinkSync(tempFilePath);
    } catch (e) {}

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
