import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { STEPS } from "@/utils/promptConfigs";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

function parseMarkdownToNotionBlocks(text: string): any[] {
  const MAX_LENGTH = 2000;
  const blocks: any[] = [];
  const lines = text.split("\n");
  
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const pText = currentParagraph.join("\n").trim();
      if (pText) {
        let remaining = pText;
        while (remaining.length > 0) {
          blocks.push({
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ type: "text", text: { content: remaining.substring(0, MAX_LENGTH) } }],
            },
          });
          remaining = remaining.substring(MAX_LENGTH);
        }
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "heading_3",
        heading_3: { rich_text: [{ type: "text", text: { content: trimmed.substring(4).substring(0, MAX_LENGTH) } }] }
      });
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: { rich_text: [{ type: "text", text: { content: trimmed.substring(3).substring(0, MAX_LENGTH) } }] }
      });
    } else if (trimmed.startsWith("# ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "heading_1",
        heading_1: { rich_text: [{ type: "text", text: { content: trimmed.substring(2).substring(0, MAX_LENGTH) } }] }
      });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: trimmed.substring(2).substring(0, MAX_LENGTH) } }] }
      });
    } else if (trimmed.startsWith("> ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "quote",
        quote: { rich_text: [{ type: "text", text: { content: trimmed.substring(2).substring(0, MAX_LENGTH) } }] }
      });
    } else if (trimmed === "") {
      flushParagraph();
    } else {
      currentParagraph.push(line);
    }
  }
  
  flushParagraph();
  
  return blocks;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, stepsData, audienceTheme } = body;
    
    // Maintain backwards compatibility if frontend hasn't updated yet or passes single content
    const content = body.content || (stepsData ? stepsData[1] : "");

    const targetDatabaseId = process.env.NOTION_heritage_ID || "3e0f374300dc80a69293fe3cd5f5d121";

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Parse category
    const categoryMatch = content?.match(/(?:主題分類|分類)[：:]\s*(.*?)(?=\n|$)/);
    const category = categoryMatch ? categoryMatch[1].trim() : "未分類";

    // Parse birthday
    let birthday = "";
    const birthdayMatch = content?.match(/(?:重要聖誕與重要節慶|聖誕千秋|農曆)[：:]?\s*([^\n]*?(?:農曆|初|十)[^\n]*)/);
    if (birthdayMatch) {
      birthday = birthdayMatch[1].trim();
    }
    
    // Fallback for birthday if it wasn't matched well
    if (!birthday) {
        const altBirthdayMatch = content?.match(/聖誕(?:千秋)?[：:]\s*(.*?)(?=\n|$)/);
        if (altBirthdayMatch) {
            birthday = altBirthdayMatch[1].trim();
        }
    }

    const properties: any = {
      "名稱": {
        title: [
          {
            text: { content: title || "" },
          },
        ],
      },
      "日期": {
        date: {
          start: new Date().toISOString().split("T")[0],
        },
      },
      "類型": {
        select: {
          name: category,
        },
      }
    };

    if (birthday) {
      properties["聖誕"] = {
        rich_text: [
          {
            text: { content: birthday },
          },
        ],
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: targetDatabaseId },
      properties: properties,
    });

    const pageId = response.id;
    const childrenBlocks: any[] = [];
    
    if (stepsData && audienceTheme) {
      // Loop over all steps and append their content
      for (const step of STEPS) {
        const stepContent = stepsData[step.id];
        if (!stepContent) continue;
        
        childrenBlocks.push({
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: `Step ${step.id}: ${step.title}` } }],
          },
        });
        
        childrenBlocks.push(...parseMarkdownToNotionBlocks(stepContent));
      }
    } else {
      // Fallback for single content string
      childrenBlocks.push(...parseMarkdownToNotionBlocks(content));
    }

    // Append blocks to the created page in batches of 100 (Notion limit)
    const CHUNK_SIZE = 100;
    for (let i = 0; i < childrenBlocks.length; i += CHUNK_SIZE) {
      const chunk = childrenBlocks.slice(i, i + CHUNK_SIZE);
      await notion.blocks.children.append({
        block_id: pageId,
        children: chunk,
      });
    }

    return NextResponse.json({ success: true, id: pageId, url: (response as any).url });
  } catch (error: any) {
    console.error("Heritage Notion API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save to Notion" }, { status: 500 });
  }
}
