import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

function cleanVoiceover(line: string) {
  let text = line
    .replace(/^.*?旁白配音.*?[：:]\s*\*?\s*/i, '')
    .replace(/^.*\(VO\)\**[：:]\s*\*?\s*/i, '')
    .replace(/^.*?(?:中文旁白|日文旁白|旁白字幕|台詞旁白|旁白|口播|配音)\**[：:]\s*\*?\s*/i, '')
    .trim();
  const isJa = line.includes('日文') || line.includes('日語') || line.includes('Japanese') || line.includes('日本語') || /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
  // 去除開頭提示型括號 (例如 [中文旁白，至少 40-50 字] 或 [語氣必須「極度生活化」中文旁白...])
  const cleanedText = text.replace(/^[\[【][^\]】]*(?:旁白|口吻|字|語氣|生活化|極度)[^\]】]*[\]】]\s*/, '').trim();
  return { isJa, text: cleanedText || text };
}

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
    // 支援 [00:00 - 00:30] 或 **00:00 - 00:30** 或純文字 00:00 - 00:30
    const timecodeRegex = /(?:\[|\*\*|^|\s)(\d{1,2}:\d{2}\s*(?:-|~)\s*\d{1,2}:\d{2})(?:\]|\*\*|$|\s)/gm;
    
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
            let voiceover_ja = "";
            
            for (const line of lines) {
                if (line.includes("畫面節點") || line.includes("視覺畫面建議") || line.includes("視覺畫面")) {
                    visualPrompt = line.replace(/^.*?(畫面節點|視覺畫面建議|視覺畫面)\**[：:]\s*\*?\s*/, '').trim();
                } else if (line.includes("畫面字卡")) {
                    caption = line.replace(/^.*?畫面字卡\**[：:]\s*\*?\s*/, '').trim();
                } else if (
                  line.includes("旁白配音") || 
                  line.includes("(VO)") || 
                  line.includes("中文旁白") || 
                  line.includes("日文旁白") || 
                  line.includes("旁白") || 
                  line.includes("口播") || 
                  line.includes("配音")
                ) {
                    const vo = cleanVoiceover(line);
                    if (vo.isJa) {
                      voiceover_ja = vo.text;
                    } else {
                      voiceover = vo.text;
                    }
                }
            }

            // 保持中日雙語旁白獨立，不互相覆蓋
            
            if (!visualPrompt) {
               const cleaned = blockRaw.replace(/(?:\[|\*\*|^|\s)\d{1,2}:\d{2}\s*(?:-|~)\s*\d{1,2}:\d{2}(?:\]|\*\*|$|\s)/g, '').replace(/#+/g, '').trim();
               visualPrompt = cleaned.split('\n')[0].trim();
            }

            const sceneIdx = parsedScenes.length;
            const sceneTitle = isStep4 ? get15sTimecode(sceneIdx) : `[${matches[i].timecode}]`;
            // 淨化 prompt：專注於視覺畫面與字卡，不把長篇旁白塞進繪圖提示詞中
            const scenePrompt = isStep4
                ? `${sceneTitle}\n- 視覺畫面：${visualPrompt}${caption ? `\n- 畫面字卡: ${caption}` : ''}`
                : `[${matches[i].timecode}]\n視覺畫面建議：${visualPrompt}${caption ? `\n畫面字卡：${caption}` : ''}`;
            
            parsedScenes.push({
                id: `group-Extreme-${sceneIdx + 1}`,
                title: sceneTitle,
                prompt: scenePrompt,
                mainTitle: "",
                subTitle: caption,
                poetry: voiceover,
                voiceover: voiceover,
                voiceover_ja: voiceover_ja
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
        let voiceover_ja = "";
        for (const line of lines) {
            if (line.includes("畫面節點") || line.includes("視覺畫面建議") || line.includes("視覺畫面")) {
                visualPrompt = line.replace(/^.*?(畫面節點|視覺畫面建議|視覺畫面)\**[：:]\s*\*?\s*/, '').trim();
            } else if (line.includes("畫面字卡")) {
                caption = line.replace(/^.*?畫面字卡\**[：:]\s*\*?\s*/, '').trim();
            } else if (
                line.includes("旁白配音") || 
                line.includes("(VO)") || 
                line.includes("中文旁白") || 
                line.includes("日文旁白") || 
                line.includes("旁白") || 
                line.includes("口播") || 
                line.includes("配音")
            ) {
                const vo = cleanVoiceover(line);
                if (vo.isJa) {
                  voiceover_ja = vo.text;
                } else {
                  voiceover = vo.text;
                }
            }
        }

        // 保持中日雙語旁白獨立，不互相覆蓋

        const descMatch = parts[i].match(/中文[：:]\s*(.*?)(?=\n|$)/);
        const desc = descMatch ? descMatch[1].trim() : lines.slice(1).join(' ').substring(0, 100);
        if (!visualPrompt) visualPrompt = desc;

        const sceneIdx = parsedScenes.length;
        const sceneTitle = isStep4 ? get15sTimecode(sceneIdx) : titleRaw;
        const scenePrompt = isStep4
            ? `${sceneTitle}\n- 視覺畫面：${visualPrompt}${caption ? `\n- 畫面字卡: ${caption}` : ''}`
            : `視覺畫面建議：${desc}`;
        
        parsedScenes.push({
          id: `group-Extreme-${sceneIdx + 1}`,
          title: sceneTitle,
          prompt: scenePrompt,
          mainTitle: "",
          subTitle: caption,
          poetry: voiceover,
          voiceover: voiceover,
          voiceover_ja: voiceover_ja
        });
      }
    }
    
    return NextResponse.json({ parsedScenes });
  } catch (error: any) {
    console.error("Extreme Parse API Error:", error);
    return NextResponse.json({ error: error.message || "解析失敗" }, { status: 500 });
  }
}
