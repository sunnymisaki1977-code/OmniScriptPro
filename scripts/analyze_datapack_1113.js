const fs = require('fs');
const dpOld = JSON.parse(fs.readFileSync('DataPack_596_2026-11-12.json', 'utf8'));
const dpNew = JSON.parse(fs.readFileSync('DataPack_596_2026-11-13.json', 'utf8'));

console.log('=== 帳戶總覽比對 ===');
console.log('昨日可交易 NAV (11/11結算):', dpOld.account.nav_tradable.toLocaleString());
console.log('今日可交易 NAV (11/12結算):', dpNew.account.nav_tradable.toLocaleString());
const navDiff = dpNew.account.nav_tradable - dpOld.account.nav_tradable;
const navDiffPct = (navDiff / dpOld.account.nav_tradable * 100).toFixed(2);
console.log('NAV 變動金額:', navDiff.toLocaleString(), `(${navDiffPct}%)`);
console.log('今日可用現金:', dpNew.account.cash.toLocaleString(), `(${(dpNew.account.cash_ratio_tradable * 100).toFixed(2)}%)`);
console.log('持股總檔數:', dpNew.account.holdings_count);
console.log('昨日委託執行結果:', dpNew.prev_day_orders.outcome);

const oldPrices = {};
dpOld.holdings.forEach(h => oldPrices[h.code] = h.close_price);

const stockNames = {
  '1216': '統一', '2303': '聯電', '2308': '台達電', '2317': '鴻海', '2330': '台積電',
  '2345': '智邦', '2357': '華碩', '2382': '廣達', '2412': '中華電', '2454': '聯發科',
  '2603': '長榮', '2881': '富邦金', '2882': '國泰金', '2884': '玉山金', '2886': '兆豐金',
  '2892': '第一金', '2912': '統一超', '3008': '大立光', '3231': '緯創', '3711': '日月光投控',
  '5876': '上海商銀', '5880': '合庫金', '6669': '緯穎'
};

const rows = dpNew.holdings.map(h => {
  const oldP = oldPrices[h.code] || h.close_price;
  const change = h.close_price - oldP;
  const changePct = ((change / oldP) * 100).toFixed(2);
  const marketVal = h.shares * h.close_price;
  return {
    code: h.code,
    name: stockNames[h.code] || h.code,
    shares: h.shares,
    oldP,
    newP: h.close_price,
    change: change.toFixed(1),
    changePct: changePct + '%',
    weight: (h.tradable_weight * 100).toFixed(2) + '%',
    marketVal: marketVal
  };
});

// Sort by changePct ascending
rows.sort((a, b) => parseFloat(a.changePct) - parseFloat(b.changePct));
console.log('\n=== 2026-11-12 全持股表現排名 (由跌到漲) ===');
console.table(rows);

// Calculate total portfolio impact
const totalStockVal = dpNew.holdings.reduce((sum, h) => sum + h.shares * h.close_price, 0);
console.log('\n持股市值合計:', totalStockVal.toLocaleString());
console.log('帳戶現金:', dpNew.account.cash.toLocaleString());
console.log('檢驗總資產:', (totalStockVal + dpNew.account.cash).toLocaleString());
