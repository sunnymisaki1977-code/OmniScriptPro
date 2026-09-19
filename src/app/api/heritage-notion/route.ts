import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    const targetDatabaseId = process.env.NOTION_heritage_ID || "3e0f374300dc80a69293fe3cd5f5d121";

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Parse category
    const categoryMatch = content?.match(/(?:主題分類|分類)[：:]\s*(.*?)(?=\n|$)/);
    const category = categoryMatch ? categoryMatch[1].trim() : "未分類";

    // Parse birthday
    let birthday = "";
    const birthdayMatch = content?.match(/(?:重要聖誕與重要節慶|聖誕千秋|農曆)[：:]?\s*([^\n]*?(?:農曆|初|十)[^\n]*)/);
    if (birthdayMatch) {
      birthday = birthdayMatch[1].trim();
    }
    
    // Fallback for birthday if it wasn't matched well
    if (!birthday) {
        const altBirthdayMatch = content?.match(/聖誕(?:千秋)?[：:]\s*(.*?)(?=\n|$)/);
        if (altBirthdayMatch) {
            birthday = altBirthdayMatch[1].trim();
        }
    }

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
      },
      "類型": {
        select: {
          name: category,
        },
      }
    };

    if (birthday) {
      properties["聖誕"] = {
        rich_text: [
          {
            text: { content: birthday },
          },
        ],
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: targetDatabaseId },
      properties: properties,
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error: any) {
    console.error("Heritage Notion API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save to Notion" }, { status: 500 });
  }
}
