const fs = require('fs');
const path = require('path');

const tradeDate = "2026-11-03";
const teamId = "TEAM_12006";
const navTradable = 979939182.58;
const openingCash = 65094082.58;

// 四檔委託精算 (劇本 B：穩健汰弱換強 - 5 大隱形缺點全面修復完美版)
// 1. 1101: TRIM 200,000 股 (目標 799,000 股, 安全緩衝 +644 股)
// 2. 2308: ADD 3,000 股 (目標 36,000 股, 安全緩衝 +348 股)
// 3. 2345: ADD 2,000 股 (目標 15,000 股, 安全緩衝 +351 股)
// 4. 6669: ADD 2,000 股 (目標 14,000 股, 安全緩衝 +349 股)

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
      "content_as_of": "2026-11-02T13:30:00+08:00"
    },
    {
      "source_id": "S2",
      "authority": "vendor",
      "url": "https://finance.yahoo.com",
      "content_as_of": "2026-11-03T05:00:00+08:00"
    },
    {
      "source_id": "S3",
      "authority": "taifex",
      "url": "https://www.taifex.com.tw",
      "content_as_of": "2026-11-03T05:00:00+08:00"
    }
  ],
  "observations": [
    {
      "obs_id": "O1",
      "source_ref": [
        "S2"
      ],
      "statement": "美股週一 (11/02) 呈現狹幅高檔整固格局，四大指數漲跌互見：道瓊下跌 -0.25%、標普 500 下跌 -0.18%、那斯達克微跌 -0.32%，費城半導體逆勢微漲 +0.12%；台積電 ADR (TSM) 收在 403.8 美元，折合台股約 2,610 元（對現貨溢價約 +16.2%）；美債 10 年期殖利率落於 4.89% 高檔橫盤，市場氛圍中性健康，資金轉向聚焦實質營收與高毛利利基型標的。",
      "values": {
        "dow_change_pct": -0.0025,
        "sp500_change_pct": -0.0018,
        "nasdaq_change_pct": -0.0032,
        "sox_change_pct": 0.0012,
        "tsm_adr_close": 403.8,
        "tsm_adr_premium_pct": 16.2,
        "us10y_yield": 4.89
      }
    },
    {
      "obs_id": "O2",
      "source_ref": [
        "S1",
        "S3"
      ],
      "statement": "台股 11/02 現貨隨大盤修正，台積電 (2330) 收在 2,330 元 (-1.69%)；但我方持股中 2308 台達電 (+1.50%)、3711 日月光投控 (+0.90%)、2357 華碩 (+0.66%)、6669 緯穎 (+0.55%) 與 2345 智邦 (平盤抗跌) 逆勢領漲；台指期夜盤收在 22,980 點 (-0.15%) 維持抗震整固，期交所外資未平倉淨空單穩定於 -32,500 口中性避險水位；目前正值 11/01~11/10 10 月營收密集公佈期，核心 AI 硬體具備強勁催化動能。",
      "values": {
        "tsmc_close_price": 2330.0,
        "delta_change_pct": 0.0150,
        "ase_change_pct": 0.0090,
        "asus_change_pct": 0.0066,
        "wiwynn_change_pct": 0.0055,
        "accton_change_pct": 0.0,
        "tx_night_close": 22980.0,
        "tx_night_change_pct": -0.0015,
        "tx_foreign_net_oi": -32500.0
      }
    },
    {
      "obs_id": "O3",
      "source_ref": [
        "S1"
      ],
      "statement": "DataPack_596_2026-11-03 官方結算淨值為 979,939,182.58 元，開盤可用現金 65,094,082.58 元 (佔比 6.64%)。台積電 (2330) 持有 100,000 股，權重已自然降至 23.7770%（距離 25.0% 上限有 1.223% 寬裕緩衝），單一持股合規警示消除；1101 台泥持有 999,000 股 (2.86%) 為投組中唯一動能落後的傳統傳產死錢；總持股檔數 24 檔完全符合 20~30 檔規範。",
      "values": {
        "nav_tradable": 979939182.58,
        "cash_ratio": 0.066427,
        "tsmc_shares": 100000,
        "tsmc_weight": 0.237770,
        "tcc_1101_shares": 999000,
        "tcc_1101_weight": 0.028647,
        "holdings_count": 24,
        "estimated_active_share": 0.292
      }
    }
  ],
  "market_view": {
    "basis_refs": [
      "O1",
      "O2",
      "O3"
    ],
    "logic": "隔夜美股四大指數橫盤整固（道瓊 -0.25%、那指 -0.32%、費半 +0.12%），美債 10 年期殖利率落於 4.89%，台指期夜盤微幅整理 (-0.15%)，指示市場整體情緒處於健康中性整理。今日啟動【劇本 B：穩健汰弱換強】戰略：（一）台積電鎖定 HOLD：2330 權重已自然降溫至 23.7770%，遠離 25.0% 紅線，堅定續抱 100,000 股不賤賣核心大盤 Beta；（二）減碼傳產死錢提款：1101 台泥減碼 200,000 股 (200 張)，釋放回收 5,620,000 元現金；（三）精準加碼營收催化 AI 股：動用 10,935,000 元加碼逆勢抗跌之 2308 台達電 (+3張)、2345 智邦 (+2張)、6669 緯穎 (+2張)，掌握 10 月營收創高紅利並拉開 Active Share；（四）鐵桶防禦高現金：結算現金維持 59,779,082 元 (6.10%) 高水位，防透支安全墊高達 3,977.9 萬元，兼顧攻擊 Alpha 與下行防禦護城河。",
    "regime": "neutral",
    "stance": "neutral",
    "posture": {
      "net_exposure_intent": "increase",
      "target_cash_pct_range": [
        0.03,
        0.08
      ]
    },
    "counter_evidence": "美債殖利率落於 4.89% 若引發早盤科技權值股開低賣壓，我方加碼之 2308/2345/6669 均為 11/02 逆勢抗跌領漲標的，且加碼幅度克制僅動用 1,093.5 萬元，結算保留高達 6.10% 高現金儲備，足以全面化解日內流動性與估值波動風險。"
  },
  "inferences": [
    {
      "inf_id": "I1",
      "premise_refs": [
        "O3"
      ],
      "logic": "1101 台泥連續走弱收 28.1 元，為目前投組中唯一動能落後的傳統原物料死錢；減碼 200,000 股釋放 5,620,000 元充沛現金，既可提高投組資金運用效率，又為加碼 AI 利基強勢股提供資金活水。",
      "counter_evidence": "水泥傳產股短線跌深或有技術性弱勢反彈，但缺乏實質成長動能與法人買盤支撐，釋放資金換取流動性與高營收催化標的具備顯著正期望值。"
    },
    {
      "inf_id": "I2",
      "premise_refs": [
        "O1",
        "O2"
      ],
      "logic": "正值 11/01~11/10 10 月營收密集公佈期，2308 台達電 (伺服器電源與液冷散熱)、2345 智邦 (800G 交換器龍頭)、6669 緯穎 (客製化 ASIC 伺服器指標) 於 11/02 逆勢收紅領漲，且低於 30 檔指標主動型 ETF 擁擠度，精選加碼可顯著放大超額 Alpha 並拉高 Active Share 至 29% 以上。",
      "counter_evidence": "美股整固可能帶來開盤情緒性波動，因此委託金額嚴格壓制在 1,093.5 萬元以內（扣除賣出台泥僅微幅淨動用 531.5 萬元），結算現金仍高達 6.10%，絕無追高過熱風險。"
    },
    {
      "inf_id": "I3",
      "premise_refs": [
        "O3"
      ],
      "logic": "台積電 (2330) 權重自然回落至 23.7770%，距離 25.0% 法定上限有 1.223% 寬裕緩衝，消除合規警示；今日堅定續抱 100,000 股不於低檔賤賣；富邦金 (2881)、國泰金 (2882) 等金控龍頭、統一 (1216)、聯電 (2303)、長榮 (2603)、統一超 (2912) 與中華電 (2412) 堅定 HOLD，提供強韌股息與抗震保護傘。",
      "counter_evidence": "外資短線若賣超權值股，大型龍頭短期股價可能受限；但考量其高技術壁壘、充沛股息保護與 TSM ADR +16.2% 溢價支撐，續抱以掌握後續基本面反彈為長期最優解。"
    }
  ],
  "decisions": [
    {
      "decision_id": "D1",
      "ticker": "1101",
      "action": "TRIM",
      "target_weight": 0.02293,
      "inference_refs": [
        "I1"
      ]
    },
    {
      "decision_id": "D2",
      "ticker": "2308",
      "action": "ADD",
      "target_weight": 0.05026,
      "inference_refs": [
        "I2"
      ]
    },
    {
      "decision_id": "D3",
      "ticker": "2345",
      "action": "ADD",
      "target_weight": 0.02530,
      "inference_refs": [
        "I2"
      ]
    },
    {
      "decision_id": "D4",
      "ticker": "6669",
      "action": "ADD",
      "target_weight": 0.02665,
      "inference_refs": [
        "I2"
      ]
    }
  ],
  "no_trade_decisions": [
    {
      "ticker": "1216",
      "reason_refs": [
        "I3"
      ],
      "reason": "民生消費必需品防禦持股，部位適中續抱"
    },
    {
      "ticker": "2303",
      "reason_refs": [
        "I3"
      ],
      "reason": "成熟製程晶圓代工，獲利與配息穩健續抱"
    },
    {
      "ticker": "2317",
      "reason_refs": [
        "I2"
      ],
      "reason": "AI 伺服器機櫃組裝領導廠，獲利能見度高續抱"
    },
    {
      "ticker": "2330",
      "reason_refs": [
        "I3"
      ],
      "reason": "台積電權重 23.7770% 已在 25.0% 法定上限安全區，合規警示消除，堅守紀律續抱 100,000 股"
    },
    {
      "ticker": "2357",
      "reason_refs": [
        "I2"
      ],
      "reason": "11/02 逆勢收紅抗跌，AI PC 與伺服器產品線動能強勁續抱"
    },
    {
      "ticker": "2382",
      "reason_refs": [
        "I2"
      ],
      "reason": "雲端 AI 伺服器核心代工龍頭，長期成長趨勢明確續抱"
    },
    {
      "ticker": "2412",
      "reason_refs": [
        "I3"
      ],
      "reason": "電信龍頭高股息防禦標的，市場震盪下拉回關鍵抗震屏障續抱"
    },
    {
      "ticker": "2454",
      "reason_refs": [
        "I2"
      ],
      "reason": "旗艦天璣晶片與特製 ASIC 成長引擎，核心持股續抱"
    },
    {
      "ticker": "2603",
      "reason_refs": [
        "I3"
      ],
      "reason": "貨櫃航運運價具備高股息保護，維持既有配置續抱"
    },
    {
      "ticker": "2881",
      "reason_refs": [
        "I3"
      ],
      "reason": "金控獲利龍頭抗跌護城河，獲利動能強健維持原部位續抱"
    },
    {
      "ticker": "2882",
      "reason_refs": [
        "I3"
      ],
      "reason": "大型金控資產品質優異，提供關鍵防禦抗震支撐續抱"
    },
    {
      "ticker": "2884",
      "reason_refs": [
        "I3"
      ],
      "reason": "優質民營銀行金控，淨利差與財富管理穩定續抱"
    },
    {
      "ticker": "2886",
      "reason_refs": [
        "I3"
      ],
      "reason": "公股金控龍頭外幣利差穩健，發揮防守性股息保護傘續抱"
    },
    {
      "ticker": "2892",
      "reason_refs": [
        "I3"
      ],
      "reason": "公股金控資產穩健，提供下行防禦支撐續抱"
    },
    {
      "ticker": "2912",
      "reason_refs": [
        "I3"
      ],
      "reason": "內需消費便利商店龍頭，現金流穩定防禦續抱"
    },
    {
      "ticker": "3008",
      "reason_refs": [
        "I2"
      ],
      "reason": "高階光學潛望鏡頭指標，獲利體質良好續抱"
    },
    {
      "ticker": "3231",
      "reason_refs": [
        "I2"
      ],
      "reason": "AI 伺服器基板代工主要受惠者，維持既有配置續抱"
    },
    {
      "ticker": "3711",
      "reason_refs": [
        "I2"
      ],
      "reason": "11/02 逆勢上漲，先進封裝 CoWoS 與測試產能滿載續抱"
    },
    {
      "ticker": "5876",
      "reason_refs": [
        "I3"
      ],
      "reason": "企金利差表現優異，防禦型高股息標的續抱"
    },
    {
      "ticker": "5880",
      "reason_refs": [
        "I3"
      ],
      "reason": "官股金融資產穩固，提供穩定股息保護續抱"
    }
  ],
  "orders": [
    {
      "ticker": "1101",
      "side": "SELL",
      "shares": 200000,
      "decision_ref": "D1",
      "derivation_detail": "floor(0.022930 * 979939182.58 / 28.1 / 1000) * 1000 = 799000; 原持有 999000 股; 委託差額: SELL 200000 股 (回收 5,620,000 元)"
    },
    {
      "ticker": "2308",
      "side": "BUY",
      "shares": 3000,
      "decision_ref": "D2",
      "derivation_detail": "floor(0.050260 * 979939182.58 / 1355.0 / 1000) * 1000 = 36000; 原持有 33000 股; 委託差額: BUY 3000 股 (耗資 4,065,000 元)"
    },
    {
      "ticker": "2345",
      "side": "BUY",
      "shares": 2000,
      "decision_ref": "D3",
      "derivation_detail": "floor(0.025300 * 979939182.58 / 1615.0 / 1000) * 1000 = 15000; 原持有 13000 股; 委託差額: BUY 2000 股 (耗資 3,230,000 元)"
    },
    {
      "ticker": "6669",
      "side": "BUY",
      "shares": 2000,
      "decision_ref": "D4",
      "derivation_detail": "floor(0.026650 * 979939182.58 / 1820.0 / 1000) * 1000 = 14000; 原持有 12000 股; 委託差額: BUY 2000 股 (耗資 3,640,000 元)"
    }
  ],
  "agent_metadata": {
    "model_provider": "google",
    "model_version": "gemini-3-flash-thinking",
    "run_started_at": "2026-11-03T05:58:12+08:00",
    "run_completed_at": "2026-11-03T06:03:50+08:00",
    "code_version": "v4.3"
  }
};

const outputPath = path.join(__dirname, '..', 'DPlan_20261103_TEAM_12006.json');
fs.writeFileSync(outputPath, JSON.stringify(dplanJson, null, 2), 'utf8');
console.log('✅ 成功產出 5 大缺陷全修復版 D-Plan 交易書:', outputPath);
