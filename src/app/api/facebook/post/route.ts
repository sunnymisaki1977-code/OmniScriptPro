import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { pageId, accessToken, message, imageUrl } = await req.json();

    if (!pageId || !accessToken || !message || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields (pageId, accessToken, message, imageUrl)" }, { status: 400 });
    }

    // Check if the URL is an image file
    const isImage = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(imageUrl);

    // Prepare form data for Facebook Graph API
    const fbFormData = new URLSearchParams();
    fbFormData.append("access_token", accessToken);
    fbFormData.append("message", message);
    
    let endpoint = "";
    if (isImage) {
      fbFormData.append("url", imageUrl); // Send URL directly to FB for photos
      endpoint = `https://graph.facebook.com/v19.0/${pageId}/photos`;
    } else {
      fbFormData.append("link", imageUrl); // Send as a link post
      endpoint = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      body: fbFormData,
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, id: data.id, post_id: data.post_id });
  } catch (error: any) {
    console.error("Facebook API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to post to Facebook" }, { status: 500 });
  }
}
