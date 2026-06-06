import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const LOG_DATABASE_ID = "377cf7781506809e98d5f1163b1067d5";

export async function GET() {
  try {
    if (!LOG_DATABASE_ID) {
      return NextResponse.json({ error: "Log Database ID missing" }, { status: 500 });
    }

    const response = await notion.databases.query({
      database_id: LOG_DATABASE_ID,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      page_size: 20, // fetch the latest 20 activities
    });

    const activities = response.results.map((page: any) => {
      // Find the title property (usually named "Name" or "title")
      const titlePropKey = Object.keys(page.properties).find(
        (key) => page.properties[key].type === "title"
      );
      
      let message = "未知的活動";
      if (titlePropKey && page.properties[titlePropKey].title.length > 0) {
        message = page.properties[titlePropKey].title[0].plain_text;
      }

      return {
        id: page.id,
        message,
        createdAt: page.created_time,
      };
    });

    return NextResponse.json({ activities });
  } catch (error: any) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
