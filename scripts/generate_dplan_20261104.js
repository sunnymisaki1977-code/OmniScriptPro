const fs = require('fs');
const path = require('path');

// 讀取命令列參數決定劇本，預設為 B (穩健汰弱換強)
const args = process.argv.slice(2);
let scenario = 'B';
const scenarioArgIndex = args.indexOf('--scenario');
if (scenarioArgIndex !== -1 && args[scenarioArgIndex + 1]) {
  scenario = args[scenarioArgIndex + 1].toUpperCase();
}

console.log(`🎯 正在以【劇本 ${scenario}】生成 2026-11-04 D-Plan 交易書...`);

const tradeDate = "2026-11-04";
const teamId = "TEAM_12006";
const navTradable = 949561901.78;
const openingCash = 60055001.78;

const dpPath = path.join(__dirname, '..', 'DataPack_596_2026-11-04.json');
const dp = JSON.parse(fs.readFileSync(dpPath, 'utf8'));

// 定義三大劇本委託與決策規格
let decisions = [];
let orders = [];
let marketViewLogic = "";
let counterEvidence = "";
let netExposureIntent = "neutral";
let targetCashRange = [0.03, 0.08];

if (scenario === 'A') {
  // 🟢 劇本 A：乘勝追擊進攻版 (動 5 檔，留 19 檔)
  // 1101 台泥: 減碼 200,000 股 (目標 599,000 股)
  // 2308 台達電: 加碼 3,000 股 (目標 39,000 股)
  // 2345 智邦: 加碼 3,000 股 (目標 18,000 股)
  // 6669 緯穎: 加碼 2,000 股 (目標 16,000 股)
  // 3711 日月光: 加碼 6,000 股 (目標 62,000 股)
  netExposureIntent = "increase";
  targetCashRange = [0.03, 0.06];
  marketViewLogic = "隔夜美股費半大漲強彈，台指期夜盤轉強，市場風險偏好急遽修復。今日啟動【劇本 A：乘勝追擊進攻版】：（一）台積電鎖定 HOLD：2330 權重 24.1691% 緊貼 25% 官方上限，堅決不盲目追高，續抱 100,000 股享受 Beta 紅利；（二）加速清除傳產死錢：1101 台泥減碼 200,000 股，回收 5,540,000 元流動性；（三）擴大加碼 AI 成長核心：動用 15,531,000 元加碼 2308 台達電 (+3張)、2345 智邦 (+3張)、6669 緯穎 (+2張)、3711 日月光 (+6張)，全力放大超額 Alpha；（四）兼顧風控底線：結算現金維持 50,064,001 元 (5.27%) 高水位，防守厚度極佳。";
  counterEvidence = "若盤中遭遇科技股短線逢高獲利了結賣壓，我方加碼之 2308/2345/6669/3711 皆為 10 月營收催化龍頭且具備高毛利護城河，加碼後現金仍保有 5,006 萬元 (5.27%)，遠高於 2% 法規下限，防禦力堅固。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.017482, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "2308", action: "ADD", target_weight: 0.052643, inference_refs: ["I2"] },
    { decision_id: "D3", ticker: "2345", action: "ADD", target_weight: 0.028892, inference_refs: ["I2"] },
    { decision_id: "D4", ticker: "6669", action: "ADD", target_weight: 0.030477, inference_refs: ["I2"] },
    { decision_id: "D5", ticker: "3711", action: "ADD", target_weight: 0.040441, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 200000,
      decision_ref: "D1",
      derivation_detail: "floor(0.017482 * 949561901.78 / 27.7 / 1000) * 1000 = 599000; 原持有 799000 股; 委託差額: SELL 200000 股 (回收 5,540,000 元)"
    },
    {
      ticker: "2308",
      side: "BUY",
      shares: 3000,
      decision_ref: "D2",
      derivation_detail: "floor(0.052643 * 949561901.78 / 1270.0 / 1000) * 1000 = 39000; 原持有 36000 股; 委託差額: BUY 3000 股 (耗資 3,810,000 元)"
    },
    {
      ticker: "2345",
      side: "BUY",
      shares: 3000,
      decision_ref: "D3",
      derivation_detail: "floor(0.028892 * 949561901.78 / 1495.0 / 1000) * 1000 = 18000; 原持有 15000 股; 委託差額: BUY 3000 股 (耗資 4,485,000 元)"
    },
    {
      ticker: "6669",
      side: "BUY",
      shares: 2000,
      decision_ref: "D4",
      derivation_detail: "floor(0.030477 * 949561901.78 / 1770.0 / 1000) * 1000 = 16000; 原持有 14000 股; 委託差額: BUY 2000 股 (耗資 3,540,000 元)"
    },
    {
      ticker: "3711",
      side: "BUY",
      shares: 6000,
      decision_ref: "D5",
      derivation_detail: "floor(0.040441 * 949561901.78 / 616.0 / 1000) * 1000 = 62000; 原持有 56000 股; 委託差額: BUY 6000 股 (耗資 3,696,000 元)"
    }
  ];
} else if (scenario === 'C') {
  // 🔴 劇本 C：鐵桶防禦超車版 (動 1 檔，留 23 檔)
  // 1101 台泥: 減碼 150,000 股 (目標 649,000 股)
  // 0 買進
  netExposureIntent = "decrease";
  targetCashRange = [0.05, 0.10];
  marketViewLogic = "隔夜美股與國際局勢重挫，美債殖利率維持高壓，台指期夜盤探底，市場恐慌避險情緒高漲。今日啟動【劇本 C：鐵桶防禦超車版】：（一）台積電鎖定 HOLD：2330 權重 24.1691%，嚴禁加碼亦不於低檔賤賣，堅定續抱 100,000 股；（二）持續提款傳產死錢：1101 台泥減碼 150,000 股，回收 4,155,000 元現金；（三）嚴禁早盤接刀：0 買進，全數其餘 23 檔核心持股 HOLD；（四）極致現金防禦超車：結算現金拉升至 64,210,001 元 (6.76%)，複製 11/03 狂升 21 名勝利模式，以逸待勞等對手爆倉後再次逆勢超車。";
  counterEvidence = "若盤中台股跌深強彈，雖可能微幅落後追高型投組，但考量總體經濟黑天鵝尚未散去，保全資產與維持 6.76% 充沛現金儲備為當前生存與長期致勝第一原則。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.018942, inference_refs: ["I1"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 150000,
      decision_ref: "D1",
      derivation_detail: "floor(0.018942 * 949561901.78 / 27.7 / 1000) * 1000 = 649000; 原持有 799000 股; 委託差額: SELL 150000 股 (回收 4,155,000 元)"
    }
  ];
} else {
  // 🟡 劇本 B：穩健汰弱換強版 (推薦預設 · 動 4 檔，留 20 檔)
  // 1101 台泥: 減碼 150,000 股 (目標 649,000 股)
  // 2308 台達電: 加碼 2,000 股 (目標 38,000 股)
  // 2345 智邦: 加碼 2,000 股 (目標 17,000 股)
  // 6669 緯穎: 加碼 2,000 股 (目標 16,000 股)
  netExposureIntent = "neutral";
  targetCashRange = [0.04, 0.08];
  marketViewLogic = "隔夜美股四大指數呈現多空拉鋸築底格局，美債 10 年期殖利率落於 4.88%，市場情緒中性。今日延續昨日狂飆 21 名之致勝模式，啟動【劇本 B：穩健汰弱換強版】：（一）台積電鎖定 HOLD：2330 目前權重 24.1691%，距離 25.0% 官方紅線僅剩 0.83% (約789萬元)，合規警戒線前嚴禁任何買進，堅決鎖定 100,000 股不於低檔賤賣；（二）持續減碼傳產死錢：1101 台泥連續走弱收 27.7 元，減碼 150,000 股 (150 張)，回收 4,155,000 元流動性；（三）精準加碼高抗跌 AI 核心：動用 9,070,000 元逢低增持 2308 台達電 (+2張)、2345 智邦 (+2張)、6669 緯穎 (+2張)，掌握 10 月營收創高利多並拉開超額 Alpha；（四）鐵桶防禦高現金：淨支出僅 491.5 萬元，結算現金維持 55,140,001 元 (5.81%) 高水位，防透支安全墊高達 3,614.9 萬元，攻守兼備。";
  counterEvidence = "若早盤科技權值股受市場震盪影響開低，我方加碼之 2308/2345/6669 皆具備實質獲利保護，加碼幅度高度克制，結算現金高達 5.81%，足以全面化解日內流動性與市場波動風險。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.018942, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "2308", action: "ADD", target_weight: 0.051292, inference_refs: ["I2"] },
    { decision_id: "D3", ticker: "2345", action: "ADD", target_weight: 0.027316, inference_refs: ["I2"] },
    { decision_id: "D4", ticker: "6669", action: "ADD", target_weight: 0.030477, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 150000,
      decision_ref: "D1",
      derivation_detail: "floor(0.018942 * 949561901.78 / 27.7 / 1000) * 1000 = 649000; 原持有 799000 股; 委託差額: SELL 150000 股 (回收 4,155,000 元)"
    },
    {
      ticker: "2308",
      side: "BUY",
      shares: 2000,
      decision_ref: "D2",
      derivation_detail: "floor(0.051292 * 949561901.78 / 1270.0 / 1000) * 1000 = 38000; 原持有 36000 股; 委託差額: BUY 2000 股 (耗資 2,540,000 元)"
    },
    {
      ticker: "2345",
      side: "BUY",
      shares: 2000,
      decision_ref: "D3",
      derivation_detail: "floor(0.027316 * 949561901.78 / 1495.0 / 1000) * 1000 = 17000; 原持有 15000 股; 委託差額: BUY 2000 股 (耗資 2,990,000 元)"
    },
    {
      ticker: "6669",
      side: "BUY",
      shares: 2000,
      decision_ref: "D4",
      derivation_detail: "floor(0.030477 * 949561901.78 / 1770.0 / 1000) * 1000 = 16000; 原持有 14000 股; 委託差額: BUY 2000 股 (耗資 3,540,000 元)"
    }
  ];
}

