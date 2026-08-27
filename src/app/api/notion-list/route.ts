import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dbType = searchParams.get('db'); // 'god' or 'solar'

    let databaseId = "";
    if (dbType === 'god') {
      databaseId = process.env.NOTION_GOD_ID || "3bdf374300dc80c7a2c5ecbcd3e58eba";
    } else if (dbType === 'solar') {
      databaseId = process.env.NOTION_Solar_ID || "3bdf374300dc801d9fe4c5fdfd4c7d37";
    }

    if (!databaseId) {
      return NextResponse.json({ error: "Invalid or missing database ID" }, { status: 400 });
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
    });

    const items = response.results.map((page: any) => {
      const titleProp = Object.values(page.properties).find((prop: any) => prop.type === 'title');
      let title = "未命名";
      if (titleProp && (titleProp as any).title.length > 0) {
        title = (titleProp as any).title[0].plain_text;
      }
      return { id: page.id, title };
    }).filter(item => item.title !== "未命名");

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error("Notion List API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch Notion list" }, { status: 500 });
  }
}
