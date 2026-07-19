import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

export async function GET(req: Request) {
  try {
    if (!DATABASE_ID) {
      return NextResponse.json({ error: "Notion Database ID is missing" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("id");

    if (!pageId) {
      return NextResponse.json({ error: "Missing page ID" }, { status: 400 });
    }

    let allBlocks: any[] = [];
    let cursor: string | undefined = undefined;
    
    do {
      const blocksResponse = await notion.blocks.children.list({ 
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100
      });
      allBlocks.push(...blocksResponse.results);
      cursor = blocksResponse.next_cursor || undefined;
    } while (cursor);
    
    let step2Content = "";
    let currentStepId = 0;

    for (const block of allBlocks) {
      if (block.type === "heading_2") {
        const text = block.heading_2.rich_text.map((rt: any) => rt.plain_text).join("");
        const match = text.match(/Step (\d+):\s*(.*)/);
        if (match) {
          currentStepId = parseInt(match[1]);
        }
      } else if (currentStepId === 2) {
        const typeData = block[block.type];
        if (typeData && typeData.rich_text) {
          const text = typeData.rich_text.map((rt: any) => rt.plain_text).join("");
          
          let prefix = "";
          if (block.type === "bulleted_list_item") prefix = "- ";
          else if (block.type === "numbered_list_item") prefix = "1. ";
          else if (block.type === "heading_1") prefix = "# ";
          else if (block.type === "heading_2") prefix = "## ";
          else if (block.type === "heading_3") prefix = "### ";
          
          const contentToAdd = prefix + text;
          
          if (block.type === "quote") {
            step2Content = step2Content ? step2Content + contentToAdd : contentToAdd;
          } else {
            step2Content = step2Content ? step2Content + "\n\n" + contentToAdd : contentToAdd;
          }
        }
      }
    }
    
    // Parse step2Content for NotebookLM scenes
    const parsedScenes: any[] = [];
    const timecodeRegex = /[\[【\*]*(\d{1,2}:\d{2}(?::\d{2})?\s*[-~～到]\s*\d{1,2}:\d{2}(?::\d{2})?)[\]】\*]*/g;
    
    if (timecodeRegex.test(step2Content)) {
      timecodeRegex.lastIndex = 0;
      const blocks = step2Content.split(timecodeRegex);
      for (let i = 1; i < blocks.length; i += 2) {
        const timecode = blocks[i].trim();
        const blockText = blocks[i+1] || "";
        const visualMatch = blockText.match(/(?:視覺畫面建議|視覺畫面|視覺|畫面)[：:\s]\s*\**\s*(.*?)(?=\n|$)/);
        const captionMatch = blockText.match(/(?:畫面字卡|字卡)[：:\s]\s*\**\s*(.*?)(?=\n|$)/);
        if (visualMatch) {
          const visualPrompt = visualMatch[1].replace(/\*+/g, '').trim();
          const caption = captionMatch ? captionMatch[1].replace(/\*+/g, '').trim() : "";
          parsedScenes.push({
            id: Math.floor(i/2) + 1,
            title: `[${timecode}]`,
            desc: visualPrompt,
            caption: caption
          });
        }
      }
    } else if (step2Content.includes('### ')) {
      const parts = step2Content.split(/###\s+/);
      for(let i=1; i<parts.length; i++) {
        const lines = parts[i].split('\n');
        const title = lines[0].trim();
        const descMatch = parts[i].match(/中文[：:]\s*(.*?)(?=\n|$)/);
        const desc = descMatch ? descMatch[1].trim() : lines.slice(1).join(' ').substring(0, 100);
        parsedScenes.push({
          id: i,
          title: title,
          desc: desc,
          caption: ""
        });
      }
    }
    
    return NextResponse.json({ id: pageId, step2Content, parsedScenes });
  } catch (error: any) {
    console.error("Notion API Error:", error);
    return NextResponse.json({ error: error.message || "讀取 Notion 失敗" }, { status: 500 });
  }
}
