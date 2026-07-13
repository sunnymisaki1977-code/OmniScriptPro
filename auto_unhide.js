const fs = require('fs');
let code = fs.readFileSync('CanvaApp.js/OmniScript PRO_os.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    // 檢查登入狀態
    setIsAuthenticated(sessionStorage.getItem('os_pro_auth') === 'true');
    const savedTheme = sessionStorage.getItem('os_pro_theme');
    if (savedTheme) setAudienceTheme(savedTheme);
    setIsGlobalMaster(sessionStorage.getItem('os_pro_master') === 'true');
  }, []);`;

const replacementStr = `  useEffect(() => {
    // 檢查登入狀態
    setIsAuthenticated(sessionStorage.getItem('os_pro_auth') === 'true');
    const savedTheme = sessionStorage.getItem('os_pro_theme');
    if (savedTheme) setAudienceTheme(savedTheme);
    const isMaster = sessionStorage.getItem('os_pro_master') === 'true';
    setIsGlobalMaster(isMaster);
    
    // 如果是 Master，自動展開所有隱藏側邊欄
    if (isMaster) {
      setIsStepFlowHidden(false);
      setIsVisualSidebarHidden(false);
    }
  }, []);

  // 當 isGlobalMaster 狀態改變時（例如剛登入成功），也自動展開
  useEffect(() => {
    if (isGlobalMaster) {
      setIsStepFlowHidden(false);
      setIsVisualSidebarHidden(false);
    }
  }, [isGlobalMaster]);`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('CanvaApp.js/OmniScript PRO_os.tsx', code);
console.log('Update complete!');
