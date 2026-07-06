

const API_KEY = process.env.YOUTUBE_API_KEY;
const playlists = [
  "PLS7BJQ4awAeM",
  "PL0WZUXr5VzkfAeqC9BCtya9yRVCfyimyC",
  "PLC-IrJAPGBww",
  "PLA1T_pcDfevM",
  "PLF3eQyAQueV4",
  "PLCaj4rNP2njM"
];

async function getFirstVideoIds() {
  for (const pid of playlists) {
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${pid}&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        console.log(`Playlist: ${pid} -> VideoID: ${data.items[0].snippet.resourceId.videoId}`);
      } else {
        console.log(`Playlist: ${pid} -> No videos found or Error:`, data);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

getFirstVideoIds();
