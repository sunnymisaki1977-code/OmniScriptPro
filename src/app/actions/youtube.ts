"use server";

export async function getChannelStats() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    console.warn("Missing YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID in environment variables");
    return null;
  }

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`, {
      next: { revalidate: 3600 } // ISR Cache: 1 小時重新驗證一次，避免頻繁呼叫超過限制
    });
    
    if (!res.ok) {
      console.error("YouTube API fetching failed with status:", res.status);
      return null;
    }

    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].statistics; // contains subscriberCount, viewCount, videoCount
    }
    return null;
  } catch (error) {
    console.error("Error fetching YouTube stats:", error);
    return null;
  }
}
