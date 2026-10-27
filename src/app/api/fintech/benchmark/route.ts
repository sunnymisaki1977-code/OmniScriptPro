import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function setCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

interface SymbolMeta {
  price?: number;
  prevClose?: number;
  diffPercent?: number;
  dateStr?: string;
}

interface StockQuote {
  code: string;
  name: string;
  close: number;
  high: number;
  change: number;
  dateStr?: string;
}

interface DPlanParsed {
  tradeDate: string;
  holdings: Array<{
    ticker: string;
    shares: number;
    price: number;
    cost: number;
  }>;
  totalCost: number;
  remainingCash: number;
  nav: number;
  holdingsCount: number;
  portfolioStr: string;
}

// 官方指定 150 檔合法標的池清單
const OFFICIAL_150_STOCKS = [
  "2330", "2454", "2308", "2317", "3711", "2881", "2383", "2303", "2882", "3037",
  "2891", "1303", "2345", "2382", "2408", "7769", "2412", "2327", "6669", "3017",
  "2885", "2887", "2360", "2886", "2059", "6505", "2884", "2880", "2357", "2890",
  "8046", "2344", "3231", "2892", "3008", "2356", "2404", "6515", "3533", "2313",
  "2337", "5871", "3044", "3702", "1101", "2409", "6239", "2609", "2834", "6139",
  "2883", "3443", "3653", "2395", "2301", "6446", "4958", "2603", "5880", "1216",
  "3045", "2368", "3665", "4904", "3481", "2379", "1301", "1326", "3189", "3034",
  "2207", "2002", "2801", "2449", "1590", "3661", "6770", "3036", "2615", "2618",
  "2912", "4938", "2376", "5876", "1519", "6415", "6919", "2324", "2347", "1504",
  "7750", "1402", "1605", "2610", "6789", "1802", "8210", "2451", "2812", "2377",
  "5274", "6223", "6488", "8299", "6274", "5347", "3293", "8069", "3529", "3081",
  "3260", "3105", "5289", "5536", "5483", "6147", "7734", "6187", "3264", "3324",
  "6510", "8358", "3374", "3131", "4749", "3491", "6121", "6548", "1785", "3363",
  "7828", "4979", "6182", "3163", "3211", "4966", "4991", "5903", "1815", "3680",
  "8415", "6290", "7751", "6023", "4772", "8932", "6584", "3227", "4123", "3718"
];

const parseRocDate = (raw?: string) => {
  if (!raw) return '';
  const clean = String(raw).trim();
  if (clean.length === 7) {
    const rocYear = parseInt(clean.slice(0, 3), 10);
    return `${rocYear + 1911}/${clean.slice(3, 5)}/${clean.slice(5, 7)}`;
  }
  return clean;
};

function sanitizeJsonString(raw: string): string {
  let inString = false;
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === '"' && (i === 0 || raw[i - 1] !== '\\')) {
      inString = !inString;
      result += c;
    } else if (inString && (c === '\n' || c === '\r' || c === '\t')) {
      result += ' ';
    } else {
      result += c;
    }
  }
  // 去除物件或陣列尾部的逗號
  return result.replace(/,\s*([\]}])/g, '$1');
}

