import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const RSS_URL = "https://tw.news.yahoo.com/rss/finance"; // 改用 Yahoo 奇摩股市中文 RSS

// 簡易零依賴 RSS 解析函數
function parseRssItems(xml: string, limit = 5) {
  const items: { title: string; summary: string; pubDate: string; link: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const content = match[1];
    const getTag = (tag: string) => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const res = regex.exec(content);
      return res ? res[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').replace(/<[^>]+>/g, '').trim() : '';
    };
    const title = getTag('title');
    const summary = getTag('description') || getTag('summary');
    const pubDate = getTag('pubDate');
    const link = getTag('link');
    if (title) {
      items.push({ title, summary: summary.slice(0, 200), pubDate, link });
    }
  }
  return items;
}

export async function GET() {
  try {
    console.log(`📡 [AI 雷達] 正在抓取財經 RSS: ${RSS_URL}`);
    const rssRes = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 60 } // 快取 60 秒
    });

    if (!rssRes.ok) {
      throw new Error(`Yahoo RSS 回應失敗 (HTTP ${rssRes.status})`);
    }

    const xmlText = await rssRes.text();
    const newsList = parseRssItems(xmlText, 5);

    if (newsList.length === 0) {
      return NextResponse.json({
        success: false,
        message: "無法從 RSS 解析出任何新聞",
        news: []
      }, { status: 404 });
    }

    // 呼叫 Gemini 2.5 Flash 進行華爾街警報器分析
    let analysisResult = { trigger: false, theme: newsList[0]?.title || "最新財經趨勢解析" };
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const newsTextPayload = newsList
        .map((n, i) => `${i + 1}. 標題：${n.title}\n   簡介：${n.summary}`)
        .join("\n");

      const prompt = `你是一個專業的華爾街與台灣股市財經警報器。請閱讀以下 5 則最新財經新聞標題與簡介。
判斷其中是否包含『可能造成全球或台灣股市劇烈震盪或大跌』的突發重大事件（如：央行意外升息/降息、戰爭爆發、重量級科技股/半導體財報暴雷、台積電動態、通膨數據大超預期、地緣政治危機等）。

【最新快訊清單】：
${newsTextPayload}

請嚴格依照以下 JSON 格式回傳，且務必全數使用「繁體中文（台灣習慣用語）」輸出，不要包含任何其他文字：
如果有重大事件，回傳：{"trigger": true, "theme": "將該新聞濃縮為一句極具吸引力與社群擴散力的繁體中文爆款財經短片標題"}
如果皆為一般日常新聞，回傳：{"trigger": false, "theme": "將最熱門的一則新聞濃縮為一句吸睛的繁體中文財經短片標題"}`;

      const aiRes = await model.generateContent(prompt);
      const rawJson = aiRes.response.text().trim();
      analysisResult = JSON.parse(rawJson);
    } catch (aiErr) {
      console.warn("⚠️ [AI 雷達] Gemini 判讀發生警告，使用預設標題:", aiErr);
    }

    return NextResponse.json({
      success: true,
      news: newsList,
      analysis: analysisResult
    });
  } catch (error: any) {
    console.error("❌ [AI 雷達] 抓取或判讀錯誤:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "未知錯誤"
    }, { status: 500 });
  }
}
