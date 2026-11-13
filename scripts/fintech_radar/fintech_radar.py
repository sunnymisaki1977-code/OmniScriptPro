#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OmniScript PRO：Step 0 - AI 國際地緣與財經雷達 (AI Geopolitical & Macro Risk Radar)
用途：
1. 專門監控國際地緣事件、美中科技戰制裁、Fed 貨幣政策、國際能源與運價等重大宏觀變動。
2. 調用 Gemini 2.5 Flash 進行結構化風控判讀，輸出風險評級 (low / medium / high / critical) 與劇本偏好 (A / B / C)。
3. 輸出結果儲存於 latest_radar_signal.json，供 auto-dplan-daily.js 無縫注入 D-Plan 交易書與 Notion。
"""

import os
import sys
import json
import time
import re
from datetime import datetime
import xml.etree.ElementTree as ET

# 強制 Windows 環境下支援 UTF-8 終端輸出，防止 cp950 編碼異常
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# 嘗試載入 requests (必備)
try:
    import requests
except ImportError:
    print("❌ 錯誤：找不到 requests 套件，請執行 pip install requests")
    sys.exit(1)

# 嘗試載入 python-dotenv (若無則純手動解析 .env / .env.local)
def load_local_env():
    env_files = [
        os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"),
        os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
        os.path.join(os.path.dirname(__file__), ".env")
    ]
    for ef in env_files:
        if os.path.exists(ef):
            with open(ef, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and k not in os.environ:
                            os.environ[k] = v

load_local_env()

# ==================== 訊號源配置 ====================
# 多軌 RSS 來源：Yahoo 國際財經、Google 國際科技與地緣政治新聞、WSJ 財經
RSS_SOURCES = [
    {
        "name": "Yahoo 國際財經新聞",
        "url": "https://tw.stock.yahoo.com/rss?category=intl-markets"
    },
    {
        "name": "Yahoo 科技產業動態",
        "url": "https://tw.stock.yahoo.com/rss?category=technology"
    },
    {
        "name": "Google News 國際半導體與地緣政治",
        "url": "https://news.google.com/rss/search?q=TSMC+OR+semiconductor+OR+geopolitics+OR+tariffs+OR+Fed&hl=zh-TW&gl=TW&ceid=TW:zh-Hant"
    }
]

MODEL_NAME = "gemini-2.5-flash"

def fetch_rss_items(url, limit=5):
    """
    使用標準 HTTP 與 XML 解析器抓取 RSS，不依賴額外第三方套件，確保 100% 穩定
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    try:
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code != 200:
            return []
        
        # 清除可能的編碼與控制字元
        content = resp.content
        root = ET.fromstring(content)
        
        items = []
        # 支援 RSS 2.0 (channel/item)
        for item in root.findall(".//item")[:limit]:
            title = item.findtext("title", "").strip()
            desc = item.findtext("description", "").strip()
            # 去除 HTML tags
            desc_clean = re.sub(r'<[^>]+>', '', desc)
            desc_clean = desc_clean[:200].strip()
            pub_date = item.findtext("pubDate", "").strip()
            if title and title != "Yahoo股市":
                items.append({
                    "title": title,
                    "summary": desc_clean,
                    "pub_date": pub_date
                })
        return items
    except Exception as e:
        return []

def collect_global_news(limit_per_source=4):
    """
    搜集國際最新重大財經與地緣政治新聞
    """
    print(f"\n📡 [1/3] 正在掃描國際地緣與宏觀新聞源...")
    all_news = []
    seen_titles = set()
    
    for src in RSS_SOURCES:
        items = fetch_rss_items(src["url"], limit=limit_per_source)
        for it in items:
            t = it["title"]
            if t not in seen_titles:
                seen_titles.add(t)
                all_news.append(it)
                if len(all_news) >= 8:
                    break
        if len(all_news) >= 8:
            break
            
    print(f"📥 成功匯總 {len(all_news)} 則國際重大財經與地緣外電：")
    for i, n in enumerate(all_news[:6]):
        print(f"   [{i+1}] {n['title']}")
    return all_news

def analyze_macro_with_gemini(news_list):
    """
    調用 Gemini 模型評估國際地緣與宏觀風險，輸出 D-Plan 專屬風控指標
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("⚠️ 未偵測到 GEMINI_API_KEY，將啟用內建保守宏觀風控規則。")
        return get_fallback_macro_signal(news_list)

    print(f"\n🧠 [2/3] 正在由 AI 宏觀風控大腦 ({MODEL_NAME}) 深度評估國際情勢與傳導衝擊...")
    
    news_text = "\n".join([f"{i+1}. 標題：{n['title']}\n   摘要：{n['summary']}" for i, n in enumerate(news_list)])
    
    prompt = f"""你是一位華爾街頂尖的宏觀量化策略師與玉山 AI CUP 避險決策專家。
請閱讀以下最新國際與台灣財經外電新聞：

【最新國際重大快訊清單】：
{news_text}

