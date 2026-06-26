import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

export async function GET(req: Request) {
  try {
    if (!DATABASE_ID) {
      return NextResponse.json({ error: "Notion Database ID is missing" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("id");

    // 若有傳入 ID，代表要讀取該筆頁面的詳細內容 (還原 stepsData)
    if (pageId) {
      const blocksResponse = await notion.blocks.children.list({ block_id: pageId });
      
      const stepsData: Record<number, string> = {};
      let currentStepId = 0;

      for (const block of blocksResponse.results as any[]) {
        if (block.type === "heading_2") {
          const text = block.heading_2.rich_text.map((rt: any) => rt.plain_text).join("");
          const match = text.match(/Step (\d+):/);
          if (match) {
            currentStepId = parseInt(match[1]);
          }
        } else if (currentStepId > 0) {
          if (block.type === "paragraph") {
            const text = block.paragraph.rich_text.map((rt: any) => rt.plain_text).join("");
            stepsData[currentStepId] = stepsData[currentStepId] ? stepsData[currentStepId] + "\n\n" + text : text;
          } else if (block.type === "quote") {
            const text = block.quote.rich_text.map((rt: any) => rt.plain_text).join("");
            // quote blocks are chunked, we can join them without extra newlines if they are continuous
            stepsData[currentStepId] = stepsData[currentStepId] ? stepsData[currentStepId] + text : text;
          }
        }
      }
      
      return NextResponse.json({ id: pageId, stepsData });
    }

    // 否則，讀取最近 10 筆清單
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      page_size: 10,
    });

    const history = response.results.map((page: any) => {
      const titleProp = page.properties.Name || page.properties.title;
      let title = "未命名";
      if (titleProp && titleProp.title && titleProp.title.length > 0) {
        title = titleProp.title[0].plain_text;
      }
      return {
        id: page.id,
        title: title,
        createdAt: page.created_time,
      };
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("Notion API Error:", error);
    return NextResponse.json({ error: error.message || "讀取 Notion 失敗" }, { status: 500 });
  }
}
