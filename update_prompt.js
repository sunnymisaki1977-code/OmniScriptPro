const fs = require('fs');

let code = fs.readFileSync('src/utils/promptConfigs.ts', 'utf8');

const standardTitles = {
  1: '核心企劃知識',
  2: '主軸腳本文案',
  3: '影音 SEO 標題優化',
  4: '擴散式影音文案',
  5: '擴散式 SEO 標籤優化',
  6: '影音點擊率 (CTR) 圖像',
  7: '擴散式影音吸睛圖像',
  8: '風格化情境視覺',
  9: 'Suno AI 情緒配樂',
  10: '全平台社群推播文案'
};

const lines = code.split('\n');
let currentTheme = '';
let currentId = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const themeMatch = line.match(/^  ([a-zA-Z0-9_]+):\s*\[/);
  if (themeMatch) {
    currentTheme = themeMatch[1];
  }
  
  const idMatch = line.match(/id:\s*(\d+)/);
  if (idMatch) {
    currentId = parseInt(idMatch[1], 10);
  }
  
  if (currentTheme && currentTheme !== 'historyMeme' && currentId >= 1 && currentId <= 10) {
    const titleMatch = line.match(/title:\s*\"([^\"]+)\"/);
    if (titleMatch) {
      lines[i] = line.replace(/title:\s*\"[^\"]+\"/, `title: "${standardTitles[currentId]}"`);
      currentId = -1;
    }
  }
}

fs.writeFileSync('src/utils/promptConfigs.ts', lines.join('\n'));
console.log('Successfully updated promptConfigs.ts');
