// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Settings, 
  Play, Pause, FastForward, Sparkles, CheckCircle2, Circle, 
  Terminal, ServerCrash, Share2, UploadCloud, ChevronRight,
  Database, Video, Search, Music, Facebook, MousePointerClick,
  Sliders, Link, RefreshCw, Key, HelpCircle, HardDrive, 
  Eye, Check, ListTodo, Send, Volume2, Download, Zap, X,
  Users, Palette, ShieldAlert, BookOpen, Sun, ChevronDown, Award
} from 'lucide-react';

const AUDIENCE_THEMES = {
  creator: {
    id: 'creator',
    title: '全職影音創作者',
    subtitle: 'Cinematic Pink 劇院流動風',
    desc: '高對比、暗房極簡、RGB 霓虹電競感。專為長時間調色與靈感爆發設計。',
    gradient: 'from-pink-500 via-purple-500 to-indigo-500',
    primaryColor: 'purple-500',
    borderActive: 'border-purple-500/50',
    textActive: 'text-purple-300',
    bgActive: 'bg-purple-600/10',
    bgBadge: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    primaryBtn: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-purple-500/20',
    secondaryBtn: 'bg-purple-500/10 text-purple-300 border-purple-500/20 hover:bg-purple-500/20',
    textMuted: 'text-purple-400',
    accentText: 'text-pink-400',
    accentBg: 'bg-pink-500/10',
    ringColor: 'focus:ring-purple-500 focus:border-purple-500',
    pipelineCurrent: 'bg-purple-900/40 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.25)]',
    pipelineCurrentIcon: 'bg-purple-500 text-white animate-pulse',
    tagBg: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
    themeLogMessage: '[Theme] 已切換至「全職影音創作者 (Cinematic Pink)」模式。優化低光源剪輯視覺，啟動 RGB 電競靈感調幅機制 🟢'
  },
  beauty: {
    id: 'beauty',
    title: '時尚美妝保養',
    subtitle: 'Glamour Rose 奢華玫瑰金',
    desc: '高質感、溫柔優雅、奢華玫瑰粉與香檳金。專為美妝、穿搭與高感性生活視覺設計。',
    gradient: 'from-rose-400 via-pink-500 to-amber-500',
    primaryColor: 'pink-500',
    borderActive: 'border-pink-500/50',
    textActive: 'text-pink-300',
    bgActive: 'bg-pink-600/10',
    bgBadge: 'bg-pink-500/10 border-pink-500/20 text-pink-300',
    primaryBtn: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white shadow-pink-500/20',
    secondaryBtn: 'bg-pink-500/10 text-pink-300 border-pink-500/20 hover:bg-pink-500/20',
    textMuted: 'text-pink-400',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    ringColor: 'focus:ring-pink-500 focus:border-pink-500',
    pipelineCurrent: 'bg-pink-900/40 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.25)]',
    pipelineCurrentIcon: 'bg-pink-500 text-white animate-pulse',
    tagBg: 'bg-pink-500/10 border-pink-500/20 text-pink-300',
    themeLogMessage: '[Theme] 已切換至「時尚美妝保養 (Glamour Rose)」模式。啟動精緻暖色調高光補償，提升美感氛圍 🟢'
  },
  solopreneur: {
    id: 'travelpreneur',
    title: '旅遊先行者',
    subtitle: 'Indie Amber 極速金澄風',
    desc: '極速執行力、黃金極簡微光。專為單兵作業、產品發布與高商業價值轉換設計。',
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    primaryColor: 'amber-500',
    borderActive: 'border-amber-500/50',
    textActive: 'text-amber-300',
    bgActive: 'bg-amber-600/10',
    bgBadge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    primaryBtn: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-500/20',
    secondaryBtn: 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:bg-amber-500/20',
    textMuted: 'text-amber-400',
    accentText: 'text-yellow-400',
    accentBg: 'bg-yellow-500/10',
    ringColor: 'focus:ring-amber-500 focus:border-amber-500',
    pipelineCurrent: 'bg-amber-900/40 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]',
    pipelineCurrentIcon: 'bg-amber-500 text-white animate-pulse',
    tagBg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    themeLogMessage: '[Theme] 已切換至「一人創業家 (Indie Amber)」模式。高對比金黃預警，啟動單兵作戰、快速發布極速模式 🟢'
  },
  food: {
    id: 'food',
    title: '美食生活創作者',
    subtitle: 'Gourmet Ruby 煙火赤紅風',
    desc: '挑逗食慾的寶石紅與珊瑚橘。專為料理探店、食譜分享與高誘惑力視覺設計。',
    gradient: 'from-rose-500 via-red-500 to-orange-500',
    primaryColor: 'red-500',
    borderActive: 'border-red-500/50',
    textActive: 'text-red-300',
    bgActive: 'bg-red-600/10',
    bgBadge: 'bg-red-500/10 border-red-500/20 text-red-300',
    primaryBtn: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-red-500/20',
    secondaryBtn: 'bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20',
    textMuted: 'text-red-400',
    accentText: 'text-rose-400',
    accentBg: 'bg-rose-500/10',
    ringColor: 'focus:ring-red-500 focus:border-red-500',
    pipelineCurrent: 'bg-red-900/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.25)]',
    pipelineCurrentIcon: 'bg-red-500 text-white animate-pulse',
    tagBg: 'bg-red-500/10 border-red-500/20 text-red-300',
    themeLogMessage: '[Theme] 已切換至「美食生活創作者 (Gourmet Ruby)」模式。強化暖色系渲染，啟動高食慾誘惑力調色配置 🟢'
  },
  education: {
    id: 'education',
    title: '親子教育工作者',
    subtitle: 'Nurturing Sky 溫和知性藍',
    desc: '傳遞信任與安定的天空藍。專為課程設計、知識傳遞與溫和友善的排版設計。',
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
    primaryColor: 'blue-500',
    borderActive: 'border-blue-500/50',
    textActive: 'text-blue-300',
    bgActive: 'bg-blue-600/10',
    bgBadge: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    primaryBtn: 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-blue-500/20',
    secondaryBtn: 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20',
    textMuted: 'text-blue-400',
    accentText: 'text-sky-400',
    accentBg: 'bg-sky-500/10',
    ringColor: 'focus:ring-blue-500 focus:border-blue-500',
    pipelineCurrent: 'bg-blue-900/40 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.25)]',
    pipelineCurrentIcon: 'bg-blue-500 text-white animate-pulse',
    tagBg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
    themeLogMessage: '[Theme] 已切換至「親子教育工作者 (Nurturing Sky)」模式。降低視覺刺激，啟動安定、知性與信任感佈局 🟢'
  }
};

// ============================================================================
// --- 結合 Vercel 邏輯與 Gemini Canva API 的全新生成函數 ---
async function callVercelApi(stepId: any, context: any) {
    // 步驟 1：向 Vercel 請求「該步驟專屬的 Prompt 字串」
    const VERCEL_API_URL = 'https://gen-imprint.vercel.app/api/gemini';
    const promptResponse = await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, context })
    });
    if (!promptResponse.ok) {
        throw new Error(`Vercel 邏輯引擎錯誤: ${promptResponse.status}`);
    }
    const { prompt } = await promptResponse.json();
    // 步驟 2：拿到 Prompt 後，在前端直接打 Gemini Canva 官方 API
    const apiKey = typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });
    if (!aiResponse.ok) {
        throw new Error(`Google API 錯誤: ${aiResponse.status}`);
    }
    
    const data = await aiResponse.json();
    return data.candidates[0].content.parts[0].text;
}