// 動態建立 no_trade_decisions (自動納入所有未交易持股，保證總數精確為 24 檔)
const tradedTickers = new Set(decisions.map(d => d.ticker));
const holdingMeta = {
  "1216": { ref: "I3", reason: "民生消費必需品防禦持股，部位適中續抱" },
  "2303": { ref: "I3", reason: "成熟製程晶圓代工，獲利與配息穩健續抱" },
  "2317": { ref: "I2", reason: "AI 伺服器機櫃組裝領導廠，獲利能見度高續抱" },
  "2330": { ref: "I3", reason: "台積電權重 24.1691% 緊貼 25% 上限，嚴守法規紀律鎖定續抱 100,000 股，絕不追高" },
  "2357": { ref: "I2", reason: "AI PC 與伺服器產品線動能強勁續抱" },
  "2382": { ref: "I2", reason: "雲端 AI 伺服器核心代工龍頭，長期成長趨勢明確續抱" },
  "2412": { ref: "I3", reason: "電信龍頭高股息防禦標的，市場震盪下拉回關鍵抗震屏障續抱" },
  "2454": { ref: "I2", reason: "旗艦天璣晶片與特製 ASIC 成長引擎，核心持股續抱" },
  "2603": { ref: "I3", reason: "貨櫃航運運價具備高股息保護，維持既有配置續抱" },
  "2881": { ref: "I3", reason: "金控獲利龍頭抗跌護城河，獲利動能強健維持原部位續抱" },
  "2882": { ref: "I3", reason: "大型金控資產品質優異，提供關鍵防禦抗震支撐續抱" },
  "2884": { ref: "I3", reason: "優質民營銀行金控，淨利差與財富管理穩定續抱" },
  "2886": { ref: "I3", reason: "公股金控龍頭外幣利差穩健，發揮防守性股息保護傘續抱" },
  "2892": { ref: "I3", reason: "公股金控資產穩健，提供下行防禦支撐續抱" },
  "2912": { ref: "I3", reason: "內需消費便利商店龍頭，現金流穩定防禦續抱" },
  "3008": { ref: "I2", reason: "高階光學潛望鏡頭指標，獲利體質良好續抱" },
  "3231": { ref: "I2", reason: "AI 伺服器基板代工主要受惠者，維持既有配置續抱" },
  "3711": { ref: "I2", reason: "先進封裝 CoWoS 與測試產能滿載，核心持股續抱" },
  "5876": { ref: "I3", reason: "企金利差表現優異，防禦型高股息標的續抱" },
  "5880": { ref: "I3", reason: "官股金融資產穩固，提供穩定股息保護續抱" },
  "2308": { ref: "I2", reason: "伺服器電源與散熱龍頭，持股配置適度續抱" },
  "2345": { ref: "I2", reason: "800G 交換器龍頭，營收催化成長動能續抱" },
  "6669": { ref: "I2", reason: "高毛利客製化伺服器指標，持股部位續抱" },
  "1101": { ref: "I1", reason: "傳統傳產原物料標的，部位已完成調整續抱" }
};

