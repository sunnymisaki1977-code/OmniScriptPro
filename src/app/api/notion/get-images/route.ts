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

    const images: { url: string; name: string }[] = [];
    let lastHeading = "";
    let imageCount = 1;

    for (const block of blocks) {
      if (block.type === "heading_3" && block.heading_3.rich_text?.length > 0) {
        lastHeading = block.heading_3.rich_text.map((t: any) => t.plain_text).join("");
      } else if (block.type === "heading_2" && block.heading_2.rich_text?.length > 0) {
        lastHeading = block.heading_2.rich_text.map((t: any) => t.plain_text).join("");
      } else if (block.type === "heading_1" && block.heading_1.rich_text?.length > 0) {
        lastHeading = block.heading_1.rich_text.map((t: any) => t.plain_text).join("");
      } else if (block.type === "image") {
        let url = "";
        if (block.image.type === "external" && block.image.external.url) {
          url = block.image.external.url;
        } else if (block.image.type === "file" && block.image.file.url) {
          url = block.image.file.url;
        }
        if (url) {
          images.push({ url, name: lastHeading || `Notion 圖像 ${imageCount}` });
          imageCount++;
          lastHeading = ""; // Reset heading after use
        }
      } else if (block.type === "bookmark" && block.bookmark.url) {
        images.push({ url: block.bookmark.url, name: lastHeading || `Notion 網址 ${imageCount}` });
        imageCount++;
        lastHeading = ""; // Reset heading after use
      }
    }

    return NextResponse.json({ images });
  } catch (error: any) {
    console.error("Notion API Error (get-images):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
