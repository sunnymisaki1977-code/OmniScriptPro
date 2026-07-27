import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { content, source } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const isStep4 = source === 'step4';
    const get15sTimecode = (idx: number) => {
      const startSec = idx * 15;
      const endSec = startSec + 15;
      const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      return `[${fmt(startSec)} - ${fmt(endSec)}]`;
    };

    // Parse content for Extreme scenes
    const parsedScenes: any[] = [];
    const timecodeRegex = /\[(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})\]/g;
    
    let matches = [];
    let match;
    while ((match = timecodeRegex.exec(content)) !== null) {
      matches.push({ index: match.index, timecode: match[1] });
    }
    
    if (matches.length > 0) {
      for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index;
        const end = i + 1 < matches.length ? matches[i+1].index : content.length;
        const blockRaw = content.substring(start, end);
        
        if (blockRaw.includes("畫面節點") || blockRaw.includes("視覺畫面建議") || blockRaw.includes("視覺畫面") || blockRaw.includes("畫面字卡") || isStep4) {
            const lines = blockRaw.split('\n');
            let visualPrompt = "";
            let caption = "";
            let voiceover = "";
            
            for (const line of lines) {
                if (line.includes("畫面節點") || line.includes("視覺畫面建議") || line.includes("視覺畫面")) {
                    visualPrompt = line.replace(/^.*?(畫面節點|視覺畫面建議|視覺畫面)\**[：:]\s*\*?\s*/, '').trim();
                } else if (line.includes("畫面字卡")) {
                    caption = line.replace(/^.*?畫面字卡\**[：:]\s*\*?\s*/, '').trim();
                } else if (line.includes("旁白配音") || line.includes("(VO)")) {
                    voiceover = line.replace(/^.*?旁白配音.*?[：:]\s*\*?\s*/, '').trim();
                }
            }
            
            if (!visualPrompt) {
               const cleaned = blockRaw.replace(/\[\d{2}:\d{2}\s*-\s*\d{2}:\d{2}\]/, '').replace(/#+/g, '').trim();
               visualPrompt = cleaned.split('\n')[0].trim();
            }

            const sceneIdx = parsedScenes.length;
            const sceneTitle = isStep4 ? get15sTimecode(sceneIdx) : `[${matches[i].timecode}]`;
            const scenePrompt = isStep4
                ? `${sceneTitle}\n- 視覺畫面：${visualPrompt}\n- 畫面字卡: ${caption}\n- 旁白配音 (VO)：${voiceover}`
                : `[${matches[i].timecode}]\n視覺畫面建議：${visualPrompt}\n畫面字卡：${caption}`;
            
            parsedScenes.push({
                id: `group-Extreme-${sceneIdx + 1}`,
                title: sceneTitle,
                prompt: scenePrompt,
                mainTitle: "",
                subTitle: caption,
                poetry: voiceover
            });
        }
      }
    }
    
    // Fallback: If no structured timecodes were found, split by ### headers or scene delimiters
    if (parsedScenes.length === 0 && content.includes('### ')) {
      const parts = content.split(/###\s+/);
      for(let i=1; i<parts.length; i++) {
        const lines = parts[i].split('\n');
        const titleRaw = lines[0].trim();
        
        let visualPrompt = "";
        let caption = "";
        let voiceover = "";
        for (const line of lines) {
            if (line.includes("畫面節點") || line.includes("視覺畫面建議") || line.includes("視覺畫面")) {
                visualPrompt = line.replace(/^.*?(畫面節點|視覺畫面建議|視覺畫面)\**[：:]\s*\*?\s*/, '').trim();
            } else if (line.includes("畫面字卡")) {
                caption = line.replace(/^.*?畫面字卡\**[：:]\s*\*?\s*/, '').trim();
            } else if (line.includes("旁白配音") || line.includes("(VO)")) {
                voiceover = line.replace(/^.*?旁白配音.*?[：:]\s*\*?\s*/, '').trim();
            }
        }

        const descMatch = parts[i].match(/中文[：:]\s*(.*?)(?=\n|$)/);
        const desc = descMatch ? descMatch[1].trim() : lines.slice(1).join(' ').substring(0, 100);
        if (!visualPrompt) visualPrompt = desc;

        const sceneIdx = parsedScenes.length;
        const sceneTitle = isStep4 ? get15sTimecode(sceneIdx) : titleRaw;
        const scenePrompt = isStep4
            ? `${sceneTitle}\n- 視覺畫面：${visualPrompt}\n- 畫面字卡: ${caption}\n- 旁白配音 (VO)：${voiceover}`
            : `視覺畫面建議：${desc}`;
        
        parsedScenes.push({
          id: `group-Extreme-${sceneIdx + 1}`,
          title: sceneTitle,
          prompt: scenePrompt,
          mainTitle: "",
          subTitle: caption,
          poetry: voiceover
        });
      }
    }
    
    return NextResponse.json({ parsedScenes });
  } catch (error: any) {
    console.error("Extreme Parse API Error:", error);
    return NextResponse.json({ error: error.message || "解析失敗" }, { status: 500 });
  }
}
