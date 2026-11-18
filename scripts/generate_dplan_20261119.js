const fs = require('fs');
const path = require('path');

console.log(`🚀 正在生成 2026-11-19 D-Plan 交易書【劇本 A：止血光學與組裝・富邦兆豐加固・現金 6.67% 縱深防禦版】...`);

const tradeDate = "2026-11-19";
const teamId = "TEAM_12006";
const navTradable = 893939010.18;
const openingCash = 55815660.18;

const dpPath = path.join(__dirname, '..', 'DataPack_596_2026-11-19.json');
const dp = JSON.parse(fs.readFileSync(dpPath, 'utf8'));

// 1. Sources (合法 authority: twse, vendor, mops, taifex; 時間戳均為 +08:00)
const sources = [
  {
    source_id: "S1",
    authority: "twse",
    url: "https://www.twse.com.tw",
    content_as_of: "2026-11-18T13:30:00+08:00"
  },
  {
    source_id: "S2",
    authority: "vendor",
    url: "https://finance.yahoo.com",
    content_as_of: "2026-11-19T05:00:00+08:00"
  },
  {
    source_id: "S3",
    authority: "mops",
    url: "https://mops.twse.com.tw",
    content_as_of: "2026-11-18T21:30:00+08:00"
  },
  {
    source_id: "S4",
    authority: "taifex",
    url: "https://www.taifex.com.tw",
    content_as_of: "2026-11-19T05:00:00+08:00"
  }
];

// 2. Observations (數值為 number，文字嚴格控制在 450 字以內，語意完整閉環)
const obs1Statement = "隔夜美股正式收盤（2026/11/18）：那指逆勢上揚 101.50 點 (+0.42%) 至 24,429.89，費半小漲 9.65 點 (+0.10%) 至 9,652.80 築底連二紅；道瓊跌 561.25 點 (-1.11%) 至 50,198.17。焦點個股與 ADR 中，台積電 ADR (TSM) 抗跌上揚 +0.80% (約 362.5 美元)、超微 (AMD) 暴漲 +5.31%；輝達 (NVDA) 盤後財報展望優異但受市場觀望收 150.96 美元 (-2.89%)；美債 10Y 殖利率徘徊於 5.10%，仍高於 5.0% 警戒線。政經轉譯：科技權值股築底態勢浮現，惟長債高利率與聯準會鷹派紀要仍壓抑本益比擴張，需保持高現金彈性。";

const obs1Values = {
  djia_close: 50198.17,
  djia_change_pct: -0.0111,
  sp500_close: 7323.64,
  sp500_change_pct: -0.0023,
  nasdaq_close: 24429.89,
  nasdaq_change_pct: 0.0042,
  sox_close: 9652.80,
  sox_change_pct: 0.0010,
  nvda_close: 150.96,
  nvda_change_pct: -0.0289,
  tsm_adr_close: 362.50,
  tsm_adr_change_pct: 0.0080,
  us10y_yield: 5.10,
  wti_crude_oil: 86.80
};

const obs2Statement = "證交所 (S1) 於 2026-11-18 收盤結算：加權指數上漲 102.80 點 (+0.26%) 收 40,194.91 點，成功收復並守穩四萬點大關；期交所 (S4) 台指期夜盤 (11/19 05:00 收盤) 收於 39,987 點 (▼-0.86%)，受美債利率與短線獲利了結影響再度回測四萬點整數關卡。投組持股結構性分化：AI 與自研晶片族群領軍暴衝，2345 智邦大漲 +6.77% (收 1,420 元)、3711 日月光大漲 +5.38% (收 548 元)、2454 聯發科強彈 +2.60% (收 3,940 元)；惟高階光學 3008 大立光續跌 -2.33% (收 4,410 元) 連三日破底，代工 2382 廣達收 265 元。";

const obs2Values = {
  taiex_close: 40194.91,
  taiex_change_pct: 0.0026,
  tx_night_close: 39987,
  tx_night_change_pct: -0.0086,
  tsmc_2330_close: 2175,
  stock_2454_close: 3940.0,
  stock_2345_close: 1420.0,
  stock_3711_close: 548.0,
  stock_3008_close: 4410.0,
  stock_2382_close: 265.0
};

