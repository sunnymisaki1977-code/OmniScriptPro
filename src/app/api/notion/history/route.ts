import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { THEME_STEPS } from "@/utils/themeConfig";

export const dynamic = 'force-dynamic';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

export async function GET(req: Request) {
  try {
    if (!DATABASE_ID) {
      return NextResponse.json({ error: "Notion Database ID is missing" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const pageId = searchParams.get("id");

    // 若有傳入 ID，代表要讀取該筆頁面的詳細內容 (還原 stepsData)
    if (pageId) {
      const blocksResponse = await notion.blocks.children.list({ block_id: pageId });
      
      const stepsData: Record<number, string> = {};
      let currentStepId = 0;
      let firstStepTitle = "";
      let audienceThemeFromNotion = null;

      for (const block of blocksResponse.results as any[]) {
        if (block.type === "paragraph") {
           const text = block.paragraph.rich_text.map((rt: any) => rt.plain_text).join("");
           const themeMatch = text.match(/\[AudienceTheme:\s*([a-zA-Z0-9_]+)\]/);
           if (themeMatch) {
             audienceThemeFromNotion = themeMatch[1];
           }
        }
        
        if (block.type === "heading_2") {
          const text = block.heading_2.rich_text.map((rt: any) => rt.plain_text).join("");
          const match = text.match(/Step (\d+):\s*(.*)/);
          if (match) {
            currentStepId = parseInt(match[1]);
            if (currentStepId === 1) {
                firstStepTitle = match[2].trim();
            }
          }
        } else if (currentStepId > 0) {
          const typeData = block[block.type];
          if (typeData && typeData.rich_text) {
            const text = typeData.rich_text.map((rt: any) => rt.plain_text).join("");
            
            let prefix = "";
            if (block.type === "bulleted_list_item") prefix = "- ";
            else if (block.type === "numbered_list_item") prefix = "1. ";
            else if (block.type === "heading_1") prefix = "# ";
            else if (block.type === "heading_2") prefix = "## ";
            else if (block.type === "heading_3") prefix = "### ";
            
            const contentToAdd = prefix + text;
            
            if (block.type === "quote") {
              stepsData[currentStepId] = stepsData[currentStepId] ? stepsData[currentStepId] + contentToAdd : contentToAdd;
            } else {
              stepsData[currentStepId] = stepsData[currentStepId] ? stepsData[currentStepId] + "\n\n" + contentToAdd : contentToAdd;
            }
          }
        }
      }
      
      // 反向工程：從 Step 1 的標題推斷 audienceTheme (為了相容舊的 Notion 存檔)
      if (!audienceThemeFromNotion && firstStepTitle) {
          for (const [key, steps] of Object.entries(THEME_STEPS)) {
              if (steps[0] && steps[0].name === firstStepTitle) {
                  audienceThemeFromNotion = key;
                  break;
              }
          }
      }
      
      return NextResponse.json({ id: pageId, stepsData, audienceTheme: audienceThemeFromNotion });
    }

    // 否則，讀取最近 10 筆清單
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
      page_size: 10,
    });

    const history = response.results.map((page: any) => {
      const titleProp = page.properties.Name || page.properties.title;
      let title = "未命名";
      if (titleProp && titleProp.title && titleProp.title.length > 0) {
        title = titleProp.title[0].plain_text;
      }
      return {
        id: page.id,
        title: title,
        createdAt: page.created_time,
      };
    });

    return NextResponse.json({ history });
  } catch (error: any) {
    console.error("Notion API Error:", error);
    return NextResponse.json({ error: error.message || "讀取 Notion 失敗" }, { status: 500 });
  }
}
