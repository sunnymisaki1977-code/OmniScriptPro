const http = require('http');
const { GoogleGenAI } = require('@google/genai');

const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        console.log('HEADERS:', req.headers);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({candidates: [{content: {parts: [{text: 'success'}]}}]}));
        server.close();
    });
});

server.listen(3000, async () => {
    try {
        const ai = new GoogleGenAI({ bearerToken: 'ya29.test123', httpOptions: { baseUrl: 'http://localhost:3000' } });
        await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
    } catch(e) {
        console.error(e);
        server.close();
    }
});