// ============================================================================
// 2. 瘦身版 STEPS (已移除 Prompt，交由 Vercel 後端處理)
// ============================================================================
const STEPS = [
  { id: 1, name: '基礎背景事實查核', icon: Database, category: 'Research', desc: '針對主題進行定義釐清與客觀史料彙整', type: "text", dependsOn: ["theme"] },
  { id: 2, name: "長影音腳本撰寫", icon: FileText, category: 'Content', desc: "根據基礎背景，產出 5-10 分鐘的 YouTube 長影片文案。", type: "text", dependsOn: ["theme", "step1"] },
  { id: 3, name: "長影音 SEO 優化", icon: Search, category: 'Optimization', desc: "生成標題、標籤與說明欄內容。", type: "text", dependsOn: ["theme", "step2"] },
  { id: 4, name: "短影音腳本撰寫", icon: Video, category: 'Content', desc: "產出 60 秒內的精簡爆款短影片文案。", type: "text", dependsOn: ["theme", "step1"] },
  { id: 5, name: "短影音 SEO 優化", icon: Search, category: 'Optimization', desc: "生成短影片標題與標籤。", type: "text", dependsOn: ["theme", "step4"] },
  { id: 6, name: "長影音縮圖設計", icon: ImageIcon, category: 'Visuals', desc: "生成 3 組 16:9 YouTube 縮圖文案與 AI 繪圖指令。", type: "code", language: "markdown", dependsOn: ["theme", "step3"] },
  { id: 7, name: "短影音縮圖設計", icon: ImageIcon, category: 'Visuals', desc: "生成 3 組 9:16 短影音縮圖文案與 AI 繪圖指令。", type: "code", language: "markdown", dependsOn: ["theme", "step5"] },
  { id: 8, name: "彩墨風格意象圖", icon: ImageIcon, category: 'Visuals', desc: "生成 3 組 16:9 意象圖指令與搭配詩詞。", type: "code", language: "markdown", dependsOn: ["theme"] },
  { id: 9, name: "Suno AI 配樂設計", icon: Music, category: 'Audio', desc: "生成 3 組符合主題氛圍的音樂生成指令。", type: "code", language: "markdown", dependsOn: ["theme", "step1"] },
  { id: 10, name: "社群推播發控中心", icon: Facebook, category: 'Distribution', desc: "一鍵生成動態視覺提示詞、圖卡排版字卡與社群正文", type: "social", language: "markdown", dependsOn: ["theme", "step1"] }
];

const getInitialStepContent = (stepId, themeText, previousContents = {}) => {
  const step = STEPS.find(s => s.id === stepId);
  if (!step) return "請選擇一個步驟進行檢視。";
  
  return `【等待從 Vercel 伺服器獲取資料...】\n\n點擊「一鍵全自動模式」或單步「重新生成」來向伺服器發送請求。`;
};

