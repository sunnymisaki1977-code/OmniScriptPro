import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { getWorkflowSteps } from "@/utils/promptConfigs";

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

    function buildRichText(text: string) {
      if (!text) return [];
      const MAX_LENGTH = 2000;
      const richText = [];
      let remaining = text.trim();
      while (remaining.length > 0) {
        richText.push({ text: { content: remaining.substring(0, MAX_LENGTH) } });
        remaining = remaining.substring(MAX_LENGTH);
      }
      return richText;
    }

    // Parse category (主題分類)
    const categoryMatch = content?.match(/(?:主題分類)[：:]\s*(.*?)(?=\n|$)/);
    const category = categoryMatch ? categoryMatch[1].trim() : "未分類";

    // Parse reason (判斷原因)
    const reasonMatch = content?.match(/(?:判斷原因)[：:]\s*(.*?)(?=\n|$)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : "";

    // Parse birthday (重要聖誕及所屬節氣與重要節慶)
    let birthday = "";
    const birthdayMatch = content?.match(/(?:重要聖誕及所屬節氣與重要節慶)[：:]\s*(.*?)(?=\n|$)/);
    if (birthdayMatch) {
      birthday = birthdayMatch[1].trim();
    } else {
      const altBirthdayMatch = content?.match(/聖誕(?:千秋)?[：:]\s*(.*?)(?=\n|$)/);
      if (altBirthdayMatch) {
          birthday = altBirthdayMatch[1].trim();
      }
    }

    // Parse Intro (導言)
    const introMatch = content?.match(/###\s*一、.*?導言.*?\n([\s\S]*?)(?=###|$)/);
    const intro = introMatch ? introMatch[1].trim() : "";

    // Parse Protection (職能守護與信仰群體)
    const protectionMatch = content?.match(/###\s*(?:六|五|四)、.*?職能守護.*?\n([\s\S]*?)(?=###|$)/);
    const protection = protectionMatch ? protectionMatch[1].trim() : "";

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
      "主題分類": {
        select: {
          name: category,
        },
      }
    };

    if (reason) properties["判斷原因"] = { rich_text: buildRichText(reason) };
    if (birthday) properties["重要聖誕及所屬節氣與重要節慶"] = { rich_text: buildRichText(birthday) };
    if (intro) properties["導言"] = { rich_text: buildRichText(intro) };
    if (protection) properties["職能守護與信仰群體"] = { rich_text: buildRichText(protection) };

    const response = await notion.pages.create({
      parent: { database_id: targetDatabaseId },
      properties: properties,
    });

    const pageId = response.id;
    const childrenBlocks: any[] = [];
    
    if (stepsData && audienceTheme) {
      // Loop over all steps and append their content
      const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'heritage');
      for (const step of WORKFLOW_STEPS) {
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
