import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;

export async function POST(req: Request) {
  try {
    if (!FEEDBACK_DB_ID) {
      return NextResponse.json({ error: "Missing NOTION_FEEDBACK_DB_ID" }, { status: 500 });
    }

    const payload = await req.json();
    const isApplication = payload.formType === 'application';

    console.log(`[Vercel 後端偵錯] 收到${isApplication ? '封測申請' : '問卷回饋'}資料`); 

    const childrenBlocks: any[] = [];
    const addHeading = (text: string) => {
      childrenBlocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: text } }] }
      });
    };
    const addSubHeading = (text: string) => {
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

    if (isApplication) {
      // --- 封測申請表單排版 ---
      const { name, email, platforms, link, painPoints, aiTools, apiKey, goal } = payload;
      
      addHeading("1. 基本身份與戰場確認");
      addText(`稱呼/品牌名稱: ${name}`);
      addText(`聯絡信箱: ${email}`);
      addText(`主力發布平台: ${Array.isArray(platforms) ? platforms.join(", ") : platforms}`);
      addText(`頻道/社群/網站連結: ${link}`);

      addHeading("2. 痛點與 AI 熟悉度");
      addSubHeading("最心力交瘁的環節");
      addText(Array.isArray(painPoints) ? painPoints.join("\n") : painPoints);
      
      addSubHeading("熟悉的 AI 工具");
      addText(Array.isArray(aiTools) ? aiTools.join(", ") : aiTools);

      addHeading("3. 資源對接與承諾");
      addSubHeading("API 金鑰意願");
      addText(apiKey);
      
      addSubHeading("最希望解決的問題");
      addText(goal);
    } else {
      // --- 意見回饋問卷排版 ---
      const { theme, audience, usage, satisfaction, painPoint, bugReport, designFeel, wowFeature, nps, wishlist } = payload;
      
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
      addSubHeading("最困惑的環節");
      addText(painPoint);
      addSubHeading("Bug 回報");
      addText(bugReport);
      addSubHeading("介面設計與視覺風格感受");
      addText(designFeel);

      addHeading("4. 產品價值與未來期待");
      addSubHeading("最驚豔或省時的功能");
      addText(wowFeature);
      addSubHeading("NPS 推薦意願 (0-10)");
      addText(nps !== null ? `${nps} 分` : "未填寫");
      addSubHeading("許願池 (優先新增或改善)");
      addText(wishlist);
    }

    const titleText = isApplication 
      ? `[封測申請] ${payload.name || 'Unknown'}` 
      : `[封測回饋] ${payload.theme || 'General'}`;

    await notion.pages.create({
      parent: { database_id: FEEDBACK_DB_ID },
      properties: {
        Name: {
          title: [{ text: { content: titleText } }],
        },
      },
      children: childrenBlocks,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to submit to Notion:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
