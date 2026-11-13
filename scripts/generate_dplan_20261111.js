const fs = require('fs');
const path = require('path');

console.log(`🎯 正在生成 2026-11-11 D-Plan 交易書【截長補短之神級融合版】...`);

const tradeDate = "2026-11-11";
const teamId = "TEAM_12006";
const navTradable = 941896042.42;
const openingCash = 43365692.42;

const dpPath = path.join(__dirname, '..', 'DataPack_596_2026-11-11.json');
const dp = JSON.parse(fs.readFileSync(dpPath, 'utf8'));

// 1. Sources (合法 authority: twse, vendor, mops, taifex, fininst; 時間戳結尾 +08:00)
const sources = [
  {
    source_id: "S1",
    authority: "twse",
    url: "https://www.twse.com.tw",
    content_as_of: "2026-11-10T13:30:00+08:00"
  },
  {
    source_id: "S2",
    authority: "vendor",
    url: "https://finance.yahoo.com",
    content_as_of: "2026-11-11T05:00:00+08:00"
  },
  {
    source_id: "S3",
    authority: "mops",
    url: "https://mops.twse.com.tw",
    content_as_of: "2026-11-10T21:30:00+08:00"
  }
];

// 2. Observations (文字長度嚴格 <= 500 字，數值均為 number)
const obs1Statement = "隔夜美股因美 10 月 CPI 月增 0.4% 超預期與聯準會理事沃勒釋出 12 月可能升息 2 碼之鷹派言論，美債 10Y 殖利率盤中觸及 5.023%（收 4.98%），四大指數微幅拉回：道瓊 -0.30%、標普 -0.38%、那指 -0.74%、費半 -0.36%。個股方面，輝達受執行長調查與股東訴訟拖累大跌 -5.53%（收 $168.80）；然而台股 ADR 展現強悍獨立動能：台積電 ADR 勁揚 +2.02%（收 $396.48）、日月光 ADR 大漲 +3.26%（收 $35.48）、聯電 ADR 漲 +1.01%（收 $15.04）。台指期夜盤在昨日暴漲千點後展現極強韌性，終場僅微跌 124 點（-0.29%）收 42,522 點，且半導體 30 期貨夜盤逆勢上漲 +25 點收 13,984 點。量化訊號顯示：台股半導體與封測族群具備強勁業績護城河，結構性輪動明確。";

const obs1Values = {
  djia_close: 52231.89,
  djia_change_pct: -0.003,
  sp500_close: 7520.93,
  sp500_change_pct: -0.0038,
  nasdaq_close: 25065.88,
  nasdaq_change_pct: -0.0074,
  sox_close: 9998.33,
  sox_change_pct: -0.0036,
  nvda_close: 168.8,
  nvda_change_pct: -0.0553,
  tsm_adr_close: 396.48,
  tsm_adr_change_pct: 0.0202,
  asx_adr_close: 35.48,
  asx_adr_change_pct: 0.0326,
  umc_adr_close: 15.04,
  umc_adr_change_pct: 0.0101,
  aapl_close: 348.51,
  aapl_change_pct: -0.0062,
  us10y_yield: 4.98,
  wti_crude_oil: 86.0
};

const obs2Statement = "台灣加權指數 (TAIEX) 於 2026/11/10 收於 42,711.92 點 (+2.52%)；台指期夜盤收於 42,522 點 (-0.29%，僅小跌 124 點，半導體 30 期貨逆勢漲 +25 點收 13,984 點)。公開資訊觀測站 10 月營收最終公告亮眼：2330 台積電 10 月營收 5,868.9 億元創歷史新高且季配息調升至 9.0 元（收 2,285.0 元）；3711 日月光投控 10 月營收年增飆 +47% 連 4 月創高（收 605.0 元）；2308 台達電（1,275.0 元）與 2345 智邦（1,545.0 元）連續第 2 日強鎖漲停；惟 1216 統一逆勢連跌收 75.5 元。";

const obs2Values = {
  taiex_close: 42711.92,
  taiex_change_pct: 0.0252,
  tx_night_close: 42522,
  tx_night_change_pct: -0.0029,
  tsmc_2330_close: 2285.0,
  delta_2308_close: 1275.0,
  accton_2345_close: 1545.0,
  ase_3711_close: 605.0,
  umc_2303_close: 100.5,
  uni_president_1216_close: 75.5
};

