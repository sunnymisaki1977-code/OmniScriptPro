const fs = require('fs');
let content = fs.readFileSync('CanvaApp.js/OmniScript PRO_os.tsx', 'utf8');
content = content.replace(/fetch\('https:\/\/omni-script-pro\.vercel\.app\/api\//g, "fetch('/api/");
content = content.replace(/fetch\('\/api\//g, "fetch('https://omni-script-pro.vercel.app/api/");
content = content.replace(/fetch\(\`\/api\//g, "fetch(`https://omni-script-pro.vercel.app/api/");
fs.writeFileSync('CanvaApp.js/OmniScript PRO_os.tsx', content);
console.log('Replaced successfully');
