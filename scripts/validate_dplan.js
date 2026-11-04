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
