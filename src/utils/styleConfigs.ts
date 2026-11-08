export interface StyleOption {
  id: string;
  name: string;
  promptSuffix: string;
  description?: string;
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
  },
  proposal: {
    id: "style-proposal",
    name: "商業提案風格 (極簡專業)",
    promptSuffix: ", sleek modern corporate presentation style, minimalist infographic, clean typography, soft emerald green and white palette, professional corporate branding, highly detailed, high-end commercial aesthetic"
  },

edtech: {
    id: "style-edtech-flat",
    name: "現代幾何圖解 (扁平化教育)",
    promptSuffix: ", modern flat vector illustration, clean geometric shapes, bold and vibrant color palette, minimalist educational infographic style, smooth gradients, no outlines, corporate tech aesthetic, clean sans-serif typography layout, highly detailed, 8k resolution"
  },
  edtech_isometric: {
    id: "style-edtech-isometric",
    name: "3D 等距微縮 (系統拆解)",
    promptSuffix: ", 3D isometric illustration, stylized miniature diorama, clean bright studio lighting, soft pastel and corporate blue colors, educational tech aesthetic, intricate mechanical or structural details, octane render, clean line-art background configuration, 8k"
  },
  edtech_sketch: {
    id: "style-edtech-sketch",
    name: "學術手帳線稿 (筆記圖解)",
    promptSuffix: ", elegant academic sketch style, delicate clean line-art layout, blueprint or sketchbook aesthetic, minimal soft watercolor accents, warm paper texture, educational diagram, clear visual hierarchy, highly detailed, serene study atmosphere"
  }
};

