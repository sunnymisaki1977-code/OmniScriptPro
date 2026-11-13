const fs = require('fs');

const dplanPath = process.argv[2] || 'DPlan_20261104_TEAM_12006.json';
const dpPath = process.argv[3] || 'DataPack_596_2026-11-04.json';

const dplan = JSON.parse(fs.readFileSync(dplanPath, 'utf8'));
const dp = JSON.parse(fs.readFileSync(dpPath, 'utf8'));

console.log(`--- ${dplan.trade_date} D-Plan 官方 Schema 零容忍自檢 ---`);
console.log('1. schema_version:', dplan.schema_version === '4.3');
console.log('2. doc_type:', dplan.doc_type === 'D-Plan');
console.log('3. team_id:', dplan.team_id === 'TEAM_12006');
console.log('4. trade_date:', dplan.trade_date === dp.trade_date);

// 檢查根節點
const allowedRootKeys = ['schema_version', 'doc_type', 'team_id', 'trade_date', 'sources', 'observations', 'market_view', 'inferences', 'decisions', 'no_trade_decisions', 'orders', 'agent_metadata'];
const extraKeys = Object.keys(dplan).filter(k => !allowedRootKeys.includes(k));
console.log('5. 根節點額外欄位 (須為 0):', extraKeys.length, extraKeys);

// 檢查 sources authority & +08:00
const validAuth = ['twse', 'tpex', 'taifex', 'mops', 'fininst', 'media', 'vendor', 'other'];
const authOk = dplan.sources.every(s => validAuth.includes(s.authority));
const tzOk = dplan.sources.every(s => s.content_as_of.endsWith('+08:00'));
console.log('6. Sources authority 合法:', authOk, '時間戳 +08:00:', tzOk);

// 檢查 observations values 必須為 number
const obsValuesOk = dplan.observations.every(o => Object.values(o.values).every(v => typeof v === 'number'));
console.log('7. Observations values 均為 number:', obsValuesOk);

// 檢查 counter_evidence 不為空
const mvCounterOk = Boolean(dplan.market_view.counter_evidence && dplan.market_view.counter_evidence.trim());
const infCounterOk = dplan.inferences.every(inf => Boolean(inf.counter_evidence && inf.counter_evidence.trim()));
console.log('8. counter_evidence 均不為空:', mvCounterOk && infCounterOk);

// 檢查 posture net_exposure_intent (必須為 increase / hold / reduce)
const validIntents = ['increase', 'hold', 'reduce'];
const intentOk = validIntents.includes(dplan.market_view.posture.net_exposure_intent);
console.log('9. net_exposure_intent (須為 increase/hold/reduce):', dplan.market_view.posture.net_exposure_intent, '->', intentOk ? 'PASS ✅' : 'FAIL ❌');
// 檢查 market_view.regime & stance
const validRegimes = ['risk_on', 'neutral', 'risk_off'];
const validStances = ['aggressive', 'neutral', 'defensive'];
const regimeOk = validRegimes.includes(dplan.market_view.regime);
const stanceOk = validStances.includes(dplan.market_view.stance);
console.log('9b. market_view.regime (須為 risk_on/neutral/risk_off):', dplan.market_view.regime, '->', regimeOk ? 'PASS ✅' : 'FAIL ❌');
console.log('9c. market_view.stance (須為 aggressive/neutral/defensive):', dplan.market_view.stance, '->', stanceOk ? 'PASS ✅' : 'FAIL ❌');

// 檢查持股檔數
const decisionTickers = dplan.decisions.map(d => d.ticker);
const noTradeTickers = dplan.no_trade_decisions.map(nt => nt.ticker);
const allTickers = new Set([...decisionTickers, ...noTradeTickers]);
console.log('10. 總處理持股檔數:', allTickers.size, '(20~30 檔合規)');

// 檢查委託單推導一致性
const nav = dp.account.nav_tradable;
const holdingsMap = new Map(dp.holdings.map(h => [h.code, h]));

