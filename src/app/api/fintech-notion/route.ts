import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    const targetDatabaseId = process.env.NOTION_fintech_ID || "3cdf374300dc8033af23d63306769950";

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Parse category
    const categoryMatch = content?.match(/(?:主題分類)[：:]\s*(.*?)(?=\n|$)/);
    const categoryRaw = categoryMatch ? categoryMatch[1].trim() : "";
    
    // The select options in Notion are exact strings, we should try to match them exactly,
    // but typically Notion accepts creating new select options or matching if the text is identical.
    // We will just pass the parsed string. Let's make sure we include the number if it's there.
    let category = categoryRaw || "未分類";

    // Parse reason
    const reasonMatch = content?.match(/(?:判斷原因)[：:]\s*(.*?)(?=\n|$)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : "";

    // Parse executive summary
    const execSummaryMatch = content?.match(/(?:執行摘要\s*\(TL;DR\)|執行摘要)[^]*?(?:市場痛點破題[：:]\s*([^\n]+)|(?:\n(?!#).*?)*)/i);
    // Actually, maybe a simpler regex for summary: everything between "執行摘要 (TL;DR)" and the next "###" or empty line
    const execSummaryRegex = /(?:一、\s*執行摘要\s*\(TL;DR\))([^]*?)(?:### 二、|$)/;
    const summaryMatch = content?.match(execSummaryRegex);
    let summary = "";
    if (summaryMatch) {
      summary = summaryMatch[1].replace(/市場痛點破題：|當前數據\/政策現況：/g, '').trim().substring(0, 1500); // Notion rich_text limit is 2000 per block
    } else {
        // Fallback to grab a few lines after "執行摘要"
        const altMatch = content?.match(/執行摘要(?:.*)\n([^]*?)(?=\n\n|\n#|$)/);
        if (altMatch) summary = altMatch[1].trim();
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
      }
    };

    if (category) {
      properties["主題分類"] = {
        select: {
          name: category,
        },
      };
    }

    if (reason) {
      properties["判斷原因"] = {
        rich_text: [
          {
            text: { content: reason },
          },
        ],
      };
    }
    
    if (summary) {
      properties["執行摘要"] = {
        rich_text: [
          {
            text: { content: summary },
          },
        ],
      };
    }

    const response = await notion.pages.create({
      parent: { database_id: targetDatabaseId },
      properties: properties,
    });

    return NextResponse.json({ success: true, url: (response as any).url });
  } catch (error: any) {
    console.error("Error creating Notion page:", error.body || error);
    return NextResponse.json(
      { error: "Failed to create Notion page", details: error.message },
      { status: 500 }
    );
  }
}
