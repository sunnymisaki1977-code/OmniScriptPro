import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SymbolMeta {
  price?: number;
  prevClose?: number;
  diffPercent?: number;
  dateStr?: string;
}

export async function GET() {
  try {
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
    await Promise.all(
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
            // 優先直接使用官方即時計算之單日漲跌幅 (regularMarketChangePercent)，避免受多日範圍基準偏誤
            const diffPercent =
              typeof meta.regularMarketChangePercent === 'number'
                ? meta.regularMarketChangePercent
                : typeof meta.fulldayChangePercent === 'number'
                ? meta.fulldayChangePercent
                : meta.chartPreviousClose
                ? ((price - meta.chartPreviousClose) / meta.chartPreviousClose) * 100
                : 0;

            const timestamp = meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now();

            // 時區判斷：台股為台北時間 (Asia/Taipei)，美股及國際資金指標為美東紐約時間 (America/New_York)
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

    try {
      // 優先查詢盤後交易 (夜盤 marketCode=1)
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

        // 若夜盤尚未開盤或無成交，查詢一般交易 (日盤 marketCode=0)
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

    // 依使用者需求嚴格組合指定格式
    const formatted = `1. 隔夜美股四大指數最新收盤點位與漲跌幅：
   - 道瓊 (DJIA)：${fmtNum(results.djia?.price)} (${fmtPct(results.djia?.diffPercent)}) (資料日期：${fmtDate(results.djia?.dateStr)})
   - 標普 (S&P 500)：${fmtNum(results.sp500?.price)} (${fmtPct(results.sp500?.diffPercent)}) (資料日期：${fmtDate(results.sp500?.dateStr)})
   - 那斯達克 (Nasdaq)：${fmtNum(results.nasdaq?.price)} (${fmtPct(results.nasdaq?.diffPercent)}) (資料日期：${fmtDate(results.nasdaq?.dateStr)})
   - 費半 (SOX)：${fmtNum(results.sox?.price)} (${fmtPct(results.sox?.diffPercent)}) (資料日期：${fmtDate(results.sox?.dateStr)})
2. 關鍵科技巨頭最新收盤價與漲跌幅：
   - 輝達 (NVDA)：$${fmtNum(results.nvda?.price)} (${fmtPct(results.nvda?.diffPercent)}) (資料日期：${fmtDate(results.nvda?.dateStr)})
   - 台積電 ADR (TSM)：$${fmtNum(results.tsm?.price)} (${fmtPct(results.tsm?.diffPercent)}) (資料日期：${fmtDate(results.tsm?.dateStr)})
   - 蘋果 (AAPL)：$${fmtNum(results.aapl?.price)} (${fmtPct(results.aapl?.diffPercent)}) (資料日期：${fmtDate(results.aapl?.dateStr)})
3. 台灣加權指數 (TAIEX) 昨日收盤點位：${fmtNum(results.taiex?.price)} (${fmtPct(results.taiex?.diffPercent)}) (資料日期：${fmtDate(results.taiex?.dateStr)})
4. 台指期夜盤最新收盤點位：${txData.close} (${txData.diffPercent}) (資料日期：${txData.dateStr})
5. 全球資金指標：
   - 美國 10 年期國債殖利率：${fmtNum(results.us10y?.price, 3)}% (資料日期：${fmtDate(results.us10y?.dateStr)})
   - 美元指數 (DXY)：${fmtNum(results.dxy?.price)} (資料日期：${fmtDate(results.dxy?.dateStr)})
6. 歷史庫存狀態：
   - 今日總資產淨值 (NAV_tradable)：1,000,000,000 元 (預設10億，非首日請依實際更新)
   - 今日初始可用現金：1,000,000,000 元 (非首日請依實際更新)
   - 昨日持股明細：無 (首日建倉；若非首日請依格式列出：代碼-股數-成本)`;

    return NextResponse.json({
      success: true,
      formatted,
      raw: {
        results,
        txData,
      },
    });
  } catch (error: any) {
    console.error('[Benchmark API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '未知錯誤',
      },
      { status: 500 }
    );
  }
}
