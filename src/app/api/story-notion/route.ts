import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { getWorkflowSteps } from "@/utils/promptConfigs";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

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
    } else if (trimmed.startsWith("- ")) {
      flushParagraph();
      blocks.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: [{ type: "text", text: { content: trimmed.substring(2).substring(0, MAX_LENGTH) } }] }
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
    
    const content = body.content || (stepsData ? stepsData[1] : "");

    const targetDatabaseId = process.env.NOTION_story_ID || "3cdf374300dc8003869fc653e367c867";

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Parse category
    const categoryMatch = content?.match(/(?:主題分類)[：:]\s*(.*?)(?=\n|$)/);
    const categoryRaw = categoryMatch ? categoryMatch[1].trim() : "";
    
    let category = categoryRaw || "未分類";
    const catClean = categoryRaw.replace(/^\d+\.\s*/, "").trim();

    if (catClean.includes("神佛/歷史人物")) {
      category = "1. 神佛/歷史人物";
    } else if (catClean.includes("民俗/節氣/宮廟")) {
      category = "2. 民俗/節氣/宮廟";
    }

    // Parse reason
    const reasonMatch = content?.match(/(?:判斷原因)[：:]\s*(.*?)(?=\n|$)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : "";

    // Parse book source
    const bookMatch = content?.match(/(?:故事取材經典著作)[：:]\s*(.*?)(?=\n|$)/);
    const book = bookMatch ? bookMatch[1].trim() : "";

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
      }
    };

    if (category) {
      properties["主題分類"] = {
        select: {
          name: category,
        },
      };
    }

    if (reason) {
      properties["判斷原因"] = {
        rich_text: [
          {
            text: { content: reason.substring(0, 2000) },
          },
        ],
      };
    }
    
    if (book) {
      properties["故事取材經典著作"] = {
        rich_text: [
          {
            text: { content: book.substring(0, 2000) },
          },
        ],
      };
    }

    let childrenBlocks: any[] = [];

    if (stepsData && audienceTheme) {
      const WORKFLOW_STEPS = getWorkflowSteps(audienceTheme || 'story');
      for (const step of WORKFLOW_STEPS) {
        const stepContent = stepsData[step.id];
        if (stepContent && stepContent.trim() !== "") {
          childrenBlocks.push({
            object: "block",
            type: "heading_1",
            heading_1: {
              rich_text: [{ type: "text", text: { content: step.title.substring(0, 2000) } }]
            }
          });
          childrenBlocks.push(...parseMarkdownToNotionBlocks(stepContent));
        }
      }
    } else {
      childrenBlocks.push(...parseMarkdownToNotionBlocks(content));
    }

    const response = await notion.pages.create({
      parent: { database_id: targetDatabaseId },
      properties: properties,
    });

    const pageId = response.id;

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
    console.error("Story Notion API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
