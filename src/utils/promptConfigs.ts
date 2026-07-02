export interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  prompt: (context: any) => string;
  type: "text" | "code" | "social";
  language?: string;
  dependsOn: string[];
}

export const WORKFLOWS_REGISTRY: Record<string, WorkflowStep[]> = {
  CultureTech: [
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

    降生背景與異象：   誕生於哪個朝代、地理位置？本名、俗名？出生時是否有天降紅光、滿室異香、百鳥朝鳳等神異現象？
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
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。結尾必須包含：--16:9

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
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。結尾必須包含：--9:16

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
AI Prompt (中文) 必須包含：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。 結尾必須包含：-- 16:9

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入意象圖名稱]
詩詞（由上到下由右到左不要標點符號）：[請填入七言四句詩詞]
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

請嚴格遵循以下二大任務與格式要求：

---
### 任務一：生成動態視覺 Prompt (Midjourney / Imagen)
請從${ctx.step1}萃取五個【蒙太奇資訊】。
  視覺公式（必須包含）  ：
畫面必須融合【動態分割構圖（Dynamic Segmented Layout）】、【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】與【蒙太奇資訊圖表（Montage Infographic）】三種視覺語言。
整體風格採用 colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed。	

### 任務二：撰寫社群發布正文
使用生動、能引起現代人共鳴的語氣。將史料轉化為 3~5 點易讀的亮點解析，並以提問開場，以祈福導流收尾。

---

### 🎨 視覺 Prompt
  16:9 動態分割構圖提示詞：  
以「${ctx.theme}」為核心主角，必須包含風格：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed，以主標題，核心主角五個【蒙太奇資訊】【視覺描述】，運用【動態分割構圖（Dynamic Segmented Layout）】以及【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】組合併接成一張【蒙太奇資訊圖表（Montage Infographic）】--16:9。
  主標題：  [請填入主標題]
1.   畫格 1：   [蒙太奇資訊名稱 1]
   視覺描述：  [請填入視覺描述]
2.   畫格 2：   [蒙太奇資訊名稱 2]
   視覺描述：  [請填入視覺描述]
3.   畫格 3：   [蒙太奇資訊名稱 3]
   視覺描述：  [請填入視覺描述]
4.   畫格 4：   [蒙太奇資訊名稱 4]
   視覺描述：  [請填入視覺描述]
5.   畫格 5：   [蒙太奇資訊名稱 5]
   視覺描述：  [請填入視覺描述]


現在，請直接輸出以下格式：
AI Prompt (中文):[開始撰寫16:9 動態分割構圖提示詞]


  9:16 動態分割構圖提示詞：  
以「${ctx.theme}」為核心主角，必須包含風格：colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed，以主標題，核心主角五個【蒙太奇資訊】【視覺描述】，運用【動態分割構圖（Dynamic Segmented Layout）】以及【美式漫畫跨頁插圖（Comic Book Splash Page with Insets）】組合併接成一張【蒙太奇資訊圖表（Montage Infographic）】--9:16。

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


現在，請直接輸出以下格式：
AI Prompt (中文):[開始撰寫9:16 動態分割構圖提示詞]



### 📱 社群發布正文
[請填入帶有 Emoji 的 Hook 開場白，製造懸念或情感共鳴]

[請條列 3-5 點核心亮點解析，每點包含一個小標題與兩句精簡解說，必須基於史料]

[互動提問：請邀請粉絲留言分享經驗]
祈福點燈、消災延壽，讓神明的靈光持續護佑您的日常 ➔ [此處自動帶入廟方數位功德箱/點燈連結]

#世代銘印 #${ctx.theme} [請再補充 3-5 個相關的 Hashtags]
`,  },
  ],
  beauty: [
  {
    id: 1,
    title: "基礎背景科學查核",
    description: "針對保養成分或美妝趨勢進行定義釐清與科學/歷史文獻彙整",
    type: "text",
    dependsOn: ["theme"],
    prompt: (ctx) => `你是一位嚴謹的皮膚科學專家與國際美妝保養趨勢主編。請針對主題「${ctx.theme}」進行一份約 1500 字的精確事實報告。
請注意，網路上常有誇大的美妝謠言與行銷話術，請務必基於皮膚科學機轉、成分實證或發展史撰寫，嚴禁任何 AI 腦補。
撰寫時請務必嚴格遵循以下「詳細架構與撰寫指南」進行結構化輸出：

## 🗂️ 詳細架構與撰寫指南

### 一、 導言：現代人的肌膚痛點與流行風潮
    破題引言：用一句話點出該主題解決了什麼現代人的容貌焦慮或引領了什麼新風尚（例如：「在換季時節，總有一款成分成為敏弱肌的救星，那就是...」）。
    現代市場影響力：簡述此成分或風格在目前的普及程度與市場規模。

### 二、 核心定義與分類系統
    正式學名與常見俗稱：
      官方/科學名稱：[例如：菸鹼醯胺、生育酚、A醇]
      民間親切俗稱：[例如：維他命B3、抗老黃金、早C晚A]
    機制定位與保養階級：屬於哪一類保養體系？在皮膚生理學中作用於哪一個層次？（例如：角質代謝、真皮層膠原協同）。

### 三、 成分源流與研發傳奇（它從哪裡來？）
> 💡 撰寫提示： 若該主題為「美妝風格」（如：Clean Girl），此段可調整為「風格起源、流行文化與美學源流」。

    發現背景與契機：誕生於哪個年代、實驗室或歷史背景？最初是如何被發現有美妝/保養功效的？
    研發痛點與技術突破：該成分有哪些不穩定性（如易氧化、具刺激性）？科學家後來用什麼技術（如包裹技術、微脂囊）克服？

### 四、 核心功效與經典案例（它能做到什麼？）
    核心實證功效（精選 1-2 則）：挑選最具科學實證的功效（如：抑制酪胺酸酶活性、促進細胞更新）。
    視覺前後對比描述：臨床或實驗上，正確使用後會帶來什麼樣的膚質或妝效轉變？

### 五、 質地特徵與包裝美學（它長什麼樣子？）
    質地與觸感解析：外觀顏色、流動性、吸收速度與膚感（如：微乳化質地、清爽啞光、絲絨霧面、清透水光）。
    包裝與活性保護：為了維持活性，通常需要什麼樣的包裝設計？（如：避光棕色瓶、真空壓泵、雙艙設計）。

### 六、 適用膚質與精準搭配（誰最適合它？）
    主要對症痛點：現代人遇到哪些肌膚問題（如：暗沉、初老、敏感、毛孔粗大）會特別需要它？
    特定避雷與蜜糖群體：哪些膚質是天生蜜糖？哪些膚質需要建立耐受，或不可與什麼成分（如：高濃度酸類）疊加混搭？

### 七、 現代日常保養/彩妝儀式
    最佳使用時機與手法：應該在早晨還是夜晚使用？搭配什麼樣的按摩手法或疊擦順序能發揮最大功效？
    經典代表產品：現今市場上以此為核心成分的指標性專櫃或平價產品。

### 八、 專櫃品牌行銷話術 vs. 皮膚科正史對比
    破解常見的「神話級」行銷話術，從科學角度告訴讀者哪些是必須的，哪些只是商家的概念炒作，建立專業公信力！

### 九、 結語：悅己美學的現代啟示
    核心價值的現代轉化：將複雜的保養/美妝昇華為一種「自我療癒與生活儀式感」，給予讀者日常護理的信心。
    美學傳承與反思：總結它如何從實驗室數據或小眾趨勢，走入現代人的化妝台，成為跨越世代的美麗寄託。

現在，請以「${ctx.theme}」為主題，開始撰寫這份嚴謹的科學報告。`,
  },
  {
    id: 2,
    title: "長影音腳本撰寫",
    description: "根據基礎背景，產出 5-10 分鐘的 YouTube 長影片文案。",
    type: "text",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請根據以下【經過專家查核的基礎科學資料】，為「${ctx.theme}」撰寫一份 5-10 分鐘的 YouTube 長影片腳本。

【⚠️ 絕對真實性指令】：
你在本腳本中提及的所有成分、機轉、專有名詞與護膚步驟，必須 100% 遵守下方提供的背景資料，不可修改名詞定義與功效宣稱。

背景資料：
${ctx.step1}

腳本需求：包含引人入勝的痛點開場、深度成分與誤區解析、以及總結與互動引導。`,
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

請提供：5 個 Hook 標題（需帶有痛點解決或趨勢感）、10 個熱門美妝保養 Hasthtags、以及 150 字影片說明、時間軸建議。`,
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

需求：節奏明快，前 3 秒必須有鉤子 (Hook，如「你以為的保養其實在毀容？」)，內容精簡有力，直擊痛點與解法。`,
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

請提供：3 個衝擊力強、適合短影音演算法的標題。`,
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
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號。
AI Prompt (中文) 必須包含：high-end beauty editorial, minimalist luxury aesthetic, crisp studio lighting, soft shadows, macro product texture, clean girl aesthetic, high-end cosmetics branding, pastel neutral tones, cinematic lighting, ultra detailed。結尾必須包含：--ar 16:9

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入縮圖名稱]
主標：[請填入10字以內主標內容]
副標：[請填入8字以內副標內容]
中文：[請填入中文 Prompt，具體描述產品外觀、質地微距或膚質光澤]`,
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
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號。
AI Prompt (中文) 必須包含：high-end beauty editorial, minimalist luxury aesthetic, crisp studio lighting, soft shadows, macro product texture, clean girl aesthetic, high-end cosmetics branding, pastel neutral tones, cinematic lighting, ultra detailed。結尾必須包含：--ar 9:16

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入短影音縮圖名稱]
高點擊文案：[請填入	主標內容]
中文：[請填入中文 Prompt，具體描述產品外觀、質地微距或膚質光澤]`,
  },
  {
    id: 8,
    title: "品牌高奢行銷海報",
    description: "生成 3 組 9:16 高奢行銷海報。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組 9:16 高奢行銷海報。
視覺設計必須包含風格標籤 (high-end beauty editorial, minimalist luxury aesthetic, crisp studio lighting, soft shadows, macro product texture, clean girl aesthetic, high-end cosmetics branding, pastel neutral tones, cinematic lighting, ultra detailed)，充滿極簡美學與高級保養質地的氛圍。

【格式絕對鎖定指令】：
你現在是美妝保養行銷專家，
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號。
AI Prompt (中文) 必須包含：high-end beauty editorial, minimalist luxury aesthetic, crisp studio lighting, soft shadows, macro product texture, clean girl aesthetic, high-end cosmetics branding, pastel neutral tones, cinematic lighting, ultra detailed。 結尾必須包含：--ar 9:16

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入高奢行銷海報名稱]
核心文案：[請填入八字以內的頂級美妝文案]
促銷副標：[請填入副標]
中文Prompt：[美妝保養行銷專家設計中文 Prompt]`,
  },
  {
    id: 9,
    title: "Suno AI 配樂設計",
    description: "生成 3 組符合主題氛圍的音樂生成指令。",
    type: "code",
    language: "markdown",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組 Suno AI 音樂生成 Prompt。
場景設計分別為：1. 秀場感（高級感與力量感開場）、2. 療癒感（沉浸式保養/日常放鬆）、3. 輕快感（美妝教學/短影片節奏）。

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號。
Suno AI 中文 Prompt 必須包含 Music Style、Instruments、Tempo。

請直接輸出以下格式，依照三種場景順序生成：

### 第一組：秀場感
適用場景：[如：高奢穿搭/彩妝氣勢開場]
Suno AI Prompt：[請填入包含參數的中文 Prompt 內容，例如：Deep House, heavy bass, confident, 120 BPM]

### 第二組：療癒感
適用場景：[如：沉浸式夜間護膚、ASMR]
Suno AI Prompt：[請填入包含參數的中文 Prompt 內容，例如：Ambient, soft electric piano, relaxing, 80 BPM]

### 第三組：輕快感
適用場景：[如：快速出門妝容、OOTD 分享]
Suno AI Prompt：[請填入包含參數的中文 Prompt 內容，例如：Upbeat Indie Pop, bright synth, energetic, 115 BPM]`,
  },
  {
    id: 10,
    title: "社群推播發控中心",
    description: "一鍵生成動態視覺提示詞、圖卡排版字卡與社群正文",
    type: "social",
    language: "markdown",
    dependsOn: ["theme", "step1"],
    prompt: (ctx) => `你現在是頂級美妝保養雜誌視覺總監與高轉化美妝社群文案主編。
你的任務是根據下方的【基礎背景科學查核】，為主題「${ctx.theme}」打造一組「高奢雜誌風」社群圖文懶人包。

【⚠️ 絕對真實性指令】：
所有萃取的資訊，必須完全基於下方科學資料，禁止腦補。

【基礎背景科學查核】：
${ctx.step1}


---
### 任務：撰寫社群發布正文
使用精緻、推心置腹且具專業公信力的語氣。將科學資料轉化為 3~5 點易讀的亮點或誤區解析，並以痛點提問開場，以產品導流收尾。

---

### 📱 社群發布正文
[請填入帶有精緻 Emoji 的痛點 Hook 開場白，例如：妳以為的保養，其實是在虐肌？]

[請條列 3-5 點核心亮點解析，每點包含一個精緻小標題與兩句科學解說，必須基於資料]

[互動提問：邀請粉絲留言分享自己的膚質或使用經驗]
精準護膚、拒絕盲從，點擊看更多皮膚科醫師推薦的無雷清單 ➔ [此處自動帶入品牌導購連結 / 讀者專屬優惠碼]

#精準護膚 #${ctx.theme} [請再補充 3-5 個美妝保養熱門 Hashtags]
`
  }
],
    food: [
  {
    id: 1,
    title: "美食基礎知識與文化查核",
    description: "針對料理、食材、美食文化或飲食趨勢進行科學、歷史與文化查核。",
    type: "text",
    dependsOn: ["theme"],
    prompt: (ctx) => `你是一位嚴謹的飲食文化研究者、美食評論家與料理主編。

請針對主題「${ctx.theme}」撰寫一份約1500字的專業美食知識報告。

請注意，網路上充滿都市傳說、料理迷思與錯誤資訊，所有內容必須建立於食品科學、飲食文化、歷史文獻與料理知識，不可AI臆測。

請依照以下架構撰寫：

## 一、導言：這道料理（食材）為什麼紅？
• 現代飲食趨勢
• 市場熱度
• 流行原因

## 二、核心定義
• 正式名稱
• 常見俗稱
• 所屬料理系統
• 主要特色

## 三、起源與歷史
• 發源地
• 歷史故事
• 演變過程
• 世界各地版本

## 四、食材與料理特色
• 核心食材
• 烹調方式
• 味道層次
• 經典吃法

## 五、外觀與擺盤美學
• 色彩特色
• 質地
• 香氣描述
• 擺盤風格

## 六、適合族群與飲食建議
• 適合哪些人
• 飲食禁忌
• 營養特色
• 常見搭配

## 七、推薦餐廳與代表料理
• 經典名店
• 地區特色
• 必吃版本

## 八、美食迷思破解
破解常見錯誤觀念、料理都市傳說與網路流言。

## 九、結語
總結這道料理如何成為經典，並分享它在現代飲食文化中的價值。

現在開始撰寫「${ctx.theme}」完整美食知識報告。`
  },

  {
    id: 2,
    title: "長影音腳本撰寫",
    description: "根據美食背景資料產出5-10分鐘YouTube影片腳本。",
    type: "text",
    dependsOn: ["theme","step1"],
    prompt:(ctx)=>`請根據以下美食背景資料，為「${ctx.theme}」撰寫一份5-10分鐘YouTube長影片腳本。

背景資料：

${ctx.step1}

內容需包含：

• 開場Hook
• 美食歷史
• 食材介紹
• 烹調特色
• 品嚐重點
• 推薦吃法
• 常見迷思
• 結尾互動CTA

所有內容必須遵守背景資料，不可自行添加不存在的歷史或知識。`
  },

  {
    id:3,
    title:"長影音SEO優化",
    description:"生成SEO標題、Hashtags、說明欄。",
    type:"text",
    dependsOn:["theme","step2"],
    prompt:(ctx)=>`根據以下影片腳本：

${ctx.step2}

請提供：

1. 五個高點擊YouTube標題
2. 十個熱門美食Hashtags
3. 約150字影片介紹
4. 建議時間軸(Timestamp)

主題為：「${ctx.theme}」。`
  },

  {
    id:4,
    title:"短影音腳本",
    description:"生成60秒內爆款短影音腳本。",
    type:"text",
    dependsOn:["theme","step1"],
    prompt:(ctx)=>`請依據背景資料：

${ctx.step1}

撰寫「${ctx.theme}」60秒內YouTube Shorts / TikTok腳本。

需求：

• 前3秒Hook
• 快節奏
• 食物特寫描述
• 必吃原因
• 結尾CTA`
  },

  {
    id:5,
    title:"短影音SEO",
    description:"生成短影音SEO標題。",
    type:"text",
    dependsOn:["theme","step4"],
    prompt:(ctx)=>`依據以下短影音：

${ctx.step4}

請提供三組高CTR短影音標題。`
  },

  {
    id:6,
    title:"長影音縮圖設計",
    description:"生成16:9 YouTube縮圖。",
    type:"code",
    language:"markdown",
    dependsOn:["theme","step3"],
   prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組長影音 YouTube 縮圖設計 (16:9)。
參考背景：${ctx.step3}

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（  ）。

AI Prompt (中文) 必須包含：

high-end food photography,
Michelin restaurant style,
cinematic food lighting,
warm natural light,
macro food texture,
luxury dining,
steam effect,
appetizing colors,
premium plating,
ultra detailed

最後加入：

--ar 16:9

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入縮圖名稱]
主標：[請填入主標內容]
副標：[請填副標內容]
中文：[請填入中文 Prompt]`,

  },

  {
    id:7,
    title:"短影音封面設計",
    description:"生成9:16 Shorts封面。",
    type:"code",
    language:"markdown",
    dependsOn:["theme","step5"],
    prompt: (ctx) => `請針對主題「${ctx.theme}」生成 3 組短影音 YouTube 縮圖設計 (9:16)。
參考背景：${ctx.step5}

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（  ）。
AI Prompt (中文) 必須包含：

high-end food photography,
cinematic lighting,
luxury restaurant,
macro texture,
golden crispy,
fresh ingredients,
steam,
premium plating,
ultra detailed

最後加入

--ar 9:16

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：

### 第一組：[請填入短影音縮圖名稱]
高點擊文案：[請填入主標內容]
中文：[請填入中文 Prompt]`,
  },

  {
    id:8,
    title:"品牌級美食海報",
    description:"生成高質感餐飲行銷海報。",
    type:"code",
    language:"markdown",
    dependsOn:["theme"],
    prompt:(ctx)=>`請針對「${ctx.theme}」設計三組9:16品牌級美食海報。

【格式絕對鎖定指令】：
你現在是一個自動化資料轉換 API。禁止任何開場白、問候語、解釋或結語。
請【完全且嚴格】拷貝下方的 Markdown 模板進行填寫，不可新增任何標籤、不可改變欄位名稱、不可隨意加上粗體符號（  ）。
AI Prompt (中文) 必須包含：

Michelin food photography,
luxury restaurant branding,
warm cinematic lighting,
premium ingredients,
macro texture,
minimalist composition,
editorial food magazine,
ultra detailed

最後加入-- 16:9


格式：

請直接輸出以下格式，重複三次（第一組、第二組、第三組）：
### 第一組：[請填入名稱]
核心文案：
促銷副標：
中文：[請填入中文畫面描述]`,
  },

  {
    id:9,
    title:"Suno AI 美食配樂",
    description:"生成三組美食影片音樂。",
    type:"code",
    language:"markdown",
    dependsOn:["theme","step1"],
    prompt:(ctx)=>`請針對「${ctx.theme}」設計三組Suno AI音樂。

場景：

1. 高級餐廳
2. 美食紀錄片
3. 探店Vlog

格式：

### 第一組
適用場景：
Suno AI Prompt：

Prompt須包含：

Music Style
Instruments
Tempo`
  },

    {
      id:10,
      title:"社群美食發布中心",
      description:"生成Instagram、Facebook、小紅書貼文。",
      type:"social",
      language:"markdown",
      dependsOn:["theme","step1"],
      prompt:(ctx)=>`你是一位頂級美食雜誌總編輯與餐飲品牌社群行銷專家。

根據以下資料：

${ctx.step1}

請製作一篇高互動社群貼文。

內容包含：

📍痛點Hook

🍽️ 3~5個美食亮點
• 食材特色
• 料理特色
• 必吃原因
• 推薦搭配

💬 留言互動

📍店家資訊（可留空供後續填寫）

📣 CTA

最後加入：

#${ctx.theme}

並補充5個熱門美食Hashtags。`
    }
  ],
  travelpreneur: [
    {
      id: 1,
      title: "旅遊目的地背景查核",
      description: "蒐集目的地歷史、文化、景點、美食、交通與旅遊資訊，建立可信基礎資料。",
      type: "text",
      dependsOn: ["theme"],
      prompt: (ctx) => `你是一位資深旅遊作家、旅遊規劃師與文化研究專家。

請針對旅遊主題「${ctx.theme}」撰寫約1500字的完整旅遊背景報告。

請依照以下架構：

## 一、目的地介紹
- 國家／城市
- 地理位置
- 最佳旅遊季節
- 氣候特色

## 二、歷史文化
- 發展歷史
- 在地文化
- 世界文化遺產
- 節慶活動

## 三、必去景點
- Top 10 景點
- 推薦理由
- 建議停留時間
- 最佳拍照時間

## 四、在地美食
- 必吃料理
- 必喝飲品
- 在地甜點
- 夜市／市場推薦

## 五、交通攻略
- 國際交通
- 市區交通
- 一日券
- IC卡
- 租車建議

## 六、住宿推薦
- 豪華飯店
- 商務飯店
- 民宿
- 青年旅館

## 七、旅遊預算
- 一日預算
- 三天兩夜
- 五天四夜

## 八、旅遊注意事項
- 簽證
- 網路
- 插座
- 貨幣
- 小費文化
- 安全提醒

## 九、推薦行程
提供三種玩法：
- 一日遊
- 三日遊
- 五日深度旅行

最後總結此目的地最值得造訪的原因。`
    },

    {
      id: 2,
      title: "長影音腳本",
      description: "產出8~12分鐘YouTube旅遊攻略影片。",
      type: "text",
      dependsOn: ["theme", "step1"],
      prompt: (ctx) => `根據以下旅遊背景資料：

${ctx.step1}

請撰寫「${ctx.theme}」8~12分鐘YouTube旅遊攻略。

內容包含：

1. Hook
2. 地點介紹
3. 必去景點
4. 美食推薦
5. 交通攻略
6. 住宿推薦
7. 花費公開
8. 行程建議
9. 結尾CTA

風格像旅遊YouTuber分享攻略。`
    },

    {
      id: 3,
      title: "長影音SEO",
      description: "產生YouTube SEO內容。",
      type: "text",
      dependsOn: ["theme", "step2"],
      prompt: (ctx) => `依據影片腳本：

${ctx.step2}

請提供：

1. 五個高CTR標題
2. 十個熱門Hashtags
3. 約200字影片介紹
4. YouTube Timestamp
5. SEO關鍵字20組`
    },

    {
      id: 4,
      title: "Shorts腳本",
      description: "生成60秒旅遊Shorts腳本。",
      type: "text",
      dependsOn: ["theme", "step1"],
      prompt: (ctx) => `根據背景資料：

${ctx.step1}

請撰寫60秒Shorts腳本。

需求：

• 前3秒Hook
• 景點快速介紹
• 美食亮點
• 必玩特色
• CTA

節奏快速，適合TikTok與YouTube Shorts。`
    },

    {
      id: 5,
      title: "Shorts SEO",
      description: "生成Shorts SEO。",
      type: "text",
      dependsOn: ["theme", "step4"],
      prompt: (ctx) => `根據以下Shorts：

${ctx.step4}

請提供：

- 三個爆款標題
- 五個熱門Hashtags
- 一段Shorts說明。`
    },

    {
      id: 6,
      title: "YouTube縮圖",
      description: "生成16:9縮圖Prompt。",
      type: "code",
      language: "markdown",
      dependsOn: ["theme", "step3"],
      prompt: (ctx) => `請針對「${ctx.theme}」生成三組YouTube縮圖。

格式：

### 第一組
主標：
副標：
中文Prompt：

Prompt需包含：

travel photography,
cinematic travel,
golden hour,
drone aerial,
vibrant colors,
luxury travel,
editorial travel magazine,
ultra detailed,
8k

最後加入：

--ar 16:9`
    },

    {
      id: 7,
      title: "Shorts封面",
      description: "生成9:16 Shorts封面。",
      type: "code",
      language: "markdown",
      dependsOn: ["theme", "step5"],
      prompt: (ctx) => `請生成三組9:16 Shorts封面。

格式：

### 第一組
標題：
中文Prompt：

Prompt需包含：

travel photography,
vacation mood,
golden hour,
drone shot,
cinematic,
ultra detailed

最後加入：

--ar 9:16`
    },

    {
      id: 8,
      title: "旅遊品牌海報",
      description: "生成高質感旅遊宣傳海報。",
      type: "code",
      language: "markdown",
      dependsOn: ["theme"],
      prompt: (ctx) => `請設計三組旅遊品牌海報。

格式：

### 第一組
主文案：
副文案：
中文Prompt：

Prompt需包含：

luxury travel poster,
editorial travel,
cinematic lighting,
golden hour,
drone view,
vibrant colors,
premium tourism,
ultra detailed

最後加入：

--ar 9:16`
    },

    {
      id: 9,
      title: "Suno AI 配樂",
      description: "生成旅遊影片背景音樂。",
      type: "code",
      language: "markdown",
      dependsOn: ["theme", "step1"],
      prompt: (ctx) => `請設計三組旅遊影片背景音樂。

第一組：
史詩旅行

第二組：
咖啡廳Vlog

第三組：
Road Trip

格式：

### 第一組
適用場景：
Suno AI Prompt：

Prompt包含：

Music Style
Mood
Instruments
Tempo`
    },

    {
      id: 10,
      title: "社群發布中心",
      description: "生成IG、Facebook、Threads、小紅書旅遊貼文。",
      type: "social",
      language: "markdown",
      dependsOn: ["theme", "step1"],
      prompt: (ctx) => `你是一位旅遊雜誌總編輯與旅遊品牌社群行銷專家。

根據：

${ctx.step1}

請製作一篇完整社群貼文。

內容包含：

📍吸睛Hook

✨ 3~5個旅遊亮點

📸 最美拍照景點

🍜 必吃美食

🚆 交通小技巧

💰 預算建議

💬 留言互動

📌 收藏CTA

最後加入：

#${ctx.theme}

以及5~10個熱門旅遊Hashtags。`
    }
  ],
  pet: [
    {
      id: 1,
      title: "寵物問題研究與專家查核",
      description: "深入分析寵物問題成因、行為學、獸醫觀點與最新研究，建立可信基礎資料。",
      type: "text",
      dependsOn: ["theme"],
      prompt: (ctx: any) => `你是一位獸醫、動物行為學專家、寵物營養師與寵物媒體總編輯。

請針對主題「${ctx.theme}」撰寫一份約1500字的完整分析。

主題可能是：
- 行為問題
- 健康疾病
- 飲食營養
- 飼養技巧
- 訓練方法
- 品種問題

請依照以下架構：

## 一、問題介紹
- 問題是什麼？
- 常見程度
- 哪些犬貓最容易發生？

## 二、真正原因
- 生理原因
- 心理原因
- 環境因素
- 年齡因素

## 三、如何判斷
- 正常現象
- 異常警訊
- 什麼情況要看獸醫？

## 四、解決方法
- 在家可以做什麼？
- 專家建議
- 正確改善流程

## 五、常見錯誤
- 網路迷思
- 錯誤訓練
- 常犯錯誤

## 六、預防方法
- 日常照護
- 飲食建議
- 環境改善

## 七、結論
整理重點並提供飼主建議。`
    },

    {
      id: 2,
      title: "長影音腳本",
      description: "產出8~12分鐘問題解決型YouTube影片。",
      type: "text",
      dependsOn: ["theme", "step1"],
      prompt: (ctx: any) => `根據以下資料：

${ctx.step1}

請撰寫8~12分鐘YouTube腳本。

內容包含：

1. 前5秒Hook
2. 常見迷思
3. 問題真正原因
4. 如何改善
5. 什麼情況需要看獸醫
6. 常見QA
7. CTA

語氣像專業寵物知識頻道。`
    },

    {
      id: 3,
      title: "影片SEO優化",
      description: "產生YouTube SEO。",
      type: "text",
      dependsOn: ["theme", "step2"],
      prompt: (ctx: any) => `根據影片腳本：

${ctx.step2}

請提供：

- 五個高CTR標題
- 十個熱門Hashtags
- 200字影片介紹
- Timestamp
- 20組SEO搜尋關鍵字

請優先符合Google與YouTube搜尋習慣。`
    },

    {
      id: 4,
      title: "Shorts腳本",
      description: "生成60秒爆款短影音。",
      type: "text",
      dependsOn: ["theme", "step1"],
      prompt: (ctx: any) => `根據以下資料：

${ctx.step1}

請撰寫60秒Shorts。

需求：

前三秒必須Hook。

例如：

「狗一直舔腳？千萬別只擦藥！」

內容需包含：

Hook
原因
快速解法
CTA`
    },

    {
      id: 5,
      title: "Shorts SEO",
      description: "生成Shorts SEO。",
      type: "text",
      dependsOn: ["theme", "step4"],
      prompt: (ctx: any) => `依據Shorts：

${ctx.step4}

請提供：

- 三個爆款標題
- 五個熱門Hashtags
- Shorts說明。`
    },

    {
      id: 6,
      title: "YouTube縮圖",
      description: "生成三組高CTR縮圖。",
      type: "code",
      language: "markdown",
      dependsOn: ["theme", "step3"],
      prompt: (ctx: any) => `請針對「${ctx.theme}」生成三組YouTube縮圖。

格式：

### 第一組
主標：
副標：
中文Prompt：

Prompt必須包含：

cute pet,
professional pet photography,
veterinary clinic,
emotional expression,
soft natural lighting,
high detail,
editorial style,
8k

最後加入：

--ar 16:9`
    },

    {
      id: 7,
      title: "Shorts封面",
      description: "生成9:16封面。",
      type: "code",
      language: "markdown",
      dependsOn: ["theme", "step5"],
      prompt: (ctx: any) => `請生成三組Shorts封面。

格式：

### 第一組

標題：

中文Prompt：

Prompt需包含：

cute puppy,
cute kitten,
close-up,
soft lighting,
adorable,
high detail

最後加入：

--ar 9:16`
    },

    {
      id: 8,
      title: "用品推薦與品牌合作",
      description: "推薦相關用品、品牌合作與導購文案。",
      type: "text",
      dependsOn: ["theme", "step1"],
      prompt: (ctx: any) => `根據：

${ctx.step1}

請推薦：

1. 五種適合商品
2. 推薦理由
3. 適合族群
4. 商品比較
5. 品牌合作建議
6. 聯盟行銷CTA

內容需保持客觀，不得誇大產品效果。`
    },

    {
      id: 9,
      title: "Suno AI配樂",
      description: "生成三組寵物影片背景音樂。",
      type: "code",
      language: "markdown",
      dependsOn: ["theme"],
      prompt: (ctx: any) => `請設計三組背景音樂。

第一組：
可愛療癒

第二組：
知識教學

第三組：
活潑Vlog

格式：

### 第一組

適用場景：

Suno AI Prompt：

包含：

Music Style
Mood
Tempo
Instruments`
    },

    {
      id: 10,
      title: "社群內容中心",
      description: "生成IG、FB、Threads、小紅書完整貼文。",
      type: "social",
      language: "markdown",
      dependsOn: ["theme", "step1"],
      prompt: (ctx: any) => `你是一位寵物媒體總編輯。

依據：

${ctx.step1}

請製作一篇高互動社群貼文。

內容包含：

🐶 吸睛Hook

📌 三至五個重點

⚠️ 常見迷思

❤️ 專家提醒

💬 留言互動

📣 CTA

最後加入：

#${ctx.theme}

以及10個熱門寵物Hashtags。`
    }
  ]
};

export const getWorkflowSteps = (themeId: string): WorkflowStep[] => {
  return WORKFLOWS_REGISTRY[themeId] || WORKFLOWS_REGISTRY['CultureTech'];
};

export const WORKFLOW_STEPS: WorkflowStep[] = WORKFLOWS_REGISTRY['CultureTech'];