// ============================================================================
// 3. React 元件主體與狀態
// ============================================================================
export default function App() {
  // --- 狀態管理保持不變 ---
  const [activeTab, setActiveTab] = useState('creation'); 
  const [viewState, setViewState] = useState('hub'); 
  const [mode, setMode] = useState('manual'); 
  const [activeStep, setActiveStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
   const [theme, setTheme] = useState('');
   const [completedSteps, setCompletedSteps] = useState([1]); 
     const [visualStep, setVisualStep] = useState(6);
  const [audienceTheme, setAudienceTheme] = useState('creator');
  const curTheme = AUDIENCE_THEMES[audienceTheme];
  const [stepContents, setStepContents] = useState({
    1: getInitialStepContent(1, ""), 2: getInitialStepContent(2, ""), 3: getInitialStepContent(3, ""),
    4: getInitialStepContent(4, ""), 5: getInitialStepContent(5, ""), 6: getInitialStepContent(6, ""),
    7: getInitialStepContent(7, ""), 8: getInitialStepContent(8, ""), 9: getInitialStepContent(9, "")
  });

 // 🔽 新增這三個變數來控制 Notion 下拉選單 🔽
  const [archiveList, setArchiveList] = useState([]); 
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");
  // 🔽 新增這個 useEffect，一開網頁就自動去 Vercel 拿 Notion 清單 🔽
  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const response = await fetch('https://gen-imprint.vercel.app/api/notion/history');
        const data = await response.json();
        if (data.history) {
          setArchiveList(data.history);
        }
      } catch (err) {
        console.error("無法載入 Notion 專案清單", err);
      }
    };
    fetchArchives();
  }, []);

  const [logs, setLogs] = useState([
    { time: "23:22:36", text: "[System] GenImprint Pro OS 初始化完畢。", type: "info" },
    { time: "23:22:40", text: "[System] 系統就緒。主美學配置：全職影音創作者 (Cinematic Pink)", type: "default" }
  ]);
  
  const [aiStatus, setAiStatus] = useState('pro'); 
  const [credits, setCredits] = useState(125);
  const [isNotionExporting, setIsNotionExporting] = useState(false);
  const [notionStatus, setNotionStatus] = useState('尚未歸檔');
  const [notionUrl, setNotionUrl] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState(35);
  const [musicGenre, setMusicGenre] = useState('Synthwave');
  const [lyricsText, setLyricsText] = useState('在霓虹閃爍的深夜... 代碼在螢幕上跳動，這是一個人的戰場...');
  const [midjourneyPrompt, setMidjourneyPrompt] = useState('A futuristic 3D render of a content creator workspace in 2026, holographic displays, neon glowing colors --ar 16:9');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [generatedImages, setGeneratedImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: '第一組中文Prompt' },
    { id: 2, url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: '第二組中文Prompt' },
    { id: 3, url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: '第三組中文Prompt' }
  ]);

  const [groupImages, setGroupImages] = useState({});
  const [generatingGroups, setGeneratingGroups] = useState({});

  const visualGroups = useMemo(() => {
    const text = stepContents[visualStep];
    if (!text) return [];
    
    // Step 10 Composite Layout Parsing
    if (visualStep === 10 && (text.includes('16:9 動態分割構圖') || text.includes('9:16 動態分割構圖') || text.includes('4:3 4 張圖卡'))) {
      const compositeGroups = [];
      const blocks = text.split(/(?=16:9 動態分割構圖|9:16 動態分割構圖|### 🖼️ 4:3 4 張圖卡)/);
      blocks.forEach((block, index) => {
        if (!block.trim()) return;
        let layoutType = "";
        let layoutName = "";
        if (block.includes("16:9 動態分割構圖")) { layoutType = "16:9"; layoutName = "16:9 動態分割構圖"; }
        else if (block.includes("9:16 動態分割構圖")) { layoutType = "9:16"; layoutName = "9:16 動態分割構圖"; }
        else if (block.includes("4:3 4 張圖卡")) { layoutType = "4:3"; layoutName = "4:3 排版字卡"; }
        else return; // Ignore introductory text
        
        const mainTitleMatch = block.match(/(?:主標|主標題)\s*[：:]\s*(.*?)(?=\n|$)/);
        const subTitleMatch = block.match(/(?:副標|副標題)\s*[：:]\s*(.*?)(?=\n|$)/);
        
        // 兼容「1. 畫格 1：」與「1. ###圖卡標題：」
        const frameRegex = /\d+\.\s*(?:畫格|###圖卡)[^\n]*\n([\s\S]*?)(?=(?:\n\s*\d+\.\s*(?:畫格|###圖卡)|$))/g;
        const frames = [];
        let frameMatch;
        while ((frameMatch = frameRegex.exec(block)) !== null) {
          const frameContent = frameMatch[1];
          const promptMatch = frameContent.match(/(?:中文|視覺描述|中文\s*Prompt|視覺Prompt)\s*[：:]\s*(.*?)(?=\n|$)/);
          frames.push(promptMatch ? promptMatch[1].trim() : "無法自動擷取提示詞");
        }
        
        if (frames.length > 0) {
          compositeGroups.push({
            id: `composite-${visualStep}-${index}`,
            title: layoutName,
            layoutType: layoutType,
            frames: frames,
            mainTitle: mainTitleMatch ? mainTitleMatch[1].trim() : "",
            subTitle: subTitleMatch ? subTitleMatch[1].trim() : ""
          });
        }
      });
      if (compositeGroups.length > 0) return compositeGroups;
    }
    
    // Original Pattern to match "### 第一組" or "1. 畫格 1"
    const regex = /(?:###\s*(第[一二三四五六七八九十\d]+組)|(?:^|\n)\s*\d+\.\s*(畫格\s*\d+))[^\n]*\n([\s\S]*?)(?=(?:###\s*第[一二三四五六七八九十\d]+組)|(?:^|\n)\s*\d+\.\s*畫格\s*\d+|$)/g;
    const groups = [];
    let match;
    let index = 0;
    while ((match = regex.exec(text)) !== null) {
      const groupName = match[1] || match[2];
      const content = match[3];
      const promptMatch = content.match(/(?:中文|視覺描述|中文\s*Prompt|視覺Prompt)\s*[：:]\s*(.*?)(?=\n|$)/);
      const promptText = promptMatch ? promptMatch[1].trim() : "無法自動擷取提示詞，請手動確認";
      
      const mainTitleMatch = content.match(/(?:主標|高點擊文案|主標題)\s*[：:]\s*(.*?)(?=\n|$)/);
      const subTitleMatch = content.match(/(?:副標|副標題)\s*[：:]\s*(.*?)(?=\n|$)/);
      const poetryMatch = content.match(/詩詞(?:（.*?）)?\s*[：:]\s*([\s\S]*?)(?=\n(?:中文|視覺|主標|副標|高點擊文案|主標題|副標題)\s*[：:]|$)/);
      
      groups.push({
        id: `group-${visualStep}-${index}`,
        title: groupName,
        prompt: promptText,
        mainTitle: mainTitleMatch ? mainTitleMatch[1].trim() : "",
        subTitle: subTitleMatch ? subTitleMatch[1].trim() : "",
        poetry: poetryMatch ? poetryMatch[1].trim() : ""
      });
      index++;
    }
    
    // Fallback if no groups matched but there is text
    if (groups.length === 0 && text.trim().length > 10) {
       const promptMatch = text.match(/(?:中文|視覺描述|中文\s*Prompt|視覺Prompt)\s*[：:]\s*(.*?)(?=\n|$)/);
       const mainTitleMatch = text.match(/(?:主標|高點擊文案|主標題)\s*[：:]\s*(.*?)(?=\n|$)/);
       const subTitleMatch = text.match(/(?:副標|副標題)\s*[：:]\s*(.*?)(?=\n|$)/);
       const poetryMatch = text.match(/詩詞(?:（.*?）)?\s*[：:]\s*([\s\S]*?)(?=\n(?:中文|視覺|主標|副標|高點擊文案|主標題|副標題)\s*[：:]|$)/);
       groups.push({
         id: `group-${visualStep}-fallback`,
         title: "主要視覺",
         prompt: promptMatch ? promptMatch[1].trim() : text.substring(0, 150),
         mainTitle: mainTitleMatch ? mainTitleMatch[1].trim() : "",
         subTitle: subTitleMatch ? subTitleMatch[1].trim() : "",
         poetry: poetryMatch ? poetryMatch[1].trim() : ""
       });
    }
    
    return groups;
  }, [stepContents, visualStep]);

  const drawCover = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let srcW = img.width;
    let srcH = img.height;
    let srcX = 0;
    let srcY = 0;
    if (imgRatio > targetRatio) {
      srcW = srcH * targetRatio;
      srcX = (img.width - srcW) / 2;
    } else {
      srcH = srcW / targetRatio;
      srcY = (img.height - srcH) / 2;
    }
    ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, w, h);
  };

  const createCompositeCanvas = async (imagesBase64, layoutType, mainTitle, subTitle) => {
    return new Promise(async (resolve) => {
      const loadedImages = await Promise.all(imagesBase64.map(src => {
        return new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => res(img);
          img.onerror = () => rej();
          img.src = src;
        });
      }));
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let width, height;
      
      if (layoutType === "16:9") {
        width = 1920; height = 1080;
        canvas.width = width; canvas.height = height;
        // Frame 1: Left half
        if(loadedImages[0]) drawCover(ctx, loadedImages[0], 0, 0, width/2, height);
        // Frame 2,3,4,5: Right half grid
        if(loadedImages[1]) drawCover(ctx, loadedImages[1], width/2, 0, width/4, height/2);
        if(loadedImages[2]) drawCover(ctx, loadedImages[2], width*0.75, 0, width/4, height/2);
        if(loadedImages[3]) drawCover(ctx, loadedImages[3], width/2, height/2, width/4, height/2);
        if(loadedImages[4]) drawCover(ctx, loadedImages[4], width*0.75, height/2, width/4, height/2);
      } else if (layoutType === "9:16") {
        width = 1080; height = 1920;
        canvas.width = width; canvas.height = height;
        // Frame 1: Top half
        if(loadedImages[0]) drawCover(ctx, loadedImages[0], 0, 0, width, height/2);
        // Frame 2,3,4,5: Bottom half grid
        if(loadedImages[1]) drawCover(ctx, loadedImages[1], 0, height/2, width/2, height/4);
        if(loadedImages[2]) drawCover(ctx, loadedImages[2], width/2, height/2, width/2, height/4);
        if(loadedImages[3]) drawCover(ctx, loadedImages[3], 0, height*0.75, width/2, height/4);
        if(loadedImages[4]) drawCover(ctx, loadedImages[4], width/2, height*0.75, width/2, height/4);
      } else if (layoutType === "4:3") {
        width = 1440; height = 1080;
        canvas.width = width; canvas.height = height;
        // 2x2 grid
        if(loadedImages[0]) drawCover(ctx, loadedImages[0], 0, 0, width/2, height/2);
        if(loadedImages[1]) drawCover(ctx, loadedImages[1], width/2, 0, width/2, height/2);
        if(loadedImages[2]) drawCover(ctx, loadedImages[2], 0, height/2, width/2, height/2);
        if(loadedImages[3]) drawCover(ctx, loadedImages[3], width/2, height/2, width/2, height/2);
      }
      
      // Add border around frames for layout distinction
      ctx.strokeStyle = "#1A1A1A";
      ctx.lineWidth = 12;
      ctx.beginPath();
      if (layoutType === "16:9") {
        ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height);
        ctx.moveTo(width/2, height/2); ctx.lineTo(width, height/2);
        ctx.moveTo(width*0.75, 0); ctx.lineTo(width*0.75, height);
      } else if (layoutType === "9:16") {
        ctx.moveTo(0, height/2); ctx.lineTo(width, height/2);
        ctx.moveTo(width/2, height/2); ctx.lineTo(width/2, height);
        ctx.moveTo(0, height*0.75); ctx.lineTo(width, height*0.75);
      } else if (layoutType === "4:3") {
        ctx.moveTo(width/2, 0); ctx.lineTo(width/2, height);
        ctx.moveTo(0, height/2); ctx.lineTo(width, height/2);
      }
      ctx.stroke();
      
      const compositedBase64 = canvas.toDataURL('image/png', 0.95);
      
      if (mainTitle || subTitle) {
        const finalImage = await applyTextOverlayToImageBase64(compositedBase64, mainTitle, subTitle, "");
        resolve(finalImage);
      } else {
        resolve(compositedBase64);
      }
    });
  };

  const applyTextOverlayToImageBase64 = (base64Image, mainTitle, subTitle, poetry) => {
    return new Promise((resolve) => {
      if (!mainTitle && !subTitle && !poetry) {
        resolve(base64Image);
        return;
      }
      
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0);
        
        const mainFontSize = Math.floor(width * 0.065);
        const subFontSize = Math.floor(width * 0.028);
        const poetryFontSize = Math.floor(width * 0.04);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // --- 隨機多樣化風格定義 (由 AI 隨機取樣) ---
        const palettes = [
          { main: 'rgba(255, 251, 240, 1)', mainShadow: 'rgba(20, 10, 0, 0.7)', sub: 'rgba(240, 200, 80, 1)', subShadow: 'rgba(0, 0, 0, 0.58)' },
          { main: 'rgba(255, 223, 130, 1)', mainShadow: 'rgba(0, 0, 0, 0.8)', sub: 'rgba(255, 255, 255, 1)', subShadow: 'rgba(0, 0, 0, 0.7)' },
          { main: 'rgba(240, 245, 255, 1)', mainShadow: 'rgba(5, 15, 40, 0.8)', sub: 'rgba(150, 220, 255, 1)', subShadow: 'rgba(0, 5, 20, 0.7)' },
          { main: 'rgba(255, 200, 100, 1)', mainShadow: 'rgba(20, 10, 5, 0.8)', sub: 'rgba(255, 150, 80, 1)', subShadow: 'rgba(20, 5, 0, 0.7)' },
          { main: 'rgba(255, 240, 245, 1)', mainShadow: 'rgba(30, 10, 40, 0.8)', sub: 'rgba(230, 180, 255, 1)', subShadow: 'rgba(20, 0, 30, 0.7)' }
        ];
        const style = palettes[Math.floor(Math.random() * palettes.length)];
        
        // 藝術書法字優先 (加入 Google Fonts 行書/毛筆/小薇體/宋體 隨機抽樣)
        const fontFamilies = [
          '"Ma Shan Zheng", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // 馬善政毛筆楷書
          '"Zhi Mang Xing", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // 志莽行書
          '"ZCOOL XiaoWei", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // 站酷小薇體
          '"Noto Serif TC", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif'  // 思源宋體
        ];
        const randomFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
        const fontStr = (size) => `bold ${size}px ${randomFontFamily}`;
        
        if (visualStep === 7 && mainTitle) {
          // Step 7 主標直式 (基準線右方 25%)
          const startX = width * 0.75;
          const startY = height * 0.15;
          ctx.font = fontStr(mainFontSize);
          let currentY = startY;
          for (let i = 0; i < mainTitle.length; i++) {
            const char = mainTitle[i];
            ctx.fillStyle = style.mainShadow;
            ctx.fillText(char, startX + 2, currentY + 2);
            ctx.fillStyle = style.main;
            ctx.fillText(char, startX, currentY);
            currentY += mainFontSize * 1.1;
          }
        } else if (visualStep === 8 && poetry) {
          // Step 8 詩詞直式 (基準線右方 25%，移除標點)
          const startX = width * 0.75;
          const startY = height * 0.15;
          ctx.font = fontStr(poetryFontSize);
          const cleanText = poetry.replace(/[，。！？；、\s]/g, "");
          const lines = [];
          // 七言四句: 每 7 字換行
          for (let i = 0; i < cleanText.length; i += 7) {
            lines.push(cleanText.slice(i, i + 7));
          }
          let xOffset = startX;
          lines.forEach((line) => {
            let currentY = startY;
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              ctx.fillStyle = style.mainShadow;
              ctx.fillText(char, xOffset + 2, currentY + 2);
              ctx.fillStyle = style.main;
              ctx.fillText(char, xOffset, currentY);
              currentY += poetryFontSize * 1.1;
            }
            xOffset -= poetryFontSize * 1.3;
          });
        } else {
          const mainX = width / 2;
          const mainY = height * 0.25;
          if (mainTitle) {
            ctx.font = fontStr(mainFontSize);
            const shadowOffset = Math.max(1, Math.floor(width * 0.003));
            ctx.fillStyle = style.mainShadow;
            ctx.fillText(mainTitle, mainX + shadowOffset, mainY + shadowOffset);
            ctx.fillStyle = style.main;
            ctx.fillText(mainTitle, mainX, mainY);
          }
          if (subTitle) {
            const subX = width / 2;
            const subY = mainY + (mainFontSize * 0.8);
            ctx.font = fontStr(subFontSize);
            ctx.fillStyle = style.subShadow;
            ctx.fillText(subTitle, subX + 1, subY + 1);
            ctx.fillStyle = style.sub;
            ctx.fillText(subTitle, subX, subY);
          }
        }
        
        resolve(canvas.toDataURL('image/png', 0.95));
      };
      img.onerror = () => resolve(base64Image);
      img.src = base64Image;
    });
  };

  const generateGroupImage = async (group) => {
    const { id: groupId, prompt, mainTitle, subTitle, poetry } = group;
    if (!prompt) return;
    setGeneratingGroups(prev => ({ ...prev, [groupId]: true }));
    addLog(`[Imagen 4.0] 啟動 ${groupId} 繪製進程...`, 'info');
    
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      
      let aspectRatio = "1:1";
      if (visualStep === 6 || visualStep === 8) aspectRatio = "16:9";
      if (visualStep === 7) aspectRatio = "9:16";
      if (visualStep === 10) aspectRatio = "4:3";
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1, aspectRatio: aspectRatio }
        })
      });
      
      const data = await response.json();
      if (data.predictions && data.predictions[0]) {
        const base64 = data.predictions[0].bytesBase64Encoded;
        const originalImage = `data:image/png;base64,${base64}`;
        
        const finalImage = await applyTextOverlayToImageBase64(originalImage, mainTitle, subTitle, poetry);
        
        setGroupImages(prev => ({ ...prev, [groupId]: finalImage }));
        addLog(`[Imagen 4.0] ✨ ${groupId} 渲染及字型疊加完成！`, 'success');
        setCredits(prev => Math.max(0, prev - 5));
      } else {
        throw new Error(data.error?.message || "未收到圖片資料");
      }
    } catch (err) {
      addLog(`[Imagen 4.0] ${groupId} 繪製失敗: ${err.message}`, 'error');
    } finally {
      setGeneratingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const generateCompositeImage = async (group) => {
    const { id: groupId, frames, layoutType, mainTitle, subTitle } = group;
    if (!frames || frames.length === 0) return;
    
    setGeneratingGroups(prev => ({ ...prev, [groupId]: true }));
    addLog(`[Imagen 4.0] 啟動 ${layoutType} 排版並發渲染進程 (${frames.length} 張圖)...`, 'info');
    
    try {
      const apiKey = ""; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      
      const base64Images = [];
      // 依序執行避免 API Rate Limit
      for (let i = 0; i < frames.length; i++) {
        const prompt = frames[i];
        addLog(`[Imagen 4.0] 正在繪製第 ${i + 1}/${frames.length} 張畫格...`, 'info');
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: prompt }],
            parameters: { sampleCount: 1, aspectRatio: "1:1" }
          })
        });
        const data = await response.json();
        if (data.predictions && data.predictions[0]) {
           base64Images.push(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
        } else {
           throw new Error(data.error?.message || `第 ${i + 1} 張畫格未收到圖片資料`);
        }
      }
      
      const compositedImage = await createCompositeCanvas(base64Images, layoutType, mainTitle, subTitle);
      
      setGroupImages(prev => ({ ...prev, [groupId]: compositedImage }));
      addLog(`[Imagen 4.0] ✨ ${groupId} 組合拼圖渲染及字型疊加完成！`, 'success');
      setCredits(prev => Math.max(0, prev - 5 * frames.length));
    } catch (err) {
      addLog(`[Imagen 4.0] 拼圖繪製失敗: ${err.message}`, 'error');
    } finally {
      setGeneratingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleDownloadImage = (url, filename) => {
    if (!url) {
      addLog(`[System] 尚未生成影像，無法下載`, 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'image'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const logsEndRef = useRef(null);
  useEffect(() => {
    let progressInterval;
    if (isPlayingMusic) {
      progressInterval = setInterval(() => {
        setMusicProgress(prev => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(progressInterval);
  }, [isPlayingMusic]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (message, type = 'default') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time: timestamp, text: message, type }]);
  };

  const handleThemeChange = (newThemeId) => {
    setAudienceTheme(newThemeId);
    const selectedTheme = AUDIENCE_THEMES[newThemeId];
    addLog(selectedTheme.themeLogMessage, 'info');  
  };

  const runAutoGeneration = async (startTheme) => {
    setIsGenerating(true);
    setMode('auto');
    setViewState('workspace');
    setCompletedSteps([]);
    let currentContextContents = {}; 
    for (let step = 1; step <= 10; step++) {
      setActiveStep(step);
      addLog(`[Process] 正在向 Vercel 請求真實生成 Step ${step}: ${STEPS[step - 1].name}...`);
      try {
        const context = {
          theme: startTheme,
          step1: currentContextContents[1] || "",
          step2: currentContextContents[2] || "",
          step3: currentContextContents[3] || "",
          step4: currentContextContents[4] || "",
          step5: currentContextContents[5] || "",
        };
        const resultText = await callVercelApi(step, context);
        currentContextContents[step] = resultText;
        setStepContents(prev => ({ ...prev, [step]: resultText }));
        setCompletedSteps(prev => [...new Set([...prev, step])]);
        addLog(`[AI] ✨ Step ${step} 內容從伺服器回傳完畢！`, 'success');
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        addLog(`[Error] Step ${step} 生成失敗: ${error.message}，中止全自動流程。`, 'error');
        setIsGenerating(false);
        return; 
      }
    }
    setIsGenerating(false);
    addLog("[System] ✨ 10-Step 全自動企劃產出完畢！您的矩陣內容已備妥。", 'success');
    setCredits(prevCredits => Math.max(0, prevCredits - 15));
    await startNotionExport(currentContextContents, startTheme);
  };

  const handleLoadArchive = async (e) => {
    const pageId = e.target.value;
    if (!pageId) return;
    if (pageId === "open_current") {
      if (notionUrl) window.open(notionUrl, '_blank');
      setSelectedArchive("");
      return;
    }
    setSelectedArchive(pageId);
    setIsLoadingArchive(true);
    addLog(`[Notion] 正在從雲端載入專案資料...`, 'info');
    try {
      const response = await fetch(`https://gen-imprint.vercel.app/api/notion/history?id=${pageId}`);
      const data = await response.json();
      if (data.stepsData) {
        if (data.theme) setTheme(data.theme); 
        setStepContents({
          1: data.stepsData[1] || "", 2: data.stepsData[2] || "", 3: data.stepsData[3] || "",
          4: data.stepsData[4] || "", 5: data.stepsData[5] || "", 6: data.stepsData[6] || "",
          7: data.stepsData[7] || "", 8: data.stepsData[8] || "", 9: data.stepsData[9] || "",
          10: data.stepsData[10] || ""
        });
        addLog(`[Notion] ✨ 專案載入成功！`, 'success');
        setNotionStatus('✅ 已成功歸檔');
        setNotionUrl(`https://www.notion.so/${pageId.replace(/-/g, '')}`);
        setViewState('workspace');
      }
    } catch (error) {
      addLog(`[Error] 載入失敗: ${error.message}`, 'error');
    } finally {
      setIsLoadingArchive(false);
      setSelectedArchive("");
    }
  };
  
  const handleStartAuto = () => {
    const finalTheme = theme.trim() || '日本京阪神五日遊攻略';
    if (!theme.trim()) setTheme('日本京阪神五日遊攻略');
    addLog(`[System] 🚀 啟動 10-Step 雲端引擎！目標企劃：『${finalTheme}』`, 'info');
    runAutoGeneration(finalTheme);
  };

  const startManualWorkspace = () => {
    const finalTheme = theme.trim() || '日本京阪神五日遊攻略';
    if (!theme.trim()) setTheme('日本京阪神五日遊攻略');
    setMode('manual');
    setViewState('workspace');
    addLog(`[System] 進入手動編輯模式。目標企劃：『${finalTheme}』`, 'info');
  };

  const handleEditorChange = (e) => {
    const text = e.target.innerText;
    setStepContents(prev => ({ ...prev, [activeStep]: text }));
  };

  const triggerSingleStepAi = async () => {
    addLog(`[AI] 正在向 Vercel 雲端請求... 重新生成 Step ${activeStep}`, 'info');
    setIsGenerating(true);
    try {
      const context = {
        theme: theme || "未命名企劃主題",
        step1: stepContents[1] || "", step2: stepContents[2] || "", step3: stepContents[3] || "",
        step4: stepContents[4] || "", step5: stepContents[5] || "",
      };
      const resultText = await callVercelApi(activeStep, context);
      setStepContents(prev => ({ ...prev, [activeStep]: resultText }));
      setCompletedSteps(prev => [...new Set([...prev, activeStep])]);
      setCredits(prevCredits => Math.max(0, prevCredits - 2));
      addLog(`[AI] ✨ Step ${activeStep} 內容生成完畢！已成功渲染至編輯器。`, 'success');
    } catch (error) {
      console.error("生成失敗:", error);
      addLog(`[Error] 生成失敗: ${error.message}`, 'error');
      alert(`API 呼叫失敗，錯誤原因: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const startNotionExport = async (customContents = null, customTheme = null) => {
    setIsNotionExporting(true);
    setNotionStatus('正在同步至 Notion...');
    addLog(`[System] 開始封裝企劃資料，自動準備匯出...`, 'info');
    try {
      const VERCEL_NOTION_URL = 'https://gen-imprint.vercel.app/api/notion';
      const targetTheme = customTheme || theme || "未命名企劃主題";
      const targetContents = customContents || stepContents;
      const payload = {
        theme: targetTheme,
        stepsData: targetContents,
        creatorName: curTheme.title
      };
      const response = await fetch(VERCEL_NOTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`伺服器錯誤: ${response.status}`);
      const data = await response.json();
      setNotionStatus('✅ 已成功歸檔');
      addLog(`[Notion] ✨ 企劃匯出成功！`, 'success');
      if (data.url) {
        setNotionUrl(data.url);
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Notion 匯出失敗:", error);
      setNotionStatus('❌ 歸檔失敗');
      addLog(`[Error] 匯出失敗: ${error.message}`, 'error');
    } finally {
      setIsNotionExporting(false);
    }
  };

  const generateNewImage = async () => {
    if (visualGroups.length === 0) return;
    setIsGeneratingImage(true);
    addLog(`[Visual Hub] 開始批次發送 ${visualGroups.length} 組 Prompt 至 Imagen 4.0 API 端點...`, 'info');
    await Promise.all(visualGroups.map(group => group.frames ? generateCompositeImage(group) : generateGroupImage(group)));
    setIsGeneratingImage(false);
    addLog(`[Visual Hub] 🎨 所有 Imagen 4.0 影像生成完畢！`, 'success');
  };

  const getAiStatusColor = () => {
    if (aiStatus === 'pro') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (aiStatus === 'flash') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      <aside className="w-64 bg-[#070b16] border-r border-slate-900 flex flex-col justify-between z-20 shrink-0">
        <div className="p-5">
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${curTheme.gradient} flex items-center justify-center shadow-lg transition-all duration-700`}>
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                GenImprint Pro
              </h1>
            </div>
          </div>
          <nav className="space-y-1.5">
            {[
              { id: 'creation', icon: FileText, label: '內容創作中心' },
              { id: 'visual', icon: ImageIcon, label: '視覺發控中心' },
              { id: 'suno', icon: Music, label: 'Suno 配樂中心' },
              { id: 'notebook', icon: BookOpen, label: 'NotebookLM 影片中心' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} className="space-y-1.5">
                  <button 
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'creation' && viewState === 'workspace') {} 
                      else { setViewState('hub'); }
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left border relative ${
                      isActive 
                        ? `${curTheme.bgActive} ${curTheme.textActive} ${curTheme.borderActive}` 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                    }`}
                  >
                    {isActive && <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-gradient-to-b ${curTheme.gradient}`} />}
                    <tab.icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                  {isActive && tab.id === 'visual' && (
                    <div className="mx-2 p-4 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl space-y-4 backdrop-blur-md">
                      <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />視覺裂變
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">影音縮圖</label>
                          <select className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none">
                            <option>長影音</option><option>短影音</option><option>社群FB/IG</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">輸出比例</label>
                          <select 
                            value={visualStep}
                            onChange={(e) => setVisualStep(Number(e.target.value))}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                          >
                            <option value={6}>16:9 - 橫幅縮圖 (YouTube / FB)</option>
                            <option value={7}>9:16 - 短片直式封面 (Shorts / Reels)</option>
                            <option value={8}>16:9 - 彩墨風格意象圖</option>
                            <option value={10}>1:1 / 4:3 - 社群視覺素材 (IG Post)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-900 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center font-black text-xs text-white border border-slate-800">N</div>
              <div className="text-[11px]">
                <p className="font-semibold text-slate-300">Notion 連動中</p>
                <p className="text-[9px] text-slate-500">v2.4.1 Active</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1d] relative">
        <header className="h-16 border-b border-slate-900 bg-[#0a0f1d]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="w-96 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="例如：日本寺廟抽籤攻略"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-[#111827]/60 border border-slate-800/80 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
              <Sparkles className="w-3.5 h-3.5" /><span>Canvas 環境已授權</span>
            </div>
            <button 
              onClick={handleStartAuto}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all"
            >
              <Zap className="w-3.5 h-3.5" /><span>一鍵全自動模式</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500/20" /><span>{credits} 點額度</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col relative">
          {activeTab === 'creation' && (
            viewState === 'hub' ? (
              <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0f1d] to-[#030712]">
                <div className={`absolute top-1/4 w-96 h-96 rounded-full bg-gradient-to-br ${curTheme.gradient} opacity-5 blur-[120px] pointer-events-none`} />
                <div className="w-full max-w-2xl bg-[#0f172a]/60 border border-slate-900/80 rounded-3xl p-8 backdrop-blur-xl relative shadow-2xl space-y-8">
                  <div className={`absolute left-0 right-0 top-0 h-[2px] rounded-t-3xl bg-gradient-to-r ${curTheme.gradient}`} />
                  <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-white">今天想創作什麼？</h2>
                    <p className="text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">輸入你想探討的主題，AI 將為你生成從研究、長短影音腳本到社群貼文的全域企劃。</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {Object.values(AUDIENCE_THEMES).map((themeObj) => {
                        const isSel = audienceTheme === themeObj.id;
                        return (
                          <button key={themeObj.id} onClick={() => handleThemeChange(themeObj.id)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${isSel ? `${themeObj.bgActive} ${themeObj.borderActive} ${themeObj.textActive}` : 'border-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'}`}>
                            {themeObj.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
                      <input type="text" placeholder="例如：日本京阪神五日遊攻略" value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full relative bg-[#070b16] border border-slate-900 rounded-2xl px-6 py-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={handleStartAuto} className={`py-4 rounded-2xl ${curTheme.primaryBtn} font-black text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-98`}>
                        <div className="flex items-center gap-2"><Play className="w-4 h-4 fill-white" /><span>一鍵全自動模式</span></div>
                      </button>
                      <button onClick={startManualWorkspace} className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-98">
                        <div className="flex items-center gap-2 text-slate-200"><Sliders className="w-4 h-4 text-slate-400" /><span>分步編輯工作流</span></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex overflow-hidden">
                <div className="w-64 border-r border-slate-900/60 overflow-y-auto bg-[#070b16]/30 p-4 space-y-1.5 custom-scrollbar shrink-0">
                  {STEPS.map((step) => {
                    const isActive = activeStep === step.id;
                    const Icon = step.icon;
                    return (
                      <button key={step.id} onClick={() => setActiveStep(step.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? `${curTheme.bgActive} ${curTheme.textActive}` : 'bg-transparent hover:bg-slate-900/40 text-slate-400'}`}>
                        <Icon className="w-4 h-4" /> <span className="font-bold text-xs">{step.name}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 bg-[#090d19]/40 p-6 overflow-y-auto relative flex flex-col">
                  <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
                    <div className="flex-1 bg-[#0f172a]/50 border border-slate-900 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                      <div className="flex-1 relative min-h-[500px]">
                        {isGenerating ? (
                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d19]/90 z-10 backdrop-blur-md">
                             <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse tracking-wider">AI 核心引擎高速運算中...</h3>
                             <p className="text-slate-400 mt-3 text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" />正在從伺服器抓取資料，請稍候</p>
                           </div>
                        ) : (
                          <div contentEditable suppressContentEditableWarning onBlur={handleEditorChange} className="absolute inset-0 p-6 font-mono text-sm text-slate-300 focus:outline-none overflow-y-auto whitespace-pre-wrap leading-relaxed select-text cursor-text">
                            {stepContents[activeStep]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* TAB 2: Visual Center */}
          {activeTab === 'visual' && (
            /* --- STREAMING_CHUNK:Rendering Visual Hub Control Panel --- */
            <div className="flex-1 p-6 overflow-y-auto bg-[#0a0f1d] custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Visual Intro banner */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <ImageIcon className="w-5 h-5 text-indigo-400" />
                      視覺調度中心
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">控制與生成 16:9 YouTube 橫向縮圖、9:16 短片直式封面及社群視覺素材。</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Left Controls column */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md flex flex-col">

<div className="relative w-full flex-1 min-h-[500px]">
  
  {/* AI 正在生成時，顯示 MP4 讀取動畫 */}
  {isGenerating ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-xl z-10 backdrop-blur-md">
       
      <video 
        src="https://res.cloudinary.com/dhvzfeo7p/video/upload/q_auto/f_auto/v1780920395/_%E5%9C%96%E7%94%9F%E5%8B%95%E7%95%AB%E8%A6%8F%E5%8A%83_Animation_Planning__o5hw6k.mp4" 
        autoPlay 
        loop 
        muted 
        playsInline
        className="w-[600px] h-[340px] object-cover rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] mb-6"
      />
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse tracking-wider">
        AI 引擎高速運算中...
      </h3>
      <p className="text-purple-300/60 mt-3 text-sm flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        正在從 Vercel 節點抓取資料，請稍候
      </p>
    </div>
  ) : (
    
    /* 生成完畢後，顯示原本的文字編輯器 */
    <textarea
      className="w-full h-full min-h-[500px] p-6 bg-gray-900/50 text-gray-200 border border-gray-700/50 rounded-xl focus:outline-none focus:border-purple-500/50 resize-none leading-relaxed"
      value={stepContents[visualStep]}
      onChange={(e) => setStepContents(prev => ({ ...prev, [visualStep]: e.target.value }))}
    />
    
  )}
</div>

                    <button
                      onClick={generateNewImage}
                      disabled={isGeneratingImage || visualGroups.length === 0}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isGeneratingImage ? '正在批次渲染中...' : '✨ AI 批次繪製全部影像'}</span>
                    </button>
                  </div>

                  {/* Right Masonry Grid of images */}
                  <div className="col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">已渲染媒體資產庫 ({visualGroups.length})</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {visualGroups.map((group) => (
                        <div key={group.id} className="group bg-[#0f172a]/40 border border-slate-900 rounded-2xl overflow-hidden relative shadow-lg flex flex-col">
                          {/* Image Area */}
                          <div className="w-full h-40 bg-[#070b16] relative flex items-center justify-center overflow-hidden">
                            {groupImages[group.id] ? (
                               <img src={groupImages[group.id]} alt={group.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                            ) : generatingGroups[group.id] ? (
                               <div className="flex flex-col items-center gap-2">
                                 <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
                                 <span className="text-[10px] text-purple-400">正在透過 Imagen 4 生成...</span>
                               </div>
                            ) : (
                               <div className="text-slate-700 font-medium text-xs flex items-center gap-2">
                                 <ImageIcon className="w-4 h-4" /> 尚未生成影像
                               </div>
                            )}
                          </div>
                          
                          {/* Content Area */}
                          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                                  Imagen 4.0
                                </span>
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => handleDownloadImage(groupImages[group.id], group.title)}
                                    className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <h5 className="text-[11px] font-bold text-slate-200">{group.title}</h5>
                              <p className="text-[9px] text-slate-500 font-mono truncate mt-1" title={group.prompt}>{group.prompt}</p>
                            </div>
                            
                            <button
                              onClick={() => group.frames ? generateCompositeImage(group) : generateGroupImage(group)}
                              disabled={generatingGroups[group.id]}
                              className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{generatingGroups[group.id] ? '正在渲染...' : `✨ AI 繪製影像 (-${group.frames ? 5 * group.frames.length : 5} 點)`}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Suno 配樂中心 */}
          {activeTab === 'suno' && (
            /* --- STREAMING_CHUNK:Rendering Suno AI Audio Center --- */
            <div className="flex-1 p-6 overflow-y-auto bg-[#0a0f1d] custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <Music className="w-5 h-5 text-purple-400" />
                      Suno 配樂中心
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">基於影片受眾調性與腳本節奏，一鍵調用 Suno API 自動生成原創、無版權問題的配樂。</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Lyrics generation */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">配樂歌詞生成</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">配樂風格 (Style of Music)</label>
                        <input 
                          type="text" 
                          value={musicGenre} 
                          onChange={(e) => setMusicGenre(e.target.value)}
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">歌詞內容 / 音調環境</label>
                        <textarea
                          value={stepContents[8]} 
                          onChange={(e) => setStepContents(prev => ({ ...prev, 8: e.target.value }))}
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl p-3 text-xs text-slate-300 focus:outline-none h-36 resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addLog("[Suno API] 正在調度音訊引擎撰寫情緒軌跡...", "info");
                        setTimeout(() => {
                          addLog("[Suno API] ✅ 音軌生成成功！已加入下方配樂庫。", "success");
                        }, 1500);
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>重新調製音訊軌跡</span>
                    </button>
                  </div>

                  {/* Active sound visualizer */}
                  <div className="col-span-2 space-y-4">
                    <div className="bg-[#0f172a]/40 border border-slate-900 rounded-2xl p-6 relative overflow-hidden">
                      {/* Active equalizer simulation */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0"
                          >
                            {isPlayingMusic ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                          </button>
                          <div>
                            <p className="text-xs font-bold text-white">SaaS Dreamscape - Vol.3</p>
                            <p className="text-[10px] text-slate-500">Style: Synthwave, Cyberpunk Lofi Beat</p>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-purple-400">
                          {Math.floor((musicProgress / 100) * 120)}s / 120s
                        </div>
                      </div>

                      {/* Waveform visualizer bars */}
                      <div className="h-16 flex items-end gap-[3px] mb-4">
                        {Array.from({ length: 48 }).map((_, i) => {
                          // Generate random heights that animate if playing
                          const randomHeight = isPlayingMusic ? Math.floor(Math.random() * 90) + 10 : Math.sin(i * 0.3) * 35 + 45;
                          return (
                            <div 
                              key={i} 
                              className={`flex-1 rounded-t bg-gradient-to-t from-purple-600/40 via-purple-500 to-indigo-400 transition-all duration-300`} 
                              style={{ height: `${randomHeight}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* Progress slider bar */}
                      <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${musicProgress}%` }} />
                      </div>
                    </div>

                    {/* Suno Audio Archive Library */}
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest pt-2">配樂生成庫</h4>
                    <div className="space-y-2">
                      {[
                        { title: 'SaaS Dreamscape - Vol.3', style: 'Synthwave', dur: '02:00' },
                        { title: 'Neon Coding Vibes', style: 'Lofi Cyberpunk', dur: '01:45' },
                        { title: 'The Solopreneur Spirit', style: 'Acoustic Bright', dur: '02:30' }
                      ].map((track) => (
                        <div key={track.title} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-900/60 hover:border-purple-500/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center text-purple-400">
                              <Music className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{track.title}</p>
                              <p className="text-[10px] text-slate-500">Style: {track.style}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-500">{track.dur}</span>
                            <button className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-white font-bold border border-slate-800">
                              使用此音軌
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: NotebookLM Video Center */}
          {activeTab === 'notebook' && (
            /* --- STREAMING_CHUNK:Rendering NotebookLM Summarizer Panel --- */
            <div className="flex-1 p-6 overflow-y-auto bg-[#0a0f1d] custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      NotebookLM 影片整合中心
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">匯入長影片、外部文檔或錄音檔，自動生成主題關係圖並轉譯為結構化對談與學習指南。</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Left input container */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">外部資料庫匯入</h4>
                    
                    <div className="space-y-3">
                      <div className="p-4 border border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl bg-slate-900/10 text-center cursor-pointer transition-all">
                        <UploadCloud className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-400 block">拖曳 Markdown/PDF 到這裡</span>
                        <span className="text-[10px] text-slate-600 block mt-1">或 點擊選擇上傳</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">YouTube 長影片 URL</label>
                        <input 
                          type="text" 
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/40"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addLog("[NotebookLM] 正在解析影片語音，進行語意關係圖對應分析...", "info");
                        setTimeout(() => {
                          addLog("[NotebookLM] ✅ 成功解構長影片！摘要資訊已生成。", "success");
                        }, 1200);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      <span>解析影片並載入背景庫</span>
                    </button>
                  </div>

                  {/* NotebookLM key points display */}
                  <div className="col-span-2 space-y-4">
                    <div className="p-5 bg-[#0f172a]/40 border border-slate-900 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Award className="w-4 h-4" />
                        <span>AI 生成長影片知識卡 (影片時長 35 mins)</span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-slate-200">關鍵摘要 01 - 跨平台分流之必然趨勢</p>
                          <p className="text-slate-400 mt-1">2026年單一社群平台流量正在緊縮，頂尖創作者必須建立 YouTube（長格式）- TikTok（短格式）- FB/IG（社群宣傳）的自動分流系統。</p>
                        </div>
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-slate-200">關鍵摘要 02 - 多工 AI 優勢</p>
                          <p className="text-slate-400 mt-1">使用整合型 Prompt 比分批下達能更好留存上下文關係。一次解構全域步驟能有效避免宣傳文案與腳本調性不一致的痛點。</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick interactive Q&As */}
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest pt-1">快速導讀問答</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { q: '這段內容的受眾痛點是什麼？', a: '主要在於重複的發文格式排版以及腳本靈感瓶頸。' },
                        { q: '全域企劃與單純寫腳本差在哪？', a: '全域企劃整合了背景、長短分鏡、Suno 配樂與 SEO，一次完成多重產出。' }
                      ].map((qa, i) => (
                        <div key={i} className="p-4 bg-slate-900/30 border border-slate-900/80 rounded-xl space-y-1.5">
                          <p className="font-bold text-slate-200">❓ {qa.q}</p>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{qa.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- STREAMING_CHUNK:Right Control and Monitor Panel --- */}
      <aside className="w-80 bg-[#070b16] border-l border-slate-900/80 flex flex-col justify-between z-20 shrink-0">
        
        {/* Top Part: AI Engine Monitor & Live Logs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* AI 狀態監控 Panel */}
          <div className="p-5 border-b border-slate-900/80">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3.5 h-3.5 rounded bg-slate-900 flex items-center justify-center">
                <Sliders className="w-2.5 h-2.5 text-slate-500" />
              </span>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI 狀態監控</h4>
            </div>

            {/* Simulated Active Engine Card */}
            <div className="bg-black/40 border border-slate-900 p-3 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Engine</span>
              </div>
              <div className="text-lg font-black tracking-widest text-white ml-4">
                pro
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-mono mt-1 border-t border-slate-950 pt-2 ml-4">
                <div>Uptime: <span className="text-slate-300">99.99%</span></div>
                <div>Latency: <span className="text-slate-300">1.2s</span></div>
              </div>
            </div>
          </div>

          {/* _> 系統與日誌 (Log Terminal Box) */}
          <div className="flex-1 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">系統與日誌</h4>
              </div>
              
              {/* Simulated MacOS close icons */}
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <span className="w-2 h-2 rounded-full bg-green-500/80" />
              </div>
            </div>

            {/* Active Logs Terminal Container */}
            <div className="flex-1 bg-black/60 border border-slate-950 rounded-xl p-4 font-mono text-[10px] overflow-y-auto space-y-2.5 custom-scrollbar text-slate-400">
              {logs.map((log, index) => {
                let colorClass = "text-slate-400";
                if (log.type === 'info') colorClass = "text-blue-400";
                if (log.type === 'success') colorClass = "text-emerald-400";
                if (log.type === 'warning') colorClass = "text-amber-400";
                
                return (
                  <div key={index} className="leading-relaxed whitespace-pre-wrap">
                    <span className="text-slate-600">[{log.time}]</span>{' '}
                    <span className={colorClass}>{log.text}</span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>

        {/* 返回創作大廳 */}
        <div className="flex justify-center pb-2 pt-2 border-t border-slate-900 bg-slate-950/20">
          <button
            onClick={() => setViewState('hub')}
            className="py-1.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-900/50 hover:bg-slate-800 hover:text-white border border-slate-800 rounded transition-colors"
          >
            返回創作大廳
          </button>
        </div>

        {/* Bottom Part: Notion Synchronization Center */}
        <div className="p-5 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-2 mb-3.5">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notion 同步中心</h4>
          </div>

          <div className="space-y-4">
            {/* Sync status feedback */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">存檔同步狀態</span>
              <span className={`font-bold ${notionStatus === '已同步至 Notion' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {notionStatus}
              </span>
            </div>

            {/* Notion sync execution button */}
            {notionStatus === '✅ 已成功歸檔' ? (
              <div className="w-full relative">
                <select
                  className="w-full py-2.5 pl-8 pr-8 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 text-xs font-bold appearance-none cursor-pointer outline-none text-center shadow-inner transition-all disabled:opacity-50"
                  onChange={handleLoadArchive}
                  value={selectedArchive}
                  disabled={isLoadingArchive}
                >
                  <option value="">點擊選擇團隊專案</option>
                  <option value="open_current">🔗 打開目前專案</option>
                  {archiveList.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
                <Link className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ) : (
              <button
                onClick={startNotionExport}
                disabled={isNotionExporting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-inner active:scale-98 transition-all disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 text-slate-400 ${isNotionExporting ? 'animate-bounce' : ''}`} />
                <span>{isNotionExporting ? '正在傳輸數據庫...' : '自動匯出 Notion'}</span>
              </button>
            )}
          </div>
        </div>

      </aside>

    </div>
  );
}