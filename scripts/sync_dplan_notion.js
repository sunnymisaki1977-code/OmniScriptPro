const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');

async function syncToNotion() {
  // 從 .env.local 動態讀取金鑰，不硬編碼
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NOTION_API_KEY=([^\r\n]+)/);
    if (match) process.env.NOTION_API_KEY = match[1].trim();
  }
  const notionToken = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_fintech_ID || '3cdf374300dc8033af23d63306769950';

  const notion = new Client({ auth: notionToken });

  const dplanPath = path.join(__dirname, '..', 'DPlan_20261103_TEAM_12006.json');
  const dplan = JSON.parse(fs.readFileSync(dplanPath, 'utf8'));

  console.log('🚀 開始將 2026-11-03 D-Plan (5大缺陷修復版) 完整 10-Step 歷程寫入 Notion:');

  // 1. 查詢是否已有今日頁面
  let existingPageId = '40cf3743-00dc-812d-a97b-c47b98398a59';
  try {
    const check = await notion.pages.retrieve({ page_id: existingPageId });
    if (check && !check.archived) {
      console.log('📍 找到現有頁面:', existingPageId, '將直接在原頁面進行更新與覆蓋！');
    }
  } catch (e) {
    console.log('⚠️ 頁面未找到或需建立新頁面');
    existingPageId = null;
  }

  const pageProps = {
    "名稱": {
      title: [{ text: { content: "2026-11-03 玉山 AI CUP D-Plan 交易書 ＆ 10-Step 決策歷程（TEAM_12006・5大缺陷全修復版）" } }]
    },
    "日期": {
      date: { start: "2026-11-03" }
    },
    "主題分類": {
      select: { name: "7. AI 宏觀風控與選股決策引擎" }
    },
    "判斷原因": {
      rich_text: [{ text: { content: "隔夜美股整固(費半+0.12%)，美債4.89%，台指期夜盤22980抗震，台積電23.7770%鎖定HOLD；減碼1101台泥200張釋放562萬，加碼10月營收催化之2308/2345/6669，加厚安全緩衝至350股，結算現金維持6.10%高防禦水位" } }]
    },
    "執行摘要": {
      rich_text: [{ text: { content: "【劇本 B：穩健汰弱換強・5大缺陷全修復版】開盤基準 NAV 9.799 億 (979,939,182.58 元)，開盤現金 6,509 萬。TRIM 1101 台泥 200,000 股 (+562 萬)；ADD 2308 台達電 3,000 股 (-406.5 萬)、2345 智邦 2,000 股 (-323 萬)、6669 緯穎 2,000 股 (-364 萬)；2330 台積電等 20 檔持股堅定 HOLD。期末結算現金 5,977.9 萬元 (6.10%)，防透支安全墊高達 3,977.9 萬元，總持股 24 檔，100% 通過大會官方驗證。" } }]
    }
  };

  let pageId = existingPageId;
  let pageUrl = '';

  if (pageId) {
    const updateRes = await notion.pages.update({
      page_id: pageId,
      properties: pageProps,
      icon: { type: "emoji", emoji: "🛡️" }
    });
    pageUrl = updateRes.url;
    console.log('✅ 成功更新 Notion 頁面屬性！');

    // 清理舊的 blocks
    const oldBlocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
    for (const b of oldBlocks.results) {
      try {
        await notion.blocks.delete({ block_id: b.id });
      } catch (err) {}
    }
    console.log('🧹 舊有 Blocks 已清理完畢，準備注入全新 5 大修復內容...');
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

  // 2. 準備 Step 1 ~ 10 區塊結構
  const childrenBlocks = [
    // Step 1: Callout & Tables
    {
      object: "block",
      type: "callout",
      callout: {
        rich_text: [{
          type: "text",
          text: {
            content: "🛡️ 官方驗證 100% 合規交易書（5 大隱形缺點全面修復完美版）\n• 宏觀數據定錨：美股四大指數整固 (道瓊 -0.25%、那指 -0.32%、費半 +0.12%) | 美債 10Y 4.89% | 台積電 ADR 403.8 (+16.2% 溢價) | 台指期夜盤 22,980 (-0.15%)\n• 戰略核心：2330 台積電權重 23.7770% 堅定 HOLD；減碼 1101 台泥 200 張提款 562 萬；精選 10 月營收催化之 2308 台達電、2345 智邦、6669 緯穎；加厚公式安全緩衝至 350~644 股；結算現金維持 5,977.9 萬元 (6.10%)！"
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
        rich_text: [{ type: "text", text: { content: "💵 Step 1：現金流平衡與防透支審計表 (精確 NAV 979,939,182.58)" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: {
            content: "• 開盤可用現金：65,094,082.58 元 (佔淨值 6.64%)\n• 今日賣出回收現金：+5,620,000.00 元 (1101 台泥 -200,000 股)\n• 最大可動用預算 (Buying Power)：50,714,082.58 元 (強制扣除 2,000 萬底線)\n• 今日買進耗資總額：-10,935,000.00 元 (2308/2345/6669 共 3 檔)\n• 淨現金流出：-5,315,000.00 元\n• 期末結算現金：59,779,082.58 元 (6.1003%)\n• 防透支安全墊：+39,779,082.58 元 (合規率 100%)"
          }
        }]
      }
    },
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "📈 Step 1：今日 24 檔持股部位、公式緩衝與委託動作明細" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{
          type: "text",
          text: {
            content: "【4 檔動態調整標的 (均含 340~650 股厚實安全緩衝)】\n1. 1101 台泥：原持 999 張 ➔ 減碼 200 張 (TRIM) ➔ 剩餘 799 張 (回收 562.0 萬，權重 0.02293，計算股數 799,644 股，緩衝 +644 股)\n2. 2308 台達電：原持 33 張 ➔ 加碼 3 張 (ADD) ➔ 達 36 張 (耗資 406.5 萬，權重 0.05026，計算股數 36,348 股，緩衝 +348 股)\n3. 2345 智邦：原持 13 張 ➔ 加碼 2 張 (ADD) ➔ 達 15 張 (耗資 323.0 萬，權重 0.02530，計算股數 15,351 股，緩衝 +351 股)\n4. 6669 緯穎：原持 12 張 ➔ 加碼 2 張 (ADD) ➔ 達 14 張 (耗資 364.0 萬，權重 0.02665，計算股數 14,349 股，緩衝 +349 股)\n\n【20 檔堅定續抱標的 (HOLD・因果引用已修正指向 I3 防禦推論)】\n• 2330 台積電：100 張 (權重 23.7770% 遠低於 25% 上限，堅定續抱核心大盤 Beta)\n• 金融獲利雙保險：2881 富邦金 (283張)、2882 國泰金 (396張) 全數續抱抗震\n• 公股與優質銀行：2884 玉山金 (301張)、2886 兆豐金 (338張)、2892 第一金 (472張)、5876 上海商銀 (183張)、5880 合庫金 (534張)\n• 防禦與高股息：2412 中華電 (126張)、1216 統一 (188張)、2912 統一超 (66張)、2603 長榮 (115張)\n• AI 科技核心梯隊：2454 聯發科 (19張)、2317 鴻海 (326張)、2382 廣達 (137張)、2357 華碩 (24張)、3711 日月光投控 (56張)、3231 緯創 (105張)、3008 大立光 (4張)、2303 聯電 (118張)"
          }
        }]
      }
    },
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "📄 Step 1：官方合規 D-Plan v4.3 JSON 代碼 (全修復版)" } }]
      }
    },
    {
      object: "block",
      type: "code",
      code: {
        caption: [{ text: { content: "DPlan_20261103_TEAM_12006.json" } }],
        rich_text: [{ type: "text", text: { content: JSON.stringify(dplan, null, 2).substring(0, 2000) } }],
        language: "json"
      }
    },
    // Step 2 Toggle: YouTube 長影片腳本
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "🎬 Step 2：YouTube 8 分鐘深度長影片腳本（美股整固下的汰弱換強與營收催化密碼）" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "【開場破題 00:00-01:30】\n各位投資朋友早安！今天是 2026 年 11 月 3 號星期二。隔夜美股四大指數呈現高檔微幅整固，道瓊與那指僅小跌約 0.2~0.3%，費半晶片股更逆勢收紅 +0.12%，台積電 ADR 維持在 403.8 美元，對台股現貨保持超過 16% 的高溢價！市場在美債 4.89% 下氣氛冷靜中性，這正是主動選股的最佳時機！\n\n【第一幕：台積電鎖定 HOLD 23.77% 的安全緩衝 01:30-03:30】\n先看我們團隊的投組防線：昨天台積電收在 2,330 元，使我們持有 100 張台積電的權重自然降溫到了 23.7770%！距離 25% 官方上限有超過 1.2% 的寬裕緩衝！今天無論大盤如何開盤，我們一張台積電都不必賤賣，100 張核心晶片皇冠堅定抱牢！\n\n【第二幕：為什麼今天果斷減碼 1101 台泥？03:30-05:30】\n昨天我們靠著完全出清中鋼，單日排名狂升 30 名衝到全國 #148 名！今天我們鎖定投組裡唯一的傳統原物料弱勢標的——1101 台泥。台泥昨天續跌到 28.1 元，動能落後，我們今天果斷減碼 200 張，一口氣換回 562 萬元的真金白銀！把沒有效益的死錢，轉化為最有殺傷力的子彈！\n\n【第三幕：正值 10 月營收黃金週，加碼哪三檔抗跌龍頭？05:30-07:30】\n回收了 562 萬現金後，我們只動用 1,093 萬，精選三檔昨天在大盤下跌時逆勢收紅的 AI 營收利基股：\n1. 2308 台達電 (+1.50%)：加碼 3 張，液冷散熱與伺服器電源王者！\n2. 2345 智邦 (平盤抗跌)：加碼 2 張，800G 交換器全球獨霸！\n3. 6669 緯穎 (+0.55%)：加碼 2 張，ASIC 伺服器出貨放量！\n這三檔都低於市場上 30 檔指標 ETF 的擁擠度，能在兼顧大盤的同時，為我們創造超越對手的主動 Alpha！\n\n【結尾與展望 07:30-08:00】\n算下來，我們期末結算現金依然高達 5,977 萬元，現金比例高達 6.10%！進可攻、退可守，完全不怕早盤震盪。這就是量化風控與主動投資的魅力，歡迎訂閱按讚，我們盤後見！"
                }
              }]
            }
          }
        ]
      }
    },
    // Step 3 Toggle: SEO 優化內容
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "🔍 Step 3：影音 SEO 標題 / Hashtags / 說明欄優化" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "【高點擊爆款標題備選】\n1. 【11/03 操盤戰報】美股高檔整固！台積電 ADR 溢價 16% 抱牢不賣！砍台泥換 562 萬加碼 3 檔 AI 飆股！\n2. 排名單日狂飆 30 名的秘密！美債 4.89% 下，為什麼我們敢逆勢加碼台達電、智邦與緯穎？\n3. 別再死抱傳產！1101 台泥提款 200 張，6.1% 高現金鐵桶陣如何打贏這場量化淘汰賽？\n\n【精選 Hashtags】\n#台股 #台積電 #費半收紅 #AI概念股 #台達電 #智邦 #緯穎 #量化交易 #資產配置 #玉山AICUP #ETF\n\n【YouTube 官方說明欄】\n隔夜美股科技股高檔整固，費半逆勢收紅 +0.12%，台積電 ADR 溢價達 16.2%。面對盤面，本集為您深度拆解量化冠軍團隊的 11/03 實戰交易書：\n✔ 為什麼台積電 23.77% 權重是今天最完美的防護罩？\n✔ 傳產提款機：砍 1101 台泥 200 張的流動性邏輯\n✔ 10 月營收黃金週：逆勢領漲的 3 大利基 AI 股加碼精算\n✔ 6.1% 結算高現金防線，防透支安全墊高達近 4,000 萬！"
                }
              }]
            }
          }
        ]
      }
    },
    // Step 4 Toggle: 短影音腳本
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "📱 Step 4：擴散式短影音文案（Shorts / TikTok 180 秒快訊）" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "【0-15s 黃金鉤子 Hook】\n（畫面：黑底金字，彭博終端螢幕閃爍）\n費半逆勢收紅，今天台股一開盤，你的股票該逃跑還是加碼？\n等等！先看全國排名單日狂飆 30 名的量化冠軍隊，今天到底怎麼操作！\n\n【15-60s 核心衝突與台積電真相】\n很多人都在問：台積電要不要賣？\n答案是：一張都不准賣！昨天台積電跌到 2330，反而讓我們持股權重自然降到 23.77%，徹底解除大會 25% 的超額紅線！100 張台積電，鎖定抱牢！\n\n【60-120s 汰弱換強神操作】\n真正要砍的，是躲在角落的「傳產死錢」！\n今天直接賣掉 1101 台泥 200 張，當場換回 562 萬現金！\n然後轉身加碼昨天大盤下跌、卻逆勢上漲的 3 檔 AI 神隊友：台達電買 3 張、智邦買 2 張、緯穎買 2 張！正值 10 月營收公佈黃金週，有營收撐腰的股票才是真大哥！\n\n【120-180s 結算現金與致勝金句】\n買完之後，期末結算現金高達 5,977 萬，現金水位牢牢鎖定在 6.1%！\n別人恐慌接刀，我們高枕無憂。這就是專業量化的力量！\n點讚收藏，留言『666』，帶你持續看懂法人真正的底牌！"
                }
              }]
            }
          }
        ]
      }
    },
    // Step 5 Toggle: 短影音 SEO
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "🏷️ Step 5：短影音 SEO 標籤與推薦演算法關鍵字" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "【核心標籤 (Tags)】\n#Shorts #股票 #台股開盤 #台積電2330 #費半收紅 #AI概念股 #短影音 #投資理財 #當沖 #資產配置 #致富思維\n\n【演算法推播關鍵字 (Search Keywords)】\n美股收盤、台股今日走勢、台積電目標價、台達電液冷、智邦營收、緯穎ASIC、玉山競賽、量化投資"
                }
              }]
            }
          }
        ]
      }
    },
    // Step 6 Toggle: 16:9 YouTube 縮圖 Prompt
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "🖼️ Step 6：YouTube 點擊率 (CTR) 縮圖繪圖 Prompt（16:9）" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "### 第一組：【費半收紅下的超車戰神】\n主標：美股整固！費半逆勢收紅！台股怎麼超車？\n副標：砍台泥換 562 萬 ➔ 加碼 3 檔 AI 逆勢飆股\nPrompt：\nholographic stock charts, neon glowing lines, professional Bloomberg terminal aesthetic, corporate blue and gold accents, data visualization, cinematic lighting, ultra detailed, large bold financial typography. A split screen: on the left, a consolidating Nasdaq candlestick chart; on the right, a glowing golden cybernetic bull surging through a vibrant blue 10Y Treasury 4.89% barrier, neon stock tickers (2308, 2345, 6669) radiating intense green and cyan aura, 16:9 widescreen composition."
                }
              }]
            }
          }
        ]
      }
    },
    // Step 7 Toggle: 9:16 短影音縮圖 Prompt
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "📐 Step 7：短影音吸睛圖像繪圖 Prompt（9:16）" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "### 第一組：【短影音百萬封面】\n高點擊文案：別再賣台積電！砍這檔傳產才賺！\nPrompt：\nholographic stock charts, neon glowing lines, professional Bloomberg terminal aesthetic, corporate blue and gold accents, data visualization, cinematic lighting, ultra detailed, large bold financial typography, extreme vertical composition. Extreme close-up of a glowing digital vault door showing 59,779,000 TWD cash reserves with an emerald shield emblem, laser holographic numbers +30 RANK JUMP, cyberpunk Taipei financial district night background, 9:16 vertical ratio."
                }
              }]
            }
          }
        ]
      }
    },
    // Step 8 Toggle: 風格化行銷海報
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "🎨 Step 8：風格化行銷海報繪圖 Prompt（彭博藍金終端風）" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "### 第一組：【11/03 戰情室官方戰報】\n海報主題：穩健汰弱換強 · 6.10% 高現金防線\nPrompt：\nholographic stock charts, neon glowing lines, professional Bloomberg terminal aesthetic, corporate blue and gold accents, data visualization, cinematic lighting, ultra detailed, large bold financial typography. A luxury financial investment executive poster, featuring a majestic translucent architectural grid floating above a dark slate glass surface, golden ratio radar charts displaying Active Share 29.2%, 24 holdings portfolio balance matrix, sleek high-end typography stating 'D-PLAN v4.3 QUANT ENGINE', studio ambient lighting."
                }
              }]
            }
          }
        ]
      }
    },
    // Step 9 Toggle: Suno AI 配樂
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "🎵 Step 9：Suno AI 專業情緒配樂 Prompt" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "【曲風設定 Style】\nCinematic electronic, ambient synthwave, rhythmic pulses, driving sub-bass, professional corporate tech, suspenseful yet calculated, 120 BPM, minor key transitioning to triumphant major chords.\n\n【歌詞/架構結構 Prompt】\n[Instrumental Intro: Subdued analog synth arpeggios, steady heartbeat kick drum, ticking clock rhythm]\n[Verse 1: Calm electronic bassline entering, analytical atmosphere, clean synth pads representing morning data crunching]\n[Pre-Chorus: Rising tempo, crisp hi-hats, tension building as market volatility surges]\n[Chorus: Powerful electronic drop with warm analog brass, sweeping filters, steady momentum representing disciplined execution]\n[Outro: Smooth fadeout with deep resonant piano chords and subtle futuristic radar pings]"
                }
              }]
            }
          }
        ]
      }
    },
    // Step 10 Toggle: 全平台社群推播
    {
      object: "block",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "📢 Step 10：全平台社群推播文案（IG 圖卡 / FB / Threads）" } }],
        children: [
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{
                type: "text",
                text: {
                  content: "【Instagram 圖卡文案 4 張流】\nP1：美股昨晚整固費半逆勢漲，今天開盤你該逃跑還是加碼？（黑金彭博風格背景）\nP2：台積電一張不賣！權重降至 23.77% 消除紅線警告，抱牢大盤核心 Beta！\nP3：砍掉 1101 台泥 200 張釋放 562 萬現金，加碼 10 月營收抗跌三劍客 (台達電/智邦/緯穎)！\nP4：期末結算現金近 6,000 萬 (6.10%)，防透支安全墊近 4,000 萬，這就是職業隊的風控！\n\n【Threads 極速短評】\n昨天靠出清中鋼單日狂升 30 名到 #148。\n今天美股整固，我們的劇本只有一個字：『穩』。\n台積電 23.77% 抱死不放，台泥賣 200 張提款 562 萬，小加碼 3 檔營收創高 AI 股。\n結算現金 6.10%，留滿手現金看別人早盤接飛刀。\n真正的超車，永遠發生在大盤洗盤之際！📈"
                }
              }]
            }
          }
        ]
      }
    }
  ];

  // 分批寫入 Notion Blocks
  const CHUNK_SIZE = 50;
  for (let i = 0; i < childrenBlocks.length; i += CHUNK_SIZE) {
    const chunk = childrenBlocks.slice(i, i + CHUNK_SIZE);
    await notion.blocks.children.append({
      block_id: pageId,
      children: chunk
    });
  }

  console.log('🎉 恭喜！5大缺陷全修復版 10-Step 完整決策歷程已 100% 寫入 Notion 決策戰情室！');
  console.log('🔗 Notion Page URL:', pageUrl);
}

syncToNotion().catch(err => {
  console.error('❌ Notion 同步失敗:', err);
  process.exit(1);
});