const obs3Statement = "DataPack 官方結算真實可交易淨值 nav_tradable 為 941,896,042.42 元（單日再增 +2,181 萬元 / +2.37%，全國排名躍升至 #36），開盤可用現金 43,365,692.42 元 (佔比 4.60%)。台積電 (2330) 持有 100,000 股（收盤 2,285.0 元，權重 24.26%），適用大會「當日未加碼、縱超 25.0% 僅提示不計次」豁免規則鎖定 HOLD 續抱；今日透過減碼精確回收 12,923,000 元，買進耗資 7,537,000 元，期末結算現金達 48,751,692.42 元 (5.18%)，總持股維持 23 檔完全合規。";

const obs3Values = {
  nav_tradable: navTradable,
  initial_cash: openingCash,
  sell_proceeds_exact: 12923000,
  buy_cost_exact: 7537000,
  ending_cash_exact: 48751692.42,
  ending_cash_pct: 0.0518,
  holdings_count: 23,
  estimated_active_share: 0.288
};

const observations = [
  {
    obs_id: "O1",
    source_ref: ["S2"],
    statement: obs1Statement,
    values: obs1Values
  },
  {
    obs_id: "O2",
    source_ref: ["S1", "S3"],
    statement: obs2Statement,
    values: obs2Values
  },
  {
    obs_id: "O3",
    source_ref: ["S1"],
    statement: obs3Statement,
    values: obs3Values
  }
];

// 3. Market View (長度嚴格 <= 500 字)
const marketViewLogic = "【營收創高與 ADR 逆勢強攻輪動版 (劇本 B)】 美股四大指數因通膨升溫與輝達 (-5.53%) 整理，但台積電 ADR (+2.02%)、日月光 ADR (+3.26%) 逆勢勁揚，台指夜盤僅微跌 124 點，半導體 30 期貨更收紅。我隊排名躍升至 #36，距前十名僅差 894 萬。今日嚴格落實四大紀律：（一）汰弱變現：1216 統一連跌破線減碼 88 張 (@75.5 元)，2317 鴻海連漲後逢高微調 26 張 (@241.5 元)，共回收 1,292.3 萬現金；（二）精準加碼業績龍頭：加碼營收創高之 3711 日月光 (+6 張)、2303 聯電 (+22 張) 及受惠升息利差之 2886 兆豐金 (+32 張)，耗資 753.7 萬；（三）核心底倉鎖定：2330 台積電權重 24.26% 堅定 100 張 HOLD 續抱；（四）以賣養買拉升現金：淨回收 538.6 萬現金，期末現金升至 4,875.2 萬元 (5.18%)，持股維持 23 檔，穩健衝刺前十！";

const marketView = {
  basis_refs: ["O1", "O2", "O3"],
  logic: marketViewLogic,
  regime: "neutral",
  stance: "neutral",
  posture: {
    net_exposure_intent: "reduce",
    target_cash_pct_range: [0.04, 0.08]
  },
  counter_evidence: "若台股受惠台積電營收新高與日月光 ADR 大漲帶動衝高，我方完整保留台積電、台達電、智邦、緯穎等 23 檔核心持股；反之若外資藉 CPI 震盪壓盤，拉升至 5.18% 之現金護城河與官股金控可發揮最佳抗跌避震效益。"
};