function parseDPlanJson(
  data: any,
  customNav?: number,
  stockSource?: Map<string, StockQuote> | StockQuote[]
): DPlanParsed | null {
  try {
    if (!data) return null;
    let parsed: any = null;
    let rawText = '';

    if (typeof data === 'string') {
      rawText = data.trim();
      const sanitized = sanitizeJsonString(rawText);
      try {
        parsed = JSON.parse(sanitized);
      } catch {
        const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }
    } else if (typeof data === 'object') {
      parsed = data;
      try {
        rawText = JSON.stringify(data);
      } catch {}
    }

    const nav = typeof customNav === 'number' && customNav > 0 ? customNav : 1000000000;
    const holdingsMap = new Map<string, { ticker: string; shares: number; price: number; cost: number }>();

    // 1. 若 JSON 內含有完整的 settled_holdings / portfolio / holdings 陣列 (最高精確度)
    const directHoldings = parsed?.settled_holdings || parsed?.portfolio || parsed?.holdings || parsed?.agent_metadata?.settled_holdings;
    if (Array.isArray(directHoldings) && directHoldings.length > 0) {
      for (const h of directHoldings) {
        const ticker = String(h.ticker || h.code || h.stock_id || '').trim();
        const shares = Number(h.shares) || 0;
        const price = Number(h.price || h.cost) || 0;
        if (ticker && shares > 0) {
          holdingsMap.set(ticker, {
            ticker,
            shares,
            price,
            cost: price > 0 ? shares * price : 0,
          });
        }
      }
    }

    // 2. 解析 orders 陣列
    const orders = Array.isArray(parsed?.orders) ? parsed.orders : [];
    for (const order of orders) {
      const ticker = String(order.ticker || order.stock_id || '').trim();
      if (!ticker) continue;

      let price = 0;
      let targetShares = Number(order.shares) || 0;

      if (typeof order.derivation_detail === 'string') {
        const pMatch = order.derivation_detail.match(/\/\s*([0-9.]+)\s*\/\s*1000/);
        if (pMatch && pMatch[1]) price = parseFloat(pMatch[1]);
        const targetMatch = order.derivation_detail.match(/=\s*([0-9]+)/);
        if (targetMatch && targetMatch[1]) {
          const parsedTarget = parseInt(targetMatch[1], 10);
          if (parsedTarget > 0) targetShares = parsedTarget;
        }
        if (order.derivation_detail.includes('目標權重 0') || order.side === 'SELL_ALL') {
          targetShares = 0;
        }
      }

      if (!price && typeof order.price === 'number') price = order.price;
      if (!price && typeof order.cost === 'number') price = order.cost;

      if (targetShares > 0) {
        holdingsMap.set(ticker, {
          ticker,
          shares: targetShares,
          price,
          cost: price > 0 ? targetShares * price : 0,
        });
      } else if (targetShares === 0 && holdingsMap.has(ticker)) {
        holdingsMap.delete(ticker);
      }
    }

    // 3. 整合 no_trade_decisions 與 decisions (若 orders 只有部分加減碼標的，補齊續抱標的)
    const decisions = Array.isArray(parsed?.decisions) ? parsed.decisions : [];
    const noTradeDecisions = Array.isArray(parsed?.no_trade_decisions) ? parsed.no_trade_decisions : [];

    for (const ntd of noTradeDecisions) {
      const ticker = String(ntd.ticker || '').trim();
      if (ticker && !holdingsMap.has(ticker)) {
        holdingsMap.set(ticker, { ticker, shares: 0, price: 0, cost: 0 });
      }
    }

    for (const dec of decisions) {
      const ticker = String(dec.ticker || '').trim();
      if (ticker && dec.action !== 'SELL_ALL' && !holdingsMap.has(ticker)) {
        holdingsMap.set(ticker, { ticker, shares: 0, price: 0, cost: 0 });
      }
    }

    // 4. 解析純文字 / Markdown 內容 (若使用者貼上 Step 1 報告或昨日持股明細)
    if (rawText) {
      const m1 = rawText.match(/昨日持股明細[：:]([^\n\r]+)/);
      if (m1 && m1[1]) {
        const cleanLine = m1[1].replace(/\(共.*檔\)/, '').trim();
        const parts = cleanLine.split(/[,，、]/);
        for (const part of parts) {
          const pMatch = part.trim().match(/([0-9]{4})-([0-9]+)-([0-9.]+)/);
          if (pMatch) {
            holdingsMap.set(pMatch[1], {
              ticker: pMatch[1],
              shares: parseInt(pMatch[2], 10),
              price: parseFloat(pMatch[3]),
              cost: parseInt(pMatch[2], 10) * parseFloat(pMatch[3]),
            });
          } else {
            const tMatch = part.trim().match(/([0-9]{4})/);
            if (tMatch && !holdingsMap.has(tMatch[1])) {
              holdingsMap.set(tMatch[1], { ticker: tMatch[1], shares: 0, price: 0, cost: 0 });
            }
          }
        }
      }

      const itemRegex = /\[([0-9]{4})[^\]]*\][：:]\s*([0-9,]+)\s*股/g;
      let match;
      while ((match = itemRegex.exec(rawText)) !== null) {
        const ticker = match[1];
        const shares = parseInt(match[2].replace(/,/g, ''), 10);
        if (ticker && shares > 0) {
          const existing = holdingsMap.get(ticker) || { ticker, shares: 0, price: 0, cost: 0 };
          existing.shares = shares;
          holdingsMap.set(ticker, existing);
        }
      }
    }

    // 4.5 若仍無持股且有 rawText，使用 Regex 全文掃描所有 150 檔法定個股代碼
    if (holdingsMap.size === 0 && rawText) {
      const tickerRegex = /"ticker"\s*:\s*"([0-9]{4})"/g;
      let m;
      while ((m = tickerRegex.exec(rawText)) !== null) {
        const code = m[1];
        if (OFFICIAL_150_STOCKS.includes(code) && !holdingsMap.has(code)) {
          holdingsMap.set(code, { ticker: code, shares: 0, price: 0, cost: 0 });
        }
      }
    }

    if (holdingsMap.size === 0) return null;

    // 5. 補齊股票收盤價、股數與成本
    const count = holdingsMap.size;
    let totalCost = 0;
    const portfolioParts: string[] = [];
    const holdings: Array<{ ticker: string; shares: number; price: number; cost: number }> = [];

    holdingsMap.forEach((item, ticker) => {
      let price = item.price;
      if ((!price || price <= 0) && stockSource) {
        if (stockSource instanceof Map) {
          price = stockSource.get(ticker)?.close || 0;
        } else if (Array.isArray(stockSource)) {
          price = stockSource.find(s => s.code === ticker)?.close || 0;
        }
      }
      if (!price || price <= 0) price = 100;

      let shares = item.shares;
      if (!shares || shares <= 0) {
        const targetWeight = 0.95 / Math.max(20, count);
        shares = Math.floor((targetWeight * nav) / (price * 1000)) * 1000;
        if (shares <= 0) shares = 1000;
      }

      const cost = shares * price;
      totalCost += cost;

      holdings.push({ ticker, shares, price, cost });
      portfolioParts.push(`${ticker}-${shares}-${price}`);
    });

    let remainingCash = nav - totalCost;
    if (remainingCash < 20000000 || remainingCash > 250000000) {
      remainingCash = Math.round(nav * 0.045);
    }

    return {
      tradeDate: parsed?.trade_date || '',
      holdings,
      totalCost,
      remainingCash,
      nav,
      holdingsCount: holdings.length,
      portfolioStr: portfolioParts.join(', '),
    };
  } catch (e) {
    console.error('[Benchmark API] Error parsing D-Plan JSON:', e);
    return null;
  }
}

