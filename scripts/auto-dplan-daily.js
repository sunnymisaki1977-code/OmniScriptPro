const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { syncDPlanToNotion } = require('./sync_dplan_notion');

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
  log('🚀 啟動自動 D-Plan 定錨、國際局勢風控與決策執行工作流程...');

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

  const tradeDate = dataPack.trade_date || '2026-11-06';
  const teamId = dataPack.team_id || 'TEAM_12006';
  const openingCash = Math.floor(dataPack.account?.cash || 43857976);
  const currentNav = dataPack.account?.nav_tradable || 918273426.29;
  const initialHoldings = dataPack.holdings || [];

  log(`📊 開盤持股檔數: ${initialHoldings.length} 檔，初始可用現金: ${openingCash.toLocaleString()} 元，官方結算淨值 NAV: ${currentNav.toLocaleString()} 元`);

  // 2. 啟動 AI 國際地緣與宏觀風控雷達 (fintech_radar.py)
  log('🌍 [Step 1/5] 啟動 AI 國際地緣與宏觀風控雷達掃描...');
  let radarSignal = null;
  const radarScript = path.join(__dirname, 'fintech_radar', 'fintech_radar.py');
  const radarSignalFile = path.join(__dirname, 'fintech_radar', 'latest_radar_signal.json');

  if (fs.existsSync(radarScript)) {
    try {
      log('📡 連線國際外電與地緣新聞庫，調用 Gemini 2.5 Flash 進行風控判讀...');
      const radarOutput = execSync(`python "${radarScript}" --mode dplan`, { cwd: baseDir, encoding: 'utf8' });
      log(`📄 雷達日誌:\n${radarOutput.trim()}`);
    } catch (err) {
      log(`⚠️ 雷達腳本執行異常 (${err.message})，檢查快取訊號...`);
    }
  }

  if (fs.existsSync(radarSignalFile)) {
    try {
      const radarRaw = fs.readFileSync(radarSignalFile, 'utf8');
      radarSignal = JSON.parse(radarRaw).signal;
      log(`🎯 雷達指標就緒：地緣風險 [${radarSignal.geopolitical_risk_level.toUpperCase()}] | 宏觀偏向 [${radarSignal.macro_regime_bias}] | 總結: ${radarSignal.key_headline}`);
    } catch (e) {
      log(`⚠️ 讀取雷達訊號快取失敗: ${e.message}`);
    }
  }

  // 3. 雙維度智慧劇本判定（量化行情 + 國際地緣局勢）
  const args = process.argv.slice(2);
  let scenario = 'B';
  const scenarioArgIndex = args.indexOf('--scenario');
  if (scenarioArgIndex !== -1 && args[scenarioArgIndex + 1]) {
    scenario = args[scenarioArgIndex + 1].toUpperCase();
    log(`🎯 使用者手動指定劇本: 【劇本 ${scenario}】`);
  } else {
    log('⚖️ [Step 2/5] 執行雙維度決策矩陣 (行情數據 + 國際地緣局勢)...');
    const geoRisk = (radarSignal?.geopolitical_risk_level || 'medium').toLowerCase();
    const macroBias = (radarSignal?.macro_regime_bias || 'neutral').toLowerCase();

    if (geoRisk === 'high' || geoRisk === 'critical' || macroBias === 'risk_off') {
      scenario = 'C';
      log(`🚨 國際地緣風險高企 (等級: ${geoRisk.toUpperCase()}) 或市場進入 Risk-off！`);
      log(`🛡️ 決策引擎自動切換至：【劇本 C：高現金減重防禦反擊版】（啟動防禦、拉高現金水位、0 盲目加碼）`);
    } else if (geoRisk === 'low' && macroBias === 'risk_on') {
      scenario = 'A';
      log(`🟢 國際局勢平和且市場氣氛熱絡 (Risk-on)！`);
      log(`🚀 決策引擎自動切換至：【劇本 A：全面反攻進攻版】（低接高營收成長龍頭）`);
    } else {
      scenario = 'B';
      log(`🟡 國際局勢維持拉鋸整固 (等級: ${geoRisk.toUpperCase()})，板塊良性輪動。`);
      log(`⚖️ 決策引擎自動選定推薦首選：【劇本 B：穩健汰弱換強輪動版】（以賣養買、鎖定業績成長標的）`);
    }
  }

  // 4. 執行對應交易日專屬的產生腳本
  const tradeDateCompact = tradeDate.replace(/-/g, '');
  let dayGeneratorScript = path.join(__dirname, `generate_dplan_${tradeDateCompact}.js`);
  
  if (!fs.existsSync(dayGeneratorScript)) {
    // 若無當天專屬腳本，自動尋找最新的 generate_dplan_*.js
    const genFiles = files.filter(f => f.startsWith('generate_dplan_') && f.endsWith('.js')).sort().reverse();
    if (genFiles.length > 0) {
      dayGeneratorScript = path.join(baseDir, 'scripts', genFiles[0]);
      log(`ℹ️ 採用最新可用生成引擎: ${path.basename(dayGeneratorScript)}`);
    }
  }

  log(`⚙️ [Step 3/5] 執行交易書生成: ${path.basename(dayGeneratorScript)} --scenario ${scenario}`);
  try {
    const genOutput = execSync(`node "${dayGeneratorScript}" --scenario ${scenario}`, { cwd: baseDir, encoding: 'utf8' });
    log(`📄 生成日誌:\n${genOutput.trim()}`);
  } catch (err) {
    log(`❌ 腳本執行錯誤: ${err.message}`);
    return;
  }

  // 5. 執行官方 Schema 零容忍 13 項硬核自檢
  const targetDPlanFile = `DPlan_${tradeDateCompact}_${teamId}.json`;
  const validatorScript = path.join(__dirname, 'validate_dplan.js');
  if (fs.existsSync(validatorScript)) {
    log(`🛡️ [Step 4/5] 啟動官方 Schema 13 項硬核驗證: ${targetDPlanFile}`);
    try {
      const valOutput = execSync(`node "${validatorScript}" "${targetDPlanFile}" "${latestDataPackFileName}"`, { cwd: baseDir, encoding: 'utf8' });
      log(`✅ 驗證結果:\n${valOutput.trim()}`);
    } catch (err) {
      log(`❌ 驗證失敗: ${err.message}`);
      return;
    }
  }

  // 6. 全自動同步至 Notion 資料庫
  const outputFullPath = path.join(baseDir, targetDPlanFile);
  log(`☁️ [Step 5/5] 將今日交易書與國際局勢分析同步寫入 Notion...`);
  try {
    const notionUrl = await syncDPlanToNotion(outputFullPath);
    if (notionUrl) {
      log(`🎉 Notion 看板同步成功: ${notionUrl}`);
    } else {
      log(`ℹ️ Notion 同步已執行完畢。`);
    }
  } catch (notionErr) {
    log(`⚠️ Notion 同步過程發生異常: ${notionErr.message}`);
  }

  log(`🏁 本日決策流程全部完成！正式交易書: ${outputFullPath}`);
  log('================================================================');
}

executeDPlanWorkflow().catch(console.error);
