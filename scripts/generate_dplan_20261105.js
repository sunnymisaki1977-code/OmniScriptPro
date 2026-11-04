const fs = require('fs');
const path = require('path');

// 讀取命令列參數決定劇本，預設為 B (穩健汰弱換強)
const args = process.argv.slice(2);
let scenario = 'B';
const scenarioArgIndex = args.indexOf('--scenario');
if (scenarioArgIndex !== -1 && args[scenarioArgIndex + 1]) {
  scenario = args[scenarioArgIndex + 1].toUpperCase();
}

console.log(`🎯 正在以【劇本 ${scenario}】生成 2026-11-05 D-Plan 交易書...`);

const tradeDate = "2026-11-05";
const teamId = "TEAM_12006";
const navTradable = 941930102.87;
const openingCash = 55210252.87;

const dpPath = path.join(__dirname, '..', 'DataPack_596_2026-11-05.json');
const dp = JSON.parse(fs.readFileSync(dpPath, 'utf8'));

// 定義三大劇本委託與決策規格
let decisions = [];
let orders = [];
let marketViewLogic = "";
let counterEvidence = "";
let netExposureIntent = "increase";
let targetCashRange = [0.03, 0.08];

if (scenario === 'A') {
  // 🟢 劇本 A：乘勝反彈進攻版 (動 5 檔，留 19 檔)
  // 觸發條件：隔夜美股費半強彈 > +1.5%、TSM ADR 漲逾 +2%、美債 10 年期 < 4.85%
  // 1101 台泥: 減碼 149,000 股 (目標 500,000 股，回收 4,060,250 元)
  // 2308 台達電: 加碼 4,000 股 (目標 42,000 股，耗資 4,880,000 元)
  // 3711 日月光: 加碼 8,000 股 (目標 64,000 股，耗資 5,016,000 元)
  // 2345 智邦: 加碼 2,000 股 (目標 19,000 股，耗資 2,960,000 元)
  // 6669 緯穎: 加碼 2,000 股 (目標 18,000 股，耗資 3,570,000 元)
  netExposureIntent = "increase";
  targetCashRange = [0.03, 0.06];
  marketViewLogic = "隔夜外圍市場強勢修復，美股費半指數強彈，TSM ADR 溢價維持高檔，市場風險胃納大幅回升。今日啟動【劇本 A：乘勝反彈進攻版】：（一）台積電鎖定續抱：2330 權重已自然收斂至 23.9933%，完全解除超標警報且預留 948 萬安全空間，堅決 100% HOLD 續抱 100,000 股享受權值反彈 Beta；（二）加速清除傳產死錢：1101 台泥續跌至 27.25 元，減碼 149,000 股釋放 4,060,250 元流動性；（三）擴大低接 AI 算力龍頭：動用 16,426,000 元加碼超跌之 2308 台達電 (+4張)、CoWoS 強勢反彈之 3711 日月光投控 (+8張)、800G 交換器 2345 智邦 (+2張) 與高價伺服器 6669 緯穎 (+2張)，掌握 10 月營收創高大催化；（四）防守與現金流兼備：淨支出 1,236.6 萬元，結算現金仍高達 42,844,502.87 元 (4.55%)，遠超 2.0% 法規底線，防守安全墊充足。";
  counterEvidence = "若盤中遭遇科技股短線追高獲利回吐賣壓，我方加碼標的皆為具備 10 月營收創高能見度之龍頭，且加碼後結算現金仍保有 4,284 萬元 (4.55%)，足以抵禦任何日內波動。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.0144751, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "2308", action: "ADD", target_weight: 0.0548523, inference_refs: ["I2"] },
    { decision_id: "D3", ticker: "3711", action: "ADD", target_weight: 0.0428349, inference_refs: ["I2"] },
    { decision_id: "D4", ticker: "2345", action: "ADD", target_weight: 0.0304035, inference_refs: ["I2"] },
    { decision_id: "D5", ticker: "6669", action: "ADD", target_weight: 0.0347741, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 149000,
      decision_ref: "D1",
      derivation_detail: "floor(0.0144751 * 941930102.87 / 27.25 / 1000) * 1000 = 500000; 原持有 649000 股; 委託差額: SELL 149000 股 (回收 4,060,250 元)"
    },
    {
      ticker: "2308",
      side: "BUY",
      shares: 4000,
      decision_ref: "D2",
      derivation_detail: "floor(0.0548523 * 941930102.87 / 1220.0 / 1000) * 1000 = 42000; 原持有 38000 股; 委託差額: BUY 4000 股 (耗資 4,880,000 元)"
    },
    {
      ticker: "3711",
      side: "BUY",
      shares: 8000,
      decision_ref: "D3",
      derivation_detail: "floor(0.0428349 * 941930102.87 / 627.0 / 1000) * 1000 = 64000; 原持有 56000 股; 委託差額: BUY 8000 股 (耗資 5,016,000 元)"
    },
    {
      ticker: "2345",
      side: "BUY",
      shares: 2000,
      decision_ref: "D4",
      derivation_detail: "floor(0.0304035 * 941930102.87 / 1480.0 / 1000) * 1000 = 19000; 原持有 17000 股; 委託差額: BUY 2000 股 (耗資 2,960,000 元)"
    },
    {
      ticker: "6669",
      side: "BUY",
      shares: 2000,
      decision_ref: "D5",
      derivation_detail: "floor(0.0347741 * 941930102.87 / 1785.0 / 1000) * 1000 = 18000; 原持有 16000 股; 委託差額: BUY 2000 股 (耗資 3,570,000 元)"
    }
  ];
} else if (scenario === 'C') {
  // 🔴 劇本 C：鐵桶防禦超車版 (動 1 檔，留 23 檔)
  // 觸發條件：隔夜美股重挫、費半跌逾 -1.5%、美債 10 年期突破 5.0%
  // 1101 台泥: 減碼 149,000 股 (目標 500,000 股，回收 4,060,250 元)
  // 0 買進，全數 HOLD
  netExposureIntent = "reduce";
  targetCashRange = [0.05, 0.10];
  marketViewLogic = "隔夜美股與全球資金收縮，美債 10 年期殖利率突破 5.0% 警戒線，市場風險偏好轉弱。今日啟動【劇本 C：鐵桶防禦超車版】：（一）台積電鎖定續抱：2330 權重 23.9933% 完全合規，堅定續抱 100,000 股定錨投組；（二）持續提款傳產死錢：1101 台泥減碼 149,000 股，回收 4,060,250 元流動性；（三）盤面震盪不接刀：今日維持 0 買進，其餘 23 檔持股全數堅決 HOLD；（四）拉高防守現金水位：結算現金提高至 59,270,502.87 元 (6.29%)，徹底複製 11/03 單日狂升 21 名模式，以逸待勞等對手爆倉後再次逆勢超車。";
  counterEvidence = "若盤中台股逆勢反彈，雖短線漲幅可能略遜於滿手高 Beta 小型股的隊伍，但考量總體高利率壓頂環境，維持 6.29% 現金與全數金融防禦網為長期生存與挺進前段班的最高準則。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.0144751, inference_refs: ["I1"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 149000,
      decision_ref: "D1",
      derivation_detail: "floor(0.0144751 * 941930102.87 / 27.25 / 1000) * 1000 = 500000; 原持有 649000 股; 委託差額: SELL 149000 股 (回收 4,060,250 元)"
    }
  ];
} else {
  // 🟡 劇本 B：穩健汰弱換強版 (推薦預設 · 動 4 檔，留 20 檔)
  // 觸發條件：隔夜美股小漲小跌 (±0.8% 內)、美債 10 年期落於 4.85%~4.98%
  // 1101 台泥: 減碼 149,000 股 (目標 500,000 股，回收 4,060,250 元)
  // 2308 台達電: 加碼 3,000 股 (目標 41,000 股，耗資 3,660,000 元)
  // 3711 日月光: 加碼 5,000 股 (目標 61,000 股，耗資 3,135,000 元)
  // 6669 緯穎: 加碼 1,000 股 (目標 17,000 股，耗資 1,785,000 元)
  netExposureIntent = "increase";
  targetCashRange = [0.04, 0.08];
  marketViewLogic = "隔夜外圍市場呈現多空拉鋸築底，美債 10 年期殖利率橫盤震盪，盤面維持健康板塊輪動。今日啟動【劇本 B：穩健汰弱換強版】：（一）台積電鎖定續抱：2330 權重已自然回落至 23.9933% (100,000 股)，合規 Notice 警報完全消除，堅定 0 賣出續抱享受權值護城河；（二）持續提款傳產弱勢股：1101 台泥續跌收 27.25 元，減碼 149,000 股回收 4,060,250 元現金；（三）精準低接營收催化龍頭：動用 8,580,000 元加碼超跌之 2308 台達電 (+3張)、先進封裝強勢反彈之 3711 日月光投控 (+5張) 與抗震領先創高之 6669 緯穎 (+1張)，鎖定 10 月營收公告期爆發力；（四）高額防守現金池：淨支出僅 451.9 萬元，期末結算現金維持 50,690,502.87 元 (5.38%) 高水位，防透支買力高達 3,475 萬元，攻守兼備。";
  counterEvidence = "若早盤科技權值受外圍情緒影響開低震盪，加碼之 2308/3711/6669 皆具備營收與高毛利雙重保護，且結算現金維持 5.38% 充沛水位，足以完全化解任何日內流動性與估值回撤風險。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.0144751, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "2308", action: "ADD", target_weight: 0.0535571, inference_refs: ["I2"] },
    { decision_id: "D3", ticker: "3711", action: "ADD", target_weight: 0.0408379, inference_refs: ["I2"] },
    { decision_id: "D4", ticker: "6669", action: "ADD", target_weight: 0.0328790, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 149000,
      decision_ref: "D1",
      derivation_detail: "floor(0.0144751 * 941930102.87 / 27.25 / 1000) * 1000 = 500000; 原持有 649000 股; 委託差額: SELL 149000 股 (回收 4,060,250 元)"
    },
    {
      ticker: "2308",
      side: "BUY",
      shares: 3000,
      decision_ref: "D2",
      derivation_detail: "floor(0.0535571 * 941930102.87 / 1220.0 / 1000) * 1000 = 41000; 原持有 38000 股; 委託差額: BUY 3000 股 (耗資 3,660,000 元)"
    },
    {
      ticker: "3711",
      side: "BUY",
      shares: 5000,
      decision_ref: "D3",
      derivation_detail: "floor(0.0408379 * 941930102.87 / 627.0 / 1000) * 1000 = 61000; 原持有 56000 股; 委託差額: BUY 5000 股 (耗資 3,135,000 元)"
    },
    {
      ticker: "6669",
      side: "BUY",
      shares: 1000,
      decision_ref: "D4",
      derivation_detail: "floor(0.0328790 * 941930102.87 / 1785.0 / 1000) * 1000 = 17000; 原持有 16000 股; 委託差額: BUY 1000 股 (耗資 1,785,000 元)"
    }
  ];
}

