import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { content, visualStep } = body;

    if (!content) {
      return NextResponse.json({ parsedGroups: [] });
    }

    const lines = content.split('\n');
    let groups: { title: string; content: string }[] = [];
    let currentGroup: { title: string; content: string } | null = null;
    let cardCount = 1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        let titleMatch = null;
        if (line.match(/###\s*(第[一二三四五六七八九十\d]+組.*)/)) {
            titleMatch = line.match(/###\s*(第[一二三四五六七八九十\d]+組.*)/)![1].trim();
        } else if (line.match(/\d+\.\s*(畫格\s*\d+.*)/)) {
            titleMatch = line.match(/\d+\.\s*(畫格\s*\d+.*)/)![1].trim();
        } else if (line.match(/(16:9\s*動態分割構圖.*)/)) {
            titleMatch = line.match(/(16:9\s*動態分割構圖.*)/)![1].trim();
        } else if (line.match(/(9:16\s*動態分割構圖.*)/)) {
            titleMatch = line.match(/(9:16\s*動態分割構圖.*)/)![1].trim();
        } else if (line.match(/\d+\.\s*###\s*圖卡標籤/)) {
            titleMatch = `圖卡 ${cardCount}`;
            cardCount++;
        }
        
        if (titleMatch) {
            if (currentGroup) {
                groups.push(currentGroup);
            }
            currentGroup = { title: titleMatch, content: "" };
        } else {
            if (currentGroup) {
                currentGroup.content += line + "\n";
            }
        }
    }
    if (currentGroup) {
        groups.push(currentGroup);
    }
    
    const parsedGroups = groups.map((g, index) => {
        const groupContent = g.content;
        
        let promptText = "無法自動擷取提示詞，請手動確認";
        
        // 1. 嘗試組合: 核心文案 + 促銷副標 + 中文 (使用者要求的進階整合)
        let promptTextParts = [];
        const coreCopyMatch = groupContent.match(/(?:核心文案|主標|高點擊文案|主標題)\s*[：:]\s*(.*?)(?=\n|$)/);
        if (coreCopyMatch && coreCopyMatch[1].trim()) promptTextParts.push(`核心文案：${coreCopyMatch[1].trim()}`);
        
        const subPromoMatch = groupContent.match(/(?:促銷副標(?:（.*?）)?|副標|副標題)\s*[：:]\s*(.*?)(?=\n|$)/);
        if (subPromoMatch && subPromoMatch[1].trim()) promptTextParts.push(`促銷副標：${subPromoMatch[1].trim()}`);
        
        const zhPromptMatch = groupContent.match(/(?:中文|中文\s*Prompt|中文Prompt)\s*[：:]\s*([\s\S]*?)(?=\n(?:主標|副標|核心文案|促銷副標|詩詞|###|$)|$)/);
        if (zhPromptMatch && zhPromptMatch[1].trim()) promptTextParts.push(`畫面細節與標籤：${zhPromptMatch[1].trim()}`);

        if (promptTextParts.length > 0) {
            promptText = promptTextParts.join("\\n");
        } else {
            // 2. Fallback: 尋找舊的標籤格式
            const aiPromptMatch = groupContent.match(/AI\s*Prompt\s*(?:\(中文\)|（中文）)?[：:\s]*(?:必須包含[：:\s]*)?([\s\S]*?)(?=\n(?:主標|副標|詩詞|###|$)|$)/i);
            if (aiPromptMatch && aiPromptMatch[1].trim().length > 0) {
                promptText = aiPromptMatch[1].trim();
            } else {
                const fallbackMatch = groupContent.match(/(?:中文|視覺描述|中文\s*Prompt|視覺Prompt)\s*[：:]\s*(.*?)(?=\n|$)/);
                if (fallbackMatch && fallbackMatch[1].trim().length > 0) {
                    promptText = fallbackMatch[1].trim();
                }
            }
        }
        
        const mainTitleMatch = groupContent.match(/(?:主標|高點擊文案|主標題|核心文案)\s*[：:]\s*(.*?)(?=\n|$)/);
        const subTitleMatch = groupContent.match(/(?:副標|副標題|促銷副標(?:（.*?）)?)\s*[：:]\s*(.*?)(?=\n|$)/);
        const poetryMatch = groupContent.match(/詩詞(?:（.*?）)?\s*[：:]\s*([\s\S]*?)(?=\n(?:中文|視覺|主標|副標|核心文案|促銷副標|高點擊文案|主標題|副標題|AI Prompt)\s*[：:]|$)/);
        
        return {
            id: `group-${visualStep}-${index}`,
            title: g.title,
            prompt: promptText,
            mainTitle: mainTitleMatch ? mainTitleMatch[1].trim() : "",
            subTitle: subTitleMatch ? subTitleMatch[1].trim() : "",
            poetry: poetryMatch ? poetryMatch[1].trim() : ""
        };
    });
    
    if (parsedGroups.length > 0) {
        return NextResponse.json({ parsedGroups });
    }
    
    // Fallback if no groups matched but there is text
    const fullText = content.trim();
    if (fullText.length > 10) {
        return NextResponse.json({
            parsedGroups: [{
                id: `group-${visualStep}-fallback`,
                title: "未分類圖卡",
                prompt: fullText.substring(0, 500) + "...", // 截斷避免過長
                mainTitle: "",
                subTitle: "",
                poetry: ""
            }]
        });
    }

    return NextResponse.json({ parsedGroups: [] });

  } catch (error) {
    console.error("Parse visuals API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
