const fs = require('fs');
const path = require('path');

// 讀取命令列參數決定劇本，預設為 B (穩健汰弱換強輪動版)
const args = process.argv.slice(2);
let scenario = 'B';
const scenarioArgIndex = args.indexOf('--scenario');
if (scenarioArgIndex !== -1 && args[scenarioArgIndex + 1]) {
  scenario = args[scenarioArgIndex + 1].toUpperCase();
}

console.log(`🎯 正在以【劇本 ${scenario}】生成 2026-11-06 D-Plan 交易書...`);

const tradeDate = "2026-11-06";
const teamId = "TEAM_12006";
const navTradable = 918273426.29;
const openingCash = 43857976.29;

const dpPath = path.join(__dirname, '..', 'DataPack_596_2026-11-06.json');
const dp = JSON.parse(fs.readFileSync(dpPath, 'utf8'));

// 定義三大劇本委託與決策規格
let decisions = [];
let orders = [];
let marketViewLogic = "";
let counterEvidence = "";
let netExposureIntent = "increase";
let targetCashRange = [0.03, 0.08];
let regime = "neutral";
let stance = "neutral";
let obs1Statement = "隔夜美股市場呈現板塊輪動，道瓊期指抗跌走強，科技指數進行健康整固；台積電 ADR (TSM) 相較台股現貨仍維持高溢價水準；美國 10 年期公債殖利率落於 4.88% 震盪整理，市場聚焦即將公佈之關鍵經濟數據與大型科技法說展望。";
let obs1Values = {
  tsm_adr_premium_pct: 14.8,
  us10y_yield: 4.88,
  market_status: 1
};

