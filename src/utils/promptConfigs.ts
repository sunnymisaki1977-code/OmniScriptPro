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
  title: "基礎背景事實查核",
  description: "針對主題進行定義釐清與客觀史料彙整",
  type: "text",
  dependsOn: ["theme"],
  prompt: (ctx) => `你是一位嚴謹的台灣民俗與歷史學家。請針對主題「${ctx.theme}」進行一份約 1500 字的精確事實報告。
請注意，這類名詞常有字面誤導（姓氏不代表特定歷史名人）。

請絕對基於搜尋到的客觀事實撰寫，嚴禁任何 AI 腦補。
撰寫時請務必嚴格遵循以下「詳細架構與撰寫指南」進行結構化輸出：

## 🗂️ 詳細架構與撰寫指南

### 一、 導言：與祂的初次見面
    破題引言：   用一句話總結這位神佛在民間最深入人心的形象（例如：「在臺灣，每逢農曆三月，總有一股熱潮席捲全島，那就是...」）。
    現代社會影響力：   簡述祂在現代社會、海內外信仰圈的普及程度與信仰人口分布。

### 二、 神格定位與尊號系統
    正式尊稱與歷代封號：
     官方或朝廷敕封：[例如：護國庇民妙靈昭應弘仁普濟天上聖母]
      民間親切俗稱：[例如：媽祖婆、婆姐、聖母]
      不同宗教/派別的稱呼：[例如：關公在道教尊為「三界伏魔大帝」，在佛教尊為「伽藍菩薩」]
    宗教職能與階級：   屬於哪一個宗教體系？在神界行政體系中擔任什麼職位？（例如：地方最高主宰、地府掌管者、行業祖師爺）。

### 三、 凡人身世與成神傳奇（祂從哪裡來？）
> 💡   撰寫提示：   若該神明為「先天神」（如：玉皇大帝、太陽星君、西王母），此段可調整為「宇宙誕生、自然化育與神話源流」。

    降生背景與異象：   誕生於哪個朝代、地理位置？俗名為何？出生時是否有天降紅光、滿室異香、百鳥朝鳳等神異現象？
    凡間修持與人格特質：   祂在人間時展現了哪些不凡的特質？（如：過人的智慧、精湛的醫術、極致的孝行、保家衛國的英勇事蹟）。
    得道 / 昇天契機：      關鍵轉折：  經歷了什麼重大的考驗、修行、頓悟或拜師經歷？
       羽化登仙：  祂是如何離開人世並被尊為神的？（如：為救百姓而犧牲、白日飛升、遇難後靈魂顯聖庇護鄉里）。

### 四、 經典神蹟與民間傳說（祂做了什麼？）
    核心神蹟（精選 1-2 則）：   挑選最具代表性、最廣為人知且具備文學色彩的故事（如：保生大帝「點龍眼、醫虎喉」、濟公活佛「古井運木」）。
    平定災難與庇護地方：   祂曾幫助民間解決過什麼重大災難？（如：平定瘟疫、驅逐妖怪、乾旱求雨、戰亂中顯靈護國）。
    神魔鬥法或收服隨從：   是否有與其他神魔鬥法，或是感化、收服部將的傳奇故事？

### 五、 法相特徵與隨身法器（祂長什麼樣子？）
    金身法相解析：      面容與神情：  膚色（如黑面媽祖代表威赫、粉面代表親和）、神情（慈祥、威嚴、憤怒降魔尊）。
       服飾與冠冕：  身穿文袍、武冠、龍袍或一襲白衣？
       坐騎：  是否有專屬坐騎？（如：文殊菩薩騎獅、普賢菩薩騎象、玄天上帝腳踏龜蛇）。
    法器與隨身物件的寓意：   祂手上拿著什麼？這些物件背後代表什麼權力、願力或功能？（如：文昌帝君的毛筆與功名簿、觀音菩薩的淨瓶柳枝、托塔天王的寶塔）。
    左右護法與隨從神將：   祂的身邊常伴隨哪些神將、童子或部屬？（如：媽祖與千里眼/順風耳、關聖帝君與關平/周倉）。

### 六、 職能守護與信仰群體（誰去拜祂？）
    主要掌管職務：   現代人遇到生活中的哪些疑難雜症會特別去祈求這位神佛？
       祈福範疇：  求財運、求子嗣、求功名考試、求身體健康、求航海與交通安全等。
    特定崇拜行業與群體：   哪些行業特別奉祂為守護神、祖師爺？（如：警察、商人拜關公；木工、建築業拜魯班；醫藥界拜保生大帝與神農大帝）。

### 七、 現代信仰文化與祭祀儀式
    重要聖誕與重要節慶：   祂的聖誕千秋（生日）或得道昇天日是農曆哪一天？當天民間與宮廟有何特殊的慶祝方式？
    海內外代表性廟宇：     歷史悠久的發源祖廟（如：湄洲媽祖祖廟、解州關帝廟）。
      現今香火最鼎盛、最具指標性的代表宮廟。
    獨特民俗與宗教儀式：   與祂緊密相關的特殊民俗活動（如：遶境進香、割香、建醮祈安、王爺信仰的「燒王船」、特殊的民俗陣頭）。

### 八、小說演義 / 民間傳說 對比：  
正史《三國志》與 小說《三國演義》的差異，這樣的介紹既具備學術公信力，又充滿引人入勝的文學趣味！

### 九、 結語：神格精神的現代啟示
    核心價值的現代轉化：   這位神佛的核心精神（如：媽祖的無私慈悲、關公的誠信忠義）對現代人的生活、職場或道德操守有何指引與啟發？
    文化傳承與反思：   總結祂如何從歷史記載或遠古神話，一步步走入現代人的心靈，成為跨越時代的精神寄託。

現在，請以「${ctx.theme}」為主題，開始撰寫這份嚴謹的歷史報告。`,
  },
  {
    id: 2,
    title: "長影音腳本撰寫",
    description: "根據基礎背景，產出 5-10 分鐘的 YouTube 長影片文案。",
    type: "text",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請根據以下【經過專家查核的基礎背景資料】，為「${ctx.theme}」撰寫一份 5-10 分鐘的 YouTube 長影片腳本。

【⚠️ 絕對真實性指令】：
你在本腳本中提及的所有生平、神明、科儀名稱與神話，  必須 100% 遵守下方提供的背景資料，不可修改名詞定義  。

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

請提供：5 個 Hook 標題、10 個熱門 Hasthtags。、以及150字影片說明、時間軸建議。`,
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

請提供：3 個衝擊力強的標題。`,
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
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（  ）。
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。大而醒目的藝術文字設計，結尾必須包含：--ar 16:9

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入縮圖名稱]
主標：[請填入主標內容]
副標：[請填入副標內容]
中文：[請填入中文 Prompt]`,
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
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（  ）。
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。大而醒目的藝術文字設計，結尾必須包含：--ar 9:16

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入短影音縮圖名稱]
高點擊文案：[請填入主標內容]
中文：[請填入中文 Prompt]`,
  },
  {
    id: 8,
    title: "彩墨風格意象圖",
    description: "生成 3 組 16:9 意象圖指令與搭配詩詞。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組 16:9 彩墨風格意象圖。
視覺設計必須包含風格標籤 (colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed)，無人物、充滿禪意或史詩感的氛圍。

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（  ）。
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。 結尾必須包含：--ar 16:9

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入意象圖名稱]
詩詞（由上到下，由右到左）：[請填入七言四句詩詞]
中文：[請填入中文畫面描述]`,
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
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（  ）。
Suno AI 中文 Prompt 必須包含 Music Style、Instruments、Tempo 。

請直接輸出以下格式，依照三種場景順序生成：

### 第一組：史詩感
適用場景：[請填入適用場景說明]
Suno AI Prompt：[請填入包含參數的中文 Prompt 內容]

### 第二組：敘事感
適用場景：[請填入適用場景說明]
Suno AI Prompt：[請填入包含參數的中文 Prompt 內容]

### 第三組：活力感
適用場景：[請填入適用場景說明]
Suno AI Prompt：[請填入包含參數的中文 Prompt 內容]`,
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

