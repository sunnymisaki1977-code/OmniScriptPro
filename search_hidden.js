const fs = require('fs');
const lines = fs.readFileSync('CanvaApp.js/OmniScript PRO_os.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
    if (l.includes('className') && l.includes('hidden')) {
        console.log(i + 1, l.trim());
    }
});