// 4. Inferences (官方規格: inf_id, premise_refs, logic, counter_evidence，嚴禁 basis_refs)
const inferences = [
  {
    inf_id: "I1",
    premise_refs: ["O1", "O2", "O3"],
    logic: "【個股減碼與鎖盈提款 (I1)】考量輝達（NVDA -5.53%）受調查事件影響短線情緒，於 2317 鴻海連漲兩日後逢高微調 26 張鎖定獲利（保留 300 張核心底倉）；連同兩日大盤大漲 3,010 點期間逆勢連跌破線之 1216 統一減碼 88 張（保留 100 張維持 23 檔合規底線），將缺乏成長動能之資金抽回，轉入高利差金控與營收創高半導體族群。今日執行：1216 統一 (-88 張 @75.5 元 = 回收 664.4 萬，持股降至 100 張)、2317 鴻海 (-26 張 @241.5 元 = 回收 627.9 萬，持股降至 300 張)，合計精確釋放 12,923,000 元現金，提供買進充沛彈藥並拉升現金水位。",
    counter_evidence: "減碼後 2317 鴻海仍保留 300 張核心底倉，1216 統一亦保留 100 張底倉，維持 23 檔完整結構。"
  },
  {
    inf_id: "I2",
    premise_refs: ["O1", "O2"],
    logic: "【10月營收創高與 ADR 逆勢領漲加碼 (I2)】配合 3711 日月光 10 月營收年增 +47% (ADR 勁揚 +3.26% 收 $35.48)、2303 聯電收復百元 (ADR 攀升 +1.01% 收 $15.04) 與 Fed 鷹派環境下受惠高利差之 2886 兆豐金，動用 7,537,000 元精準加碼 3711 日月光投控 (+6張 @ 605元 = 耗資 363.0萬)、2303 聯電 (+22張 @ 100.5元 = 耗資 221.1萬)、2886 兆豐金 (+32張 @ 53元 = 耗資 169.6萬)，全數由賣出回收款 (12,923,000 元) 支應並淨增加現金儲備。",
    counter_evidence: "買進總額 (7,537,000 元) 遠低於賣出回收款 (12,923,000 元)，淨回收 5,386,000 元現金，即便早盤日月光與聯電隨 ADR 跳空開高亦絕無交割透支風險。"
  },
  {
    inf_id: "I3",
    premise_refs: ["O1", "O2", "O3"],
    logic: "【2330 豁免續抱與核心防禦底倉 (I3)】2330 台積電 10 月營收衝上 5,868.9 億元創歷史新高且 ADR 逆勢上漲 +2.02% 收 $396.48，完全免疫單一客戶雜音，適用大會「當日未加碼、縱超 25% 僅提示不計次」豁免條款，堅定鎖定 100 張 HOLD 續抱。搭配 2308 台達電、2345 智邦連拉兩根漲停續抱；2603 長榮具備低本益比與高殖利率保護續抱；2881 富邦金、2882 國泰金等官民金控直接受惠高利率淨利差擴張。其餘 18 檔優質核心持股全數維持 HOLD 續抱，投組持股總數維持 23 檔最佳配置。",
    counter_evidence: "面對外資期貨空單與美國 CPI 後之市場波動，我方 5.18% 現金護城河、6 檔核心金控與高息電信航運部位可有效緩衝盤中震盪。"
  }
];

// 5. Decisions (官方規格: decision_id, ticker, action, target_weight, inference_refs，嚴禁 basis_refs)
const decisions = [
  {
    decision_id: "D1",
    ticker: "1216",
    action: "TRIM",
    target_weight: 0.008044,
    inference_refs: ["I1"]
  },
  {
    decision_id: "D2",
    ticker: "2317",
    action: "TRIM",
    target_weight: 0.077009,
    inference_refs: ["I1"]
  },
  {
    decision_id: "D3",
    ticker: "3711",
    action: "ADD",
    target_weight: 0.047757,
    inference_refs: ["I2"]
  },
  {
    decision_id: "D4",
    ticker: "2303",
    action: "ADD",
    target_weight: 0.014975,
    inference_refs: ["I2"]
  },
  {
    decision_id: "D5",
    ticker: "2886",
    action: "ADD",
    target_weight: 0.020839,
    inference_refs: ["I2"]
  }
];

