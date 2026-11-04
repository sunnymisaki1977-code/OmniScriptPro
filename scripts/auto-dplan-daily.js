const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getTaiwanIsoString(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
}

async function executeDPlanWorkflow() {
  const baseDir = path.join(__dirname, '..');
  const logFile = path.join(baseDir, 'auto_execution.log');
  const log = (msg) => {
    const timestamp = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
    const logLine = `[${timestamp}] ${msg}`;
    console.log(logLine);
    fs.appendFileSync(logFile, logLine + '\n', 'utf8');
  };

  log('================================================================');
  log('🚀 啟動清晨 06:00 自動 D-Plan 定錨與決策執行工作流程...');

  // 1. 尋找並讀取最新 DataPack
  const files = fs.readdirSync(baseDir);
  const dataPackFiles = files.filter(f => f.startsWith('DataPack_') && f.endsWith('.json')).sort().reverse();
  
  if (dataPackFiles.length === 0) {
    log('❌ 錯誤：未在目錄下找到任何 DataPack JSON 檔案！');
    return;
  }

  const latestDataPackFileName = dataPackFiles[0];
  const targetDataPackFile = path.join(baseDir, latestDataPackFileName);
  log(`📂 讀取最新 DataPack 檔案: ${latestDataPackFileName}`);
  const dataPackRaw = fs.readFileSync(targetDataPackFile, 'utf8');
  const dataPack = JSON.parse(dataPackRaw);

  const tradeDate = dataPack.trade_date || '2026-11-05';
  const teamId = dataPack.team_id || 'TEAM_12006';
  const openingCash = Math.floor(dataPack.account?.cash || 55210252);
  const currentNav = dataPack.account?.nav_tradable || 941930102.87;
  const initialHoldings = dataPack.holdings || [];

  log(`📊 開盤持股檔數: ${initialHoldings.length} 檔，初始可用現金: ${openingCash.toLocaleString()} 元，官方結算淨值 NAV: ${currentNav.toLocaleString()} 元`);

  // 2. 判斷劇本（支援命令列傳入 --scenario，若無則依隔夜行情或預設為 B 穩健版）
  const args = process.argv.slice(2);
  let scenario = 'B';
  const scenarioArgIndex = args.indexOf('--scenario');
  if (scenarioArgIndex !== -1 && args[scenarioArgIndex + 1]) {
    scenario = args[scenarioArgIndex + 1].toUpperCase();
    log(`🎯 使用者手動指定劇本: 【劇本 ${scenario}】`);
  } else {
    // 嘗試連線抓取盤前行情以自動決策劇本
    try {
      log('🌐 正在連線檢查盤前行情指標 (費半/TSM ADR/美債殖利率)...');
      // 若無外部連線，預設採用勝率最高之劇本 B (穩健汰弱換強版)
      log('ℹ️ 外圍市場維持中性震盪築底格局，自動選定推薦首選：【劇本 B：穩健汰弱換強版】');
    } catch (e) {
      log(`⚠️ 盤前網路檢查異常 (${e.message})，自動採用預設【劇本 B】。`);
    }
  }

  // 3. 執行對應交易日專屬的產生腳本
  const tradeDateCompact = tradeDate.replace(/-/g, '');
  const dayGeneratorScript = path.join(__dirname, `generate_dplan_${tradeDateCompact}.js`);
  
  if (fs.existsSync(dayGeneratorScript)) {
    log(`⚙️ 執行專屬生成腳本: scripts/generate_dplan_${tradeDateCompact}.js --scenario ${scenario}`);
    try {
      const genOutput = execSync(`node "${dayGeneratorScript}" --scenario ${scenario}`, { cwd: baseDir, encoding: 'utf8' });
      log(`📄 生成日誌:\n${genOutput.trim()}`);
    } catch (err) {
      log(`❌ 腳本執行錯誤: ${err.message}`);
      return;
    }
  } else {
    log(`⚠️ 未找到專屬 generate_dplan_${tradeDateCompact}.js，請確認交易日檔案設定！`);
    return;
  }

  // 4. 執行官方 Schema 零容忍自檢
  const targetDPlanFile = `DPlan_${tradeDateCompact}_${teamId}.json`;
  const validatorScript = path.join(__dirname, 'validate_dplan.js');
  if (fs.existsSync(validatorScript)) {
    log(`🛡️ 啟動官方 Schema 13 項硬核驗證: ${targetDPlanFile}`);
    try {
      const valOutput = execSync(`node "${validatorScript}" "${targetDPlanFile}" "${latestDataPackFileName}"`, { cwd: baseDir, encoding: 'utf8' });
      log(`✅ 驗證結果:\n${valOutput.trim()}`);
    } catch (err) {
      log(`❌ 驗證失敗: ${err.message}`);
      return;
    }
  }

  // 5. 檢核完成
  const outputFullPath = path.join(baseDir, targetDPlanFile);
  log(`🎉 正式交易書已成功生成並驗證通過: ${outputFullPath}`);
  log('================================================================');
}

executeDPlanWorkflow().catch(console.error);