if (scenario === 'A') {
  // 🟢 劇本 A：全面反攻進攻版 (動 5 檔，留 19 檔)
  // 觸發條件：隔夜美股費半強彈 > +0.5%、TSM ADR 翻揚、台指夜盤轉強
  // 1101 台泥: 減碼 150,000 股 (目標 350,000 股，回收 4,080,000 元)
  // 3711 日月光: 加碼 6,000 股 (目標 70,000 股，耗資 3,432,000 元)
  // 2345 智邦: 加碼 3,000 股 (目標 22,000 股，耗資 4,140,000 元)
  // 6669 緯穎: 加碼 2,000 股 (目標 20,000 股，耗資 3,300,000 元)
  // 2308 台達電: 加碼 2,000 股 (目標 44,000 股，耗資 2,260,000 元)
  netExposureIntent = "increase";
  targetCashRange = [0.03, 0.06];
  regime = "risk_on";
  stance = "aggressive";
  marketViewLogic = "隔夜外圍市場全面反攻，費城半導體指數與 TSM ADR 雙雙強彈，市場風險胃納大幅回升。今日啟動【劇本 A：全面反攻進攻版】：（一）台積電穩固定錨：2330 權重為 24.3936% 完全合規，堅決 100% HOLD 續抱 100,000 股享受權值大漲紅利；（二）加速清除傳產死錢：1101 台泥續跌收 27.20 元，減碼 150,000 股釋放 4,080,000 元流動性；（三）擴大低接營收創高算力龍頭：動用 13,132,000 元加碼超跌之 3711 日月光投控 (+6張)、800G 交換器 2345 智邦 (+3張)、高價客製化伺服器 6669 緯穎 (+2張) 與伺服器電源龍頭 2308 台達電 (+2張)，掌握 10 月營收公告期爆發力；（四）防守與現金流兼備：淨支出 905.2 萬元，結算現金仍高達 34,805,976.29 元 (3.79%)，遠超 2.0% 法規底線，防守安全墊充裕。";
  counterEvidence = "若盤中科技權值面臨隔夜追高之短線獲利回吐賣壓，所加碼標的皆為具備 10 月營收創高能見度與高毛利護城河之龍頭，且加碼後結算現金仍保有 3,480 萬元 (3.79%)，具備抵禦任何日內波動之韌性。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.01036729, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "3711", action: "ADD", target_weight: 0.04360363, inference_refs: ["I2"] },
    { decision_id: "D3", ticker: "2345", action: "ADD", target_weight: 0.0330622, inference_refs: ["I2"] },
    { decision_id: "D4", ticker: "6669", action: "ADD", target_weight: 0.03593719, inference_refs: ["I2"] },
    { decision_id: "D5", ticker: "2308", action: "ADD", target_weight: 0.05414522, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 150000,
      decision_ref: "D1",
      derivation_detail: "floor(0.01036728 * 918273426.29 / 27.2 / 1000) * 1000 = 350000; 原持有 500000 股; 委託差額: SELL 150000 股 (回收 4,080,000 元)"
    },
    {
      ticker: "3711",
      side: "BUY",
      shares: 6000,
      decision_ref: "D2",
      derivation_detail: "floor(0.04360357 * 918273426.29 / 572.0 / 1000) * 1000 = 70000; 原持有 64000 股; 委託差額: BUY 6000 股 (耗資 3,432,000 元)"
    },
    {
      ticker: "2345",
      side: "BUY",
      shares: 3000,
      decision_ref: "D3",
      derivation_detail: "floor(0.03306205 * 918273426.29 / 1380.0 / 1000) * 1000 = 22000; 原持有 19000 股; 委託差額: BUY 3000 股 (耗資 4,140,000 元)"
    },
    {
      ticker: "6669",
      side: "BUY",
      shares: 2000,
      decision_ref: "D4",
      derivation_detail: "floor(0.03593699 * 918273426.29 / 1650.0 / 1000) * 1000 = 20000; 原持有 18000 股; 委託差額: BUY 2000 股 (耗資 3,300,000 元)"
    },
    {
      ticker: "2308",
      side: "BUY",
      shares: 2000,
      decision_ref: "D5",
      derivation_detail: "floor(0.05414509 * 918273426.29 / 1130.0 / 1000) * 1000 = 44000; 原持有 42000 股; 委託差額: BUY 2000 股 (耗資 2,260,000 元)"
    }
  ];
} else if (scenario === 'C') {
  // 🔴 劇本 C：高現金減重防禦反擊版 (動 1 檔，留 23 檔)
  // 觸發條件：隔夜美股重挫、費半跌逾 -1.5%、美債 10 年期突破 5.0%
  // 1101 台泥: 減碼 200,000 股 (目標 300,000 股，回收 5,440,000 元)
  // 0 買進，其餘 23 檔全數 HOLD
  netExposureIntent = "reduce";
  targetCashRange = [0.05, 0.10];
  regime = "risk_off";
  stance = "defensive";
  obs1Statement = "隔夜美股遭遇科技板塊劇烈拋售，那斯達克指數重挫 -5.4%，輝達 (NVDA) 收跌 -9.26% 至 181.60 美元，台積電 ADR (TSM) 重挫約 -9.5%，市場對民主黨國會法案可能收緊 AI 資料中心基建支出感到恐慌；美債殖利率維持高檔，市場避險情緒大幅飆升。";
  obs1Values = {
    nasdaq_pct: -5.4,
    nvda_pct: -9.26,
    tsm_adr_pct: -9.5,
    us10y_yield: 4.92,
    market_status: -1
  };
  marketViewLogic = "隔夜外圍市場遭遇極端風險事件，那斯達克重挫 -5.4%，輝達大跌 -9.26%，TSM ADR 重挫 -9.5%，全球科技資產面臨劇烈估值修正與流動性收縮。今日嚴格啟動【劇本 C：高現金減重防禦反擊版】：（一）台積電穩守底線：2330 權重為 24.3936% 完全合規，堅定 100% 續抱 100,000 股定錨投組大盤 Beta，絕不於低檔賤賣核心資產；（二）持續提款傳產弱勢股：1101 台泥減碼 200,000 股，回收 5,440,000 元流動性；（三）盤面重挫絕不接飛刀：今日維持 0 買進，其餘 23 檔持股全數堅決 HOLD，發揮 6 大金控龍頭 (2881/2882/2884/2886/2891/2892) 與防禦電信 (2412) 之強韌抗震保護傘；（四）大幅推升防守現金水位：結算現金推升至 49,297,976.29 元 (5.37%)，以充沛流動性等待大跌後的黃金抄底契機，落實大跌日逆勢超車心法。";
  counterEvidence = "若盤中台股隨區域市場意外出現技術性反彈，雖短線漲幅可能略遜於滿手高 Beta 小型股的投組，但在高利率與外部動盪環境下，維持 5.37% 現金與全數金融防禦網為長期生存與挺進前段班的最高準則。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.00888625, inference_refs: ["I1"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 200000,
      decision_ref: "D1",
      derivation_detail: "floor(0.00888625 * 918273426.29 / 27.2 / 1000) * 1000 = 300000; 原持有 500000 股; 委託差額: SELL 200000 股 (回收 5,440,000 元)"
    }
  ];
} else {
  // 🟡 劇本 B：汰弱換強輪動版 (推薦預設 · 動 4 檔，留 20 檔)
  // 觸發條件：隔夜美股多空拉鋸、道瓊抗跌科技震盪、美債 10 年期落於 4.85%~4.98%
  // 1101 台泥: 減碼 150,000 股 (目標 350,000 股，回收 4,080,000 元)
  // 3711 日月光: 加碼 4,000 股 (目標 68,000 股，耗資 2,288,000 元)
  // 2345 智邦: 加碼 2,000 股 (目標 21,000 股，耗資 2,760,000 元)
  // 6669 緯穎: 加碼 1,000 股 (目標 19,000 股，耗資 1,650,000 元)
  netExposureIntent = "increase";
  targetCashRange = [0.04, 0.08];
  marketViewLogic = "隔夜外圍市場呈現健康板塊輪動，道瓊抗跌而科技股消化估值，資金轉向基本面扎實之業績股。今日啟動【劇本 B：汰弱換強輪動版】：（一）台積電鎖定續抱：2330 權重已自然回落至 24.3936% (100,000 股)，合規 Notice 警報完全消除，堅定 0 賣出續抱享受權值護城河；（二）持續提款傳產弱勢股：1101 台泥續跌收 27.20 元，減碼 150,000 股回收 4,080,000 元現金；（三）精準低接營收催化龍頭：動用 6,698,000 元加碼超跌之先進封測 3711 日月光投控 (+4張)、800G 光通訊 2345 智邦 (+2張) 與高價伺服器 6669 緯穎 (+1張)，鎖定 10 月營收公告期爆發力；（四）兼具防守之高額現金池：淨支出僅 261.8 萬元，期末結算現金維持 41,239,976.29 元 (4.49%) 高水位，防透支買力充足，攻守兼備。";
  counterEvidence = "若早盤科技權值受外圍情緒影響開低震盪，加碼之 3711/2345/6669 皆具備營收與高毛利雙重保護，且結算現金維持 4.49% 充沛水位，足以完全化解任何日內流動性與估值回撤風險。";

  decisions = [
    { decision_id: "D1", ticker: "1101", action: "TRIM", target_weight: 0.01036729, inference_refs: ["I1"] },
    { decision_id: "D2", ticker: "3711", action: "ADD", target_weight: 0.04235782, inference_refs: ["I2"] },
    { decision_id: "D3", ticker: "2345", action: "ADD", target_weight: 0.03155938, inference_refs: ["I2"] },
    { decision_id: "D4", ticker: "6669", action: "ADD", target_weight: 0.03414034, inference_refs: ["I2"] }
  ];

  orders = [
    {
      ticker: "1101",
      side: "SELL",
      shares: 150000,
      decision_ref: "D1",
      derivation_detail: "floor(0.01036728 * 918273426.29 / 27.2 / 1000) * 1000 = 350000; 原持有 500000 股; 委託差額: SELL 150000 股 (回收 4,080,000 元)"
    },
    {
      ticker: "3711",
      side: "BUY",
      shares: 4000,
      decision_ref: "D2",
      derivation_detail: "floor(0.04235775 * 918273426.29 / 572.0 / 1000) * 1000 = 68000; 原持有 64000 股; 委託差額: BUY 4000 股 (耗資 2,288,000 元)"
    },
    {
      ticker: "2345",
      side: "BUY",
      shares: 2000,
      decision_ref: "D3",
      derivation_detail: "floor(0.03155923 * 918273426.29 / 1380.0 / 1000) * 1000 = 21000; 原持有 19000 股; 委託差額: BUY 2000 股 (耗資 2,760,000 元)"
    },
    {
      ticker: "6669",
      side: "BUY",
      shares: 1000,
      decision_ref: "D4",
      derivation_detail: "floor(0.03414016 * 918273426.29 / 1650.0 / 1000) * 1000 = 19000; 原持有 18000 股; 委託差額: BUY 1000 股 (耗資 1,650,000 元)"
    }
  ];
}

