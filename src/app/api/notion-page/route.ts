import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get('id');

    if (!pageId) {
      return NextResponse.json({ error: "Missing page ID" }, { status: 400 });
    }

    // Fetch page to get title (name)
    const page: any = await notion.pages.retrieve({ page_id: pageId });
    const titleProp = Object.values(page.properties).find((prop: any) => prop.type === 'title');
    let name = "未命名";
    if (titleProp && (titleProp as any).title.length > 0) {
      name = (titleProp as any).title[0].plain_text;
    }

    // Fetch blocks to parse content
    const blocksResponse = await notion.blocks.children.list({ block_id: pageId });
    const blocks = blocksResponse.results as any[];

    let organization = "";
    let title = "";
    let desc = "";
    let poem = "";
    let tags: string[] = [];
    let imagePrompt = "";
    let imageUrl = "";
    let solar_term = "";

    for (const block of blocks) {
      if (block.type === 'heading_2') {
        const text = block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
        const match = text.match(/^\[(.*?)\] (.*)$/);
        if (match) {
          organization = match[1];
          title = match[2];
        } else {
          title = text;
        }
      } else if (block.type === 'paragraph') {
        const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
        if (text.startsWith('標籤:')) {
          tags = text.replace('標籤:', '').split(' ').filter((t: string) => t.trim().startsWith('#')).map((t: string) => t.replace('#', '').trim());
        } else if (text.startsWith('主要祭典節氣:')) {
          solar_term = text.replace('主要祭典節氣:', '').trim();
        } else if (text.trim() && !desc && text !== '生成圖像 Prom') {
          desc = text;
        } else if (text.trim() && desc && imagePrompt === "" && text !== '生成圖像 Prom' && !text.startsWith('標籤:')) {
          // The prompt comes after the heading_3 usually, but could be caught here
          imagePrompt = text;
        }
      } else if (block.type === 'quote') {
        poem = block.quote.rich_text.map((t: any) => t.plain_text).join('');
      } else if (block.type === 'image') {
        if (block.image.type === 'external') {
          imageUrl = block.image.external.url;
        } else if (block.image.type === 'file') {
          imageUrl = block.image.file.url;
        }
      }
    }

    const card = {
      id: pageId,
      name,
      organization,
      title,
      desc,
      poem,
      tags,
      solar_term,
      imagePrompt,
      imageUrl,
      category: solar_term ? "宮廟" : "神佛/歷史人物" // basic guess
    };

    return NextResponse.json({ success: true, card });
  } catch (error: any) {
    console.error("Notion Page API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch Notion page" }, { status: 500 });
  }
}
