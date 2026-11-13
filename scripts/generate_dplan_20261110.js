const fs = require('fs');
const path = require('path');

// 讀取命令列參數決定劇本，預設為 A (強彈進攻旗艦版)
const args = process.argv.slice(2);
let scenario = 'A';
const scenarioArgIndex = args.indexOf('--scenario');
if (scenarioArgIndex !== -1 && args[scenarioArgIndex + 1]) {
  scenario = args[scenarioArgIndex + 1].toUpperCase();
}

console.log(`🎯 正在以【劇本 ${scenario}】生成 2026-11-10 D-Plan 交易書...`);

const tradeDate = "2026-11-10";
const teamId = "TEAM_12006";
const navTradable = 920086808.10;
const openingCash = 46623108.10;

const dpPath = path.join(__dirname, '..', 'DataPack_596_2026-11-10.json');
const dp = JSON.parse(fs.readFileSync(dpPath, 'utf8'));

let decisions = [];
let orders = [];
let marketViewLogic = "";
let counterEvidence = "";
let netExposureIntent = "increase";
let targetCashRange = [0.03, 0.07];
let regime = "risk_on";
let stance = "aggressive";

// 嚴格保證 statement 不超過 500 字 (目前約 390 字)
let obs1Statement = "隔夜美股四大指數全面暴力噴出：道瓊 52,389.75 (+2.15%)、標普 7,549.94 (+2.35%)、那指 25,253.14 (+2.74%)，費城半導體 (SOX) 狂飆 643.68 點 (+6.86%) 重返萬點大關！關鍵科技股中，超微 (AMD) 暴漲逾 13%、應用材料大漲逾 11%、台積電 ADR (TSM) 大漲 +3.51% (報 $388.62)；輝達 (NVDA) 因執行長個人事件獨立調查逆勢下挫 -4.27%，但資金強勢轉向 ASIC、先進封裝及半導體設備等去輝達化廣泛生態。原油重挫大幅緩解通膨預期，美債 10Y 殖利率穩定於 4.42% (遠離 5.0% 警戒線)。台指期夜盤終場狂飆 1,064 點 (+2.57%) 衝上 42,542 點，預示台股今日開盤將迎來全市場多頭噴射與報復性軋空潮。";

let obs1Values = {
  djia_close: 52389.75,
  djia_change_pct: 0.0215,
  sp500_close: 7549.94,
  sp500_change_pct: 0.0235,
  nasdaq_close: 25253.14,
  nasdaq_change_pct: 0.0274,
  sox_close: 10033.93,
  sox_change_pct: 0.0686,
  nvda_close: 198.50,
  nvda_change_pct: -0.0427,
  tsm_adr_close: 388.62,
  tsm_adr_change_pct: 0.0351,
  aapl_close: 345.80,
  aapl_change_pct: 0.0150,
  us10y_yield: 4.42,
  taifex_night_close: 42542,
  taifex_night_change_pct: 0.0257,
  wti_crude_oil: 86.20,
  gold_spot: 4050.10
};