const obs3Statement = "DataPack (2026-11-19) 官方真實可交易淨值 (nav_tradable) 升至 893,939,010.18 元（單日淨增 500 萬，全國排名狂飆 27 名殺入 #92、學生組 #76，合格剩 385 隊），開盤可用現金 55,815,660.18 元 (6.2438%)，昨日委託 100% 撮合成功且 0 違規。2330 台積電持有 100,000 股（收盤 2,175 元，權重 24.3305%），完美落於 25.0% 上限內無警告，堅定 HOLD；今日汰弱減碼大立光與廣達共回收現金 7,060,000 元，加碼金控龍頭富邦金與兆豐金耗資 3,287,000 元，期末現金升至 59,588,660.18 元 (6.6658%)，維持 23 檔合規。";

const obs3Values = {
  nav_tradable: 893939010.18,
  initial_cash: 55815660.18,
  cash_ratio: 0.062438,
  tsmc_2330_shares: 100000,
  tsmc_2330_close: 2175,
  tsmc_2330_settled_weight: 0.243305,
  sell_proceeds_exact: 7060000,
  buy_cost_exact: 3287000,
  ending_cash_exact: 59588660.18,
  ending_cash_pct: 0.066658,
  holdings_count: 23,
  estimated_active_share: 0.288
};

const observations = [
  { observation_id: "O1", source_ref: "S2", statement: obs1Statement, values: obs1Values },
  { observation_id: "O2", source_ref: "S1", statement: obs2Statement, values: obs2Values },
  { observation_id: "O3", source_ref: "S1", statement: obs3Statement, values: obs3Values }
];

// 3. Market View
const marketView = {
  regime: "risk_off",
  stance: "defensive",
  posture: {
    cash_weight_target: 0.066658,
    net_exposure_intent: "reduce",
    target_beta: 0.85
  },
  logic: "美債 10 年期殖利率仍處 5.10% 高檔，持續觸發大會 5.0% 估值防禦硬核條款；台指期夜盤回測 39,987 點 (-0.86%) 震盪洗盤，操作姿態堅決維持 defensive。策略執行「精確止血・金融加固」：調節連三日破底之弱勢光學 3008 大立光 1 張與伺服器組裝 2382 廣達 10 張共釋放現金 706 萬元，增持高股息金控獲利王 2881 富邦金 15 張與官股外幣企金龍頭 2886 兆豐金 20 張耗資 328.7 萬元，將期末現金水位進一步推升至 5,958.8 萬元 (6.6658%)，擴大流動性縱深，總持股維持 23 檔合規。",
  counter_evidence: "若費半與那斯達克帶動台股科技權值展開報復性大反彈，本投組重倉持有之 2330 台積電 (100張, 權重24.33%)、2454 聯發科 (權重9.26%)、2345 智邦 (權重3.81%) 及 3711 日月光投控 (權重4.90%) 能充分享受大盤反彈超額 Alpha；反之若大盤跌破四萬點二次探底，6.67% 充沛現金與高息金控可發揮全市場最強抗跌避震防護。"
};

// 4. Inferences
const inferences = [
  {
    inference_id: "I1",
    premise_refs: ["O1", "O3"],
    logic: "美債 10 年期殖利率徘徊於 5.10%，持續觸發大會 5.0% 強制防禦閥值。高本益比科技股仍承受評價折現壓力，藉由動態調倉將現金水位由 6.24% 推升至 6.67%，確保大盤高波動下的絕對安全邊際。",
    counter_evidence: "若聯準會轉向鴿派預期引導美債殖利率驟降，估值壓力將解除；投組保留台積電、聯發科與智邦等核心成長股即可對沖機會成本。"
  },
  {
    inference_id: "I2",
    premise_refs: ["O1", "O2"],
    logic: "3008 大立光受高階潛望鏡頭拉貨減緩與外資降評影響連跌三日破底至 4,410 元，為投組主要出血點；2382 廣達面臨伺服器驗證過渡期。減碼大立光 1 張與廣達 10 張精確回收 7,060,000 元現金，果斷停損止血並保留底倉。",
    counter_evidence: "若非蘋陣營急單拉動大立光跌深反彈，減碼可能少賺；但大立光技術面均線空頭排列，截斷下行風險為首要原則。"
  },
  {
    inference_id: "I3",
    premise_refs: ["O2", "O3"],
    logic: "金融獲利龍頭 2881 富邦金與外幣存放淨利差受惠者 2886 兆豐金本益比合理且具高股息保護，動用 3,287,000 元加碼，期末現金仍達 6.67%，兼顧估值防守與穩定現金流保護。",
    counter_evidence: "若資本市場震盪加劇影響壽險未實現損益，金控股價可能短線整理；但相較於高波動成長股，金控龍頭下檔風險顯著受限。"
  }
];

