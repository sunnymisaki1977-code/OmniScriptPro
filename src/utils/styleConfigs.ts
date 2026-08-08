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
  },
  "fairy tales": {
    id: "style-fairytales",
    name: "奇幻童話繪本 (皮克斯 3D)",
    promptSuffix: ", cute 3D animation style, Pixar and Disney style, vibrant colors, magical glowing effects, soft studio lighting, adorable characters, fairytale setting, highly detailed, beautiful children's book illustration"
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
    id: "style-golden-dawn-ink",
    name: "Golden Dawn (晨曦金墨)",
    promptSuffix: ", light and warm color ink wash, delicate line-art background composition, ethereal bright atmosphere, radiant morning glow, divine warm golden sunlight, glowing amber and peach energy flow, eastern fantasy, luminous gold accents, uplifting and hopeful mood, soft cinematic volumetric lighting, 8k resolution, ultra detailed"
  },



 {
    id: "style-vivid-divine-ink",
    name: "絢麗神輝彩墨",
    // 移除了 high contrast 和 intense，加入 soft warm glow
    promptSuffix: ", highly saturated color ink wash, vivid and bold warm color palette, brilliant pigment diffusion, glowing golden particles, gentle dynamic energy flow, eastern fantasy, luminous gold accents, eastern mythology, uplifting spiritual energy, vibrant cinematic volumetric lighting, soft warm glow, ultra detailed, masterpiece"
  },
{
    id: "style-radiant-dawn-ink", // 改個名字比較符合修改後的感覺
    name: "晨曦流光水墨",
    // 移除了 jewel-toned 和 neon-like，改為 warm pastel 和 divine light
    promptSuffix: ", warm pastel-toned ink wash, delicate line-art background composition, glowing golden particles, divine light spiritual energy flow, eastern fantasy, gold flowing accents, dynamic composition, vibrant but soft color saturation, cinematic volumetric lighting, radiant morning glow, 8k resolution, ultra detailed"
  }, 
  {
    id: "style-luminous-nature-ink",
    name: "萬物生機彩墨",
    // 加入了 warm sunlight，並將對比改為柔和過渡
    promptSuffix: ", highly saturated warm seasonal color palette, warm sunlight luminous lighting, vibrant dynamic ink wash, uplifting nature energy flow, soft environmental transition, ethereal beauty, cinematic depth of field, hopeful atmosphere, 8k"
  },
 {
    id: "style-cyber",
    name: "3D 賽博龐克 (霓虹電競)",
    promptSuffix: ", 3d render, octane render, cyberpunk, neon lighting, futuristic, highly detailed, 8k"
  },
  {
    id: "style-anime",
    name: "日系手繪動漫 (新海誠風)",
    promptSuffix: ", makoto shinkai style, dramatic breathtaking sky, volumetric cumulonimbus clouds, vibrant saturated color palette, cinematic lens flare, crepuscular rays, crystal clear water reflections, highly detailed anime illustration, romantic and ethereal atmosphere, 8k resolution, masterpiece"
  },
 {
    id: "style-jianlai-3d",
    name: "3D仙俠國漫 (劍來風)",
    promptSuffix: ", 3D Donghua style, Chinese Xianxia animation, Unreal Engine 5 render, octane render, intricate traditional Chinese clothing, epic eastern fantasy, flying swords and magical energy, dramatic cinematic lighting, ray tracing, 8k resolution, ultra-detailed CGI"
  },
{
    id: "style-xianxia-2d",
    name: "2D唯美仙俠 (國風插畫)",
    promptSuffix: ", gorgeous Chinese style illustration, wuxia anime style, flowing traditional clothes, epic eastern fantasy landscape, delicate facial features, vivid colors, ethereal lighting, masterpiece, high quality"
  },
{
    id: "style-wushan-ink",
    name: "狂草水墨武俠 (霧山風)",
    promptSuffix: ", fierce Chinese ink wash painting style, bold brushstrokes, dynamic wuxia action, vivid splashes of color, traditional pigments, high contrast ink, epic battle atmosphere, masterpiece, 8k"
  },
{
    id: "style-baimiao-lineart",
    name: "國風白描線條 (純粹質感)",
    promptSuffix: ", traditional Chinese Bai Miao style, delicate line-art background composition, elegant black ink lines, minimalist coloring, ethereal and clean atmosphere, focused on line weight and fluidity, serene mood, highly detailed line work"
  }, 
{
    id: "style-dunhuang-mural",
    name: "敦煌壁畫志怪 (奇譚風)",
    promptSuffix: ", Dunhuang mural art style, traditional Chinese folk art, flat colors, ancient folklore atmosphere, textured paper background, oxidized mineral pigments, mysterious and mythical mood, 2D flat illustration"
  },

{
    id: "style-minimal",
    name: "北歐寫實極簡 (生活感)",
    promptSuffix: ", Scandinavian minimalist photography, natural daylight, soft shadows, clean aesthetic, realistic, 8k"
  }

];