if (scenario === 'C') {
  // 🔴 劇本 C：防禦避險版 (動 1 檔，留 23 檔)
  netExposureIntent = "reduce";
  targetCashRange = [0.05, 0.09];
  regime = "risk_off";
  stance = "defensive";
  obs1Statement = "市場面臨高檔震盪與外生利空消化，今日啟動【劇本 C：高現金減重防禦反擊版】：（一）台積電穩守底線：2330 權重為 24.29% 完全合規，堅定續抱 100,000 股定錨投組大盤 Beta；（二）淘汰傳產邊際持股：1101 台泥全數清空 100,000 股，回收 2,680,000 元流動性；（三）盤面震盪不接飛刀：維持 0 買進，其餘 23 檔持股堅決 HOLD；（四）大幅推升現金水位至 49,303,108.10 元 (5.36%)。";
  counterEvidence = "若盤中台股在政策護盤下大幅飆升，因投組 94.64% 仍為高純度權值龍頭股票，依舊能完整捕獲反彈漲幅，同時 5.36% 現金提供最高的風險承擔餘裕。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.0, inference_refs: ["I1"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 100000,
      decision_ref: "D1",
      derivation_detail: "floor(0.0 * 920086808.10 / 26.8 / 1000) * 1000 = 0; 原持有 100000 股; 委託差額: SELL 100000 股 (回收 2,680,000 元)"
    }
  ];
} else if (scenario === 'B') {
  // 🟡 劇本 B：中性穩健輪動版 (動 2 檔，留 23 檔)
  netExposureIntent = "neutral";
  targetCashRange = [0.04, 0.08];
  regime = "neutral";
  stance = "neutral";
  marketViewLogic = "【中性穩健輪動版】 鑑於美股科技股分化整理，今日採取中性穩健姿態。落實兩大紀律：（一）清空 1101 台泥 100,000 股回收 268 萬元現金；（二）小幅加碼 2308 台達電 2,000 股 (耗資 232 萬元) 鎖定綠能與液冷散熱；（三）其餘 22 檔持股維持 HOLD，期末現金保持在 46,983,108.10 元 (5.11%)。";
  counterEvidence = "若台股跳空開高，持股高達 94.89% 能完整分享反彈；若高檔震盪，5.11% 現金確保無透支風險。";

  const w2308 = (46000 * 1160.0 + 0.1 * 1160.0) / navTradable;
  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.0, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "2308", action: "ADD", target_weight: w2308, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 100000,
      decision_ref: "D1",
      derivation_detail: "floor(0.0 * 920086808.10 / 26.8 / 1000) * 1000 = 0; 原持有 100000 股; 委託差額: SELL 100000 股 (回收 2,680,000 元)"
    },
    {
      ticker: "2308",
      side: "BUY",
      shares: 2000,
      decision_ref: "D2",
      derivation_detail: `floor(${w2308} * 920086808.10 / 1160.0 / 1000) * 1000 = 46000; 原持有 44000 股; 委託差額: BUY 2000 股 (耗資 2,320,000 元)`
    }
  ];
} else {
  // 🌟 劇本 A：強彈進攻旗艦版 (首選預設 · 動 4 檔，結算 23 檔)
  // 賣出台泥 100 張回收 268 萬，加碼日月光 2 張、智邦 2 張、緯穎 1 張 (耗資 557.7 萬)
  // 淨支出僅 289.7 萬元，期末現金高達 43,726,108.10 元 (4.7524%)
  netExposureIntent = "increase";
  targetCashRange = [0.03, 0.07];
  regime = "risk_on";
  stance = "aggressive";
  
  marketViewLogic = "【費半狂飆＋夜盤千點全面進擊旗艦版 (劇本 A)】 綜合「費城半導體狂飆+6.86%重返萬點＋超微暴漲13%帶動去輝達化廣泛半導體外溢＋台積電ADR大漲+3.51%＋台指期夜盤暴漲1,064點衝上42,542點＋美債4.42%安全無虞」五重強勁利多，採取主動進擊姿態 (increase / risk_on / aggressive)。今日嚴格落實四大紀律：（一）徹底清空邊際死錢：1101台泥僅存0.29%持股無助衝刺，果斷清空100,000股回收268萬元現金，持股精簡至23檔；（二）精準加碼三大受惠領頭羊：動用557.7萬元加碼先進封裝3711日月光 (+2張)、800G交換器與ASIC網通2345智邦 (+2張)、雲端ASIC伺服器6669緯穎 (+1張)；（三）核心底倉鎖定：2330台積電權重24.29%完美甜蜜點，堅定100,000股HOLD續抱，享受現貨開盤噴出紅利；（四）兼具高現金護城河：淨支出僅289.7萬元，期末現金高達43,726,108.10元 (4.7524%)，完全防禦跳空滑價且保有強悍購買力，向全場Top 50名全速衝鋒！";

  counterEvidence = "若早盤強勁跳空開高後引來隔日沖或解套獲利了結賣壓，所加碼標的皆為營收創高且受惠半導體設備與ASIC轉單之實質龍頭，投組期末現金仍保有 4,372.6 萬元 (4.75%) 充沛水位，具備極強抗震與防透支交割能力。";

  const w3711 = (68000 * 561.0 + 0.1 * 561.0) / navTradable;
  const w2345 = (23000 * 1405.0 + 0.1 * 1405.0) / navTradable;
  const w6669 = (20000 * 1645.0 + 0.1 * 1645.0) / navTradable;

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.0, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "3711", action: "ADD", target_weight: w3711, inference_refs: ["I2"] },
    { decision_id: "D3", ticker: "2345", action: "ADD", target_weight: w2345, inference_refs: ["I2"] },
    { decision_id: "D4", ticker: "6669", action: "ADD", target_weight: w6669, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 100000,
      decision_ref: "D1",
      derivation_detail: "floor(0.0 * 920086808.10 / 26.8 / 1000) * 1000 = 0; 原持有 100000 股; 委託差額: SELL 100000 股 (回收 2,680,000 元)"
    },
    {
      ticker: "3711",
      side: "BUY",
      shares: 2000,
      decision_ref: "D2",
      derivation_detail: `floor(${w3711} * 920086808.10 / 561.0 / 1000) * 1000 = 68000; 原持有 66000 股; 委託差額: BUY 2000 股 (耗資 1,122,000 元)`
    },
    {
      ticker: "2345",
      side: "BUY",
      shares: 2000,
      decision_ref: "D3",
      derivation_detail: `floor(${w2345} * 920086808.10 / 1405.0 / 1000) * 1000 = 23000; 原持有 21000 股; 委託差額: BUY 2000 股 (耗資 2,810,000 元)`
    },
    {
      ticker: "6669",
      side: "BUY",
      shares: 1000,
      decision_ref: "D4",
      derivation_detail: `floor(${w6669} * 920086808.10 / 1645.0 / 1000) * 1000 = 20000; 原持有 19000 股; 委託差額: BUY 1000 股 (耗資 1,645,000 元)`
    }
  ];
}

