import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function POST(req: Request) {
  try {
    const { pageId } = await req.json();

    if (!pageId) {
      return NextResponse.json({ error: "Missing pageId" }, { status: 400 });
    }

    let hasMore = true;
    let nextCursor: string | undefined = undefined;
    const blocks: any[] = [];

    // Fetch all blocks
    while (hasMore) {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: nextCursor,
      });
      blocks.push(...response.results);
      hasMore = response.has_more;
      nextCursor = response.next_cursor || undefined;
    }

    const prompts: Record<string, string> = {
      step1: "",
      step2: "",
      step6: "",
      step7: "",
      step8: "",
      step9: "",
      step10: "",
    };

    let currentStep: string | null = null;

    for (const block of blocks) {
      if (block.type === "heading_2") {
        const text = block.heading_2.rich_text.map((t: any) => t.plain_text).join("");
        if (text.includes("Step 10") || text.includes("Step10")) {
          currentStep = "step10";
        } else if (text.includes("Step 1")) {
          currentStep = "step1";
        } else if (text.includes("Step 2")) {
          currentStep = "step2";
        } else if (text.includes("Step 6")) {
          currentStep = "step6";
        } else if (text.includes("Step 7")) {
          currentStep = "step7";
        } else if (text.includes("Step 8")) {
          currentStep = "step8";
        } else if (text.includes("Step 9")) {
          currentStep = "step9";
        } else {
          currentStep = null; // stop collecting if it's another heading
        }
      } else if (currentStep) {
        // Collect text from quote, paragraph, code, and list blocks
        let content = "";
        if (block.type === "quote" && block.quote.rich_text) {
          content = block.quote.rich_text.map((t: any) => t.plain_text).join("");
        } else if (block.type === "paragraph" && block.paragraph.rich_text) {
          content = block.paragraph.rich_text.map((t: any) => t.plain_text).join("");
        } else if (block.type === "code" && block.code.rich_text) {
          content = block.code.rich_text.map((t: any) => t.plain_text).join("");
        } else if (block.type === "bulleted_list_item" && block.bulleted_list_item.rich_text) {
          content = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join("");
        } else if (block.type === "numbered_list_item" && block.numbered_list_item.rich_text) {
          content = block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join("");
        } else if (block.type === "callout" && block.callout.rich_text) {
          content = block.callout.rich_text.map((t: any) => t.plain_text).join("");
        }

        if (content) {
          // Keep newline separation for multiple blocks
          prompts[currentStep] += (prompts[currentStep] ? "\n\n" : "") + content;
        }
      }
    }

    return NextResponse.json({ prompts });
  } catch (error: any) {
    console.error("Notion API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
