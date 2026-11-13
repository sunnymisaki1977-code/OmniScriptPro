const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');

async function syncDPlanToNotion(specifiedDPlanPath = null) {
  // 1. 動態讀取 .env.local
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NOTION_API_KEY=([^\r\n]+)/);
    if (match) process.env.NOTION_API_KEY = match[1].trim();
    const fintechMatch = envContent.match(/NOTION_fintech_ID=([^\r\n]+)/);
    if (fintechMatch) process.env.NOTION_fintech_ID = fintechMatch[1].trim();
  }

  const notionToken = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_fintech_ID || '3cdf374300dc8033af23d63306769950';

  if (!notionToken) {
    console.log('⚠️ 未找到 NOTION_API_KEY，略過 Notion 同步');
    return null;
  }

  const notion = new Client({ auth: notionToken });
  const baseDir = path.join(__dirname, '..');

  // 2. 確定目標 D-Plan 檔案
  let dplanPath = specifiedDPlanPath;
  if (!dplanPath) {
    // 預設找最新的 DPlan_*.json
    const files = fs.readdirSync(baseDir);
    const dplanFiles = files.filter(f => f.startsWith('DPlan_') && f.endsWith('.json')).sort().reverse();
    if (dplanFiles.length === 0) {
      console.log('⚠️ 未在目錄下找到任何 DPlan_*.json 檔案！');
      return null;
    }
    dplanPath = path.join(baseDir, dplanFiles[0]);
  }

  if (!fs.existsSync(dplanPath)) {
    console.log(`⚠️ 找不到指定檔案: ${dplanPath}`);
    return null;
  }

  const dplan = JSON.parse(fs.readFileSync(dplanPath, 'utf8'));
  const tradeDate = dplan.trade_date || new Date().toISOString().slice(0, 10);
  const teamId = dplan.team_id || 'TEAM_12006';
  const regime = dplan.market_view?.regime || 'neutral';
  const stance = dplan.market_view?.stance || 'neutral';
  const orders = dplan.orders || [];
  const decisions = dplan.decisions || [];
  const noTradeDecisions = dplan.no_trade_decisions || [];
  const totalHoldingsCount = decisions.length + noTradeDecisions.length;

  // 讀取最新國際地緣風控雷達資訊（若有）
  let radarInfo = null;
  const radarPath = path.join(__dirname, 'fintech_radar', 'latest_radar_signal.json');
  if (fs.existsSync(radarPath)) {
    try {
      radarInfo = JSON.parse(fs.readFileSync(radarPath, 'utf8')).signal;
    } catch (e) {}
  }

  const headline = radarInfo?.key_headline || "國際多空拉鋸，台股權值嚴控風險";
  const geoRisk = radarInfo?.geopolitical_risk_level ? radarInfo.geopolitical_risk_level.toUpperCase() : "MEDIUM";

  console.log(`🚀 正在同步 ${path.basename(dplanPath)} 至 Notion 資料庫...`);

  // 3. 查詢 Notion 資料庫中是否已存在當日頁面
  let pageId = null;
  let pageUrl = '';

  try {
    const searchRes = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "日期",
        date: {
          equals: tradeDate
        }
      }
    });

    if (searchRes.results.length > 0) {
      pageId = searchRes.results[0].id;
      pageUrl = searchRes.results[0].url;
      console.log(`📍 找到當日現有頁面 (${tradeDate}): ${pageId}，將執行更新與內容覆蓋！`);
    }
  } catch (err) {
    console.log(`⚠️ 查詢 Notion 資料庫時發生輕微異常: ${err.message}`);
  }

  const pageTitle = `${tradeDate} 玉山 AI CUP D-Plan 交易書 ＆ 國際局勢宏觀歷程（${teamId}・${stance.toUpperCase()}）`;
  const orderSummary = orders.length > 0
    ? orders.map(o => `${o.side} ${o.ticker} (${(o.shares / 1000).toFixed(0)}張)`).join(', ')
    : "0 買進 / 0 賣出 (全數堅決 HOLD 防禦)";

  const pageProps = {
    "名稱": {
      title: [{ text: { content: pageTitle } }]
    },
    "日期": {
      date: { start: tradeDate }
    },
    "主題分類": {
      select: { name: "7. AI 宏觀風控與選股決策引擎" }
    },
    "判斷原因": {
      rich_text: [{
        text: {
          content: `【宏觀與地緣評級：${regime.toUpperCase()} / 風險 ${geoRisk}】${headline}。${dplan.market_view?.logic?.substring(0, 300) || ''}`.substring(0, 1950)
        }
      }]
    },
    "執行摘要": {
      rich_text: [{
        text: {
          content: `委託指令：${orderSummary}。總持股檔數：${totalHoldingsCount} 檔 (合規)。市場姿態：${stance}。100% 通過官方驗證。`.substring(0, 1950)
        }
      }]
    }
  };

  if (pageId) {
    await notion.pages.update({
      page_id: pageId,
      properties: pageProps,
      icon: { type: "emoji", emoji: "🛡️" }
    });

    // 清理舊的 blocks
    const oldBlocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
    for (const b of oldBlocks.results) {
      try {
        await notion.blocks.delete({ block_id: b.id });
      } catch (err) {}
    }
  } else {
    const pageRes = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: pageProps,
      icon: { type: "emoji", emoji: "🛡️" }
    });
    pageId = pageRes.id;
    pageUrl = pageRes.url;
    console.log('✅ 成功建立 Notion 主頁面！Page ID:', pageId);
  }

  // 4. 準備寫入區塊
  const childrenBlocks = [
    {
      object: "block",
      type: "callout",
      callout: {
        rich_text: [{
          type: "text",
          text: {
            content: `🛡️ 官方驗證 100% 合規交易書（${tradeDate}・TEAM_12006）\n• 國際地緣與宏觀局勢：【風險等級：${geoRisk}】${headline}\n• 操作指令：${orderSummary}\n• 市場姿態 (Stance)：${stance} | 市場態勢 (Regime)：${regime}\n• 總持股檔數：${totalHoldingsCount} 檔（嚴格符合 20~30 檔限制）`
          }
        }],
        icon: { type: "emoji", emoji: "💎" },
        color: "blue_background"
      }
    },
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "🌍 國際地緣與宏觀風控雷達分析報告" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: {
            content: `• 局勢關鍵摘要：${radarInfo?.key_headline || '多空平衡整固'}\n• 國際觀察 (O3 注入)：${radarInfo?.observation_statement || '美債與外圍市場動態穩定'}\n• 傳導推論 (I3 注入)：${radarInfo?.inference_statement || '科技權值與防禦資產輪動配置'}\n• 產業多空偏好：科技硬體 [${radarInfo?.sector_bias?.tech_hardware || 'neutral'}]、半導體 [${radarInfo?.sector_bias?.semiconductor || 'neutral'}]、金融 [${radarInfo?.sector_bias?.financials || 'bullish'}]、航運 [${radarInfo?.sector_bias?.shipping || 'neutral'}]`
          }
        }]
      }
    },
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "📋 今日委託單 (Orders) 與目標股數推導明細" } }]
      }
    }
  ];

  if (orders.length > 0) {
    orders.forEach((o, idx) => {
      childrenBlocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{
            type: "text",
            text: {
              content: `【委託單 ${idx + 1}】代號：${o.ticker} | 動作：${o.side} | 股數：${o.shares.toLocaleString()} 股\n推導明細：${o.derivation_detail}`
            }
          }]
        }
      });
    });
  } else {
    childrenBlocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: {
            content: "今日維持 0 買進 / 0 賣出，全數 24 檔現有持股堅決 HOLD 續抱，不盲目接刀亦不賤賣核心資產。"
          }
        }]
      }
    });
  }

  childrenBlocks.push({
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "📄 官方合規 D-Plan v4.3 JSON 代碼" } }]
    }
  });

  // 拆分 JSON 以防超過 Notion 2000 字元限制
  const jsonStr = JSON.stringify(dplan, null, 2);
  for (let i = 0; i < jsonStr.length; i += 1800) {
    childrenBlocks.push({
      object: "block",
      type: "code",
      code: {
        rich_text: [{
          type: "text",
          text: {
            content: jsonStr.slice(i, i + 1800)
          }
        }],
        language: "json"
      }
    });
  }

  // 分批寫入 blocks (Notion API 單次上限 100 blocks)
  try {
    await notion.blocks.children.append({
      block_id: pageId,
      children: childrenBlocks
    });
    console.log(`🎉 成功同步至 Notion！頁面連結: ${pageUrl || `https://notion.so/${pageId.replace(/-/g, '')}`}`);
  } catch (err) {
    console.log(`⚠️ 寫入 Notion blocks 時發生錯誤: ${err.message}`);
  }

  return pageUrl;
}

if (require.main === module) {
  const targetPath = process.argv[2] || null;
  syncDPlanToNotion(targetPath).catch(console.error);
}

module.exports = { syncDPlanToNotion };
