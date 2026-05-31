import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const pageId = formData.get("pageId") as string;
    const accessToken = formData.get("accessToken") as string;
    const message = formData.get("message") as string;
    const image = formData.get("image") as File;

    if (!pageId || !accessToken || !message || !image) {
      return NextResponse.json({ error: "Missing required fields (pageId, accessToken, message, image)" }, { status: 400 });
    }

    // Prepare form data for Facebook Graph API
    const fbFormData = new FormData();
    fbFormData.append("access_token", accessToken);
    fbFormData.append("message", message);
    fbFormData.append("source", image);

    const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/photos`, {
      method: "POST",
      body: fbFormData,
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return NextResponse.json({ success: true, id: data.id, post_id: data.post_id });
  } catch (error: any) {
    console.error("Facebook API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to post to Facebook" }, { status: 500 });
  }
}