【⚠️ 絕對真實性指令】：
所有萃取的資訊、排版字卡內容與社群正文，必須完全基於下方史料，禁止腦補。

【基礎背景史料】：
${ctx.step1}

請嚴格遵循以下三大任務與格式要求：

---
### 任務一：生成動態視覺 Prompt (Midjourney / Imagen)
請從${ctx.step1}萃取五個【蒙太奇資訊】。
  視覺公式（必須包含）  ：
畫面必須融合【動態分割構圖（Dynamic Segmented Layout）】、【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】與【蒙太奇資訊圖表（Montage Infographic）】三種視覺語言。
整體風格採用 colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。	

### 任務二：設計 4 張圖卡排版字卡
請將史料轉化為 4 張社群圖卡（4:3）的排版字卡。每張字卡必須具備強烈的敘事性，並符合現代社群閱讀習慣（字數精簡、標題吸睛）。
視覺設計必須包含風格標籤 (colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed)

### 任務三：撰寫社群發布正文
使用生動、能引起現代人共鳴的語氣。將史料轉化為 3~5 點易讀的亮點解析，並以提問開場，以祈福導流收尾。

---
【格式絕對鎖定指令】（請直接輸出以下格式，禁止任何問候與結語）：

### 🎨 視覺 Prompt
  16:9 動態分割構圖提示詞：  
