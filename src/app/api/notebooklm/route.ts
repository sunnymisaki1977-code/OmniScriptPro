import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    // Parse content for NotebookLM scenes
    const parsedScenes: any[] = [];
    const timecodeRegex = /\*\*\[(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})\]\*\*/g;
    
    if (timecodeRegex.test(content)) {
      timecodeRegex.lastIndex = 0;
      const blocks = content.split(timecodeRegex);
      for (let i = 1; i < blocks.length; i += 2) {
        const timecode = blocks[i].trim();
        const blockText = blocks[i+1] || "";
        const visualMatch = blockText.match(/視覺畫面建議[：:]\s*\*?\s*(.*?)(?=\n|$)/);
        const captionMatch = blockText.match(/畫面字卡[：:]\s*\*?\s*(.*?)(?=\n|$)/);
        const voiceoverMatch = blockText.match(/旁白配音\s*\(VO\)[：:]\s*\*?\s*(.*?)(?=\n|$)/);
        
        if (visualMatch) {
          const visualPrompt = visualMatch[1].replace(/\*+/g, '').trim();
          const caption = captionMatch ? captionMatch[1].replace(/\*+/g, '').trim() : "";
          const voiceover = voiceoverMatch ? voiceoverMatch[1].replace(/\*+/g, '').trim() : "";
          
          const combinedPrompt = `[${timecode}]\n視覺畫面建議：${visualPrompt}\n畫面字卡：${caption}`;

          parsedScenes.push({
            id: `group-notebooklm-${Math.floor(i/2) + 1}`,
            title: `[${timecode}]`,
            prompt: combinedPrompt,
            mainTitle: "",
            subTitle: caption,
            poetry: voiceover
          });
        }
      }
    } else if (content.includes('### ')) {
      const parts = content.split(/###\s+/);
      for(let i=1; i<parts.length; i++) {
        const lines = parts[i].split('\n');
        const title = lines[0].trim();
        const descMatch = parts[i].match(/中文[：:]\s*(.*?)(?=\n|$)/);
        const desc = descMatch ? descMatch[1].trim() : lines.slice(1).join(' ').substring(0, 100);
        
        parsedScenes.push({
          id: `group-notebooklm-${i}`,
          title: title,
          prompt: `視覺畫面建議：${desc}`,
          mainTitle: "",
          subTitle: "",
          poetry: ""
        });
      }
    }
    
    return NextResponse.json({ parsedScenes });
  } catch (error: any) {
    console.error("NotebookLM Parse API Error:", error);
    return NextResponse.json({ error: error.message || "解析失敗" }, { status: 500 });
  }
}
