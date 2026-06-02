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

    const imageUrls: string[] = [];

    for (const block of blocks) {
      if (block.type === "image") {
        if (block.image.type === "external" && block.image.external.url) {
          imageUrls.push(block.image.external.url);
        } else if (block.image.type === "file" && block.image.file.url) {
          imageUrls.push(block.image.file.url);
        }
      } else if (block.type === "bookmark" && block.bookmark.url) {
        imageUrls.push(block.bookmark.url);
      }
    }

    return NextResponse.json({ images: imageUrls });
  } catch (error: any) {
    console.error("Notion API Error (get-images):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
