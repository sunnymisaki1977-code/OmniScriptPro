import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const LOG_DATABASE_ID = "377cf7781506809e98d5f1163b1067d5"; // The user-provided ID

export async function POST(req: Request) {
  try {
    const { user, action, theme } = await req.json();

    if (!LOG_DATABASE_ID) {
      return NextResponse.json({ error: "Log Database ID missing" }, { status: 500 });
    }

    // Format the log message, e.g. "Misaki 建立了一個新專案：【三國演義】"
    // Or we can just store the raw data in the Name property
    let logMessage = `${user} ${action}`;
    if (theme) {
      logMessage += `：【${theme}】`;
    }

    await notion.pages.create({
      parent: { database_id: LOG_DATABASE_ID },
      properties: {
        // Assuming the default title property is "Name" or "title", wait, 
        // Notion DB default title property is usually "Name". If it fails, it will throw an error.
        title: {
          title: [
            {
              text: {
                content: logMessage,
              },
            },
          ],
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to log activity:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
