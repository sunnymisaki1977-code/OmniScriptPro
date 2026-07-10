import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;

export async function POST(req: Request) {
  try {
    // 檢查環境變數
    if (!FEEDBACK_DB_ID) {
      return NextResponse.json({ error: "Missing NOTION_FEEDBACK_DB_ID" }, { status: 500 });
    }

    // 1. 解析前端傳來的回饋資料
    const { type, message, theme, email } = await req.json();

    // 🔍 【安插點】這行 log 會印在 Vercel 後台，用來檢查前端傳進來的內容
    console.log("[Vercel 後端偵錯] 收到前端傳來的回饋資料:", { type, message, theme, email }); 

    // 驗證必要欄位
    if (!type || !message) {
      return NextResponse.json({ error: "Type and message are required" }, { status: 400 });
    }

    // 2. 將資料寫入 Notion 資料庫
    await notion.pages.create({
      parent: { database_id: FEEDBACK_DB_ID },
      properties: {
        // Notion 資料庫預設的 title 欄位 (通常叫 Name)
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
      // 將詳細內容放在頁面內文 (blocks) 中
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
