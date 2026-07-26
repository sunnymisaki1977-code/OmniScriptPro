#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OmniScript PRO：Step 0 - AI 財經雷達 (新聞快訊爬蟲驅動 POC)
用途：事件驅動 (Event-Driven) 守門員機制，定時抓取 Yahoo Finance 最新 5 則財經新聞，
     交由 Gemini 2.5 Flash 判讀是否為引發股市震盪的大事件，並於觸發時啟動自動化影音與社群產製管線。
"""

import os
import sys
import json
import time
from datetime import datetime
import feedparser
import requests
from dotenv import load_dotenv

# 嘗試載入環境變數
load_dotenv()

try:
    import google.generativeai as genai
except ImportError:
    print("❌ 錯誤：找不到 google-generativeai 套件，請執行 pip install -r requirements.txt")
    sys.exit(1)

# ==================== 配置設定 ====================
RSS_URL = "https://finance.yahoo.com/news/rssindex"
# 備用 RSS 來源 (若 Yahoo 發生 User-Agent 阻擋時可切換測試)：
# RSS_URL = "https://feeds.a.dj.com/rss/RSSMarketsMain.xml"  # Wall Street Journal Markets
MODEL_NAME = "gemini-2.5-flash"

def print_header():
    print("=" * 60)
    print(" ⚡ OmniScript PRO: Step 0 - AI 財經雷達 (News Radar POC)")
    print(" 🤖 核心模型: Gemini 2.5 Flash | 📡 來源: Yahoo Finance RSS")
    print("=" * 60)

def fetch_latest_news(rss_url, limit=5):
    """
    從指定的 RSS Feed 抓取最新新聞
    """
    print(f"\n📡 [1/3] 正在連接財經訊號源：{rss_url} ...")
    try:
        # 加入 User-Agent 模擬瀏覽器，避免 Yahoo 阻擋爬蟲
        feed = feedparser.parse(rss_url, agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        if feed.bozo and hasattr(feed, 'bozo_exception'):
            # 若解析出現輕微異常仍嘗試讀取
            pass
            
        entries = feed.entries[:limit]
        if not entries:
            print("⚠️ 警告：目前 RSS 來源未返回任何新聞內容。")
            return []
            
        news_list = []
        print(f"📥 成功取得前 {len(entries)} 則最新快訊：")
        for idx, entry in enumerate(entries, 1):
            title = entry.get("title", "無標題").strip()
            summary = entry.get("summary", "") or entry.get("description", "")
            # 清除 summary 中的 HTML 標籤或過長文字
            summary_clean = summary[:150].strip() + ("..." if len(summary) > 150 else "")
            print(f"   [{idx}] {title}")
            news_list.append({"title": title, "summary": summary_clean})
            
        return news_list
    except Exception as e:
        print(f"❌ 抓取 RSS 時發生錯誤: {str(e)}")
        return []

def analyze_news_with_gemini(news_list):
    """
    呼叫 Gemini API 進行「華爾街警報器」判讀，強制回傳 JSON 結構
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\n❌ 錯誤：未偵測到 GEMINI_API_KEY。")
        print("💡 請在當前目錄建立 .env 檔案並設定：GEMINI_API_KEY=\"你的金鑰\"")
        return None

    print(f"\n🧠 [2/3] 正在傳送至 AI 財經警報器 ({MODEL_NAME}) 進行重大波動判讀 ...")
    try:
        genai.configure(api_key=api_key)
        
        # 強制指定 JSON 輸出模型配置
        generation_config = {
            "temperature": 0.2,  # 降低隨機性，維持客觀判讀
            "top_p": 0.8,
            "top_k": 40,
            "response_mime_type": "application/json",
        }
        
        model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            generation_config=generation_config
        )
        
        # 組裝新聞文字
        news_text_payload = "\n".join([f"{i+1}. 標題：{n['title']}\n   簡介：{n['summary']}" for i, n in enumerate(news_list)])
        
        # 系統與任務 Prompt
        prompt = f"""你是一個專業的華爾街財經警報器。請閱讀以下 5 則最新財經新聞標題與簡介。
判斷其中是否包含『可能造成全球股市劇烈震盪或大跌』的突發重大事件（如：央行意外升息、戰爭爆發、重量級科技股財報暴雷、通膨數據大超預期、地緣政治危機等）。

【最新快訊清單】：
{news_text_payload}

請嚴格依照以下 JSON 格式回傳，不要包含任何其他文字：
如果有重大事件，回傳：{{"trigger": true, "theme": "將該新聞濃縮為一句極具吸引力的財經標題"}}
如果皆為一般日常新聞，回傳：{{"trigger": false, "theme": null}}"""

        response = model.generate_content(prompt)
        raw_json = response.text.strip()
        
        # 解析 JSON
        result = json.loads(raw_json)
        return result

    except json.JSONDecodeError as je:
        print(f"❌ LLM 回傳格式非合法 JSON: {str(je)}")
        print(f"原始回傳內容: {response.text}")
        return None
    except Exception as e:
        print(f"❌ Gemini API 呼叫失敗: {str(e)}")
        return None

