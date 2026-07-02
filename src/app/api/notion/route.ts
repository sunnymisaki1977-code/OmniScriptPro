import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { getWorkflowSteps } from "@/utils/promptConfigs";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

/**
 * Splits long text into chunks that fit within Notion's 2000 character limit.
 * Tries to split by paragraphs first, then by sentence/chunks.
 */
function createSafeParagraphBlocks(text: string): any[] {
  const MAX_LENGTH = 2000;
  // First split by double newlines for natural paragraphs
  const paragraphs = text.split("\n\n");
  const blocks: any[] = [];

  for (const p of paragraphs) {
    if (p.length <= MAX_LENGTH) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: p } }],
        },
      });
    } else {
      // If a single paragraph is too long, chunk it
      let remaining = p;
      while (remaining.length > 0) {
        const chunk = remaining.substring(0, MAX_LENGTH);
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: chunk } }],
          },
        });
        remaining = remaining.substring(MAX_LENGTH);
      }
    }
  }
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

      // Add Content based on step type
      if (step.id <= 5) {
        // Scripts and SEO as paragraphs
        const pBlocks = createSafeParagraphBlocks(content);
        children.push(...pBlocks);
      } else {
        // Prompts as Quote blocks (to support auto-wrap and look distinct)
        const MAX_LENGTH = 2000;
        const paragraphs = content.split("\n\n");
        
        for (const p of paragraphs) {
          if (p.trim() === "") continue;
          
          // Chunk long quotes if necessary
          let remaining = p;
          while (remaining.length > 0) {
            const chunk = remaining.substring(0, MAX_LENGTH);
            children.push({
              object: "block",
              type: "quote",
              quote: {
                rich_text: [{ type: "text", text: { content: chunk } }],
              },
            });
            remaining = remaining.substring(MAX_LENGTH);
          }
        }
      }
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