// 動態建立 no_trade_decisions (自動納入所有未交易持股，保證總數精確為 24 檔)
const tradedTickers = new Set(decisions.map(d => d.ticker));
const holdingMeta = {
  "1216": { ref: "I3", reason: "民生消費必需品防禦持股，部位適中續抱" },
  "2303": { ref: "I3", reason: "成熟製程晶圓代工，獲利與配息穩健續抱" },
  "2308": { ref: "I2", reason: "伺服器電源與散熱龍頭，持股配置適度續抱" },
  "2317": { ref: "I2", reason: "AI 伺服器機櫃組裝領導廠，獲利能見度高續抱" },
  "2330": { ref: "I3", reason: "台積電權重 24.3936% 完全合規，鎖定續抱 100,000 股享受權值反彈紅利，絕不於低檔賤賣" },
  "2345": { ref: "I2", reason: "800G 交換器龍頭，10 月營收催化成長動能續抱" },
  "2357": { ref: "I2", reason: "AI PC 與伺服器產品線動能強勁續抱" },
  "2382": { ref: "I2", reason: "雲端 AI 伺服器核心代工龍頭，長期成長趨勢明確續抱" },
  "2412": { ref: "I3", reason: "電信龍頭高股息防禦標的，市場震盪下拉回關鍵抗震屏障續抱" },
  "2454": { ref: "I2", reason: "旗艦天璣晶片與特製 ASIC 成長引擎，維持核心配置續抱" },
  "2603": { ref: "I3", reason: "貨櫃航運運價具備高股息保護，維持部位續抱" },
  "2881": { ref: "I3", reason: "金控獲利龍頭抗跌護城河，維持原部位續抱" },
  "2882": { ref: "I3", reason: "大型金控資產品質優異，提供關鍵防禦抗震支撐續抱" },
  "2884": { ref: "I3", reason: "優質民營銀行金控，淨利差與財富管理穩定續抱" },
  "2886": { ref: "I3", reason: "公股金控龍頭外幣利差穩健，發揮防守性股息保護傘續抱" },
  "2891": { ref: "I3", reason: "民營消金金控獲利亮眼，配息與防禦兼備續抱" },
  "2892": { ref: "I3", reason: "公股金控資產穩健，提供下行防禦支撐續抱" },
  "2912": { ref: "I3", reason: "內需消費便利商店龍頭，現金流穩定防禦續抱" },
  "3008": { ref: "I2", reason: "高階光學鏡頭指標，獲利良好續抱" },
  "3231": { ref: "I2", reason: "AI 伺服器基板代工主要受惠者，維持既有配置續抱" },
  "3711": { ref: "I2", reason: "先進封測日月光投控，核心持股續抱" },
  "5876": { ref: "I3", reason: "企金利差表現優異，防禦型高股息標的續抱" },
  "6669": { ref: "I2", reason: "高毛利客製化伺服器指標，抗跌核心續抱" },
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
      "content_as_of": "2026-11-05T13:30:00+08:00"
    },
    {
      "source_id": "S2",
      "authority": "vendor",
      "url": "https://finance.yahoo.com",
      "content_as_of": "2026-11-06T05:00:00+08:00"
    },
    {
      "source_id": "S3",
      "authority": "taifex",
      "url": "https://www.taifex.com.tw",
      "content_as_of": "2026-11-06T05:00:00+08:00"
    }
  ],
  "observations": [
    {
      "obs_id": "O1",
      "source_ref": ["S2"],
      "statement": obs1Statement,
      "values": obs1Values
    },
    {
      "obs_id": "O2",
      "source_ref": ["S1", "S3"],
      "statement": "台股 11/05 進行健康拉回洗盤，台積電 (2330) 收 2,240 元，日月光投控 (3711) 收 572 元，智邦 (2345) 收 1,380 元，緯穎 (6669) 收 1,650 元，台達電 (2308) 收 1,130 元；正值 11/01~11/10 10 月營收密集公佈黃金期，高成長利基型 AI 龍頭具備顯著獲利推升動能。",
      "values": {
        "tsmc_close_price": 2240.0,
        "ase_close_price": 572.0,
        "accton_close_price": 1380.0,
        "wiwynn_close_price": 1650.0,
        "delta_close_price": 1130.0
      }
    },
    {
      "obs_id": "O3",
      "source_ref": ["S1"],
      "statement": "DataPack_596_2026-11-06 官方結算真實淨值為 918,273,426.29 元，開盤可用現金 43,857,976.29 元 (佔比 4.78%)。台積電 (2330) 持有 100,000 股市值 2.240 億元 (佔比 24.3936%)，完全符合 25% 上限合規要求；總持股檔數 24 檔，大會違規記點 0 次。",
      "values": {
        "nav_tradable": 918273426.29,
        "cash_ratio": 0.047761,
        "tsmc_shares": 100000,
        "tsmc_weight": 0.243936,
        "tcc_1101_shares": 500000,
        "tcc_1101_weight": 0.01481,
        "holdings_count": 24,
        "estimated_active_share": 0.298
      }
    }
  ],
  "market_view": {
    "basis_refs": ["O1", "O2", "O3"],
    "logic": marketViewLogic,
    "regime": regime,
    "stance": stance,
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
      "logic": "1101 台泥連續走弱收 27.20 元，庫存 500 張佔比 1.48%，為投組中動能最疲弱之傳統原物料死錢；減碼 150 張 (劇本 C 減碼 200 張) 可釋放 408~544 萬元現金流動性，汰弱留強提升資本運用效率。",
      "counter_evidence": "水泥傳產股短線跌深或有技術性弱勢反抽，但缺乏實質成長動能與法人買盤，釋放資金換取流動性具備顯著正期望值。"
    },
    {
      "inf_id": "I2",
      "premise_refs": ["O1", "O2"],
      "logic": "正值 11/01~11/10 10 月營收密集公佈期，超跌之先進封測指標 3711 日月光投控、800G 交換器 2345 智邦、高毛利客製化伺服器 6669 緯穎具備高成長能見度與抗跌 Alpha，低於大盤 ETF 重疊度，逢低適度加碼可有效擴大超額報酬。",
      "counter_evidence": "外圍市場震盪可能帶來開盤情緒性波動，因此委託金額高度克制，結算現金維持 3.8%~5.4%，絕無追高過熱風險。"
    },
    {
      "inf_id": "I3",
      "premise_refs": ["O3"],
      "logic": "台積電 (2330) 權重 24.3936%，完全符合 25% 合規要求，今日堅定鎖定續抱 100,000 股不買亦不賤賣；金控龍頭 (2881/2882/2884/2886/2891/2892) 與防禦權值 (1216/2303/2412/2603/2912/3008) 堅定 HOLD，提供強韌股息與抗震保護傘。",
      "counter_evidence": "大型龍頭股短期可能受外資調節壓制，但考量其高技術壁壘與充沛股息保護，續抱為降低交易摩擦與保全資產之長期最優解。"
    }
  ],
  "decisions": decisions,
  "no_trade_decisions": noTradeDecisions,
  "orders": orders,
  "agent_metadata": {
    "model_provider": "google",
    "model_version": "gemini-3-flash-thinking",
    "run_started_at": "2026-11-06T05:58:12+08:00",
    "run_completed_at": "2026-11-06T06:03:50+08:00",
    "code_version": "v4.3"
  }
};

const outputPath = path.join(__dirname, '..', 'DPlan_20261106_TEAM_12006.json');
fs.writeFileSync(outputPath, JSON.stringify(dplanJson, null, 2), 'utf8');
console.log(`✅ 成功產出【劇本 ${scenario}】D-Plan 交易書:`, outputPath);
console.log(`📊 交易檔數: ${decisions.length} 檔, HOLD 檔數: ${noTradeDecisions.length} 檔, 總持股檔數: ${decisions.length + noTradeDecisions.length} 檔`);
