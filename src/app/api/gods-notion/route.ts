import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = "3a483ac4203780c89a41d8f53601c864";

export async function POST(req: Request) {
  try {
    const { cards } = await req.json();

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "Missing cards array" }, { status: 400 });
    }

    const savedPages = [];

    for (const card of cards) {
      const children: any[] = [
        {
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [{ type: "text", text: { content: `[${card.organization}] ${card.title}` } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: card.desc } }],
          },
        },
        {
          object: "block",
          type: "quote",
          quote: {
            rich_text: [{ type: "text", text: { content: card.poem } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: `標籤: ${card.tags?.map((t: string) => `#${t}`).join(' ')}` } }],
          },
        },
        {
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [{ type: "text", text: { content: "生成圖像 Prom" } }],
          },
        },
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: card.imagePrompt } }],
          },
        },
      ];

      if (card.imageUrl) {
        children.push({
          object: "block",
          type: "image",
          image: {
            type: "external",
            external: { url: card.imageUrl }
          }
        });
      }

      const response = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties: {
          Name: { // Note: Assuming the default Title property is named 'Name'
            title: [
              {
                text: { content: card.name },
              },
            ],
          },
        },
        children: children,
      });

      savedPages.push(response.id);
    }

    return NextResponse.json({ success: true, savedPages });
  } catch (error: any) {
    console.error("Gods Notion API Error:", error);
    return NextResponse.json({ error: error.message || "儲存至 Notion 失敗" }, { status: 500 });
  }
}