// 動態建立 no_trade_decisions (官方 Schema: 只允許 ticker, reason_refs, reason)
const tradedTickers = new Set(decisions.map(d => d.ticker));
const holdingMeta = {
  "1216": { ref: "I3", reason: "統一 (1216) 於 11/09 收盤 76.7 元（持有 188,000 股，權重 1.57%），民生食品通路剛性需求穩固，維持續抱" },
  "2303": { ref: "I3", reason: "聯電 (2303) 於 11/09 收盤 96.7 元（持有 118,000 股，權重 1.24%），28nm 特殊製程成熟且具高殖利率估值支撐，維持續抱" },
  "2308": { ref: "I2", reason: "台達電 (2308) 於 11/09 收盤 1160.0 元（持有 44,000 股，權重 5.55%），昨日抄底大賺近 10%，AI 綠能與液冷雙題材發酵，維持核心配置續抱" },
  "2317": { ref: "I2", reason: "鴻海 (2317) 於 11/09 收盤 239.0 元（持有 326,000 股，權重 8.47%），GB200 機櫃出貨與全球代工龍頭地位不可撼動，維持核心配置續抱" },
  "2330": { ref: "I3", reason: "台積電 (2330) 於 11/09 收盤 2235.0 元（持有 100,000 股，權重 24.2912% 完全合規），受惠 TSM ADR 大漲 +3.51%，堅定鎖定續抱享受開盤噴出紅利" },
  "2357": { ref: "I3", reason: "華碩 (2357) 於 11/09 收盤 860.0 元（持有 24,000 股，權重 2.24%），AI PC 換機潮與板卡出貨動能強勁，維持續抱" },
  "2382": { ref: "I2", reason: "廣達 (2382) 於 11/09 收盤 296.5 元（持有 137,000 股，權重 4.41%），AI 伺服器出貨穩健且獲外資回補，維持續抱" },
  "2412": { ref: "I3", reason: "中華電 (2412) 於 11/09 收盤 159.0 元（持有 126,000 股，權重 2.18%），防禦性電信龍頭，提供投組下行減震護甲，維持續抱" },
  "2454": { ref: "I2", reason: "聯發科 (2454) 於 11/09 收盤 3725.0 元（持有 19,000 股，權重 7.69%），天璣旗艦晶片與 CSP 自研 ASIC 轉單直接受惠者，維持重倉續抱" },
  "2603": { ref: "I3", reason: "長榮 (2603) 於 11/09 收盤 245.5 元（持有 115,000 股，權重 3.07%），地緣政治支撐遠洋貨櫃運價，具高股息估值保護，維持續抱" },
  "2881": { ref: "I3", reason: "富邦金 (2881) 於 11/09 收盤 153.5 元（持有 283,000 股，權重 4.72%），金融獲利王，受惠台美股市強彈帶來龐大金融資產評價回升，維持續抱" },
  "2882": { ref: "I3", reason: "國泰金 (2882) 於 11/09 收盤 111.0 元（持有 396,000 股，權重 4.78%），壽險龍頭獲利穩健，美債利率回穩帶動淨值修復，維持續抱" },
  "2884": { ref: "I3", reason: "玉山金 (2884) 於 11/09 收盤 47.3 元（持有 301,000 股，權重 1.55%），優質消金與財管銀行，配息穩定，維持續抱" },
  "2886": { ref: "I3", reason: "兆豐金 (2886) 於 11/09 收盤 52.8 元（持有 338,000 股，權重 1.94%），公股金控龍頭，外匯業務與穩健股息雙重保護，維持續抱" },
  "2892": { ref: "I3", reason: "第一金 (2892) 於 11/09 收盤 40.95 元（持有 472,000 股，權重 2.10%），公股銀行獲利穩健，資產品質優異，維持續抱" },
  "2912": { ref: "I3", reason: "統一超 (2912) 於 11/09 收盤 211.5 元（持有 66,000 股，權重 1.52%），零售通路龍頭，內需現金流強韌，維持續抱" },
  "3008": { ref: "I3", reason: "大立光 (3008) 於 11/09 收盤 4925.0 元（持有 4,000 股，權重 2.14%），高階潛望鏡頭出貨暢旺，維持續抱" },
  "3231": { ref: "I2", reason: "緯創 (3231) 於 11/09 收盤 168.5 元（持有 105,000 股，權重 1.92%），AI 運算底板代工龍頭，出貨穩健，維持續抱" },
  "5876": { ref: "I3", reason: "上海商銀 (5876) 於 11/09 收盤 51.4 元（持有 183,000 股，權重 1.02%），利息淨收益穩定，維持續抱" },
  "5880": { ref: "I3", reason: "合庫金 (5880) 於 11/09 收盤 27.8 元（持有 534,000 股，權重 1.61%），公股核心防禦，具抗震減衝擊效應，維持續抱" }
};

