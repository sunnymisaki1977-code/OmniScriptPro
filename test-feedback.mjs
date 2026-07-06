import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const FEEDBACK_DB_ID = process.env.NOTION_FEEDBACK_DB_ID;

async function test() {
  try {
    const res = await notion.pages.create({
      parent: { database_id: FEEDBACK_DB_ID },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: `[Suggestion] 新回饋 - Unknown`,
              },
            },
          ],
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: "Test message" } }],
          },
        }
      ],
    });
    console.log("Success! Page ID:", res.id);
  } catch (error) {
    console.error("Notion API Error:", error.body ? error.body : error);
  }
}

test();