// 5. Decisions
const decisions = [
  {
    decision_id: "D1",
    ticker: "3008",
    action: "TRIM",
    target_weight: 0.014800,
    inference_refs: ["I2"]
  },
  {
    decision_id: "D2",
    ticker: "2382",
    action: "TRIM",
    target_weight: 0.022234,
    inference_refs: ["I2"]
  },
  {
    decision_id: "D3",
    ticker: "2881",
    action: "ADD",
    target_weight: 0.056671,
    inference_refs: ["I3"]
  },
  {
    decision_id: "D4",
    ticker: "2886",
    action: "ADD",
    target_weight: 0.022948,
    inference_refs: ["I3"]
  }
];

// 6. No Trade Decisions (19 檔)
const noTradeDecisions = [
  {
    ticker: "1216",
    reason_refs: ["I3"],
    reason: "統一 (1216) 於 2026-11-18 收盤 78.8 元（持有 70,000 股，權重 0.62%），本土民生消費龍頭剛性需求穩健，大盤震盪時展現穩定營運現金流防禦特質，維持核心部位續抱"
  },
  {
    ticker: "2303",
    reason_refs: ["I3"],
    reason: "聯電 (2303) 於 2026-11-18 收盤 93.0 元（微幅上漲 +0.65%，持有 140,000 股，權重 1.46%），成熟特殊製程現金流充沛，具備高股息殖利率與低本益比下檔保護，維持核心部位續抱"
  },
  {
    ticker: "2308",
    reason_refs: ["I1"],
    reason: "台達電 (2308) 於 2026-11-18 收盤 1060 元（微幅上揚 +0.47%，持有 45,000 股，權重 5.34%），AI伺服器高瓦數電源與液冷散熱絕對領先者，超跌後技術面站穩千元支撐，維持核心部位續抱"
  },
  {
    ticker: "2317",
    reason_refs: ["I1"],
    reason: "鴻海 (2317) 於 2026-11-18 收盤 221.0 元（上漲 +0.91%，持有 225,000 股，權重 5.56%），前期減碼提款後持股結構健全，今日平盤上揚展現抗跌力道，保留 225 張底倉續抱"
  },
  {
    ticker: "2330",
    reason_refs: ["I1"],
    reason: "台積電 (2330) 於 2026-11-18 收盤 2175 元（持有 100,000 股，權重 24.3305%），全球先進製程與CoWoS獨佔霸主，權重穩定落於 25.0% 上限內無警告，鎖定 100 張 HOLD 續抱"
  },
  {
    ticker: "2345",
    reason_refs: ["I1"],
    reason: "智邦 (2345) 於 2026-11-18 收盤 1420 元（狂飆大漲 +6.77%，持有 24,000 股，權重 3.81%），800G高速交換器龍頭，受惠雲端CSP自研ASIC算力中心建設訂單爆發，強勢領漲維持核心部位續抱"
  },
  {
    ticker: "2357",
    reason_refs: ["I3"],
    reason: "華碩 (2357) 於 2026-11-18 收盤 841 元（上揚 +1.82%，持有 24,000 股，權重 2.26%），AI PC與伺服器主機板雙引擎支撐，估值具備穩健下檔保護，維持核心部位續抱"
  },
  {
    ticker: "2412",
    reason_refs: ["I3"],
    reason: "中華電 (2412) 於 2026-11-18 收盤 164.5 元（持平，持有 126,000 股，權重 2.32%），零Beta電信霸主具備剛性自由現金流，為投組抵禦市場下行之定海神針，維持核心部位續抱"
  },
  {
    ticker: "2454",
    reason_refs: ["I1"],
    reason: "聯發科 (2454) 於 2026-11-18 收盤 3940 元（逆勢強彈 +2.60%，持有 21,000 股，權重 9.26%），天璣9400旗艦晶片與自研ASIC雙爆發領銜反攻，逼近10%上限不再追高，維持核心部位續抱"
  },
  {
    ticker: "2603",
    reason_refs: ["I3"],
    reason: "長榮 (2603) 於 2026-11-18 收盤 257.5 元（微漲 +0.39%，持有 115,000 股，權重 3.31%），超低本益比與高殖利率優勢提供投組極強價值防護，維持核心部位續抱"
  },
  {
    ticker: "2882",
    reason_refs: ["I3"],
    reason: "國泰金 (2882) 於 2026-11-18 收盤 110.0 元（持有 431,000 股，權重 5.30%），前期加碼後已建構 431 張充沛部位，獲利動能強勁且具殖利率防護，維持核心部位續抱"
  },
  {
    ticker: "2884",
    reason_refs: ["I3"],
    reason: "玉山金 (2884) 於 2026-11-18 收盤 42.15 元（持有 301,000 股，權重 1.42%），財富管理手續費收入成長穩健且存貸利差優異，維持核心部位續抱"
  },
  {
    ticker: "2892",
    reason_refs: ["I3"],
    reason: "第一金 (2892) 於 2026-11-18 收盤 41.00 元（持有 510,000 股，權重 2.34%），公股銀行存放款利差穩定且股息配發率高，防禦屬性鮮明，維持核心部位續抱"
  },
  {
    ticker: "2912",
    reason_refs: ["I3"],
    reason: "統一超 (2912) 於 2026-11-18 收盤 214.0 元（上揚 +0.47%，持有 66,000 股，權重 1.58%），本土零售通路龍頭具備抗通膨定價能力與穩定現金流入，維持核心部位續抱"
  },
  {
    ticker: "3231",
    reason_refs: ["I1"],
    reason: "緯創 (3231) 於 2026-11-18 收盤 162.0 元（大漲 +3.18%，持有 65,000 股，權重 1.18%），減碼提款後輕裝上陣，反彈動能重現，保留 65 張底倉續抱"
  },
  {
    ticker: "3711",
    reason_refs: ["I1"],
    reason: "日月光投控 (3711) 於 2026-11-18 收盤 548.0 元（強彈 +5.38%，持有 80,000 股，權重 4.90%），CoWoS先進封測訂單滿載，急跌後強勢修復估值，維持核心部位續抱"
  },
  {
    ticker: "5876",
    reason_refs: ["I3"],
    reason: "上海商銀 (5876) 於 2026-11-18 收盤 52.9 元（持有 183,000 股，權重 1.08%），高資本適足率與高股息防禦特徵明確，與主動型ETF零重疊，維持核心部位續抱"
  },
  {
    ticker: "5880",
    reason_refs: ["I3"],
    reason: "合庫金 (5880) 於 2026-11-18 收盤 27.50 元（持有 534,000 股，權重 1.64%），官股金控資產品質優異且波動極低，發揮極佳避震器作用，維持核心部位續抱"
  },
  {
    ticker: "6669",
    reason_refs: ["I1"],
    reason: "緯穎 (6669) 於 2026-11-18 收盤 1475 元（上漲 +1.72%，持有 24,000 股，權重 3.96%），雲端CSP客製化ASIC旗艦，直接受惠自研晶片伺服器出貨放量，維持核心部位續抱"
  }
];