// 動態建立 no_trade_decisions (自動納入所有未交易持股，保證總數精確為 24 檔)
const tradedTickers = new Set(decisions.map(d => d.ticker));
const holdingMeta = {
  "1216": { ref: "I3", reason: "民生消費必需品防禦持股，部位適中續抱" },
  "2303": { ref: "I3", reason: "成熟製程晶圓代工，獲利與配息穩健續抱" },
  "2317": { ref: "I2", reason: "AI 伺服器機櫃組裝領導廠，獲利能見度高續抱" },
  "2330": { ref: "I3", reason: "台積電權重 23.9933% 完全解除超標警戒，鎖定續抱 100,000 股享受權值反彈紅利，絕不於低檔賤賣" },
  "2345": { ref: "I2", reason: "800G 交換器龍頭，10 月營收催化成長動能續抱" },
  "2357": { ref: "I2", reason: "AI PC 與伺服器產品線動能強勁續抱" },
  "2382": { ref: "I2", reason: "雲端 AI 伺服器核心代工龍頭，長期成長趨勢明確續抱" },
  "2412": { ref: "I3", reason: "電信龍頭高股息防禦標的，市場震盪下拉回關鍵抗震屏障續抱" },
  "2454": { ref: "I2", reason: "旗艦天璣晶片與特製 ASIC 成長引擎，今日逆勢走強續抱" },
  "2603": { ref: "I3", reason: "貨櫃航運運價具備高股息保護，今日逆勢收紅續抱" },
  "2881": { ref: "I3", reason: "金控獲利龍頭抗跌護城河，今日逆勢走揚維持原部位續抱" },
  "2882": { ref: "I3", reason: "大型金控資產品質優異，提供關鍵防禦抗震支撐續抱" },
  "2884": { ref: "I3", reason: "優質民營銀行金控，淨利差與財富管理穩定續抱" },
  "2886": { ref: "I3", reason: "公股金控龍頭外幣利差穩健，發揮防守性股息保護傘續抱" },
  "2891": { ref: "I3", reason: "民營消金金控獲利亮眼，配息與防禦兼備續抱" },
  "2892": { ref: "I3", reason: "公股金控資產穩健，提供下行防禦支撐續抱" },
  "2912": { ref: "I3", reason: "內需消費便利商店龍頭，現金流穩定防禦續抱" },
  "3008": { ref: "I2", reason: "大立光強勢重返 5,000 元大關，高階光學鏡頭指標獲利良好續抱" },
  "3231": { ref: "I2", reason: "AI 伺服器基板代工主要受惠者，維持既有配置續抱" },
  "3711": { ref: "I2", reason: "先進封測日月光投控強彈收 627 元 (+1.79%)，核心持股續抱" },
  "5876": { ref: "I3", reason: "企金利差表現優異，防禦型高股息標的續抱" },
  "2308": { ref: "I2", reason: "伺服器電源與散熱龍頭，持股配置適度續抱" },
  "6669": { ref: "I2", reason: "高毛利客製化伺服器指標，今日逆勢抗跌走強續抱" },
  "1101": { ref: "I1", reason: "水泥傳統傳產原物料標的，部位調整完畢續抱" }
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
      "content_as_of": "2026-11-04T13:30:00+08:00"
    },
    {
      "source_id": "S2",
      "authority": "vendor",
      "url": "https://finance.yahoo.com",
      "content_as_of": "2026-11-05T05:00:00+08:00"
    },
    {
      "source_id": "S3",
      "authority": "taifex",
      "url": "https://www.taifex.com.tw",
      "content_as_of": "2026-11-05T05:00:00+08:00"
    }
  ],
  "observations": [
    {
      "obs_id": "O1",
      "source_ref": ["S2"],
      "statement": "美股週三外圍市場多空拉鋸，科技股進入財報與總經數據消化期；台積電 ADR (TSM) 相較台股現貨仍維持 +15.5% 左右高溢價水準；美國 10 年期公債殖利率落於 4.86% 震盪整理，市場聚焦即將公佈之關鍵經濟數據與大型科技股法說會展望。",
      "values": {
        "tsm_adr_premium_pct": 15.5,
        "us10y_yield": 4.86,
        "market_status": 1
      }
    },
    {
      "obs_id": "O2",
      "source_ref": ["S1", "S3"],
      "statement": "台股 11/04 加權指數震盪築底，台積電 (2330) 收 2,260 元，日月光投控 (3711) 強彈收 627 元 (+1.79%)，大立光 (3008) 重返 5,010 元大關，緯穎 (6669) 逆勢走強收 1,785 元 (+0.85%)；正值 11/01~11/10 10 月營收密集公佈黃金期，高成長利基型 AI 龍頭具備顯著獲利推升動能。",
      "values": {
        "tsmc_close_price": 2260.0,
        "ase_close_price": 627.0,
        "largan_close_price": 5010.0,
        "wiwynn_close_price": 1785.0
      }
    },
    {
      "obs_id": "O3",
      "source_ref": ["S1"],
      "statement": "DataPack_596_2026-11-05 官方結算真實淨值為 941,930,102.87 元，開盤可用現金 55,210,252.87 元 (佔比 5.86%)。台積電 (2330) 持有 100,000 股市值 2.260 億元 (佔比 23.9933%)，權重已自然回落至 24% 以下，完全解除超標警戒，距 25% 上限擁有 948 萬安全空間；總持股檔數 24 檔，大會違規記點 0 次。",
      "values": {
        "nav_tradable": 941930102.87,
        "cash_ratio": 0.058614,
        "tsmc_shares": 100000,
        "tsmc_weight": 0.239933,
        "tcc_1101_shares": 649000,
        "tcc_1101_weight": 0.018776,
        "holdings_count": 24,
        "estimated_active_share": 0.295
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
      "logic": "1101 台泥連續走弱收 27.25 元，庫存 649 張佔比 1.88%，為投組中動能最疲弱之傳統原物料死錢；減碼 149 張至 500 張整數整股，可釋放 406 萬元現金流動性，汰弱留強提升資本運用效率。",
      "counter_evidence": "水泥傳產股短線跌深或有技術性弱勢反抽，但缺乏實質成長動能與法人買盤，釋放資金換取流動性具備顯著正期望值。"
    },
    {
      "inf_id": "I2",
      "premise_refs": ["O1", "O2"],
      "logic": "正值 11/01~11/10 10 月營收密集公佈期，超跌之伺服器電源龍頭 2308 台達電、CoWoS 先進封測指標 3711 日月光投控、高毛利 ASIC 伺服器 6669 緯穎具備高成長能見度與抗跌 Alpha，低於大盤 ETF 重疊度，逢低適度加碼可有效擴大超額報酬。",
      "counter_evidence": "外圍市場震盪可能帶來開盤情緒性波動，因此委託金額高度克制，結算現金維持 4.5%~6.3%，絕無追高過熱風險。"
    },
    {
      "inf_id": "I3",
      "premise_refs": ["O3"],
      "logic": "台積電 (2330) 權重自然回落至 23.9933%，完全解除 25% 超標警戒，今日堅定鎖定續抱 100,000 股不買亦不賤賣；金控龍頭 (2881/2882/2884/2886/2891/2892) 與防禦權值 (1216/2303/2412/2603/2912/3008) 堅定 HOLD，提供強韌股息與抗震保護傘。",
      "counter_evidence": "大型龍頭股短期可能受外資調節壓制，但考量其高技術壁壘與充沛股息保護，續抱為降低交易摩擦與保全資產之長期最優解。"
    }
  ],
  "decisions": decisions,
  "no_trade_decisions": noTradeDecisions,
  "orders": orders,
  "agent_metadata": {
    "model_provider": "google",
    "model_version": "gemini-3-flash-thinking",
    "run_started_at": "2026-11-05T05:58:12+08:00",
    "run_completed_at": "2026-11-05T06:03:50+08:00",
    "code_version": "v4.3"
  }
};

const outputPath = path.join(__dirname, '..', 'DPlan_20261105_TEAM_12006.json');
fs.writeFileSync(outputPath, JSON.stringify(dplanJson, null, 2), 'utf8');
console.log(`✅ 成功產出【劇本 ${scenario}】D-Plan 交易書:`, outputPath);
console.log(`📊 交易檔數: ${decisions.length} 檔, HOLD 檔數: ${noTradeDecisions.length} 檔, 總持股檔數: ${decisions.length + noTradeDecisions.length} 檔`);
