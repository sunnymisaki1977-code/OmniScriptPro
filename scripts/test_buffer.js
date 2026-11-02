const nav = 979939182.58;

function checkBuffer(ticker, targetShares, price, weight) {
  const rawShares = (weight * nav) / price;
  const floored = Math.floor(rawShares / 1000) * 1000;
  const buffer = rawShares - floored;
  console.log(ticker + ': target=' + targetShares + ', weight=' + weight + ', rawShares=' + rawShares.toFixed(2) + ', floored=' + floored + ', buffer=' + buffer.toFixed(2) + ' shares, match=' + (floored === targetShares));
}

console.log('--- 原始設定檢測 ---');
checkBuffer('1101', 799000, 28.1, 0.02292);
checkBuffer('2308', 36000, 1355.0, 0.04979);
checkBuffer('2345', 15000, 1615.0, 0.02473);
checkBuffer('6669', 14000, 1820.0, 0.02601);

console.log('\n--- 優化設定檢測 (緩衝加厚至 300~500 股) ---');
// 1101: 799000 -> rawShares 約 799350
// 799350 * 28.1 / nav = 0.0229215 -> 0.02293
const w1101 = 0.02293;
checkBuffer('1101', 799000, 28.1, w1101);

// 2308: 36000 -> rawShares 約 36350
// 36350 * 1355 / nav = 0.05026 -> let's test 0.04984 (rawShares ~ 36036) or 0.0502
// Wait! target is 36,000 shares!
// If target is 36,000 shares, rawShares should be between 36,000 and 36,999!
// Let's test 36,350 shares: 36350 * 1355 / nav = 0.050262
checkBuffer('2308', 36000, 1355.0, 0.05026);

// 2345: 15000 -> rawShares 約 15350
// 15350 * 1615 / nav = 0.02530
checkBuffer('2345', 15000, 1615.0, 0.02530);

// 6669: 14000 -> rawShares 約 14350
// 14350 * 1820 / nav = 0.02665
checkBuffer('6669', 14000, 1820.0, 0.02665);
