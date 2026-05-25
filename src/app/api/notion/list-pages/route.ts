import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export async function GET() {
  if (!databaseId) {
    return NextResponse.json({ error: "NOTION_DATABASE_ID is not configured" }, { status: 500 });
  }

  try {
    // We remove the filter temporarily to ensure we can at least reach the database
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          timestamp: "last_edited_time",
          direction: "descending",
        },
      ],
    });

    const pages = response.results.map((page: any) => {
      // Robust title finding: look for any property of type 'title'
      const titleProperty = Object.values(page.properties).find(
        (p: any) => p.type === "title"
      ) as any;
      
      const title = titleProperty?.title?.[0]?.plain_text || "無標題";
      
      return {
        id: page.id,
        title: title,
      };
    });

    return NextResponse.json({ pages });
  } catch (error: any) {
    console.error("Notion API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
