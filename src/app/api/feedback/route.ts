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

    // 1. 解析前端傳來的回饋資料 (完整問卷版)
    const { 
      theme, 
      audience, 
      usage, 
      satisfaction, 
      painPoint, 
      bugReport, 
      designFeel, 
      wowFeature, 
      nps, 
      wishlist 
    } = await req.json();

    // 🔍 【安插點】這行 log 會印在 Vercel 後台，用來檢查前端傳進來的內容
    console.log("[Vercel 後端偵錯] 收到問卷回饋資料:", { theme, audience }); 

    // 建立 Notion Block 結構
    const childrenBlocks: any[] = [];

    const addHeading = (text: string) => {
      childrenBlocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: text } }] }
      });
    };

    const addText = (text: string) => {
      childrenBlocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: text || "未填寫" } }] }
      });
    };

    // 1. 受眾輪廓與使用場景
    addHeading("1. 受眾輪廓與使用場景");
    addText(`創作領域: ${audience}`);
    addText(`主要使用內容: ${Array.isArray(usage) ? usage.join(", ") : usage}`);
    
    // 2. 核心功能滿意度
    addHeading("2. 核心功能滿意度 (1-5分)");
    if (satisfaction) {
      addText(`一鍵全自動模式: ${satisfaction.auto} 分`);
      addText(`分步編輯工作流: ${satisfaction.workflow} 分`);
      addText(`視覺中心: ${satisfaction.visual} 分`);
      addText(`工具整合實用性: ${satisfaction.integration} 分`);
    } else {
      addText("未填寫");
    }

    // 3. 體驗痛點與 Bug 回報
    addHeading("3. 體驗痛點與 Bug 回報");
    childrenBlocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: "最困惑的環節" } }] }
    });
    addText(painPoint);
    
    childrenBlocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: "Bug 回報" } }] }
    });
    addText(bugReport);
    
    childrenBlocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: "介面設計與視覺風格感受" } }] }
    });
    addText(designFeel);

    // 4. 產品價值與未來期待
    addHeading("4. 產品價值與未來期待");
    childrenBlocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: "最驚豔或省時的功能" } }] }
    });
    addText(wowFeature);
    
    childrenBlocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: "NPS 推薦意願 (0-10)" } }] }
    });
    addText(nps !== null ? `${nps} 分` : "未填寫");
    
    childrenBlocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: "許願池 (優先新增或改善)" } }] }
    });
    addText(wishlist);

    // 2. 將資料寫入 Notion 資料庫
    await notion.pages.create({
      parent: { database_id: FEEDBACK_DB_ID },
      properties: {
        // Notion 資料庫預設的 title 欄位 (通常叫 Name)
        Name: {
          title: [
            {
              text: {
                content: `[封測回饋] ${theme || 'General'}`,
              },
            },
          ],
        },
      },
      // 將詳細內容放在頁面內文 (blocks) 中
      children: childrenBlocks,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to submit feedback to Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
