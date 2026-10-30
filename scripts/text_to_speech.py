import asyncio
import os
import sys
import re
import argparse
import edge_tts

# 設定標準輸出編碼為 UTF-8 以防 Windows 終端機編碼錯誤
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

# 支援的台灣與中文推薦聲音列表
VOICE_MAP = {
    # 台灣微軟自然語音
    "tw-female": "zh-TW-HsiaoChenNeural",  # 曉臻 (專業播報、財經首選)
    "tw-male": "zh-TW-YunJheNeural",      # 雲哲 (穩重專業男聲)
    "tw-female2": "zh-TW-HsiaoYuNeural",   # 曉雨 (活潑親切女聲)
    # 擴充備用
    "cn-male": "zh-CN-YunxiNeural",       # 雲希 (熱門短影音說書男聲)
    "cn-female": "zh-CN-XiaoxiaoNeural"    # 曉曉 (溫和女聲)
}

def extract_narration(text: str) -> str:
    """
    從生成的腳本中自動提取旁白與正文內容，過濾掉分鏡標記、視覺指示等雜訊。
    """
    lines = text.splitlines()
    narrations = []
    
    # 匹配常見的旁白格式，如「旁白配音 (VO)：...」、「旁白：...」、「VO:...」
    vo_pattern = re.compile(r'^(?:旁白配音\s*(?:\(VO\))?|旁白|VO|口播)\s*[:：]\s*(.+)', re.IGNORECASE)
    
    has_vo_tags = any(vo_pattern.search(line) for line in lines)
    
    if has_vo_tags:
        for line in lines:
            m = vo_pattern.search(line.strip())
            if m:
                cleaned = m.group(1).strip()
                # 去除前後括號註解
                cleaned = re.sub(r'\[.*?\]', '', cleaned)
                cleaned = re.sub(r'\(.*?\)', '', cleaned)
                if cleaned:
                    narrations.append(cleaned)
        return "\n".join(narrations)
    else:
        # 若無特殊標籤，過濾 markdown 標題與分鏡標籤，保留主文字
        cleaned_lines = []
        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue
            if line_str.startswith('#') or line_str.startswith('---'):
                continue
            if re.match(r'^(視覺畫面|畫面字卡|時間|⏱️|🎬|📱|💥)', line_str):
                continue
            cleaned = re.sub(r'\[.*?\]', '', line_str)
            if cleaned:
                cleaned_lines.append(cleaned)
        return "\n".join(cleaned_lines)

async def generate_audio(text: str, output_path: str, voice_key: str = "tw-female", rate: str = "+0%", pitch: str = "+0Hz"):
    voice = VOICE_MAP.get(voice_key, voice_key)
    print(f"🎙️ 使用語音角色: {voice}")
    print(f"⚡ 語速調整: {rate} | 音調: {pitch}")
    print(f"💾 輸出目標: {output_path}")
    
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_path)
    print(f"✅ 音檔已成功生成！大小: {os.path.getsize(output_path)} bytes")

def main():
    parser = argparse.ArgumentParser(description="一鍵將文字/腳本轉換為高品質微軟 TTS 音檔")
    parser.add_argument("--text", type=str, help="直接輸入要轉換的純文字內容")
    parser.add_argument("--file", type=str, help="腳本檔案路徑 (例如 .md, .txt, .json)")
    parser.add_argument("--output", type=str, default="output/audio.mp3", help="輸出的音檔路徑 (.mp3)")
    parser.add_argument("--voice", type=str, default="tw-female", choices=list(VOICE_MAP.keys()) + list(VOICE_MAP.values()), help="語音角色代碼 (預設: tw-female 台灣曉臻)")
    parser.add_argument("--rate", type=str, default="+0%", help="語速調整，例如 +10%% 或 -5%%")
    parser.add_argument("--pitch", type=str, default="+0Hz", help="音調調整，例如 +5Hz 或 -5Hz")
    parser.add_argument("--auto-extract", action="store_true", default=True, help="是否自動擷取腳本中的旁白配音 (VO)")

    args = parser.parse_args()

    content = ""
    if args.text:
        content = args.text
    elif args.file:
        if not os.path.exists(args.file):
            print(f"❌ 錯誤：找不到指定檔案 {args.file}")
            sys.exit(1)
        with open(args.file, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        print("💡 提示：請提供 --text 或 --file 參數。")
        print("範例: python scripts/text_to_speech.py --text \"今日台股開高走揚...\" --output \"audio/morning.mp3\"")
        sys.exit(0)

    if args.auto_extract:
        parsed_content = extract_narration(content)
        if parsed_content.strip():
            content = parsed_content

    if not content.strip():
        print("⚠️ 警告：沒有可供合成的有效文字！")
        sys.exit(1)

    print(f"📝 待合成內容預覽（前 120 字）：\n{content[:120]}...\n")
    asyncio.run(generate_audio(content, args.output, args.voice, args.rate, args.pitch))

if __name__ == "__main__":
    main()
