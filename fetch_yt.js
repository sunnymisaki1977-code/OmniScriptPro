const fetch = require('node-fetch'); // wait, fetch is built-in in node 18+
fetch('https://www.youtube.com/playlist?list=PLOna4AWCnbzw').then(r=>r.text()).then(t=>{
    const match = t.match(/videoId":"([a-zA-Z0-9_-]{11})/);
    console.log(match ? match[1] : 'not found');
}).catch(console.error);
