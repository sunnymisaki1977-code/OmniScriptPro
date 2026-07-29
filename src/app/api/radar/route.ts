import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 簡易零依賴 RSS 解析函數 (支援 Yahoo 與 Google News RSS)
function parseRssItems(xml: string, limit = 5) {
  const items: { title: string; summary: string; pubDate: string; link: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const content = match[1];
    const getTag = (tag: string) => {
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const res = regex.exec(content);
      if (!res) return '';
      let text = res[1];
      text = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1'); // 移除 CDATA
      text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' '); // 轉換 HTML 實體
      return text.replace(/<[^>]+>/g, '').trim(); // 移除所有 HTML 標籤
    };
    
    // Google News 會將發布源放在標題最後 (e.g. "... - 自由時報")
    let title = getTag('title');
    const summary = getTag('description') || getTag('summary');
    const pubDate = getTag('pubDate');
    const link = getTag('link');
    
    if (title && title !== "Yahoo股市" && title !== "Google 新聞") {
      let formattedDate = pubDate;
      try {
        if (pubDate) {
          const d = new Date(pubDate);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false });
          }
        }
      } catch (e) {}
      items.push({ title, summary: summary.slice(0, 200), pubDate: formattedDate, link });
    }
  }
  return items;
}

const THEME_RSS_MAP: Record<string, { keyword: string; isYahooFinance: boolean }> = {
  heritage: { keyword: "民俗信仰 OR 台灣宗教 OR 宮廟", isYahooFinance: false },
  beauty: { keyword: "美妝保養 OR 保養品 OR 醫美", isYahooFinance: false },
  travelpreneur: { keyword: "旅遊景點 OR 出國旅遊 OR 自由行", isYahooFinance: false },
  food: { keyword: "美食推薦 OR 餐廳評鑑 OR 料理食譜", isYahooFinance: false },
  pet: { keyword: "寵物照護 OR 毛小孩 OR 獸醫", isYahooFinance: false },
  fintech: { keyword: "", isYahooFinance: true },
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const theme = url.searchParams.get('theme') || 'fintech';
    const config = THEME_RSS_MAP[theme] || THEME_RSS_MAP['fintech'];
    
    const RSS_URL = config.isYahooFinance
      ? "https://tw.stock.yahoo.com/rss?category=news"
      : `https://news.google.com/rss/search?q=${encodeURIComponent(config.keyword)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;

    console.log(`📡 [AI 雷達] 正在抓取主題 [${theme}] 的 RSS: ${RSS_URL}`);
    const rssRes = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      next: { revalidate: 60 } // 快取 60 秒
    });

    if (!rssRes.ok) {
      throw new Error(`RSS 回應失敗 (HTTP ${rssRes.status})`);
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

    // 呼叫 Gemini 2.5 Flash 進行智能分析
    let analysisResult = { trigger: false, theme: newsList[0]?.title || "最新趨勢解析" };
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

      const roleStr = theme === 'fintech' ? "專業的華爾街與台灣股市財經警報器" : "專業的社群趨勢分析師與話題發掘器";
      const criteriaStr = theme === 'fintech' 
        ? "判斷其中是否包含『可能造成全球或台灣股市劇烈震盪或大跌』的突發重大事件" 
        : "判斷其中是否包含『能引發大量社群共鳴、具備病毒式傳播潛力』的重大趨勢或突發話題";

      const prompt = `你是一個${roleStr}。請閱讀以下 5 則最新快訊標題與簡介。
${criteriaStr}。

【最新快訊清單】：
${newsTextPayload}

請嚴格依照以下 JSON 格式回傳，且務必全數使用「繁體中文（台灣習慣用語）」輸出，不要包含任何其他文字：
如果有重大事件或超級爆款話題，回傳：{"trigger": true, "theme": "將該新聞濃縮為一句極具吸引力與社群擴散力的繁體中文爆款短片標題"}
如果皆為一般日常新聞，回傳：{"trigger": false, "theme": "將最熱門的一則新聞濃縮為一句吸睛的繁體中文短片標題"}`;

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