export const POPULAR_STYLES: StyleOption[] = [
  {
    id: "style-empty",
    name: "無預設風格 (空白)",
    promptSuffix: ""
  },
  {
    id: "style-fintech",
    name: "FinTech 財經量化 (彭博全息)",
    promptSuffix: ", holographic stock charts, neon glowing lines, professional Bloomberg terminal aesthetic, corporate blue and gold accents, data visualization, cinematic lighting, ultra detailed, large bold financial typography,"
  },
  {
    id: "style-heritage",
    name: "東方古典美學 (水墨工筆)",
    promptSuffix: ", colorful ink wash, vivid diffusion, translucent crystal texture, sheer silk, refraction, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed,"
  },

{
    id: "style-golden-dawn-ink",
    name: "Golden Dawn (晨曦金墨)",
    promptSuffix: ", light and warm color ink wash, delicate line-art background composition, ethereal bright atmosphere, radiant morning glow, divine warm golden sunlight, glowing amber and peach energy flow, eastern fantasy, luminous gold accents, uplifting and hopeful mood, sheer silk, soft cinematic volumetric lighting, 8k resolution, ultra detailed"
  },



 {
    id: "style-vivid-divine-ink",
    name: "絢麗神輝彩墨",
    // 移除了 high contrast 和 intense，加入 soft warm glow
    promptSuffix: ", highly saturated color ink wash, vivid and bold warm color palette, brilliant pigment diffusion, glowing golden particles, gentle dynamic energy flow, eastern fantasy, luminous gold accents, eastern mythology, uplifting spiritual energy, vibrant cinematic volumetric lighting, soft warm glow, translucent crystal texture, ultra detailed, masterpiece"
  },
{
    id: "style-radiant-dawn-ink", // 改個名字比較符合修改後的感覺
    name: "晨曦流光水墨",
    // 移除了 jewel-toned 和 neon-like，改為 warm pastel 和 divine light
    promptSuffix: ", warm pastel-toned ink wash, layered transparency, delicate line-art background composition, ethereal translucent elements, glowing golden particles, divine light spiritual energy flow, eastern fantasy, crystal clear gold flowing accents, dynamic composition, vibrant but soft color saturation, cinematic volumetric lighting, radiant morning glow, 8k resolution, ultra detailed"
  }, 
  {
    id: "style-luminous-nature-ink",
    name: "萬物生機彩墨",
    // 加入了 warm sunlight，並將對比改為柔和過渡
    promptSuffix: ", highly saturated warm seasonal color palette, clear water-like ink, translucent dew, warm sunlight luminous lighting, vibrant dynamic ink wash, liquid flow, uplifting nature energy flow, soft environmental transition, ethereal beauty, cinematic depth of field, hopeful atmosphere, 8k"
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

    id: "style-eastern-cyberpunk",

    name: "東方神話龐克 (賽博風)",

    promptSuffix: ", Eastern cyberpunk style, mythology meets sci-fi, neon lighting, futuristic traditional clothing, glowing mechanical parts, rich and dark cinematic atmosphere, intricate mechanical details, Unreal Engine 5 render, 8k"

  }, 
{
    id: "style-chinese-ink-fairytale",
    name: "新國風彩墨童話 (靈動唯美)",
    promptSuffix: ", traditional Chinese color ink wash style, stylized folklore illustration, ethereal and magical atmosphere, flowing silk and clouds, rice paper texture, soft cinematic lighting, elegant linework, breathtaking eastern fantasy, masterpiece, 8k"
  },
  {
    id: "style-donghua-3d-fantasy",
    name: "國漫 3D 奇幻 (大片視覺)",
    promptSuffix: ", modern Chinese 3D animation style, mythological high fantasy, vibrant and rich colors, glowing magical particles, elaborate traditional costumes, epic cinematic lighting, dynamic angle, Unreal Engine 5 render, highly detailed, 8k"
  },
  {
    id: "style-chinese-storybook-lineart",
    name: "東方繪本線稿 (圖文排版)",
    promptSuffix: ", traditional Chinese stylized illustration, clean line-art background configuration, elegant decorative patterns, flat but vibrant color palette, whimsical fairy tale storytelling, warm ambient lighting, elegant composition, 8k"
  },

// 1. 台灣風格
  {
    id: "style-taiwan-nostalgic",
    name: "台灣懷旧復古 (煙火氣息)",
    promptSuffix: ", Taiwanese retro cinema style, golden hour warm lighting, nostalgic film grain, subtropical atmosphere, authentic street life, rich shadows, 8k, photorealistic"
  },
  {
    id: "style-taiwan-modern-zen",
    name: "台灣現代人文 (茶禪美學)",
    promptSuffix: ", Taiwanese modern tea house aesthetic, natural light through wooden blinds, minimalist stone and wood textures, calm and earthy tones, elegant atmosphere, high resolution photography"
  },

// 1. 台灣日常煙火氣 (台味復古電影感)
  {
    id: "style-taiwan-nostalgic-life",
    name: "台灣日常煙火氣 (懷舊電影感)",
    promptSuffix: ", Taiwanese everyday life style, warm retro cinema lighting, nostalgic 35mm film grain, subtle humidity atmosphere, rich shadow details, authentic local vibes, 8k, photorealistic"
  },

  // 2. 台灣都市街角 (日夜霓虹與鐵花窗)
  {
    id: "style-taiwan-urban-street",
    name: "台灣都市街角 (鐵花窗與騎樓)",
    promptSuffix: ", Taiwanese street corner aesthetic, retro iron window grilles, mottled arcade buildings, colorful shop signboards, soft ambient light, realistic texture, cinematic composition"
  },

  // 3. 台灣島嶼明亮 (陽光與青綠植栽)
  {
    id: "style-taiwan-sunny-breeze",
    name: "台灣微風陽光 (島嶼日常美學)",
    promptSuffix: ", Taiwanese bright sunny day, lush green monstera and ferns on balcony, soft daylight filtering through frosted glass, cozy home warmth, natural colors, high quality lifestyle photo"
  },

  // 4. 台灣當代人文 (茶禪與木質老宅)
  {
    id: "style-taiwan-modern-craft",
    name: "台灣人文茶韻 (老宅文青風)",
    promptSuffix: ", Taiwanese modern tea house aesthetic, dark wood and terrazzo floor, minimalist pottery, warm sunlight shadows, serene and earthy atmosphere, refined interior photography"
  },

// 2. 日本風格
  {
    id: "style-japan-wabi-sabi",
    name: "日本侘寂靜謐 (Wabi-Sabi)",
    promptSuffix: ", Japanese Wabi-sabi aesthetic, raw textures, low key muted colors, subtle daylight, serene ambiance, organic shapes, minimalist photography, 8k"
  },
  {
    id: "style-japan-city-pop",
    name: "日本都市膠卷 (City Pop / 80s 昭和感)",
    promptSuffix: ", 1980s Japanese City Pop aesthetic, vintage 35mm film photo, retro neon glow, vibrant yet faded colors, nostalgic urban night atmosphere, cinematic"
  },
  {
    id: "style-japan-muji-clean",
    name: "日本日系明亮 (日雜生活感)",
    promptSuffix: ", Japanese clean lifestyle photography, airy soft lighting, light wood accents, pastel palette, clear background, cozy and peaceful mood, high quality"
  },

  // 3. 亞洲其他風格
  {
    id: "style-new-chinese",
    name: "新中式東方美學 (意境墨韻)",
    promptSuffix: ", New Chinese style, ink wash aesthetic, subtle gold accents, dramatic contrast, elegant silk and bamboo elements, ethereal foggy mood, cinematic lighting, 8k"
  },
  {
    id: "style-korean-minimal",
    name: "韓系奶油微甜 (Ins風格)",
    promptSuffix: ", Korean cafe aesthetic, creamy warm tones, soft diffused light, aesthetic interior photography, gentle beige palette, clean composition, high-end lifestyle"
  },

  // 4. 西洋其他風格
  {
    id: "style-french-vintage",
    name: "法式復古浪漫 (慵懶優雅)",
    promptSuffix: ", French Parisian vintage aesthetic, soft window light, moody romantic ambiance, antique moldings, classic elegance, muted warm colors, 35mm photograph"
  },
  {
    id: "style-american-midcentury",
    name: "美式復古摩登 (Mid-Century Modern)",
    promptSuffix: ", Mid-Century American retro photography, rich walnut wood, warm sunlight reflections, 1960s color palette, stylish architecture, vivid colors, photorealistic"
  },

{
    id: "style-minimal",
    name: "北歐寫實極簡 (生活感)",
    promptSuffix: ", Scandinavian minimalist photography, natural daylight, soft shadows, clean aesthetic, realistic, 8k"
  },
  {
    id: "style-value-chain",
    name: "商業模式圖解 (價值鏈風)",
    promptSuffix: ", professional business model canvas style, supply chain infographic, clean structural diagram, tech corporate aesthetic, smiling curve visualization, layered data presentation, flat vector art style, minimalist background, highly detailed, 8k resolution"
  },
 {
    id: "style-market-strategy",
    name: "市場博弈策略 (華爾街風)",
    promptSuffix: ", premium institutional strategy poster, holographic global capital flow map, Wall Street financial aesthetic, dynamic data glowing lines, dramatic cinematic lighting, corporate typography layout, powerful market game concept, deep blue and gold tones, masterpiece, 8k"
  }, 
{
    id: "style-consulting-mbb",
    name: "MBB 頂尖顧問風 (高密邏輯)",
    promptSuffix: ", professional McKinsey consulting style presentation, high information density, strict grid layout, MECE structure, waterfall charts, action titles, minimalist corporate navy and grey palette, structured data cards, highly detailed, 8k resolution"
  },
  {
    id: "style-vc-pitch",
    name: "矽谷創投募資風 (商業敘事)",
    promptSuffix: ", Sequoia Capital startup pitch deck style, modern sleek design, high contrast before-after layout, business model canvas, bold traction metrics, dynamic startup aesthetic, vibrant accent colors on dark background, highly detailed, 8k"
  },
  {
    id: "style-apple-keynote",
    name: "極簡發布會風 (蘋果級視覺)",
    promptSuffix: ", Apple keynote presentation style, ultra minimalist layout, massive bold typography, cinematic product isolation, negative space, dramatic soft spotlight, single key metric focus, high-end commercial aesthetic, masterpiece, 8k"
  },
  {
    id: "style-b2b-corporate",
    name: "B2B 企業級標準風 (沉穩專業)",
    promptSuffix: ", professional B2B corporate presentation style, consistent brand identity, clean flat vector infographics, balanced text-to-image ratio, corporate blue and white theme, trustworthy and structured layout, high quality commercial design, 8k"
  },
 



{
    "id": "style-edtech-flat",
    "name": "現代幾何圖解 (扁平化教育)",
    "description": "色彩鮮明、線條乾淨，具備企業科技感與高度模組化的特色。適合呈現邏輯清晰的商業流程、軟體操作與基礎知識圖解。",
    "promptSuffix": ", modern flat vector illustration, clean geometric shapes, bold and vibrant color palette, minimalist educational infographic style, smooth gradients, no outlines, corporate tech aesthetic, clean sans-serif typography layout, highly detailed, 8k resolution"
  },
  {
    "id": "style-edtech-isometric",
    "name": "3D 等距微縮 (系統拆解)",
    "description": "運用 3D 等距視角與精緻光影，呈現精密的立體結構與系統積木感。適合系統架構拆解、硬體設備、空間佈局與複雜運作機制。",
    "promptSuffix": ", 3D isometric illustration, stylized miniature diorama, clean bright studio lighting, soft pastel and corporate blue colors, educational tech aesthetic, intricate mechanical or structural details, octane render, clean line-art background configuration, 8k"
  },
  {
    "id": "style-edtech-sketch-warm",
    "name": "學術手帳線稿 (溫暖紙張)",
    "description": "經典的手繪線稿搭配暖色紙張質感與微淡水彩，營造寧靜專注的個人筆記與研究氛圍。適合綜合知識整理、通用筆記與人文思維分析。",
    "promptSuffix": ", elegant academic sketch style, delicate clean line-art layout, blueprint or sketchbook aesthetic, minimal soft watercolor accents, warm paper texture, educational diagram, clear visual hierarchy, highly detailed, serene study atmosphere, 8k"
  },
  {
    "id": "style-edtech-sketch-grid",
    "name": "學術手帳線稿 (網格/方格紙)",
    "description": "微淡的藍色/灰色方格紙背景，帶來嚴謹的邏輯秩序感。適合數理邏輯、幾何圖解、資料結構與演算法推導。",
    "promptSuffix": ", elegant academic sketch style, delicate clean line-art layout, faint grid paper texture, subtle blue graph line pattern, technical notebook grid, educational diagram, precise spatial measurement aesthetic, highly detailed, 8k"
  },
  {
    "id": "style-edtech-sketch-dotgrid",
    "name": "學術手帳線稿 (點陣手帳紙)",
    "description": "極簡的 Bullet Journal 點陣背景，提供隱形的對齊輔助而不干擾視覺。適合思維導圖、視覺筆記 (Sketchnote) 與卡片盒筆記。",
    "promptSuffix": ", elegant academic sketch style, delicate clean line-art layout, minimalist bullet journal dot grid background, refined paper grain, clear visual hierarchy, clean educational diagram, highly detailed, 8k"
  },
  {
    "id": "style-edtech-sketch-parchment",
    "name": "學術手帳線稿 (羊皮紙/古典)",
    "description": "帶著歲月纖維感的古樸羊皮紙背景，散發典雅的文獻與歷史氣息。適合歷史事件時間軸、古典文學解析與生物分類學手稿。",
    "promptSuffix": ", elegant academic sketch style, delicate clean line-art layout, subtle antique parchment texture, aged fiber paper, vintage botanical print background, educational diagram, scholarly archival aesthetic, highly detailed, 8k"
  },
  {
    "id": "style-edtech-sketch-kraft",
    "name": "學術手帳線稿 (牛皮紙/環保)",
    "description": "有機且具手感的回收牛皮紙紋理，帶來自然永續與實作感。適合環境科學、地理生態學、手作工藝與永續議題推廣。",
    "promptSuffix": ", elegant academic sketch style, delicate clean line-art layout, recycled kraft paper texture, tactile paper grain, organic natural paper fibers, educational diagram, earthy organic style, highly detailed, 8k"
  },
  {
    "id": "style-edtech-sketch-blueprint",
    "name": "學術手帳線稿 (藍圖/工程)",
    "description": "深藍底色配上白色細線工程網格，呈現專業的架構規劃與工程圖樣感。適合機構拆解、軟體系統架構與程式底層模組圖解。",
    "promptSuffix": ", elegant academic sketch style, white hairline technical grid, dark blue engineering blueprint paper, technical architectural layout, educational schematic diagram, precise structural analysis aesthetic, highly detailed, 8k"
  },
  {
    "id": "style-edtech-botanical",
    "name": "復古科學圖鑑 (古典解剖/生物)",
    "description": "融合古典銅板畫與細緻交叉陰影（Cross-hatching），具備極高的學術權威感與典雅質感。適合生物構造、醫學解剖、植物學與歷史科技。",
    "promptSuffix": ", vintage scientific illustration, vintage botanical print, finely detailed copperplate engraving style, subtle cross-hatching, muted earthy color palette, parchment paper texture, labeled anatomical diagram aesthetic, elegant Latin calligraphy notes, highly detailed, 8k"
  },
  {
    "id": "style-edtech-clay",
    "name": "黏土微縮概念 (微觀/具象化)",
    "description": "透過手作風格的溫暖觸感與柔軟質感，將抽象或生硬的概念具象化，降低學習門檻。適合微觀科學（如細胞、分子）、幼兒教育與故事演繹。",
    "promptSuffix": ", stylized claymation plasticine diorama, soft clay texture, handcrafted educational miniature, bright rim lighting, vibrant clean colors, tactile depth of field, stop-motion animation art style, friendly interactive learning concept, 8k"
  },
  {
    "id": "style-edtech-risograph",
    "name": "雙色印刷圖解 (高對比概念)",
    "description": "採用復古孔版印刷質感與高對比雙色調（Duotone），視覺衝擊力強且焦點極度明確。適合概念對比、重點流程圖與宣傳海報式圖解。",
    "promptSuffix": ", risograph print illustration, duotone color palette, subtle halftone dot texture, distinct layered vector shapes, bold retro educational poster style, high visual impact, clean typography, tactile print aesthetic, 8k"
  },
  {
    "id": "style-edtech-glassmorphism",
    "name": "玻璃透視層次 (現代科技/數據流)",
    "description": "運用半透明磨砂玻璃與霓虹光澤展現「內部構造」與「資料流動」。適合 AI 運算原理、程式架構、數據流轉與現代物理概念。",
    "promptSuffix": ", modern glassmorphism style, translucent frosted glass layers, vibrant neon accents, clean white soft background, high-tech educational visualization, smooth depth blur, glossy reflective finish, elegant 3D diagram, octane render, 8k"
  },
  {
    id: "style-oriental-colorink",
    name: "現代彩墨琉璃 (靈性光影)",
    promptSuffix: ", modern colorful ink wash painting style, translucent glass-like color accents, cinematic volumetric lighting, ethereal and profound atmosphere, spiritual awakening concept, any characters strictly from back-view perspective, subtle golden light rays, profound depth, 8k resolution"
  },
  {
    id: "style-ancient-scripture",
    name: "經卷古剎金石 (歷史沉澱)",
    promptSuffix: ", ancient Chinese scripture aesthetic, floating golden calligraphy characters, weathered parchment and bamboo slip texture, traditional seal script elements, dimly lit ancient temple atmosphere, swirling incense smoke, rich warm amber and dark wood tones, traditional vertical text layout, cinematic composition, 8k"
  },
  
  {
    id: "style-zen-minimalist",
    name: "東方禪意極簡 (水墨留白)",
    promptSuffix: ", Zen minimalist aesthetic, traditional oriental ink wash accents, soft muted earthy tones, ample negative space, peaceful and mindful atmosphere, subtle glowing natural light, profound spiritual vibe, elegant traditional typography layout, 8k resolution"
  }
];
