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

    const payload = await req.json();
    console.log("[Vercel 後端偵錯] 收到表單資料:", payload.formType || 'feedback', payload); 

    // 建立 Notion Block 結構
    const childrenBlocks: any[] = [];

    const addHeading = (text: string) => {
      childrenBlocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: text } }] }
      });
    };

    const addHeading3 = (text: string) => {
      childrenBlocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: text } }] }
      });
    };

    const addText = (text: string) => {
      childrenBlocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: text || "未填寫" } }] }
      });
    };

    let pageTitle = '';

    if (payload.formType === 'application') {
      // ==========================================
      // 處理「封測申請表單」 (Application Form)
      // ==========================================
      pageTitle = `[封測申請] ${payload.name || '未具名'} - ${payload.email || ''}`;

      addHeading("第一區塊：基本身份與戰場確認");
      addHeading3("稱呼 / 品牌名稱");
      addText(payload.name);
      addHeading3("聯絡信箱 (Email)");
      addText(payload.email);
      addHeading3("主力發布平台");
      addText(Array.isArray(payload.platforms) ? payload.platforms.join(", ") : payload.platforms);
      addHeading3("頻道 / 社群 / 網站連結");
      addText(payload.link);

      addHeading("第二區塊：痛點與 AI 熟悉度");
      addHeading3("最感到心力交瘁的環節");
      addText(Array.isArray(payload.painPoints) ? payload.painPoints.join("\n") : payload.painPoints);
      addHeading3("熟悉或經常使用的 AI 工具");
      addText(Array.isArray(payload.aiTools) ? payload.aiTools.join("\n") : payload.aiTools);

      addHeading("第三區塊：資源對接與承諾");
      addHeading3("關於 API 金鑰與用量意願");
      addText(payload.apiKey);
      addHeading3("最希望 OmniScript PRO 解決什麼問題");
      addText(payload.goal);

    } else {
      // ==========================================
      // 處理「封測回饋問卷」 (Feedback Form)
      // ==========================================
      const { theme, audience, usage, satisfaction, painPoint, bugReport, designFeel, wowFeature, nps, wishlist } = payload;
      pageTitle = `[封測回饋] ${theme || 'General'}`;

      addHeading("1. 受眾輪廓與使用場景");
      addText(`創作領域: ${audience}`);
      addText(`主要使用內容: ${Array.isArray(usage) ? usage.join(", ") : usage}`);
      
      addHeading("2. 核心功能滿意度 (1-5分)");
      if (satisfaction) {
        addText(`一鍵全自動模式: ${satisfaction.auto} 分`);
        addText(`分步編輯工作流: ${satisfaction.workflow} 分`);
        addText(`視覺中心: ${satisfaction.visual} 分`);
        addText(`工具整合實用性: ${satisfaction.integration} 分`);
      } else {
        addText("未填寫");
      }

      addHeading("3. 體驗痛點與 Bug 回報");
      addHeading3("最困惑的環節");
      addText(painPoint);
      addHeading3("Bug 回報");
      addText(bugReport);
      addHeading3("介面設計與視覺風格感受");
      addText(designFeel);

      addHeading("4. 產品價值與未來期待");
      addHeading3("最驚豔或省時的功能");
      addText(wowFeature);
      addHeading3("NPS 推薦意願 (0-10)");
      addText(nps !== null && nps !== undefined ? `${nps} 分` : "未填寫");
      addHeading3("許願池 (優先新增或改善)");
      addText(wishlist);
    }

    // 將資料寫入 Notion 資料庫
    await notion.pages.create({
      parent: { database_id: FEEDBACK_DB_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: pageTitle,
              },
            },
          ],
        },
      },
      children: childrenBlocks,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to submit form to Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