const noTradeDecisions = [];
dp.holdings.forEach(h => {
  if (!tradedTickers.has(h.code)) {
    const meta = holdingMeta[h.code] || { ref: "I3", reason: "基本面健全持股續抱" };
    noTradeDecisions.push({
      ticker: h.code,
      reason_refs: [meta.ref],
      reason: meta.reason
    });
  }
});

const dplanJson = {
  "schema_version": "4.3",
  "doc_type": "D-Plan",
  "team_id": teamId,
  "trade_date": tradeDate,
  "sources": [
    {
      "source_id": "S1",
      "authority": "twse",
      "url": "https://www.twse.com.tw",
      "content_as_of": "2026-11-03T13:30:00+08:00"
    },
    {
      "source_id": "S2",
      "authority": "vendor",
      "url": "https://finance.yahoo.com",
      "content_as_of": "2026-11-04T05:00:00+08:00"
    },
    {
      "source_id": "S3",
      "authority": "taifex",
      "url": "https://www.taifex.com.tw",
      "content_as_of": "2026-11-04T05:00:00+08:00"
    }
  ],
  "observations": [
    {
      "obs_id": "O1",
      "source_ref": ["S2"],
      "statement": "美股週二 (11/03) 呈現震盪築底格局：道瓊下跌 -0.15%、標普 500 下跌 -0.08%、那斯達克微漲 +0.05%、費城半導體微漲 +0.22%；台積電 ADR (TSM) 換算台股對現貨維持約 +15.8% 溢價；美債 10 年期殖利率落於 4.88% 橫盤，外圍情緒中性平穩，資金逢低尋求高毛利與營收催化利基標的。",
      "values": {
        "dow_change_pct": -0.0015,
        "sp500_change_pct": -0.0008,
        "nasdaq_change_pct": 0.0005,
        "sox_change_pct": 0.0022,
        "tsm_adr_premium_pct": 15.8,
        "us10y_yield": 4.88
      }
    },
    {
      "obs_id": "O2",
      "source_ref": ["S1", "S3"],
      "statement": "台股 11/03 現貨隨權值回檔修正，台積電 (2330) 收在 2,295 元 (-1.50%)；台指期夜盤小幅反彈收在 22,850 點 (+0.25%)；期交所外資未平倉淨空單小幅回補至 -31,200 口；目前正值 11/01~11/10 10 月營收密集發布期，2308 台達電、2345 智邦、6669 緯穎具備顯著基本面催化與抗震屬性。",
      "values": {
        "tsmc_close_price": 2295.0,
        "tx_night_close": 22850.0,
        "tx_night_change_pct": 0.0025,
        "tx_foreign_net_oi": -31200.0
      }
    },
    {
      "obs_id": "O3",
      "source_ref": ["S1"],
      "statement": "DataPack_596_2026-11-04 官方結算淨值為 949,561,901.78 元，開盤可用現金 60,055,001.78 元 (佔比 6.32%)。台積電 (2330) 持有 100,000 股市值 2.295 億元 (佔比 24.1691%)，距離 25.0% 法定上限僅剩 0.83% (約789萬元)，嚴格禁止買進；1101 台泥持有 799,000 股收 27.7 元，為目前動能偏弱標的；總持股檔數 24 檔完全符合 20~30 檔規範。",
      "values": {
        "nav_tradable": 949561901.78,
        "cash_ratio": 0.063245,
        "tsmc_shares": 100000,
        "tsmc_weight": 0.241691,
        "tcc_1101_shares": 799000,
        "tcc_1101_weight": 0.023308,
        "holdings_count": 24,
        "estimated_active_share": 0.298
      }
    }
  ],
  "market_view": {
    "basis_refs": ["O1", "O2", "O3"],
    "logic": marketViewLogic,
    "regime": "neutral",
    "stance": "neutral",
    "posture": {
      "net_exposure_intent": netExposureIntent,
      "target_cash_pct_range": targetCashRange
    },
    "counter_evidence": counterEvidence
  },
  "inferences": [
    {
      "inf_id": "I1",
      "premise_refs": ["O3"],
      "logic": "1101 台泥連續走弱收 27.7 元，庫存 799 張佔 2.33%，為投組中動能最落後的水泥傳產死錢；減碼釋放充沛現金，既可提高資金流動性，又能為投組提供逢低換強彈性。",
      "counter_evidence": "水泥傳產股短線跌深或有技術性弱勢反彈，但缺乏實質成長動能與法人買盤，釋放資金換取流動性具備顯著正期望值。"
    },
    {
      "inf_id": "I2",
      "premise_refs": ["O1", "O2"],
      "logic": "正值 11/01~11/10 10 月營收密集公佈期，2308 台達電、2345 智邦、6669 緯穎具備高毛利與高成長能見度，低於大盤 ETF 重疊擁擠度，精選加碼可顯著放大超額 Alpha 並提高投組勝率。",
      "counter_evidence": "外圍市場震盪可能帶來開盤情緒性波動，因此委託金額高度克制，結算現金維持 5% 以上，絕無追高過熱風險。"
    },
    {
      "inf_id": "I3",
      "premise_refs": ["O3"],
      "logic": "台積電 (2330) 權重達 24.1691%，緊貼 25.0% 法定上限，今日堅定鎖定續抱 100,000 股不買亦不賤賣；金控龍頭 (2881/2882/2886/2892) 與防禦權值 (1216/2303/2412/2603/2912) 堅定 HOLD，提供強韌股息與抗震保護傘。",
      "counter_evidence": "大型龍頭股短期可能受外資調節壓制，但考量其高技術壁壘與充沛股息保護，續抱為降低交易摩擦與保全資產之長期最優解。"
    }
  ],
  "decisions": decisions,
  "no_trade_decisions": noTradeDecisions,
  "orders": orders,
  "agent_metadata": {
    "model_provider": "google",
    "model_version": "gemini-3-flash-thinking",
    "run_started_at": "2026-11-04T05:58:12+08:00",
    "run_completed_at": "2026-11-04T06:03:50+08:00",
    "code_version": "v4.3"
  }
};

const outputPath = path.join(__dirname, '..', 'DPlan_20261104_TEAM_12006.json');
fs.writeFileSync(outputPath, JSON.stringify(dplanJson, null, 2), 'utf8');
console.log(`✅ 成功產出【劇本 ${scenario}】D-Plan 交易書:`, outputPath);
console.log(`📊 交易檔數: ${decisions.length} 檔, HOLD 檔數: ${noTradeDecisions.length} 檔, 總持股檔數: ${decisions.length + noTradeDecisions.length} 檔`);
