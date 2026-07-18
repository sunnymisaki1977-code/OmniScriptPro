const fs = require('fs');
const file = 'CanvaApp.js/OmniScript PRO_os.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/'Imagen 4\.0'/g, "'Gemini 2.5 Flash'");
fs.writeFileSync(file, content, 'utf8');
console.log('Replaced Imagen 4.0 in mock data');