// 7. Orders (4 筆委託，推導完全精確)
const orders = [
  {
    ticker: "3008",
    side: "SELL",
    shares: 1000,
    decision_ref: "D1",
    derivation_detail: "floor(0.014800 * 893939010.18 / 4410 / 1000) * 1000 = 3000; 原持有 4000 股; 委託差額: SELL 1000 股 (回收 4,410,000 元)"
  },
  {
    ticker: "2382",
    side: "SELL",
    shares: 10000,
    decision_ref: "D2",
    derivation_detail: "floor(0.022234 * 893939010.18 / 265 / 1000) * 1000 = 75000; 原持有 85000 股; 委託差額: SELL 10000 股 (回收 2,650,000 元)"
  },
  {
    ticker: "2881",
    side: "BUY",
    shares: 15000,
    decision_ref: "D3",
    derivation_detail: "floor(0.056671 * 893939010.18 / 149 / 1000) * 1000 = 340000; 原持有 325000 股; 委託差額: BUY 15000 股 (耗資 2,235,000 元)"
  },
  {
    ticker: "2886",
    side: "BUY",
    shares: 20000,
    decision_ref: "D4",
    derivation_detail: "floor(0.022948 * 893939010.18 / 52.6 / 1000) * 1000 = 390000; 原持有 370000 股; 委託差額: BUY 20000 股 (耗資 1,052,000 元)"
  }
];

// 8. Agent Metadata
const agentMetadata = {
  model_provider: "google",
  model_version: "gemini-3.1-pro-thinking-high",
  run_started_at: "2026-11-19T06:00:15+08:00",
  run_completed_at: "2026-11-19T06:03:45+08:00",
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

const outputPath = path.join(__dirname, '..', `DPlan_20261119_${teamId}.json`);
fs.writeFileSync(outputPath, JSON.stringify(dplan, null, 2), 'utf8');
console.log(`✅ 成功生成 2026-11-19 D-Plan 交易書：${outputPath}`);