def save_alert_to_notion(theme, news_list):
    """
    當雷達偵測到重大新聞時，自動在 Notion 建立新卡片並寫入 10 大財經步驟內容摘要
    """
    notion_token = os.getenv("NOTION_API_KEY")
    database_id = os.getenv("NOTION_DATABASE_ID")
    
    if not notion_token or not database_id:
        print("\n💡 [Notion 提示] 未偵測到 NOTION_API_KEY 或 NOTION_DATABASE_ID。")
        print("   若需啟用自動歸檔進 Notion 功能，請在 .env 檔案中補上相應金鑰。")
        return

    print("\n📝 正在將突發警報與新聞摘要自動寫入 Notion 看板資料庫...")
    url = "https://api.notion.com/v1/pages"
    headers = {
        "Authorization": f"Bearer {notion_token}",
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
    }
    
    # 整理新聞摘要
    news_summary_text = "\n".join([f"• {n['title']}" for n in news_list[:3]]) if news_list else "無摘要"
    
    # 建立 Notion 卡片與標題
    payload = {
        "parent": {"database_id": database_id},
        "properties": {
            "Name": {
                "title": [{"text": {"content": f"🚨 [突發監控] {theme} - {datetime.now().strftime('%Y/%m/%d')}"}}]
            }
        },
        "children": [
            {
                "object": "block",
                "type": "callout",
                "callout": {
                    "rich_text": [{"text": {"content": f"📡 AI 財經雷達突發監控摘要 (Gemini 2.5 Flash)：\n{news_summary_text}"}}],
                    "icon": {"emoji": "🚨"}
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "Step 1: 核心企劃知識 & Step 2: 8 分鐘主軸腳本"}}]
                }
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [{"text": {"content": "⚠️ 系統已自動觸發 OmniScript PRO 後端工作流產製管線，即將載入彭博全息視覺指令與深度解析報告..."}}]
                }
            },
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": [{"text": {"content": "Step 6 & Step 7: Bloomberg 彭博全息視覺 Prompt"}}]
                }
            },
            {
                "object": "block",
                "type": "code",
                "code": {
                    "language": "markdown",
                    "rich_text": [{"text": {"content": f"AI Prompt:\n以「{theme}」為核心，採用 holographic stock charts, neon glowing lines, professional Bloomberg terminal aesthetic, corporate blue and gold accents, data visualization, cinematic lighting, ultra detailed, large bold financial typography."}}]
                }
            }
        ]
    }
    
    try:
        res = requests.post(url, json=payload, headers=headers, timeout=10)
        if res.status_code in (200, 201):
            page_data = res.json()
            page_url = page_data.get("url", "無 URL")
            print(f"🎉 成功存入 Notion！卡片已同步建立於資料庫：{page_url}")
        else:
            print(f"⚠️ 寫入 Notion 失敗 (HTTP {res.status_code}): {res.text}")
    except Exception as e:
        print(f"⚠️ 連接 Notion API 時發生例外錯誤: {str(e)}")

def execute_trigger_pipeline(analysis_result, news_list=None):
    """
    根據 AI 判讀結果執行後續動作 (模擬觸發 OmniScript PRO 管線並寫入 Notion)
    """
    print("\n" + "-" * 60)
    print("📊 [3/3] AI 警報判讀結果報告")
    print("-" * 60)
    
    if not analysis_result:
        print("❓ 判讀失敗，無法執行觸發驗證。")
        return

    trigger_status = analysis_result.get("trigger", False)
    theme = analysis_result.get("theme", None)

    if trigger_status:
        print("\n🚨 [系統警報] 偵測到重大市場事件！")
        print(f"📥 接收主題：{theme}")
        print("⚙️ 正在自動觸發 OmniScript PRO 後端產製管線...")
        
        # 模擬自動化串接流程
        print("\n--- 🔗 [模擬] OmniScript PRO 自動化管線啟動流程 ---")
        time.sleep(0.8)
        print("   [✓] 步驟 1/3：已向 /api/config 傳遞受眾主題 ['fintech'] 與關鍵字")
        time.sleep(0.8)
        print("   [✓] 步驟 2/3：已自動啟動 10 大財經工作流 (從『核心企劃知識』至『社群推播』)")
        time.sleep(0.8)
        print("   [✓] 步驟 3/3：Bloomberg 彭博全息視覺矩陣指令與 8 分鐘影片文案已生成完畢！")
        
        # 自動存入 Notion
        if news_list:
            save_alert_to_notion(theme, news_list)
            
        print("\n🎉 恭喜！突發財經影片專案已就緒，等待最後審核發布。")
    else:
        print("\n🍃 [系統狀態] 目前市場平靜，皆為一般日常新聞。")
        print("💤 系統維持待命 (Trigger = False)，不啟動生成管線。")
    
    print("-" * 60)

def main():
    print_header()
    
    # 1. 抓取 RSS
    news_list = fetch_latest_news(RSS_URL, limit=5)
    if not news_list:
        print("\n💡 提示：若 Yahoo RSS 無法讀取，可考慮更換 RSS_URL 進行測試。")
        return

    # 2. 呼叫 Gemini 進行 JSON 結構化判讀
    analysis_result = analyze_news_with_gemini(news_list)
    
    # 3. 處理 UX 輸出與管線觸發
    execute_trigger_pipeline(analysis_result, news_list)
    
    print("\n🏁 檢測週期完畢。下次檢測時間請搭配 Cron Job / Task Scheduler 使用。")

if __name__ == "__main__":
    main()
