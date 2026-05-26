import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const HANDLE = "@GenImprint"; // 您的頻道句柄

  if (!API_KEY) {
    return NextResponse.json({ error: "YouTube API Key is missing" }, { status: 500 });
  }

  try {
    // 1. 先用 Handle 找出 Channel ID (使用 search 或 channels?forHandle)
    // 注意：v3 API 目前支援 forHandle 參數
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${HANDLE}&key=${API_KEY}`,
      { cache: 'no-store' }
    );
    const channelData = await channelRes.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const stats = channelData.items[0].statistics;
    
    // 格式化數據
    return NextResponse.json({
      subscribers: parseInt(stats.subscriberCount).toLocaleString(),
      videos: stats.videoCount,
      views: (parseInt(stats.viewCount) / 1000).toFixed(1) + "K",
      title: channelData.items[0].snippet.title,
    });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json({ error: "Failed to fetch YouTube stats" }, { status: 500 });
  }
}