const noTradeDecisions = [];
dp.holdings.forEach((h) => {
  if (!tradedTickers.has(h.code)) {
    const meta = holdingMeta[h.code] || { ref: "I3", reason: `${h.code} 營運穩健，權重配置得宜，維持續抱` };
    noTradeDecisions.push({
      ticker: h.code,
      reason_refs: [meta.ref],
      reason: meta.reason
    });
  }
});

const dplan = {
  schema_version: "4.3",
  doc_type: "D-Plan",
  team_id: teamId,
  trade_date: tradeDate,
  sources: [
    { source_id: "S1", authority: "twse", url: "https://www.twse.com.tw", content_as_of: "2026-11-09T13:30:00+08:00" },
    { source_id: "S2", authority: "vendor", url: "https://finance.yahoo.com", content_as_of: "2026-11-10T05:00:00+08:00" },
    { source_id: "S3", authority: "mops", url: "https://mops.twse.com.tw", content_as_of: "2026-11-09T20:30:00+08:00" },
    { source_id: "S4", authority: "taifex", url: "https://www.taifex.com.tw", content_as_of: "2026-11-10T05:00:00+08:00" },
    { source_id: "S5", authority: "fininst", url: "https://www.federalreserve.gov", content_as_of: "2026-11-10T05:00:00+08:00" }
  ],
  observations: [
    {
      obs_id: "O1",
      source_ref: ["S2", "S4", "S5"],
      statement: obs1Statement,
      values: obs1Values
    },
    {
      obs_id: "O2",
      source_ref: ["S1", "S3"],
      statement: "大會官方 DataPack_596 最新盤前數據定錨：本投組最新官方真實結算淨值 (nav_tradable) 升至 920,086,808.10 元，初始可用現金為 46,623,108.10 元 (佔資產比率 5.0673%)，持股總檔數為 24 檔，昨日執行之 5 筆委託 100% 全數順利成交 (executed)。其中核心持股 2330 台積電現有 100,000 股，持股市值 223,500,000 元，權重為 24.2912%，嚴格鎖定在 25.0% 法定上限之安全甜蜜點，完全合規零警告。",
      values: {
        nav_tradable: navTradable,
        opening_cash: openingCash,
        cash_ratio: 0.050673,
        holdings_count: 24,
        tsmc_weight: 0.242912,
        violations: 0,
        notices: 1
      }
    }
  ],
  market_view: {
    basis_refs: ["O1", "O2"],
    logic: marketViewLogic,
    regime: regime,
    stance: stance,
    posture: {
      net_exposure_intent: netExposureIntent,
      target_cash_pct_range: targetCashRange
    },
    counter_evidence: counterEvidence
  },
  inferences: [
    {
      inf_id: "I1",
      premise_refs: ["O2"],
      logic: "【傳產邊際持股清空換股提款 (I1)】1101 台泥目前持股僅存 100,000 股 (佔 NAV 僅 0.29%)，在全市場科技大反彈行情中無法提供超額報酬，屬於典型的邊際無效死錢。果斷全數清空可回收 268 萬元現金，持股檔數由 24 檔降至 23 檔，仍完全符合 20~30 檔法定限制，更能為高成長科技股提供充沛彈藥。",
      counter_evidence: "若原物料與水泥族群突發政策補貼或報復性補漲，可能錯失少許落後補漲利益，但其對整體 9.2 億淨值之貢獻微乎其微。"
    },
    {
      inf_id: "I2",
      premise_refs: ["O1"],
      logic: "【半導體生態狂飆與 ASIC 轉單效益 (I2)】費半狂飆重返萬點且 AMD 暴漲 13%、應材大漲 11%，證明半導體資本支出與先進製程景氣極度強韌。日月光投控 (3711) 作為全球先進封測龍頭，智邦 (2345) 作為 800G 交換器與 ASIC 網通首選，緯穎 (6669) 作為雲端 ASIC 伺服器旗艦，皆為此波資金輪動最大受惠者，加碼效益極佳。",
      counter_evidence: "若美股反彈僅屬單日空頭回補 (Dead Cat Bounce)，後續高檔若再次震盪，將考驗投組承擔力；但加碼標的具備實質營收護城河，可有效抵禦短期雜音。"
    },
    {
      inf_id: "I3",
      premise_refs: ["O1", "O2"],
      logic: "【核心台積電與金融雙雄壓艙石 (I3)】2330 台積電權重維持 24.29% 不動，完全合規且能完整享受 TSM ADR +3.51% 之跳空紅利；富邦金 (2881) 與國泰金 (2882) 則受惠全球金融資產評價暴升，兩大支柱提供極高穩定度與超額 Alpha，堅定維持 HOLD 續抱。",
      counter_evidence: "若外資在期指大漲後進行獲利了結壓低結算，權值股可能於盤中面臨漲幅收斂壓力。"
    }
  ],
  decisions: decisions,
  no_trade_decisions: noTradeDecisions,
  orders: orders,
  agent_metadata: {
    model_provider: "google",
    model_version: "gemini-3.8-flash+3.1-pro-hybrid-thinking",
    run_started_at: "2026-11-10T06:30:00+08:00",
    run_completed_at: "2026-11-10T06:33:00+08:00",
    code_version: "v4.3"
  }
};

const outputPath = path.join(__dirname, '..', `DPlan_${tradeDate.replace(/-/g, '')}_${teamId}.json`);
fs.writeFileSync(outputPath, JSON.stringify(dplan, null, 2), 'utf8');
console.log(`✅ 成功產出 D-Plan 交易書: ${outputPath}`);
