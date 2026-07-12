// --- 匯出資料至 Notion ---
const startNotionExport = async (customContents = null, customTheme = null) => {
  setIsNotionExporting(true);
  setNotionStatus('正在同步至 Notion...');
  addLog(`[System] 開始封裝企劃資料，自動準備匯出...`, 'info');

  try {
    // 呼叫我們自己的 Vercel 後端 Notion API
    const VERCEL_NOTION_URL = '/api/notion';
    
    const targetTheme = customTheme || theme || "未命名企劃主題";
    const targetContents = customContents || stepContents;

    // 封裝目前所有的輸入與生成結果，符合後端 /api/notion 預期的格式
    const payload = {
      theme: targetTheme,
      stepsData: targetContents,
      creatorName: curTheme.title, // 動態抓取目前選擇的角色名稱（例如：全職影音創作者）
      audienceTheme: audienceTheme
    };

    const response = await fetch(VERCEL_NOTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`伺服器錯誤: ${response.status}`);
    }

    const data = await response.json();
    
    setNotionStatus('✅ 已成功歸檔');
    addLog(`[Notion] ✨ 企劃匯出成功！`, 'success');
    
    // 自動開啟剛剛建好的 Notion 頁面並儲存 URL
    if (data.url) {
      setNotionUrl(data.url);
      fetchArchives(); // 成功後立即刷新歷史清單
      if (isGlobalMaster) {
        window.open(data.url, '_blank');
      }
    }
    
  } catch (error) {
    console.error("Notion 匯出失敗:", error);
    setNotionStatus('❌ 歸檔失敗');
    addLog(`[Error] 匯出失敗: ${error.message}`, 'error');
  } finally {
    setIsNotionExporting(false);
  }
};