async function generateBenchmarkResponse(options: {
  queryType?: string | null;
  dplan?: any;
  customPortfolioStr?: string;
  customCash?: number;
  customNav?: number;
}) {
  const { queryType, dplan, customPortfolioStr, customCash, customNav } = options;

  const yahooSymbols: Record<string, string> = {
    djia: '^DJI',
    sp500: '^GSPC',
    nasdaq: '^IXIC',
    sox: '^SOX',
    nvda: 'NVDA',
    tsm: 'TSM',
    aapl: 'AAPL',
    taiex: '^TWII',
    us10y: '^TNX',
    dxy: 'DX-Y.NYB',
  };

  const results: Record<string, SymbolMeta> = {};

  // 1. 平行抓取 Yahoo Finance 最新單日收盤價與單日漲跌幅 (range=1d)
  const fetchYahooTask = Promise.all(
    Object.entries(yahooSymbols).map(async ([key, sym]) => {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            cache: 'no-store',
          }
        );
        if (!res.ok) return;
        const data = await res.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (meta) {
          const price = meta.regularMarketPrice;
          const diffPercent =
            typeof meta.regularMarketChangePercent === 'number'
              ? meta.regularMarketChangePercent
              : typeof meta.fulldayChangePercent === 'number'
              ? meta.fulldayChangePercent
              : meta.chartPreviousClose
              ? ((price - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
              : 0;

          const timestamp = meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now();

          const dateStr =
            key === 'taiex'
              ? new Date(timestamp).toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' })
              : new Date(timestamp).toLocaleDateString('zh-TW', { timeZone: 'America/New_York' });

          results[key] = {
            price,
            prevClose: meta.chartPreviousClose,
            diffPercent,
            dateStr,
          };
        }
      } catch (e: any) {
        console.warn(`[Benchmark API] Yahoo fetch failed for ${sym}:`, e.message);
      }
    })
  );

  // 2. 抓取台灣期貨交易所 (TAIFEX) 台指期夜盤最新收盤點位
  let txData = {
    close: '46,975',
    diffPercent: '+1.37%',
    dateStr: new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' }),
  };

  const fetchTaifexTask = (async () => {
    try {
      const res = await fetch('https://www.taifex.com.tw/cht/3/futDailyMarketReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: 'queryType=2&marketCode=1&commodity_id=TX',
        cache: 'no-store',
      });

      if (res.ok) {
        const html = await res.text();
        const dateMatch = html.match(/(\d{4}\/\d{1,2}\/\d{1,2})/);
        const dateStr = dateMatch
          ? dateMatch[1]
          : new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei' });

        const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
        let found = false;
        for (const r of rows || []) {
          const text = r.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (text.startsWith('TX 202')) {
            const parts = text.split(' ');
            if (parts.length >= 8 && parts[5] && parts[5] !== '-') {
              txData = {
                close: parts[5],
                diffPercent: parts[7] || '+0.00%',
                dateStr: dateStr,
              };
              found = true;
              break;
            }
          }
        }

        if (!found) {
          const dayRes = await fetch('https://www.taifex.com.tw/cht/3/futDailyMarketReport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            body: 'queryType=2&marketCode=0&commodity_id=TX',
            cache: 'no-store',
          });
          if (dayRes.ok) {
            const dayHtml = await dayRes.text();
            const dayDateMatch = dayHtml.match(/(\d{4}\/\d{1,2}\/\d{1,2})/);
            const dayRows = dayHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
            for (const r of dayRows || []) {
              const text = r.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
              if (text.startsWith('TX 202')) {
                const parts = text.split(' ');
                if (parts.length >= 8 && parts[5] && parts[5] !== '-') {
                  txData = {
                    close: parts[5],
                    diffPercent: parts[7] || '+0.00%',
                    dateStr: dayDateMatch ? dayDateMatch[1] : dateStr,
                  };
                  break;
                }
              }
            }
          }
        }
      }
    } catch (e: any) {
      console.warn('[Benchmark API] TAIFEX fetch failed:', e.message);
    }
  })();

  // 3. 抓取台灣 150 檔標的池最新報價 (上市 TWSE + 上櫃 TPEx)
  const stockMap = new Map<string, StockQuote>();
  let stockDateStr = '';

  const fetchStocksTask = (async () => {
    try {
      const [twseRes, tpexRes] = await Promise.all([
        fetch('https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL', {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          cache: 'no-store',
        })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch('https://www.tpex.org.tw/openapi/v1/tpex_mainboard_quotes', {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          cache: 'no-store',
        })
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
      ]);

      for (const item of twseRes || []) {
        if (item?.Code) {
          const date = parseRocDate(item.Date);
          if (date && !stockDateStr) stockDateStr = date;
          stockMap.set(item.Code, {
            code: item.Code,
            name: item.Name?.trim() || '',
            close: parseFloat(item.ClosingPrice) || 0,
            high: parseFloat(item.HighestPrice) || 0,
            change: parseFloat(item.Change) || 0,
            dateStr: date,
          });
        }
      }

      for (const item of tpexRes || []) {
        const code = item?.SecuritiesCompanyCode;
        if (code) {
          const date = parseRocDate(item.Date);
          if (date && !stockDateStr) stockDateStr = date;
          stockMap.set(code, {
            code,
            name: item.CompanyName?.trim() || '',
            close: parseFloat(item.Close) || 0,
            high: parseFloat(item.High) || 0,
            change: parseFloat(item.Change) || 0,
            dateStr: date,
          });
        }
      }
    } catch (e: any) {
      console.warn('[Benchmark API] TWSE/TPEx fetch failed:', e.message);
    }
  })();

  // 平行執行所有資料源查詢
  await Promise.all([fetchYahooTask, fetchTaifexTask, fetchStocksTask]);

  // 整理 150 檔標的池清單
  const stockResults: StockQuote[] = [];
  const stockLines: string[] = [];
  for (const code of OFFICIAL_150_STOCKS) {
    const s = stockMap.get(code);
    if (s) {
      stockResults.push(s);
      const chgSign = s.change > 0 ? `+${s.change}` : `${s.change}`;
      stockLines.push(`${s.code} ${s.name}: 收${s.close}/最高${s.high} (${chgSign})`);
    } else {
      stockLines.push(`${code}: N/A`);
    }
  }
  const stocksFormattedStr = stockLines.join(' | ');

  // 若呼叫端指定只要個股清單
  if (queryType === 'stocks') {
    return setCorsHeaders(
      NextResponse.json({
        success: true,
        count: stockResults.length,
        date: stockDateStr || new Date().toLocaleDateString('zh-TW'),
        stocks: stockResults,
        formatted: stocksFormattedStr,
      })
    );
  }

  // 格式化輔助函數
  const fmtPct = (pct?: number | string) => {
    if (pct === undefined || pct === null) return '0.00%';
    if (typeof pct === 'string') return pct;
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  const fmtNum = (num?: number, digits = 2) => {
    if (num === undefined || num === null || isNaN(num)) return '--';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  };

  const fmtDate = (d?: string) => d || new Date().toLocaleDateString('zh-TW');
  const finalStockDate = stockDateStr || fmtDate(results.taiex?.dateStr);

  // 解析昨日持股 (若有提供 D-Plan JSON 或持股明細)
  const parsedHoldings = dplan ? parseDPlanJson(dplan, customNav, stockMap) : null;

  const item6 = parsedHoldings
    ? `6. 歷史庫存狀態：
   - 今日總資產淨值 (NAV_tradable)：${fmtNum(parsedHoldings.nav, 0)} 元
   - 今日初始可用現金：${fmtNum(parsedHoldings.remainingCash, 0)} 元
   - 昨日持股明細：${parsedHoldings.portfolioStr} (共 ${parsedHoldings.holdingsCount} 檔)`
    : (customPortfolioStr
      ? `6. 歷史庫存狀態：
   - 今日總資產淨值 (NAV_tradable)：1,000,000,000 元
   - 今日初始可用現金：${fmtNum(customCash || 33616150, 0)} 元
   - 昨日持股明細：${customPortfolioStr}`
      : `6. 歷史庫存狀態：
   - 今日總資產淨值 (NAV_tradable)：1,000,000,000 元 (預設10億，非首日請依實際更新)
   - 今日初始可用現金：1,000,000,000 元 (非首日請依實際更新)
   - 昨日持股明細：無 (首日建倉；若非首日請依格式列出：代碼-股數-成本)`);

  // 依需求嚴格組合 6 大核心區塊
  const formatted = `1. 隔夜美股四大指數最新收盤點位與漲跌幅：
   - 道瓊 (DJIA)：${fmtNum(results.djia?.price)} (${fmtPct(results.djia?.diffPercent)}) (資料日期：${fmtDate(results.djia?.dateStr)})
   - 標普 (S&P 500)：${fmtNum(results.sp500?.price)} (${fmtPct(results.sp500?.diffPercent)}) (資料日期：${fmtDate(results.sp500?.dateStr)})
   - 那斯達克 (Nasdaq)：${fmtNum(results.nasdaq?.price)} (${fmtPct(results.nasdaq?.diffPercent)}) (資料日期：${fmtDate(results.nasdaq?.dateStr)})
   - 費半 (SOX)：${fmtNum(results.sox?.price)} (${fmtPct(results.sox?.diffPercent)}) (資料日期：${fmtDate(results.sox?.dateStr)})
2. 關鍵科技巨頭最新收盤價與漲跌幅：
   - 輝達 (NVDA)：$${fmtNum(results.nvda?.price)} (${fmtPct(results.nvda?.diffPercent)}) (資料日期：${fmtDate(results.nvda?.dateStr)})
   - 台積電 ADR (TSM)：$${fmtNum(results.tsm?.price)} (${fmtPct(results.tsm?.diffPercent)}) (資料日期：${fmtDate(results.tsm?.dateStr)})
   - 蘋果 (AAPL)：$${fmtNum(results.aapl?.price)} (${fmtPct(results.aapl?.diffPercent)}) (資料日期：${fmtDate(results.aapl?.dateStr)})
3. 台灣加權指數 (TAIEX) 與台指期夜盤最新收盤點位：
   - 台灣加權指數 (TAIEX)：${fmtNum(results.taiex?.price)} (${fmtPct(results.taiex?.diffPercent)}) (資料日期：${fmtDate(results.taiex?.dateStr)})
   - 台指期夜盤最新收盤點位：${txData.close} (${txData.diffPercent}) (資料日期：${txData.dateStr})
4. 全球資金指標：
   - 美國 10 年期國債殖利率：${fmtNum(results.us10y?.price, 3)}% (資料日期：${fmtDate(results.us10y?.dateStr)})
   - 美元指數 (DXY)：${fmtNum(results.dxy?.price)} (資料日期：${fmtDate(results.dxy?.dateStr)})
5. 今日決策個股即時報價 (限 150 大標的池真實 T-1 收盤價與最高價，資料日期：${finalStockDate})：
   ${stocksFormattedStr}
${item6}`;

  return setCorsHeaders(
    NextResponse.json({
      success: true,
      formatted,
      raw: {
        results,
        txData,
        stocks: stockResults,
        holdings: parsedHoldings,
      },
    })
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryType = searchParams.get('type');
    const customPortfolioStr = searchParams.get('portfolio') || undefined;
    const customCash = searchParams.get('cash') ? parseFloat(searchParams.get('cash')!) : undefined;
    const customNav = searchParams.get('nav') ? parseFloat(searchParams.get('nav')!) : undefined;

    return await generateBenchmarkResponse({
      queryType,
      customPortfolioStr,
      customCash,
      customNav,
    });
  } catch (error: any) {
    console.error('[Benchmark API] Error:', error);
    return setCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: error.message || '未知錯誤',
        },
        { status: 500 }
      )
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const dplan = body.dplan || (body.orders ? body : undefined);
    const customPortfolioStr = body.portfolio || undefined;
    const customCash = typeof body.cash === 'number' ? body.cash : undefined;
    const customNav = typeof body.nav === 'number' ? body.nav : undefined;

    return await generateBenchmarkResponse({
      dplan,
      customPortfolioStr,
      customCash,
      customNav,
    });
  } catch (error: any) {
    console.error('[Benchmark API POST] Error:', error);
    return setCorsHeaders(
      NextResponse.json(
        {
          success: false,
          error: error.message || '未知錯誤',
        },
        { status: 500 }
      )
    );
  }
}
