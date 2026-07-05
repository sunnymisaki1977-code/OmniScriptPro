import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;

export async function POST(req: Request) {
  try {
    if (!FEEDBACK_DB_ID) {
      return NextResponse.json({ error: "Missing NOTION_FEEDBACK_DB_ID" }, { status: 500 });
    }

    const { type, message, theme, email } = await req.json();

    if (!type || !message) {
      return NextResponse.json({ error: "Type and message are required" }, { status: 400 });
    }

    await notion.pages.create({
      parent: { database_id: FEEDBACK_DB_ID },
      properties: {
        Message: {
          title: [
            {
              text: {
                content: message,
              },
            },
          ],
        },
        Type: {
          select: {
            name: type,
          },
        },
        Theme: {
          rich_text: [
            {
              text: {
                content: theme || 'Unknown',
              },
            },
          ],
        },
        Email: {
          email: email || null,
        },
        Status: {
          select: {
            name: 'New',
          },
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to submit feedback to Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