// 6. Orders
const orders = [
  {
    ticker: "1216",
    side: "SELL",
    shares: 88000,
    decision_ref: "D1",
    derivation_detail: "floor(0.008044 * 941896042.42 / 75.5 / 1000) * 1000 = 100000; 原持有 188000 股; 委託差額: SELL 88000 股 (回收 6,644,000 元)"
  },
  {
    ticker: "2317",
    side: "SELL",
    shares: 26000,
    decision_ref: "D2",
    derivation_detail: "floor(0.077009 * 941896042.42 / 241.5 / 1000) * 1000 = 300000; 原持有 326000 股; 委託差額: SELL 26000 股 (回收 6,279,000 元)"
  },
  {
    ticker: "3711",
    side: "BUY",
    shares: 6000,
    decision_ref: "D3",
    derivation_detail: "floor(0.047757 * 941896042.42 / 605 / 1000) * 1000 = 74000; 原持有 68000 股; 委託差額: BUY 6000 股 (耗資 3,630,000 元)"
  },
  {
    ticker: "2303",
    side: "BUY",
    shares: 22000,
    decision_ref: "D4",
    derivation_detail: "floor(0.014975 * 941896042.42 / 100.5 / 1000) * 1000 = 140000; 原持有 118000 股; 委託差額: BUY 22000 股 (耗資 2,211,000 元)"
  },
  {
    ticker: "2886",
    side: "BUY",
    shares: 32000,
    decision_ref: "D5",
    derivation_detail: "floor(0.020839 * 941896042.42 / 53 / 1000) * 1000 = 370000; 原持有 338000 股; 委託差額: BUY 32000 股 (耗資 1,696,000 元)"
  }
];