請針對「台股核心科技龍頭（台積電、聯發科、鴻海、廣達、台達電、緯穎、日月光、智邦）」與「防禦資產（富邦金、國泰金、長榮航運、中華電信）」，進行國際地緣政治與宏觀利率風險衝擊評估。

請嚴格輸出合法 JSON（繁體中文），不可包含任何額外說明文字或 Markdown 標籤：
{{
  "geopolitical_risk_level": "low" 或 "medium" 或 "high" 或 "critical",
  "macro_regime_bias": "risk_on" 或 "neutral" 或 "risk_off",
  "suggested_scenario": "A" 或 "B" 或 "C",
  "key_headline": "一句 25 字以內的繁體中文精闢總結（例：美中科技新管制與中東緊張推升避險，科技承壓金融穩健）",
  "observation_statement": "適合直接作為 D-Plan O3 觀察點的客觀描述（約 100 字，包含地緣、匯率、美債或關鍵事件）",
  "inference_statement": "適合直接作為 D-Plan I3 推論的傳導分析（約 100 字，說明對科技權值與防禦資產的具體衝擊）",
  "sector_bias": {{
    "tech_hardware": "bearish" 或 "neutral" 或 "bullish",
    "semiconductor": "bearish" 或 "neutral" 或 "bullish",
    "financials": "bearish" 或 "neutral" 或 "bullish",
    "shipping": "bearish" 或 "neutral" 或 "bullish"
  }}
}}
"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json"
        }
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=15)
        if resp.status_code == 200:
            res_json = resp.json()
            raw_text = res_json['candidates'][0]['content']['parts'][0]['text']
            # 清理可能的 markdown 代碼標籤
            raw_text = re.sub(r'^```json\s*', '', raw_text.strip())
            raw_text = re.sub(r'\s*```$', '', raw_text.strip())
            result = json.loads(raw_text)
            return result
        else:
            print(f"⚠️ Gemini REST API 呼叫異常 (HTTP {resp.status_code}): {resp.text[:150]}")
            return get_fallback_macro_signal(news_list)
    except Exception as e:
        print(f"⚠️ 連線 Gemini 時發生例外: {str(e)}")
        return get_fallback_macro_signal(news_list)

def get_fallback_macro_signal(news_list):
    """
    備用保守宏觀風控規則（當 API 離線時自動保障決策引擎持續運作）
    """
    return {
        "geopolitical_risk_level": "medium",
        "macro_regime_bias": "neutral",
        "suggested_scenario": "B",
        "key_headline": "國際市場多空交雜，地緣政經維持中性整固，偏向防禦輪動",
        "observation_statement": "隔夜國際地緣局勢維持拉鋸整固，美債殖利率落於高檔震盪，外資對亞洲科技資產維持審慎評價；原油與航運指數維持區間波動，市場聚焦後續總經數據與政策定錨。",
        "inference_statement": "國際地緣與科技供應鏈動態中性，科技權值面臨評價整理壓力，高股息金控與抗跌防禦標的具備相對防護力，建議採穩健汰弱換強策略。",
        "sector_bias": {
            "tech_hardware": "neutral",
            "semiconductor": "neutral",
            "financials": "bullish",
            "shipping": "neutral"
        }
    }

def save_and_output_signal(signal_data, news_list):
    """
    持久化存檔供 auto-dplan-daily.js 與 Notion 使用
    """
    base_dir = os.path.dirname(__file__)
    output_path = os.path.join(base_dir, "latest_radar_signal.json")
    
    final_payload = {
        "generated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "signal": signal_data,
        "sample_news": news_list[:4]
    }
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(final_payload, f, ensure_ascii=False, indent=2)
        
    print(f"\n💾 [3/3] 國際地緣風控訊號已儲存至: {output_path}")
    print("=" * 60)
    print(f"🌍 國際局勢總結：{signal_data.get('key_headline')}")
    print(f"🛡️ 地緣政治風險等級：{signal_data.get('geopolitical_risk_level', '').upper()}")
    print(f"📊 建議市場態勢 (Regime)：{signal_data.get('macro_regime_bias')}")
    print(f"🎯 推薦劇本配置：【劇本 {signal_data.get('suggested_scenario')}】")
    print("=" * 60)

def main():
    print("=" * 60)
    print(" 🌐 OmniScript PRO: AI 國際地緣與宏觀風控雷達 (v2.0)")
    print(f" 🤖 核心模型: {MODEL_NAME} | 📡 國際外電多軌掃描")
    print("=" * 60)
    
    news_list = collect_global_news(limit_per_source=4)
    signal = analyze_macro_with_gemini(news_list)
    save_and_output_signal(signal, news_list)
    
    # 若傳入 --mode dplan，直接印出供上游腳本接收的純字串
    if "--mode" in sys.argv and "dplan" in sys.argv:
        print("\n[D-PLAN-SIGNAL-READY]")

if __name__ == "__main__":
    main()
