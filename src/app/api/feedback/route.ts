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
        // Notion 資料庫預設都會有一個 title 類型的欄位 (通常叫 Name)
        // 為了避免使用者沒有建立特定欄位而報錯，我們將主要標題放在這裡
        Name: {
          title: [
            {
              text: {
                content: `[${type}] 新回饋 - ${theme || 'Unknown'}`,
              },
            },
          ],
        },
      },
      // 將詳細內容放在頁面內文 (blocks) 中，這樣就不需要依賴特定的資料庫欄位
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: '回饋內容' } }],
          },
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: message } }],
          },
        },
        {
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: '詳細資訊' } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: `類型 (Type): ${type}` } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: `受眾模組 (Theme): ${theme || 'Unknown'}` } }],
          },
        },
        {
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: `聯絡信箱 (Email): ${email || '未提供'}` } }],
          },
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to submit feedback to Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