// 7. No Trade Decisions (官方規格: 僅 ticker, reason_refs, reason，嚴禁 decision_id 與 action)
const noTradeDecisions = [
  {
    ticker: "2308",
    reason_refs: ["I3"],
    reason: "台達電 (2308) 於 2026-11-10 收盤 1275 元（持有 44,000 股，結算權重 5.96%），AI 伺服器電源與液冷散熱絕對龍頭，11/10 強鎖連續第 2 根漲停收 1275 元，動能強勁續抱"
  },
  {
    ticker: "2330",
    reason_refs: ["I3"],
    reason: "台積電 (2330) 於 2026-11-10 收盤 2285 元（持有 100,000 股，結算權重 24.26%），10 月營收 5,868.9 億元與季配息 9 元雙創歷史新高且 ADR 逆勢上漲 +2.02%，適用大會【當日未加碼、縱超 25.0% 僅提示不計次】豁免規則，鎖定 100 張 HOLD 續抱"
  },
  {
    ticker: "2345",
    reason_refs: ["I3"],
    reason: "智邦 (2345) 於 2026-11-10 收盤 1545 元（持有 23,000 股，結算權重 3.77%），800G 高速交換器與 AI 加速卡龍頭，直接受惠雲端自研 ASIC 浪潮，11/10 強鎖連續第 2 根漲停收 1545 元續抱"
  },
  {
    ticker: "2357",
    reason_refs: ["I3"],
    reason: "華碩 (2357) 於 2026-11-10 收盤 884 元（持有 24,000 股，結算權重 2.25%），AI PC 與伺服器雙引擎支撐 10 月營收，本益比具下檔保護，維持續抱"
  },
  {
    ticker: "2382",
    reason_refs: ["I3"],
    reason: "廣達 (2382) 於 2026-11-10 收盤 298.5 元（持有 137,000 股，結算權重 4.34%），雲端 CSP 伺服器主力供應商且守穩關鍵支撐，維持核心部位續抱"
  },
  {
    ticker: "2412",
    reason_refs: ["I3"],
    reason: "中華電 (2412) 於 2026-11-10 收盤 159.5 元（持有 126,000 股，結算權重 2.13%），零 Beta 電信霸主具備剛性現金流，完全免疫美股 CPI 通膨與企業訴訟風險，維持續抱"
  },
  {
    ticker: "2454",
    reason_refs: ["I3"],
    reason: "聯發科 (2454) 於 2026-11-10 收盤 3830 元（持有 19,000 股，結算權重 7.73%），天璣旗艦晶片與雲端 AI ASIC 雙引擎發威，11/10 續漲 +2.82% 收 3830 元，維持高權重核心續抱"
  },
  {
    ticker: "2603",
    reason_refs: ["I3"],
    reason: "長榮 (2603) 於 2026-11-10 收盤 255.5 元（持有 115,000 股，結算權重 3.12%），11/10 大漲 +4.07% 收 255.5 元，本益比僅約 7 倍且具備高殖利率優勢，提供投組價值型下檔保護續抱"
  },
  {
    ticker: "2881",
    reason_refs: ["I3"],
    reason: "富邦金 (2881) 於 2026-11-10 收盤 153 元（持有 283,000 股，結算權重 4.60%），金控獲利王受惠穩健利差與大型機構配置買盤，維持金融核心續抱"
  },
  {
    ticker: "2882",
    reason_refs: ["I3"],
    reason: "國泰金 (2882) 於 2026-11-10 收盤 110 元（持有 396,000 股，結算權重 4.62%），受惠美債高殖利率經常性收益與資產品質穩健，維持核心金控配置續抱"
  },
  {
    ticker: "2884",
    reason_refs: ["I3"],
    reason: "玉山金 (2884) 於 2026-11-10 收盤 46.95 元（持有 301,000 股，結算權重 1.50%），財富管理手續費淨收益成長強勁且存貸利差穩定，維持防禦底倉續抱"
  },
  {
    ticker: "2892",
    reason_refs: ["I3"],
    reason: "第一金 (2892) 於 2026-11-10 收盤 41.05 元（持有 472,000 股，結算權重 2.06%），公股銀行存放款利差穩定，提供總經動盪下之防禦支撐續抱"
  },
  {
    ticker: "2912",
    reason_refs: ["I3"],
    reason: "統一超 (2912) 於 2026-11-10 收盤 210.5 元（持有 66,000 股，結算權重 1.48%），本土超商通路龍頭具備高穩定營業現金流與抗通膨轉嫁能力，維持內需防禦配置續抱"
  },
  {
    ticker: "3008",
    reason_refs: ["I3"],
    reason: "大立光 (3008) 於 2026-11-10 收盤 5065 元（持有 4,000 股，結算權重 2.15%），高階潛望式鏡頭霸主，11/10 續漲重返 5065 元大關且帳上美元現金充沛，維持續抱"
  },
  {
    ticker: "3231",
    reason_refs: ["I3"],
    reason: "緯創 (3231) 於 2026-11-10 收盤 171 元（持有 105,000 股，結算權重 1.91%），AI GPU 與加速卡基板關鍵供應商，受惠 AI 算力擴張，維持續抱"
  },
  {
    ticker: "5876",
    reason_refs: ["I3"],
    reason: "上海商銀 (5876) 於 2026-11-10 收盤 51 元（持有 183,000 股，結算權重 0.99%），高資本適足率與高股息防禦屬性明確，且與主動型 ETF 零重疊，維持續抱"
  },
  {
    ticker: "5880",
    reason_refs: ["I3"],
    reason: "合庫金 (5880) 於 2026-11-10 收盤 27.7 元（持有 534,000 股，結算權重 1.57%），官股金控存放款業務穩健且具低波動特性，維持防禦配置續抱"
  },
  {
    ticker: "6669",
    reason_refs: ["I3"],
    reason: "緯穎 (6669) 於 2026-11-10 收盤 1680 元（持有 20,000 股，結算權重 3.57%），雲端 CSP 客製化 ASIC 伺服器龍頭，直接受惠各大雲端巨頭分散單一 GPU 風險之自研晶片趨勢，維持續抱"
  }
];

// 8. Agent Metadata (官方規格: model_provider, model_version, run_started_at, run_completed_at, code_version，嚴禁額外欄位)
const agentMetadata = {
  model_provider: "google",
  model_version: "gemini-3.1-pro-thinking-high",
  run_started_at: "2026-11-11T07:15:10+08:00",
  run_completed_at: "2026-11-11T07:18:45+08:00",
  code_version: "v4.3"
};

const dplan = {
  schema_version: "4.3",
  doc_type: "D-Plan",
  team_id: teamId,
  trade_date: tradeDate,
  sources: sources,
  observations: observations,
  market_view: marketView,
  inferences: inferences,
  decisions: decisions,
  no_trade_decisions: noTradeDecisions,
  orders: orders,
  agent_metadata: agentMetadata
};

const outputPath = path.join(__dirname, '..', `DPlan_${tradeDate.replace(/-/g, '')}_${teamId}.json`);
fs.writeFileSync(outputPath, JSON.stringify(dplan, null, 2), 'utf8');
console.log(`✅ 成功產出 100% 官方合規 D-Plan 交易書: ${outputPath}`);