let allOrdersMatch = true;
let totalSellCash = 0;
let totalBuyCash = 0;
dplan.orders.forEach(o => {
  const d = dplan.decisions.find(dec => dec.decision_id === o.decision_ref);
  const h = holdingsMap.get(o.ticker);
  const targetShares = Math.floor((d.target_weight * nav) / h.close_price / 1000) * 1000;
  const delta = targetShares - h.shares;
  const side = delta > 0 ? 'BUY' : 'SELL';
  const shares = Math.abs(delta);
  const match = (o.side === side && o.shares === shares);
  if (!match) allOrdersMatch = false;
  if (o.side === 'SELL') totalSellCash += o.shares * h.close_price;
  if (o.side === 'BUY') totalBuyCash += o.shares * h.close_price;
  console.log('   Order ' + o.ticker + ': side=' + o.side + ', shares=' + o.shares + ', expectedSide=' + side + ', expectedShares=' + shares + ', match=' + match);
});
console.log('11. 委託單推導 100% 一致:', allOrdersMatch);

// 現金流檢核
const endingCash = dp.account.cash + totalSellCash - totalBuyCash;
const cashRatio = endingCash / nav;
console.log('12. 結算現金: ' + endingCash.toLocaleString() + ' 元 (' + (cashRatio * 100).toFixed(4) + '%) -> 合規 (2%~10%): ' + (cashRatio >= 0.02 && cashRatio <= 0.10));

console.log('13. agent_metadata 時間戳 +08:00:', dplan.agent_metadata.run_started_at.endsWith('+08:00') && dplan.agent_metadata.run_completed_at.endsWith('+08:00'));

// 檢查官方文字長度上限 (≤ 500 字)
const obsLengthOk = dplan.observations.every((o, idx) => {
  const len = o.statement ? o.statement.length : 0;
  if (len > 500) console.log(`   ❌ observations[${idx}].statement 長度超過 500 字: ${len} 字`);
  return len <= 500;
});
const mvLogicLen = dplan.market_view?.logic ? dplan.market_view.logic.length : 0;
const mvLogicOk = mvLogicLen <= 500;
if (!mvLogicOk) console.log(`   ⚠️ market_view.logic 長度為 ${mvLogicLen} 字 (建議 ≤ 500 字)`);
console.log('14. 文字長度檢查 (observations statement 均 ≤ 500 字):', obsLengthOk ? 'PASS ✅' : 'FAIL ❌');

// 15. 檢查 inferences 規格 (必填 premise_refs, logic，嚴禁 basis_refs)
const infSpecOk = dplan.inferences.every((inf, i) => {
  return Array.isArray(inf.premise_refs) && inf.premise_refs.length > 0 &&
         typeof inf.logic === 'string' && inf.logic.trim().length > 0 &&
         inf.basis_refs === undefined;
});
console.log('15. Inferences 規格 (premise_refs/logic 齊全且無 basis_refs):', infSpecOk ? 'PASS ✅' : 'FAIL ❌');

// 16. 檢查 decisions 規格 (必填 inference_refs，嚴禁 basis_refs)
const decSpecOk = dplan.decisions.every((dec, i) => {
  return Array.isArray(dec.inference_refs) && dec.inference_refs.length > 0 &&
         dec.basis_refs === undefined;
});
console.log('16. Decisions 規格 (inference_refs 齊全且無 basis_refs):', decSpecOk ? 'PASS ✅' : 'FAIL ❌');

// 17. 檢查 no_trade_decisions 規格 (必填 reason_refs, reason，嚴禁 decision_id/action)
const ntSpecOk = dplan.no_trade_decisions.every((nt, i) => {
  return Array.isArray(nt.reason_refs) && nt.reason_refs.length > 0 &&
         typeof nt.reason === 'string' && nt.reason.trim().length > 0 &&
         nt.decision_id === undefined;
});
console.log('17. NoTrade 規格 (reason_refs/reason 齊全且無 decision_id):', ntSpecOk ? 'PASS ✅' : 'FAIL ❌');

// 18. 檢查 agent_metadata 規格 (必填 model_provider/model_version/code_version，嚴禁額外未定義欄位)
const allowedAmKeys = ['model_provider', 'model_version', 'run_started_at', 'run_completed_at', 'code_version'];
const amExtraKeys = Object.keys(dplan.agent_metadata).filter(k => !allowedAmKeys.includes(k));
const amSpecOk = amExtraKeys.length === 0 &&
                 Boolean(dplan.agent_metadata.model_provider) &&
                 Boolean(dplan.agent_metadata.model_version) &&
                 Boolean(dplan.agent_metadata.code_version);
console.log('18. AgentMetadata 規格 (無未定義欄位且核心欄位齊全):', amSpecOk ? 'PASS ✅' : 'FAIL ❌');
