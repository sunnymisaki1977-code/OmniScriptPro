import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const pageId = formData.get("pageId") as string;
    const file = formData.get("file") as File;
    const stepName = formData.get("stepName") as string || "視覺圖"; // fallback

    if (!pageId || !file) {
      return NextResponse.json({ error: "Missing pageId or file" }, { status: 400 });
    }

    const apiKey = process.env.NOTION_API_KEY;
    const version = "2022-06-28";

    // 1. Create upload session
    const createRes = await fetch("https://api.notion.com/v1/file_uploads", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": version,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });
    
    const createData = await createRes.json();
    if (!createRes.ok) {
      throw new Error(createData.message || "Failed to create Notion file upload session");
    }

    const uploadUrl = createData.upload_url;
    const fileId = createData.id;

    // 2. Send file
    // Prepare a new FormData specifically for Notion upload
    const uploadFormData = new FormData();
    uploadFormData.append("file", file, file.name);

    const sendRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": version
      },
      body: uploadFormData
    });
    
    const sendData = await sendRes.json();
    if (!sendRes.ok) {
      throw new Error(sendData.message || "Failed to send file to Notion");
    }

    // 3. Attach block to page
    const attachRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": version,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        children: [
          {
            object: "block",
            type: "heading_3",
            heading_3: {
              rich_text: [{ type: "text", text: { content: stepName } }]
            }
          },
          {
            object: "block",
            type: "image",
            image: {
              type: "file_upload",
              file_upload: {
                id: fileId
              }
            }
          }
        ]
      })
    });
    
    const attachData = await attachRes.json();
    if (!attachRes.ok) {
      throw new Error(attachData.message || "Failed to attach image block to Notion page");
    }

    return NextResponse.json({ success: true, message: "File uploaded and attached to Notion" });
  } catch (error: any) {
    console.error("Notion Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
