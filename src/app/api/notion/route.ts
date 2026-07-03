import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { getWorkflowSteps } from "@/utils/promptConfigs";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

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
    const { theme, stepsData, audienceTheme } = await req.json();

    if (!DATABASE_ID) {
      return NextResponse.json({ error: "Notion Database ID is missing" }, { status: 500 });
    }

    // 1. Create the page in the database
    const pageResponse = await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: {
        Name: {
          title: [{ text: { content: `【世代銘印】${theme} - ${new Date().toLocaleDateString()}` } }],
        },
      },
    });

    const pageId = pageResponse.id;
    const children: any[] = [];

    // 0. Add AudienceTheme metadata
    children.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [{ type: "text", text: { content: `[AudienceTheme: ${audienceTheme}]` } }],
      },
    });

    // 2. Format each step's content into blocks
    const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
    for (const step of WORKFLOW_STEPS) {
      const content = stepsData[step.id];
      if (!content) continue;

      // Add Step Title
      children.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [{ type: "text", text: { content: `Step ${step.id}: ${step.title}` } }],
        },
      });

      // Parse content into Notion blocks using universal Markdown parser
      const parsedBlocks = parseMarkdownToNotionBlocks(content);
      children.push(...parsedBlocks);
    }

    // 3. Append blocks to the created page in batches of 100 (Notion limit)
    const CHUNK_SIZE = 100;
    for (let i = 0; i < children.length; i += CHUNK_SIZE) {
      const chunk = children.slice(i, i + CHUNK_SIZE);
      await notion.blocks.children.append({
        block_id: pageId,
        children: chunk,
      });
    }

    return NextResponse.json({ success: true, url: (pageResponse as any).url });
  } catch (error: any) {
    console.error("Notion API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to archive to Notion" }, { status: 500 });
  }
}