以「${ctx.theme}」為核心主角，從史料萃取五個【蒙太奇資訊】生成 16:9 彩墨風格，五組畫格以【動態分割構圖（Dynamic Segmented Layout）】以及【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】組合併接成【蒙太奇資訊圖表（Montage Infographic）】


  主標題：  [請填入主標題]

1.   畫格 1：   [蒙太奇資訊名稱 1]

   視覺描述：  [請填入視覺描述中文 Prompt]
2.   畫格 2：   [蒙太奇資訊名稱 2]

   視覺描述：  [請填入視覺描述中文 Prompt]
3.   畫格 3：   [蒙太奇資訊名稱 3]

   視覺描述：  [請填入視覺描述中文 Prompt]
4.   畫格 4：   [蒙太奇資訊名稱 4]

   視覺描述：  [請填入視覺描述中文 Prompt]
5.   畫格 5：   [蒙太奇資訊名稱 5]

   視覺描述：  [請填入視覺描述中文 Prompt]

  9:16 動態分割構圖提示詞：  
以「${ctx.theme}」為核心主角，從史料萃取五個【蒙太奇資訊】生成 9:16 (直式) 彩墨風格，五組畫格以【動態分割構圖（Dynamic Segmented Layout）】以及【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】組合併接成【蒙太奇資訊圖表（Montage Infographic）】

  主標題：  [請填入主標題]

1.   畫格 1：   [蒙太奇資訊名稱 1]

   視覺描述：  [請填入視覺描述中文 Prompt]
2.   畫格 2：   [蒙太奇資訊名稱 2]

   視覺描述：  [請填入視覺描述中文 Prompt]
3.   畫格 3：   [蒙太奇資訊名稱 3]

   視覺描述：  [請填入視覺描述中文 Prompt]
4.   畫格 4：   [蒙太奇資訊名稱 4]

   視覺描述：  [請填入視覺描述中文 Prompt]
5.   畫格 5：   [蒙太奇資訊名稱 5]

   視覺描述：  [請填入視覺描述中文 Prompt]


### 🖼️ 4:3 4 張圖卡排版字卡提示詞：
1.   ###圖卡標題：   [15字內，包含主題名稱]
     ###一句話說明：   [20字內，點出核心精神]
     視覺描述：  [請填入視覺描述中文 Prompt]

2.   ###圖卡標題：   [15字內，包含主題名稱]
     ###一句話說明：   [20字內，點出核心精神]
     視覺描述：  [請填入視覺描述中文 Prompt]

3.   ###圖卡標題：   [15字內，包含主題名稱]
     ###一句話說明：   [20字內，點出核心精神]
     視覺描述：  [請填入視覺描述中文 Prompt]

4.   ###圖卡標題：   [15字內，包含主題名稱]
     ###一句話說明：   [20字內，點出核心精神]
     視覺描述：  [請填入視覺描述中文 Prompt]


### 📱 社群發布正文
[請填入帶有 Emoji 的 Hook 開場白，製造懸念或情感共鳴]

[請條列 3-5 點核心亮點解析，每點包含一個小標題與兩句精簡解說，必須基於史料]

[互動提問：請邀請粉絲留言分享經驗]
祈福點燈、消災延壽，讓神明的靈光持續護佑您的日常 ➔ [此處自動帶入廟方數位功德箱/點燈連結]

#世代銘印 #${ctx.theme} [請再補充 3-5 個相關的 Hashtags]
`,  },
];


