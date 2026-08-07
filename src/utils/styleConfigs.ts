export interface StyleOption {
  id: string;
  name: string;
  promptSuffix: string;
}

export const AUDIENCE_STYLES: Record<string, StyleOption> = {
  heritage: {
    id: "style-heritage",
    name: "東方古典美學 (水墨工筆)",
    promptSuffix: ", colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed,"
  },
  beauty: {
    id: "style-beauty",
    name: "高訂雜誌寫實 (微距極簡)",
    promptSuffix: ", premium editorial beauty photography, macro shot, flawless skin texture, elegant studio softbox lighting, soft neutral background, minimalist makeup aesthetic, commercial cosmetics lighting, 8k resolution"
  },
  travelpreneur: {
    id: "style-travel",
    name: "電影級廣角紀實 (探索感)",
    promptSuffix: ", cinematic travel photography, shot on 35mm lens, golden hour natural light, dynamic wide-angle landscape, national geographic style, high-contrast storytelling depth"
  },
  food: {
    id: "style-food",
    name: "頂級私廚攝影 (食慾感)",
    promptSuffix: ", professional commercial food photography, macro shot, glistening texture, delicate steam, shallow depth of field, warm cozy bokeh background, dark moody table setting, hyper-realistic food styling"
  },
  historyMeme: {
    id: "style-history",
    name: "復古漫畫排版 (浮世迷因)",
    promptSuffix: ", retro manga pop-art illustration style, bold ink outline, halftones patterns, dynamic movement lines, high-contrast vintage colors, graphic novel aesthetics, expressive and funny"
  },
  pet: {
    id: "style-pet",
    name: "溫暖居家療癒 (毛髮蓬鬆)",
    promptSuffix: ", heartwarming interior pet photography, soft cozy lighting, high-key pastel color palette, fluffy dog fur details, joyful companion emotion, warm family atmosphere, 50mm lens f/1.8"
  },
  fintech: {
    id: "style-fintech",
    name: "FinTech 財經量化 (彭博全息)",
    promptSuffix: ", holographic stock charts, neon glowing lines, professional Bloomberg terminal aesthetic, corporate blue and gold accents, data visualization, cinematic lighting, ultra detailed, large bold financial typography,"
  }
};

export const POPULAR_STYLES: StyleOption[] = [
  {
    id: "style-fintech",
    name: "FinTech 財經量化 (彭博全息)",
    promptSuffix: ", holographic stock charts, neon glowing lines, professional Bloomberg terminal aesthetic, corporate blue and gold accents, data visualization, cinematic lighting, ultra detailed, large bold financial typography,"
  },
  {
    id: "style-heritage",
    name: "東方古典美學 (水墨工筆)",
    promptSuffix: ", colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed,"
  },

 {
    id: "style-cyber",
    name: "3D 賽博龐克 (霓虹電競)",
    promptSuffix: ", 3d render, octane render, cyberpunk, neon lighting, futuristic, highly detailed, 8k"
  },
  {
    id: "style-anime",
    name: "日系手繪動漫 (新海誠風)",
    promptSuffix: ", makoto shinkai style, anime illustration, vivid colors, beautiful sky, cinematic lighting, highly detailed"
  },
  {
    id: "style-minimal",
    name: "北歐寫實極簡 (生活感)",
    promptSuffix: ", Scandinavian minimalist photography, natural daylight, soft shadows, clean aesthetic, realistic, 8k"
  },
  {
    id: "style-vibrant-ink",
    name: "現代高飽和彩墨",
    promptSuffix: ", vibrant jewel-toned ink wash, background for high contrast, glowing golden particles, neon-like spiritual energy flow, eastern fantasy, gold flowing accents, dynamic composition, extreme color saturation, cinematic volumetric lighting, 8k resolution, ultra detailed"
  },
  {
    id: "style-highly-saturated-ink",
    name: "現代高彩度彩墨",
    promptSuffix: ", highly saturated color ink wash, vivid and bold color palette, brilliant pigment diffusion, glowing golden particles, dynamic energy flow, eastern fantasy, luminous gold accents, eastern mythology, intense spiritual energy, vibrant cinematic volumetric lighting, high contrast, ultra detailed, masterpiece"
  },
  {
    id: "style-seasonal-aesthetic",
    name: "現代季節美學",
    promptSuffix: ", highly saturated seasonal color palette, luminous lighting, vibrant dynamic ink wash, nature energy flow, rich environmental contrast, ethereal beauty, cinematic depth of field, 8k"
  }
];
