export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  prompt: (context: any) => string;
  type: "text" | "code" | "social";
  language?: string;
  dependsOn: string[];
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    title: "基礎背景研究",
    description: "針對主題進行深入的文化、歷史或背景資料彙整。",
    type: "text",
    dependsOn: ["theme"],
    prompt: (ctx) => `你是一位民俗文化專家，請針對主題「${ctx.theme}」進行1500字深入的背景研究。
內容需包含：文化由來、核心意義、相關傳說或歷史紀錄。
請以結構化、易讀的段落撰寫。
【最高指導原則】：
1. 嚴守台灣傳統道教與民間信仰之正統記載，不可混入其他無關之奇幻文學或西方神話。
2. 內容必須鎖定在「正史記載」、「受官方認可之《道藏》」或「台灣指標性大廟（如大甲鎮瀾宮、松山奉天宮）之官方沿革」。
3. 嚴禁任何怪力亂神、無根據的鄉野奇談或 AI 隨意編造的法術情節。
4. 敘事範圍僅限於：文化與歷史起源神明、生平/由來、核心精神與當代象徵意義、經典神話、民間傳說或歷史史料記載、獨特的台灣民俗科儀、藝術表徵。`,
  },
  {
    id: 2,
    title: "長影音腳本撰寫",
    description: "根據基礎背景，產出 5-10 分鐘的 YouTube 長影片文案。",
    type: "text",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請根據以下背景資料，為「${ctx.theme}」撰寫一份 5-10 分鐘的 YouTube 長影片腳本。
背景資料：
${ctx.step1}

腳本需求：包含引人入勝的開場、深度內容解析、以及總結與互動引導。`,
  },
  {
    id: 3,
    title: "長影音 SEO 優化",
    description: "生成標題、標籤與說明欄內容。",
    type: "text",
    dependsOn: ["theme", "step2"],
    prompt: (ctx) => `請根據以下長影音腳本，為主題「${ctx.theme}」生成 SEO 優化內容。
腳本內容：
${ctx.step2}

請提供：5 個吸引人的標題、一組關鍵字標籤、以及一段包含時間軸建議的影片說明欄。`,
  },
  {
    id: 4,
    title: "短影音腳本撰寫",
    description: "產出 60 秒內的精簡爆款短影片文案。",
    type: "text",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請根據以下背景資料，為「${ctx.theme}」撰寫一份 60 秒內的 YouTube Shorts/TikTok 短影片腳本。
背景資料：
${ctx.step1}

需求：節奏明快，前 3 秒必須有鉤子 (Hook)，內容精簡有力。`,
  },
  {
    id: 5,
    title: "短影音 SEO 優化",
    description: "生成短影片標題與標籤。",
    type: "text",
    dependsOn: ["theme", "step4"],
    prompt: (ctx) => `請根據以下短影音腳本，產出適合的 SEO 內容。
腳本內容：
${ctx.step4}

請提供：3 個衝擊力強的標題、以及 10 個熱門 Hasthtags。`,
  },
  {
    id: 6,
    title: "長影音縮圖設計",
    description: "生成 3 組 16:9 YouTube 縮圖文案與 AI 繪圖指令。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme", "step3"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組長影音 YouTube 縮圖設計 (16:9)。
參考背景：${ctx.step3}

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（**）。
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。
AI Prompt (English) 結尾必須包含：--ar 16:9

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入縮圖名稱]
主標：[請填入主標內容]
副標：[請填入副標內容]
中文：[請填入中文 Prompt]
English：[請填入英文 Prompt]`,
  },
  {
    id: 7,
    title: "短影音縮圖設計",
    description: "生成 3 組 9:16 短影音縮圖文案與 AI 繪圖指令。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme", "step5"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組短影音 YouTube 縮圖設計 (9:16)。
參考背景：${ctx.step5}

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（**）。
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。
AI Prompt (English) 結尾必須包含：--ar 9:16

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入短影音縮圖名稱]
高點擊文案：[請填入主標內容]
中文：[請填入中文 Prompt]
English：[請填入英文 Prompt]`,
  },
  {
    id: 8,
    title: "彩墨風格意象圖",
    description: "生成 3 組 16:9 意象圖指令與搭配詩詞。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組 16:9 彩墨風格意象圖。
視覺設計必須包含風格標籤 (colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed)，強調無人物、充滿禪意或史詩感的氛圍。

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（**）。
English 結尾必須包含：--ar 16:9

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入意象圖名稱]
詩詞：[由上到下，由右到左，請填入七言四句詩詞，]
中文：[請填入中文畫面描述]
English：[請填入英文 Prompt]`,
  },
  {
    id: 9,
    title: "Suno AI 配樂設計",
    description: "生成 3 組符合主題氛圍的音樂生成指令。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組 Suno AI 音樂生成 Prompt。
場景設計分別為：1. 史詩感（神話開場）、2. 敘事感（溫暖歷史）、3. 活力感（現代節奏）。

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（**）。
Suno AI Prompt 必須包含 Music Style、Instruments、Tempo 等英文參數。

請直接輸出以下格式，依照三種場景順序生成：

### 第一組：史詩感
適用場景：[請填入適用場景說明]
Suno AI Prompt：[請填入包含參數的英文 Prompt 內容]

### 第二組：敘事感
適用場景：[請填入適用場景說明]
Suno AI Prompt：[請填入包含參數的英文 Prompt 內容]

### 第三組：活力感
適用場景：[請填入適用場景說明]
Suno AI Prompt：[請填入包含參數的英文 Prompt 內容]`,
  },
  {
    id: 10,
    title: "社群推播發控中心",
    description: "一鍵生成動態視覺提示詞、圖卡排版字卡與社群正文",
    type: "social",
    language: "markdown",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `你現在是首席視覺藝術總監與頂級社群文案主編。
你的任務是根據下方的【基礎背景史料】，為主題「${ctx.theme}」打造一組「新國風彩墨」社群圖文懶人包。

【基礎背景史料】：
${ctx.step1}

請嚴格遵循以下三大任務與格式要求：

---
### 任務一：生成動態視覺 Prompt (Midjourney / Imagen)
請從史料中萃取 4 到 5 個最震撼的「歷史高光時刻 / 核心傳說」，將其轉化為畫面描述。
**視覺公式（必須包含）**：
- 傳統底蘊：colorful ink wash, rice paper texture.
- 現代奇幻：energy flow, golden particles, neon ink.
- 史詩構圖：Dynamic Segmented Layout, Comic Book Splash Page with Insets.Montage Infographic,
- 極致光影：cinematic lighting, strong chiaroscuro.

### 任務二：設計 4 張圖卡排版字卡
請將史料轉化為 4 張社群圖卡（1:1 正方形）的排版字卡。每張字卡必須具備強烈的敘事性，並符合現代社群閱讀習慣（字數精簡、標題吸睛）。

### 任務三：撰寫社群發布正文
使用生動、能引起現代人共鳴的語氣。將史料轉化為 3~5 點易讀的亮點解析，並以提問開場，以祈福導流收尾。

---
【格式絕對鎖定指令】（請直接輸出以下格式，禁止任何問候與結語）：

### 🎨 視覺 Prompt
**16:9 動態分割構圖提示詞：**
以「${ctx.theme}」為核心主角，設計一張結合【動態分割構圖（Dynamic Segmented Layout）】、【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】與【蒙太奇資訊圖表（Montage Infographic）】風格的高質感歷史解密海報。

畫面中央為巨大主視覺（Hero Image），描繪「${ctx.theme}」最具代表性的經典形象，人物佔據畫面主要區域，神情充滿故事感與歷史厚度，呈現電影級史詩氛圍。

利用流動的金色能量、彩墨筆觸、古卷軸、龍形氣脈、書法墨痕、光芒裂縫或時空裂痕，將整體畫面動態分割成數個不規則區塊。

各個區塊（Montage Panels）分別描繪「${ctx.theme}」人生中的重要時刻：
• 出生背景
• 求學階段
• 關鍵轉折事件
• 成名時刻
• 重大歷史貢獻
• 晚年境遇
• 對後世影響

每個區塊皆具有獨立場景與時代背景，並加入相關人物互動，形成時空交錯的敘事感。
畫面上方預留大型標題區域。各分鏡旁保留數字序號與解說文字空間。
整體版面猶如高級歷史紀錄片資訊圖表，具有閱讀導向與視覺敘事功能。

風格設定：
新國風彩墨藝術、東方美學、電影海報構圖、博物館級歷史圖解設計、史詩級敘事、金墨交融、細節豐富、超高解析度、精緻光影、戲劇性構圖、文化紀錄片風格、歷史解密專題設計、cinematic lighting, masterpiece, ultra detailed, storytelling illustration, infographic design, dynamic composition, elegant typography space, museum exhibition quality

English Prompt（Professional Version）
Create an epic historical infographic poster featuring ${ctx.theme} as the central figure.
Combine: Dynamic Segmented Layout, Comic Book Splash Page with Insets, Montage Infographic Design.
A massive hero image occupies the center of the composition, portraying the most iconic version of ${ctx.theme} with cinematic presence, emotional depth, and legendary charisma.
The canvas is divided using dynamic visual elements such as: flowing golden energy streams, ancient scrolls, ink brush strokes, glowing calligraphy, celestial cracks of light, mystical dragon-shaped energy veins, temporal rifts.
These irregular divisions create multiple montage panels surrounding the hero image.
Each montage panel illustrates a significant chapter of the character's life: Origins and childhood, Education and early growth, Turning point of destiny, Rise to fame, Major achievements, Later years, Legacy and influence on future generations.
Every panel contains unique environments, supporting characters, and contextual storytelling details to create a documentary-style timeline across different eras.
Reserve a large title area at the top. Leave dedicated spaces beside each panel for numbered labels, chapter headings, and explanatory text.
The overall composition should resemble a premium historical documentary infographic, combining educational clarity with cinematic storytelling.
Style: New Chinese Ink Art, Eastern Fantasy, Historical Documentary Design, Museum Exhibition Poster, Cinematic Illustration, Epic Storytelling, Golden Ink Accents, Dynamic Layout, High Detail, Rich Atmosphere, Ultra Realistic Lighting, Historical Infographic, Masterpiece Composition, Premium Editorial Design, Cultural Heritage Illustration, cinematic lighting, ultra detailed, 8k, award-winning artwork, documentary style, storytelling montage, masterpiece, best quality, ultra detailed, dynamic segmented layout, comic splash page, montage infographic, storytelling composition, cinematic atmosphere, golden ink diffusion, historical documentary illustration, dramatic lighting, highly detailed background, educational poster design, museum exhibition quality, editorial infographic, 8k resolution, no watermark, no logo --ar 16:9 --v 6.0 --style raw

**9:16 動態分割構圖提示詞：**
以「${ctx.theme}」為核心主角，設計一張結合【動態分割構圖（Dynamic Segmented Layout）】、【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】與【蒙太奇資訊圖表（Montage Infographic）】風格的直式高質感歷史解密海報。

畫面中央為巨大主視覺（Hero Image），描繪「${ctx.theme}」最具代表性的經典形象，人物佔據畫面主要區域，神情充滿故事感與歷史厚度，呈現電影級史詩氛圍。

利用流動的金色能量、彩墨筆觸、古卷軸、龍形氣脈、書法墨痕、光芒裂縫或時空裂痕，將整體畫面動態分割成數個不規則區塊。

各個區塊（Montage Panels）分別描繪「${ctx.theme}」人生中的重要時刻：
• 出生背景
• 求學階段
• 關鍵轉折事件
• 成名時刻
• 重大歷史貢獻
• 晚年境遇
• 對後世影響

每個區塊皆具有獨立場景與時代背景，並加入相關人物互動，形成時空交錯的敘事感。
畫面上方預留大型標題區域。各分鏡旁保留數字序號與解說文字空間。
整體版面猶如高級歷史紀錄片資訊圖表，具有閱讀導向與視覺敘事功能。

風格設定：
新國風彩墨藝術、東方美學、電影海報構圖、博物館級歷史圖解設計、史詩級敘事、金墨交融、細節豐富、超高解析度、精緻光影、戲劇性構圖、文化紀錄片風格、歷史解密專題設計、cinematic lighting, masterpiece, ultra detailed, storytelling illustration, infographic design, dynamic composition, elegant typography space, museum exhibition quality

English Prompt（Professional Version）
Create an epic historical infographic poster featuring ${ctx.theme} as the central figure, vertical scroll format.
Combine: Dynamic Segmented Layout, Comic Book Splash Page with Insets, Montage Infographic Design.
A massive hero image occupies the center of the composition, portraying the most iconic version of ${ctx.theme} with cinematic presence, emotional depth, and legendary charisma.
The canvas is divided using dynamic visual elements such as: flowing golden energy streams, ancient scrolls, ink brush strokes, glowing calligraphy, celestial cracks of light, mystical dragon-shaped energy veins, temporal rifts.
These irregular divisions create multiple montage panels surrounding the hero image.
Each montage panel illustrates a significant chapter of the character's life: Origins and childhood, Education and early growth, Turning point of destiny, Rise to fame, Major achievements, Later years, Legacy and influence on future generations.
Every panel contains unique environments, supporting characters, and contextual storytelling details to create a documentary-style timeline across different eras.
Reserve a large title area at the top. Leave dedicated spaces beside each panel for numbered labels, chapter headings, and explanatory text.
The overall composition should resemble a premium historical documentary infographic, combining educational clarity with cinematic storytelling.
Style: New Chinese Ink Art, Eastern Fantasy, Historical Documentary Design, Museum Exhibition Poster, Cinematic Illustration, Epic Storytelling, Golden Ink Accents, Dynamic Layout, High Detail, Rich Atmosphere, Ultra Realistic Lighting, Historical Infographic, Masterpiece Composition, Premium Editorial Design, Cultural Heritage Illustration, cinematic lighting, ultra detailed, 8k, award-winning artwork, documentary style, storytelling montage, masterpiece, best quality, ultra detailed, dynamic segmented layout, comic splash page, montage infographic, storytelling composition, cinematic atmosphere, golden ink diffusion, historical documentary illustration, dramatic lighting, highly detailed background, educational poster design, museum exhibition quality, editorial infographic, 8k resolution, no watermark, no logo --ar 9:16 --v 6.0 --style raw

### 🖼️ 圖卡排版字卡
1. **圖卡標題：** [15字內，包含主題名稱]
   **一句話說明：** [20字內，點出核心精神]
   **排版建議：** [20字內，說明畫面情感或建議底圖風格]
2. **圖卡標題：** [15字內，包含主題名稱]
   **一句話說明：** [20字內，點出核心精神]
   **排版建議：** [20字內，說明畫面情感或建議底圖風格]
3. **圖卡標題：** [15字內，包含主題名稱]
   **一句話說明：** [20字內，點出核心精神]
   **排版建議：** [20字內，說明畫面情感或建議底圖風格]
4. **圖卡標題：** [15字內，包含主題名稱]
   **一句話說明：** [20字內，點出核心精神]
   **排版建議：** [20字內，說明畫面情感或建議底圖風格]

### 📱 社群發布正文
[請填入帶有 Emoji 的 Hook 開場白，製造懸念或情感共鳴]

[請條列 3-5 點核心亮點解析，每點包含一個小標題與兩句精簡解說，必須基於史料]

[互動提問：請邀請粉絲留言分享經驗]
祈福點燈、消災延壽，讓神明的靈光持續護佑您的日常 ➔ [此處自動帶入廟方數位功德箱/點燈連結]

#世代銘印 #${ctx.theme} [請再補充 3-5 個相關的 Hashtags]
`,
  },
];
