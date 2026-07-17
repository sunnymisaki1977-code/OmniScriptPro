// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Settings, 
  Play, Pause, FastForward, Sparkles, CheckCircle2, Circle, 
  Terminal, ServerCrash, Share2, UploadCloud, ChevronRight, ChevronLeft,
  Database, Video, Search, Music, Facebook, MousePointerClick,
  Sliders, Link, RefreshCw, Key, HelpCircle, HardDrive, 
  Eye, Check, ListTodo, Send, Volume2, VolumeX, Download, Zap, X, Copy,
  Users, Palette, ShieldAlert, BookOpen, Sun, ChevronDown, Award, Lock, ExternalLink, Trash2, Menu, Globe
, PenLine, Loader2, Star, Gift } from 'lucide-react';


const IMAGE_ENGINES = [
  {
    id: 'gemini-2.5-flash-image-preview', 
    name: 'Nano Banana',
    desc: 'Nano Banana 系列的先驅模型。雖然 Nano Banana 2 Lite 一直是可靠的工具，但我們強烈建議客戶改用這項模型，享受更優質的體驗、更快的生成速度，以及更低的 API 價格。'
  },
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4.0',
    desc: '專案內已有規劃之次世代影像生成引擎，提供極致細節與最高畫質。'
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 Lite',
    desc: '這是速度最快、成本最低的 Gemini 圖像模型，專為速度和規模而設計，適用於速度和成本是主要營運限制的情況。不適合多個參考輸入內容或多輪連續編輯。'
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Nano Banana 2',
    desc: '用途最廣泛的模型，適用於所有工作。可兼顧速度與最先進的 4K 生成技術、世界知識和可靠的文字轉譯功能。擅長處理多張參考圖像，並確保一致性。'
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Nano Banana Pro',
    desc: '最適合處理複雜的視覺化工作，提供最高程度的世界知識、進階本地化、準確的品牌一致性，以及精確的創意控制。'
  }
];

// ============================================================================
// --- 結合 Vercel 邏輯與 Gemini Canva API 的全新生成函數 ---
async function callVercelApi(stepId, context, audienceTheme, userApiKey = "") {
    // 取得 API Key 的邏輯保持不變
    const apiKey = userApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "");
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    // ==========================================
    // 階段 1：向 Vercel 請求「組裝好的 Prompt」
    // ==========================================
     const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://omni-script-pro.vercel.app' 
      : '';   
    const VERCEL_API_URL = 'https://omni-script-pro.vercel.app/api/gemini';

    const promptResponse = await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            currentStepId: stepId, 
            theme: context.theme, 
            existingData: context,
            audienceTheme,
            apiKey: apiKey,
            returnPromptOnly: true
        })
    });

    if (!promptResponse.ok) {
        throw new Error(`Vercel API 請求失敗：${promptResponse.status}`);
    }

    const vercelData = await promptResponse.json();
    const finalPrompt = vercelData.prompt; 
    const responseSchema = vercelData.schema;
    const isSearchEnabled = vercelData.isSearchEnabled;

    if (!finalPrompt) {
        throw new Error("Vercel API 沒有回傳有效的 Prompt");
    }

    const geminiPayload = {
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
            maxOutputTokens: 8192
        }
    };

    // 🌟 核心分流邏輯：正確的 Google Search 語法實作
    if (isSearchEnabled) {
        console.log(`[Google Search] 🌐 Step ${stepId} 已強制啟動 Google 搜尋功能！`);
        // 啟用 Google Search Tool
        geminiPayload.tools = [{ "google_search": {} }];
        // ⚠️ 注意：如果啟用了搜尋，就不能同時使用 responseSchema 結構化輸出
    } else if (responseSchema) {
        console.log(`[JSON Schema] 📄 Step ${stepId} 未啟動搜尋，強制啟用 JSON Schema 結構化輸出。`);
        geminiPayload.generationConfig.responseMimeType = "application/json";
        geminiPayload.generationConfig.responseSchema = responseSchema;
    }
    
    const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload)
    });

    if (!aiResponse.ok) {
        throw new Error(`Google API 錯誤: ${aiResponse.status}`);
    }
    
    const data = await aiResponse.json();
    let cleanText = data.candidates[0]?.content?.parts[0]?.text || "{}";
    
    // 🛡️ 強健版 JSON 解析器
    const cleanAndParseJSON = (rawText, stepId) => {
        try {
            return JSON.parse(rawText);
        } catch (e) {
            console.warn(`⚠️ Step ${stepId} 直接解析 JSON 失敗，啟動 Markdown 容錯清洗程序...`);
            try {
                const markdownRegex = /```json\s*([\s\S]*?)\s*```/;
                const match = rawText.match(markdownRegex);
                if (match && match[1]) {
                    return JSON.parse(match[1].trim());
                }
                const firstBrace = rawText.indexOf('{');
                const lastBrace = rawText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    const jsonSubstring = rawText.substring(firstBrace, lastBrace + 1);
                    return JSON.parse(jsonSubstring);
                }
            } catch (innerError) {
                console.error("❌ 無法從回傳文字中還原 JSON:", innerError);
            }
            return { [stepId.toString()]: rawText };
        }
    };
    
    // 如果有使用 Schema，它回傳的會是帶有 stepId 作為 key 的 JSON
    if (!isSearchEnabled) {
        try {
            // 清理可能包含的 markdown json block
            cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/i, "").trim();
            const parsedData = cleanAndParseJSON(cleanText, stepId);
            if (parsedData && parsedData[stepId.toString()]) {
                return parsedData[stepId.toString()];
            }
        } catch(e) {
            console.error("JSON 解析失敗", e);
        }
    }
    return cleanText;
}


// ============================================================================
// 2. 瘦身版 STEPS (已移除 Prompt，交由 Vercel 後端處理)
// ============================================================================
// 新增：MP4 輪播影片清單 (您可以在此陣列加入多個影片網址)
const LOADING_VIDEOS_LIST = [
  "https://res.cloudinary.com/dhvzfeo7p/video/upload/q_auto/f_auto/v1780920395/_%E5%9C%96%E7%94%9F%E5%8B%95%E7%95%AB%E8%A6%8F%E5%8A%83_Animation_Planning__o5hw6k.mp4",
  "https://res.cloudinary.com/dhvzfeo7p/video/upload/v1780920477/_%E5%9C%96%E7%94%9F%E5%8B%95%E7%95%AB%E8%A6%8F%E5%8A%83_Animation_Planning__1_umfge3.mp4" // 請替換成您的第二個影片網址
];

const getInitialStepContent = (stepId, themeText, previousContents = {}) => {
  if (!stepId) return "請選擇一個步驟進行檢視。";
  
  return `【等待從 Vercel 伺服器獲取資料...】\n\n點擊「一鍵全自動模式」或單步「重新生成」來向伺服器發送請求。`;
};



// ============================================================================
// 3. React 元件主體與狀態
// ============================================================================
export interface StyleOption {
  id: string;
  name: string;
  promptSuffix: string;
}

export const AUDIENCE_STYLES: Record<string, StyleOption> = {
  heritage: {
    id: "style-heritage",
    name: "東方古典美學 (水墨工筆)",
    promptSuffix: ", colorful ink wash, vivid diffusion, golden particles, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed, art calligraphy text style"
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
  }
};

export const POPULAR_STYLES: StyleOption[] = [
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
  }
];

export default function App() {
  const isCanvasEnv = true; // Added explicitly for Gemini Canvas environment
  const [audienceThemes, setAudienceThemes] = useState({});
  const [themeSteps, setThemeSteps] = useState({});
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [parsedVisualGroups, setParsedVisualGroups] = useState([]);
  const [isParsingVisuals, setIsParsingVisuals] = useState(false);
  const [formConfigs, setFormConfigs] = useState(null);

  useEffect(() => {
    fetch(`https://omni-script-pro.vercel.app/api/config`)
      .then(res => res.json())
      .then(data => {
        setAudienceThemes(data.AUDIENCE_THEMES);
        setThemeSteps(data.THEME_STEPS);
        if (data.FEEDBACK_CONFIG) setFormConfigs({ feedback: data.FEEDBACK_CONFIG, application: data.APPLICATION_CONFIG });
        setIsConfigLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load config:', err);
      });
  }, []);

  // --- 狀態管理保持不變 ---
  const [isGlobalMaster, setIsGlobalMaster] = useState(true); // 預設為管理員權限
   const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
    const [activeTab, setActiveTab] = useState('creation'); 

 // ====== 核心狀態管理 (加上 SSR 防護) ======
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([1, 2]);
  const [isStepFlowHidden, setIsStepFlowHidden] = useState(true);
  const [isVisualSidebarHidden, setIsVisualSidebarHidden] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const isResumeIntentRef = useRef(false);
  const [viewState, setViewState] = useState('hub');
  const [mode, setMode] = useState('manual');
  const [activeStep, setActiveStep] = useState(1);
  const [theme, setTheme] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [audienceTheme, setAudienceTheme] = useState('heritage');
  
  const [stepContents, setStepContents] = useState(() => ({
    1: getInitialStepContent(1, ""), 2: getInitialStepContent(2, ""), 3: getInitialStepContent(3, ""),
    4: getInitialStepContent(4, ""), 5: getInitialStepContent(5, ""), 6: getInitialStepContent(6, ""),
    7: getInitialStepContent(7, ""), 8: getInitialStepContent(8, ""), 9: getInitialStepContent(9, ""),
    10: getInitialStepContent(10, "")
  }));

  // 避免 Hydration Mismatch，等元件掛載後再從 localStorage 讀取狀態
  useEffect(() => {
    setIsMounted(true);
    const savedAudienceTheme = localStorage.getItem('os_pro_audienceTheme');
    if (savedAudienceTheme) setAudienceTheme(savedAudienceTheme);
  }, []);

  
    // Auth Session
    useEffect(() => {
      const isAuth = sessionStorage.getItem('os_pro_auth') === 'true';
      setIsAuthenticated(isAuth);
      if (!isAuth) {
        setShowLoginPrompt(true);
      } else {
        setIsGlobalMaster(sessionStorage.getItem('os_pro_master') === 'true');
        setAudienceTheme(sessionStorage.getItem('os_pro_theme') || 'heritage');
      }
    }, []);


  // 封測版：移除全局攔截點擊 (因為改採整合式的 Hub 密碼驗證)


  const [loadingVideoIdx, setLoadingVideoIndex] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
   
  
  
  
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false); 
   const [geminiApiKey, setGeminiApiKey] = useState('');
   const [showApiKeyModal, setShowApiKeyModal] = useState(false);
   const [pendingImageTask, setPendingImageTask] = useState<Function | null>(null);

  const [visualStep, setVisualStep] = useState(6);
  const [currentImageStyle, setCurrentImageStyle] = useState(AUDIENCE_STYLES['heritage']);
  useEffect(() => { if (AUDIENCE_STYLES[audienceTheme]) { setCurrentImageStyle(AUDIENCE_STYLES[audienceTheme]); } }, [audienceTheme]);
  const iconMap: any = { Database, FileText, Search, Video, ImageIcon, Music, Facebook };

  const curTheme = audienceThemes[audienceTheme] || {};
  const STEPS = themeSteps[audienceTheme] || themeSteps.heritage || [];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('os_pro_audienceTheme', audienceTheme);
    }
  }, [audienceTheme]);


 // 🔽 新增這三個變數來控制 Notion 下拉選單 🔽
  const [archiveList, setArchiveList] = useState([]); 
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");
  // 🔽 新增這個函數，去 Vercel 拿 Notion 清單 🔽
  const fetchArchives = async () => {
    try {
      const response = await fetch('https://omni-script-pro.vercel.app/api/notion/history');
      const data = await response.json();
      if (data.history) {
        setArchiveList(data.history);
      }
    } catch (err) {
      console.error("無法載入 Notion 專案清單", err);
    }
  };

  useEffect(() => {
     fetchArchives();
  }, []);


 

  const [logs, setLogs] = useState([
    { time: "[System]", text: "[System] OmniScript Pro OS 初始化完畢。", type: "info" },
    { time: "[System]", text: "[System] 系統就緒。主美學配置：全職影音創作者 (Cinematic Pink)", type: "default" }
  ]);
  
  const [aiStatus, setAiStatus] = useState('pro'); 
  const [credits, setCredits] = useState(125);
  const [currentProjectTitle, setCurrentProjectTitle] = useState('尚未載入專案');
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
    { id: 1, url: '[https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80)', engine: 'Imagen 4.0', prompt: '第一組中文Prompt' },
    { id: 2, url: '[https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80)', engine: 'Imagen 4.0', prompt: '第二組中文Prompt' },
    { id: 3, url: '[https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80)', engine: 'Imagen 4.0', prompt: '第三組中文Prompt' }
  ]);

  const [groupImages, setGroupImages] = useState({});
  const [generatingGroups, setGeneratingGroups] = useState({});
  const [imageEngine, setImageEngine] = useState('flash');

  useEffect(() => {
    const content = stepContents[visualStep];
    if (!content) return;
    
    setIsParsingVisuals(true);
    fetch('https://omni-script-pro.vercel.app/api/parse-visuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, visualStep })
    })
      .then(res => res.json())
      .then(data => {
        setParsedVisualGroups(data.parsedGroups || []);
        setIsParsingVisuals(false);
      })
      .catch(err => {
        console.error('Parse visuals error:', err);
        setIsParsingVisuals(false);
      });
  }, [stepContents, visualStep]);

  const visualGroups = parsedVisualGroups;

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

// 文字疊加渲染引擎 (純前端)
  const applyTextOverlayToImageBase64 = (base64Image: string, mainTitle?: string, subTitle?: string, poetry?: string): Promise<string> => {
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
        if (!ctx) return resolve(base64Image);
        
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
        const fontStr = (size: number) => `bold ${size}px ${randomFontFamily}`;
        
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
            xOffset -= poetryFontSize * 1.3; // 往左換行
          });
        } else {
          // 一般橫式 (主標下移至 25%)
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

  const generateGroupImage = async (group: any) => {
    const { id: groupId, prompt, mainTitle, subTitle, poetry } = group;
    if (!prompt) return;
    setGeneratingGroups(prev => ({ ...prev, [groupId]: true }));
    
    const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
    const engineName = engineConfig.name;
    const isImagen = imageEngine.includes('imagen');
    addLog(`[${engineName}] 啟動 ${groupId} 繪製進程...`, 'info');
    
    try {
      const activeApiKey = geminiApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "");
      
      let aspectRatio = "1:1";
      if (visualStep === 6 || visualStep === 8) aspectRatio = "16:9";
      if (visualStep === 7) aspectRatio = "9:16";
      if (visualStep === 10) aspectRatio = "4:3";
      
      let base64 = "";
      const finalPromptWithStyle = prompt + (currentImageStyle ? currentImageStyle.promptSuffix : "");

      if (imageEngine === 'flash') {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${activeApiKey}`;

        let flashPrompt = finalPromptWithStyle;
        if (mainTitle || subTitle || poetry) {
          flashPrompt += `\n\nMust integrate the following text into the image explicitly with beautiful typography matching the theme:`;
          if (mainTitle) flashPrompt += `\nMain Title: ${mainTitle}`;
          if (subTitle) flashPrompt += `\nSubtitle: ${subTitle}`;
          if (poetry) flashPrompt += `\nPoetry (vertical layout preferred): ${poetry.replace(/\s+/g, ' ')}`;
        }
        
        const finalPrompt = `${flashPrompt}\n(Please generate image with aspect ratio ${aspectRatio})`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: finalPrompt }]
              }
            ],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE']
            }
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(`API Error: ${data.error?.message || response.status}`);
        
        const parts = data.candidates?.[0]?.content?.parts || [];
        const imagePart = parts.find((p: any) => p.inlineData);
        if (imagePart) {
          base64 = imagePart.inlineData.data;
        } else {
          throw new Error("模型未回傳圖像資料");
        }
      } else {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${activeApiKey}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: finalPromptWithStyle }],
            parameters: { sampleCount: 1, aspectRatio: aspectRatio }
          })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(`API Error: ${data.error?.message || response.status}`);
        if (data.predictions && data.predictions[0]) {
          base64 = data.predictions[0].bytesBase64Encoded;
        } else {
          throw new Error("未收到圖片資料");
        }
      }
      
      if (base64) {
        const originalImage = `data:image/png;base64,${base64}`;
        
        let finalImage = originalImage;
        if (isImagen) {
          // 只有 Imagen 4 需要本地端字型疊加，Gemini Image 系列直接由模型產出內建字體
          finalImage = await applyTextOverlayToImageBase64(originalImage, mainTitle, subTitle, poetry);
        }
        
        setGroupImages(prev => ({ ...prev, [groupId]: finalImage }));
        addLog(`[${engineName}] ✨ ${groupId} 渲染完成！`, 'success');
      }
    } catch (err: any) {
      const engineName = imageEngine === 'flash' ? 'Gemini 2.5 Flash' : 'Imagen 4.0';
      addLog(`[${engineName}] 繪製失敗: ${err.message}`, 'error');
    } finally {
      setGeneratingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const generateBatchImages = async () => {
    if (visualGroups.length === 0) return;
    setIsGeneratingBatch(true);
    addLog(`[Visual Hub] 開始批次發送 ${visualGroups.length} 組 Prompt...`, 'info');
    
    await Promise.all(visualGroups.map(group => generateGroupImage(group)));
    
    setIsGeneratingBatch(false);
    addLog(`[Visual Hub] 🎨 所有影像生成完畢！`, 'success');
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

  const handleDownloadZip = async () => {
    try {
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default || JSZipModule;
      const fileSaverModule = await import('file-saver');
      const saveAs = fileSaverModule.saveAs || fileSaverModule.default?.saveAs || fileSaverModule.default;
      const zip = new JSZip();
      const folderName = `${theme || 'OmniScript'}_企劃包`;
      const folder = zip.folder(folderName);
      
      STEPS.forEach((step, idx) => {
        const content = stepContents[idx + 1];
        if (content && content.trim() !== '') {
          const safeName = step.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
          folder.file(`Step${idx + 1}_${safeName}.md`, content);
        }
      });
      
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${folderName}.zip`);
      addLog('[System] 成功匯出 ZIP 企劃包', 'success');
    } catch (err) {
      console.error(err);
      addLog('[System] 匯出 ZIP 失敗', 'error');
    }
  };

      const handleDownloadPdf = async () => {
    try {
      addLog('[System] 正在生成 PDF，請稍候...', 'info');
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const element = document.getElementById('pdf-export-container');
      if (!element) return;
      
      // We CLONE the element and put it in the body.
      // This bypasses React's h-screen and overflow-hidden which clips html2canvas rendering.
      const clone = element.cloneNode(true);
      clone.style.display = 'block';
      clone.style.position = 'relative';
      clone.style.left = 'auto';
      clone.style.top = 'auto';
      clone.style.width = '800px';
      
      // Wrap it in a container that hides it from the user but allows it to have height
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);
      
      await new Promise(r => setTimeout(r, 800)); // Give it enough time to render fonts and images
      
      const opt = {
        margin:       10,
        filename:     `${theme || 'OmniScript'}_企劃.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(clone).save();
      
      // Cleanup the clone
      document.body.removeChild(wrapper);
      
      addLog('[System] 成功匯出 PDF 報告', 'success');
    } catch (err) {
      console.error(err);
      addLog('[System] 匯出 PDF 失敗', 'error');
    }
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
    const selectedTheme = audienceThemes[newThemeId];
    addLog(selectedTheme?.themeLogMessage || `[Theme] 已切換至 ${newThemeId}`, 'info');  
  };

  // ============================================================================
  // 4. 改寫全自動生成引擎 (打 Vercel API)
  // ============================================================================
  const runAutoGeneration = async (startTheme: string, isResume = false) => {
      
    setIsGenerating(true);
        setMode('auto');
    setViewState('workspace');
    
    let currentContextContents = { ...stepContents }; 
    let startStep = 1;

 // --- 新增：偵測主題變更並自動提示清空 ---
    const savedLastTheme = localStorage.getItem('os_pro_lastGeneratedTheme') || '';
    const isCanvasEmpty = currentContextContents[1] === getInitialStepContent(1, "");
    if (startTheme !== savedLastTheme && !isCanvasEmpty) {
        setCompletedSteps([1]);
        setCustomContext('');
      }
        localStorage.setItem('os_pro_lastGeneratedTheme', startTheme);

    const isStepEmpty = (stepId: number) => {
      const content = currentContextContents[stepId];
      return !content || content.trim() === '' || content === getInitialStepContent(stepId, "");
    };

    // 如果使用者有自訂背景資料且 Step 1 為空（或只是預設佔位文字），就把它當作 Step 1
    if (customContext.trim() && isStepEmpty(1)) {
      currentContextContents[1] = customContext;
      setStepContents(prev => ({ ...prev, 1: customContext }));
      addLog(`[System] 偵測到您已提供「自訂背景資料」，系統已自動將其載入為 Step 1 基礎文獻，為您省下第一階段的查核時間！`, 'success');
    }


    // 不再使用強制跳過的智能接續邏輯，改由 selectedSteps 全權決定要執行的步驟
    // 這樣使用者若刻意勾選已完成的步驟，也能夠強制重新生成。
    startStep = 1;

    // ==========================================
    // 循序執行所有尚未完成的步驟 (Frontend Commander)
    // ==========================================
    addLog(`🚀 [Process] 自動化流水線啟動：目標主題【${startTheme}】...`, 'info');

    let localPromptFunctions: any = null;
    if (isCanvasEnv) {
        addLog(`[Canvas] 正在向後端抓取 Prompt Configs...`, 'info');
        try {
            const configRes = await fetch(`https://omni-script-pro.vercel.app/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audienceTheme })
            });
            if (!configRes.ok) throw new Error("獲取 Config 失敗");
            const { configs } = await configRes.json();
            
            // 轉換回前端 Function
            localPromptFunctions = {};
            configs.forEach((c: any) => {
                localPromptFunctions[c.id] = new Function('return (' + c.promptStr + ')')();
            });
            addLog(`[Canvas] 成功載入 Prompt Configs！準備啟動本地端生成流水線...`, 'success');
        } catch (error: any) {
            addLog(`[Error] 抓取 Prompt Configs 發生錯誤：${error.message}`, 'error');
            setIsGenerating(false);
            return;
        }
    }

    let currentRunningStep = startStep;
    try {
      for (let i = startStep; i <= STEPS.length; i++) {
        if (!selectedSteps.includes(i)) {
          addLog(`⏭️ [Process] 跳過 Step ${i}: ${STEPS[i-1].name} (使用者未勾選)...`, 'default');
          continue;
        }
        if (isResume && completedSteps.includes(i)) {
          addLog(`⏭️ [Process] 跳過 Step ${i}: ${STEPS[i-1].name} (接續生成：已完成)...`, 'success');
          continue;
        }
        currentRunningStep = i;
        addLog(`▶️ [Process] 正在執行 Step ${i}: ${STEPS[i-1].name}...`, 'info');
        setActiveStep(i);

        const activeApiKey = geminiApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "");

        const context = {
            theme: startTheme,
            step1: currentContextContents[1] || "",
            step2: currentContextContents[2] || "",
            step3: currentContextContents[3] || "",
            step4: currentContextContents[4] || "",
            step5: currentContextContents[5] || "",
            step6: currentContextContents[6] || "",
            step7: currentContextContents[7] || "",
            step8: currentContextContents[8] || "",
            step9: currentContextContents[9] || "",
            step10: currentContextContents[10] || "",
        };

        // 💡 依據環境決定生成方式
        let outputText = "";

        if (isCanvasEnv && localPromptFunctions) {
            // [Canvas 環境]：完全在前端端點執行，省去不斷與 Vercel 溝通
            const promptFunc = localPromptFunctions[i];
            const safeTheme = startTheme.replace(/<USER_DATA>|<\/USER_DATA>/gi, "");
            const safeStep1 = (currentContextContents[1] && !currentContextContents[1].includes("等待從 Vercel 伺服器獲取資料")) 
                                ? currentContextContents[1].replace(/<USER_DATA>|<\/USER_DATA>/gi, "") : "";
            
            const stepContext = {
                theme: safeTheme || '自訂企劃 (未命名)',
                step1: safeStep1 || "【缺乏 Step 1 背景資料】",
                step2: currentContextContents[2] || "【缺乏 Step 2 資料】",
                step3: currentContextContents[3] || "【缺乏 Step 3 資料】",
                step4: currentContextContents[4] || "【缺乏 Step 4 資料】",
                step5: currentContextContents[5] || "【缺乏 Step 5 資料】"
            };
            const masterPrompt = promptFunc(stepContext);
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${activeApiKey}`;
            const aiResponse = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: masterPrompt }] }],
                    tools: (i === 1 && !safeStep1) ? [{ googleSearch: {} }] : []
                })
            });
            if (!aiResponse.ok) throw new Error(`Google API 錯誤: ${aiResponse.status}`);
            const data = await aiResponse.json();
            outputText = data.candidates[0].content.parts[0].text;
            
        } else {
            // [Vercel 環境 或 Fallback]：維持原有邏輯，單步向 Vercel 拿 Prompt (或在Vercel生成)
            outputText = await callVercelApi(i, context, audienceTheme, activeApiKey);
        }
        if (outputText) {
          // 若 AI 因為某些原因拋出「拒絕生成」的訊息（例如缺乏背景資料），強制中斷以避免後續步驟受損
          if (outputText.includes('我需要一份經過專家查核') || outputText.includes('無法繼續執行') || outputText.includes('很抱歉')) {
             throw new Error(`AI 拒絕生成內容或要求補充資料`);
          }

         
          
          // 💾 成功拿到單步結果，塞入前端暫存器
          currentContextContents[i] = outputText;
          
          // 🔄 即時更新前端 UI 狀態，使用者能看到文字一格一格長出來
          setStepContents({ ...currentContextContents });
          setCompletedSteps(prev => [...new Set([...prev, i])]);
          addLog(`✅ [AI] Step ${i} 執行成功！`, 'success');
        } else {
           throw new Error("後端未回傳預期內容");
        }
      }

      addLog(`🎉 [System] ✨ ${STEPS.length}-Step 所有企劃步驟全自動流水線執行完畢！`, 'success');
      setCredits(prevCredits => Math.max(0, prevCredits - 15));
      
      // 自動匯出至 Notion
      addLog(`[Notion] 準備將全自動生成的腳本進行雲端封裝與備份...`, 'info');
      await startNotionExport(currentContextContents, startTheme);
      // 生成成功後，讓畫面回到第一步
      setActiveStep(1);

    } catch (error: any) {
      addLog(`🛑 [Error] 流水線在 Step ${currentRunningStep} 發生致命中斷: ${error.message}，已為您保留先前進度。點擊「接續自動生成」即可恢復。`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

   const handleLoadArchive = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pageId = e.target.value;
    if (!pageId) return;

    setSelectedArchive(pageId);
    setIsLoadingArchive(true);
    addLog(`[Notion] 正在從資料庫讀取專案內容...`, 'info');

    try {
      const response = await fetch(`https://omni-script-pro.vercel.app/api/notion/history?id=${pageId}`);
      const data = await response.json();

      if (data.stepsData) {
        setCurrentProjectTitle(data.theme || archiveList.find(a => a.id === pageId)?.title || '未命名專案');
        setStepContents({
          1: data.stepsData[1] || "",
          2: data.stepsData[2] || "",
          3: data.stepsData[3] || "",
          4: data.stepsData[4] || "",
          5: data.stepsData[5] || "",
          6: data.stepsData[6] || "",
          7: data.stepsData[7] || "",
          8: data.stepsData[8] || "",
          9: data.stepsData[9] || "",
          10: data.stepsData[10] || ""
        });
        addLog(`[Notion] 專案讀取成功，已匯入腳本與提示詞！`, 'success');
      }
    } catch (error: any) {
      addLog(`[Error] 讀取失敗: ${error.message}`, 'error');
    } finally {
      setIsLoadingArchive(false);
    }
  };


  const handleStartAuto = () => {
 
  if (customContext.length > 5000) {
    safeAlert(`字數總和 (${customContext.length} 字) 超過 5000 字上限，請刪減內容後再執行！`);
    return;
  }
  if (!theme.trim() && !customContext.trim()) {
    safeAlert("請輸入「企劃主題」或提供「自訂背景資料」，系統才能為您進行企劃！");
    return;
  }

  const isResume = isResumeIntentRef.current;
  const finalTheme = theme.trim() || '自訂企劃 (未命名)';

  // 如果是一次全新生成，清空 UI 的步驟內容
  if (!isResume) {
    addLog(`[System] 清空上一次的企劃快取，準備全新生成...`, 'info');
    setStepContents({
      1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: ""
    });
  }

  addLog(`[System] 🚀 啟動 ${STEPS.length}-Step 雲端引擎！目標企劃：『${finalTheme}』`, 'info');
  
  // 啟動流水線
  // 封測/Gemini環境：跳出API視窗 (如果是 Vercel 環境且無金鑰)
  if (!isCanvasEnv && !geminiApiKey.trim()) {
    setPendingImageTask(() => () => runAutoGeneration(finalTheme, isResume));
    setShowApiKeyModal(true);
    return;
  }
  runAutoGeneration(finalTheme, isResume);
  isResumeIntentRef.current = false;
};
  const startManualWorkspace = () => {
    if (customContext.length > 5000) {
      safeAlert(`字數總和 (${customContext.length} 字) 超過 5000 字上限，請刪減內容後再執行！`);
      return;
    }
    if (!theme.trim() && !customContext.trim()) {
      safeAlert("請輸入「企劃主題」或提供「自訂背景資料」，以便進入手動工作區！");
      return;
    }
    const finalTheme = theme.trim() || '自訂企劃 (未命名)';
    setMode('manual');
    setViewState('workspace');
    addLog(`[System] 進入手動編輯模式。目標企劃：『${finalTheme}』`, 'info');
  };

  const handleEditorChange = (e) => {
    const text = e.target.innerText;
    setStepContents(prev => ({ ...prev, [activeStep]: text }));
  };

  // --- 新增：讀取本地文件內容 ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCustomContext(prev => {
        const newText = prev + (prev ? '\n\n' : '') + text;
        if (newText.length > 5000) {
          addLog(`[Error] 匯入失敗：加上 ${file.name} 內容後字數達 ${newText.length} 字，超過 5000 字上限，為避免超載請刪減文字！`, 'error');
          safeAlert(`匯入失敗：字數總和 (${newText.length} 字) 超過 5000 字上限！\n建議直接擷取精華段落即可。`);
          return prev; // 放棄匯入，維持原樣
        }
        addLog(`[System] 已成功讀取文件：${file.name}`, 'success');
        return newText;
      });
    };
    reader.readAsText(file);
    e.target.value = null; // 重置 input 讓同一個檔案可以重複上傳
  };

  // --- 新增：直接寫入 Step 1 ---
  const handleImportToStep1 = () => {
    if (!customContext.trim()) {
      addLog('[System] 沒有內容可匯入，請先貼上或上傳資料', 'warning');
      return;
    }
    setStepContents(prev => ({ ...prev, 1: customContext }));
    setCompletedSteps(prev => [...new Set([...prev, 1])]); // 標記 Step 1 為已完成
    addLog('[System] 📝 參考資料已成功匯入 Step 1 畫布！', 'success');
  };

  const clearAllData = () => {
    if (safeConfirm('確定要清空畫布與所有先前的企劃資料嗎？（此動作無法還原）')) {
      setTheme('');
      setCustomContext('');
      setStepContents({
        1: getInitialStepContent(1, ""), 2: getInitialStepContent(2, ""), 3: getInitialStepContent(3, ""),
        4: getInitialStepContent(4, ""), 5: getInitialStepContent(5, ""), 6: getInitialStepContent(6, ""),
        7: getInitialStepContent(7, ""), 8: getInitialStepContent(8, ""), 9: getInitialStepContent(9, ""),
        10: getInitialStepContent(10, "")
      });
      setCompletedSteps([1]);
      setActiveStep(1);
      setViewState('hub');
      addLog('[System] 🗑️ 舊企劃資料已全數清空，隨時可開始新專案。', 'info');
    }
  };

  // ============================================================================
  // 5. 改寫手動單步生成 (打 Vercel API)
  // ============================================================================
  const triggerSingleStepAi = async () => {
    addLog(`[AI] 正在雲端請求... 重新撰寫 Step ${activeStep}`, 'info');
        setIsGenerating(true);
    
    try {
      const context = {
        theme: theme || "未命名企劃主題",
        step1: stepContents[1] || "",
        step2: stepContents[2] || "",
        step3: stepContents[3] || "",
        step4: stepContents[4] || "",
        step5: stepContents[5] || "",
      };

      const content = await callVercelApi(activeStep, context, audienceTheme, geminiApiKey);

      setStepContents(prev => ({ ...prev, [activeStep]: content }));
      setCompletedSteps(prev => [...new Set([...prev, activeStep])]);
      setCredits(prevCredits => Math.max(0, prevCredits - 2));
      addLog(`[AI] ✨ Step ${activeStep} 內容生成完畢！已成功渲染至編輯器。`, 'success');

    } catch (error: any) {
      addLog(`[Error] 生成失敗: ${error.message}`, 'error');
      safeAlert(`API 呼叫失敗，錯誤原因: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
// --- 匯出資料至 Notion ---
const startNotionExport = async (customContents = null, customTheme = null) => {
  setIsNotionExporting(true);
  setNotionStatus('正在同步至 Notion...');
  addLog(`[System] 開始封裝企劃資料，...`, 'info');

  try {
    // 呼叫我們自己的 Vercel 後端 Notion API
    const VERCEL_NOTION_URL = 'https://omni-script-pro.vercel.app/api/notion';
    
    const targetTheme = customTheme || theme || "未命名企劃主題";
    const targetContents = customContents || stepContents;

    // 封裝目前所有的輸入與生成結果，符合後端 /api/notion 預期的格式
    const payload = {
      theme: targetTheme,
      stepsData: targetContents,
      creatorName: curTheme.title, // 動態抓取目前選擇的角色名稱（例如：全職影音創作者）
      audienceTheme: audienceTheme
    };

    const response = await fetch(VERCEL_NOTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`伺服器錯誤: ${response.status}`);
    }

    const data = await response.json();
    
    setNotionStatus('✅ 已成功');
    addLog(`[Notion] ✨ 企劃成功！`, 'success');
    
    // 自動開啟剛剛建好的 Notion 頁面並儲存 URL
    if (data.url) {
      setNotionUrl(data.url);
      fetchArchives(); // 成功後立即刷新歷史清單
      if (isGlobalMaster) {
        window.open(data.url, '_blank');
      }
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
    
    // 封測/Gemini環境：不跳出API視窗，直接運行
    // if (!isCanvasEnv && !geminiApiKey.trim()) {
    //   setPendingImageTask(() => generateNewImage);
    //   setShowApiKeyModal(true);
    //   return;
    // }
    if (visualGroups.length === 0) return;
    setIsGeneratingImage(true);
    const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
    const engineName = engineConfig.name;
    addLog(`[Visual Hub] 開始批次發送 ${visualGroups.length} 組 Prompt 至 ${engineName} API 端點...`, 'info');
    
    await Promise.all(visualGroups.map(group => generateGroupImage(group)));
    
    setIsGeneratingImage(false);
    addLog(`[Visual Hub] 🎨 所有 ${engineName} 影像生成完畢！`, 'success');
  };

  

  const getAiStatusColor = () => {
    if (aiStatus === 'PRO') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (aiStatus === 'FLASH') return 'text-[#10B981] bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = passcode.trim();
    if (!code) return;

    try {
      const VERCEL_API_URL = 'https://omni-script-pro.vercel.app/api/auth';
      const res = await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setShowLoginPrompt(false);
        setAuthError('');
        setAudienceTheme(data.theme);
        setIsGlobalMaster(data.isMaster);
        sessionStorage.setItem('os_pro_auth', 'true');
        sessionStorage.setItem('os_pro_theme', data.theme);
        if (data.isMaster) {
          sessionStorage.setItem('os_pro_master', 'true');
        }
        
        addLog(`[System] 成功驗證授權，載入 ${data.theme} 工作區。`, 'success');
      } else {
        setAuthError(data.error || '授權碼無效或已過期');
      }
    } catch (error) {
      setAuthError('伺服器連線失敗，請稍後再試');
    }
  };
  if (!isMounted) {
    return null; // 解決 Hydration Mismatch，等前端掛載完成再繪製 UI
  }

  return (
    <div className="flex h-screen text-[#1E293B] font-sans overflow-hidden selection:bg-indigo-500/30 relative z-0" style={{ background: 'radial-gradient(circle at top right, #F9F7F1 0%, #E8EDF2 50%, #E2E6ED 100%)' }}>
      {/* 沉浸式環境光暈 */}
      <div className={`fixed inset-0 opacity-15 blur-[120px] bg-gradient-to-br ${audienceThemes[audienceTheme]?.gradient || 'from-slate-800 to-slate-900'} -z-10 transition-colors duration-1000`} />
      <style dangerouslySetInnerHTML={{__html: `
        .markdown-preview {
          font-family: 'Noto Sans TC', sans-serif;
          color: #cbd5e1;
          line-height: 1.8;
          font-size: 0.9rem;
        }
        .markdown-preview h1, .markdown-preview h2, .markdown-preview h3, .markdown-preview h4 {
          color: #f8fafc;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
        }
        .markdown-preview h1 { font-size: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 0.3em; }
        .markdown-preview h2 { font-size: 1.3rem; border-bottom: 1px solid #334155; padding-bottom: 0.3em; }
        .markdown-preview h3 { font-size: 1.1rem; }
        .markdown-preview p { margin-bottom: 1em; }
        .markdown-preview ul, .markdown-preview ol { padding-left: 1.5em; margin-bottom: 1em; }
        .markdown-preview ul { list-style-type: disc; }
        .markdown-preview ol { list-style-type: decimal; }
        .markdown-preview li { margin-bottom: 0.5em; }
        .pdf-markdown-content {
          color: #1E293B;
          font-family: 'Noto Sans TC', sans-serif;
          line-height: 1.8;
          font-size: 14px;
        }
        .pdf-markdown-content h1, .pdf-markdown-content h2, .pdf-markdown-content h3 {
          color: #0A2E5C;
          font-weight: bold;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .pdf-markdown-content h1 { font-size: 20px; }
        .pdf-markdown-content h2 { font-size: 18px; border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; }
        .pdf-markdown-content h3 { font-size: 16px; }
        .pdf-markdown-content p { margin-bottom: 1em; }
        .pdf-markdown-content ul, .pdf-markdown-content ol { padding-left: 20px; margin-bottom: 1em; }
        .pdf-markdown-content li { margin-bottom: 0.25em; }
        .pdf-markdown-content strong { color: #0F172A; }

        .markdown-preview strong { color: #f1f5f9; font-weight: 700; }
        .markdown-preview em { color: #94a3b8; font-style: italic; }
        .markdown-preview blockquote { border-left: 4px solid #6366f1; padding-left: 1em; color: #94a3b8; margin: 1em 0; background: rgba(99,102,241,0.1); padding: 0.5em 1em; border-radius: 4px; }
        .markdown-preview code { background-color: #1e293b; padding: 0.2em 0.4em; border-radius: 0.25em; font-family: monospace; font-size: 0.85em; color: #818cf8; }
        .markdown-preview pre { background-color: #0f172a; padding: 1em; border-radius: 0.5em; overflow-x: auto; border: 1px solid #1e293b; margin-bottom: 1em; }
        .markdown-preview pre code { background-color: transparent; padding: 0; color: #e2e8f0; }
        .markdown-preview a { color: #818cf8; text-decoration: underline; text-underline-offset: 2px; }
        .markdown-preview hr { border-color: #334155; margin: 2em 0; }
      `}} />
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* --- STREAMING<CHUNK:Left Navigation Bar --- */}
       <aside className={`fixed inset-y-0 left-0 w-64 bg-transparent flex flex-col justify-between z-50 shrink-0 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}`}>
        <div className="p-5">
          
          {/* Logo */}
         <div className="flex items-center gap-3 mb-8 px-1">
            
              <img src="https://omni-script-pro.vercel.app/OmniScript%20logo.png" alt="OmniScript" className="h-24 md:h-32 object-contain" />
            
            <div>
                           
            </div>
          </div>

          {/* Navigation Links (Matching Design exactly) */}
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
                      if (tab.id === 'creation' && isAuthenticated && stepContents[1] && stepContents[1].length > 10) {
                        setViewState('workspace');
                      }
                      setActiveTab(tab.id);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left border relative ${
                      isActive 
                        ? `${curTheme.bgActive} ${curTheme.textActive} ${curTheme.borderActive}` 
                        : 'text-[#64748B] border-transparent hover:text-[#1E293B] hover:bg-slate-50'
                    }`}
                  >
                    {/* Left indicator active line */}
                    {isActive && (
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-gradient-to-b ${curTheme.gradient}`} />
                    )}
                    <tab.icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                  
                  {/* 視覺裂變 (在左側選單視覺發控中心下) */}
                  {isActive && tab.id === 'visual' && (
                    <div className="mx-2 p-4 bg-white border border-slate-200 rounded-xl space-y-4 backdrop-blur-lg">
                      <h4 className="text-[10px] font-bold text-[#1E293B] uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
                        視覺裂變
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-[#64748B] font-bold block mb-1">畫風濾鏡</label>
                          <select 
                            value={currentImageStyle.id}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const recommendedStyle = AUDIENCE_STYLES[audienceTheme];
                              if (recommendedStyle && recommendedStyle.id === selectedId) {
                                setCurrentImageStyle(recommendedStyle);
                                return;
                              }
                              const foundPopular = POPULAR_STYLES.find(s => s.id === selectedId);
                              if (foundPopular) setCurrentImageStyle(foundPopular);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-[#1E293B] focus:outline-none mb-3 backdrop-blur-sm"
                          >
                            {AUDIENCE_STYLES[audienceTheme] && (
                              <optgroup label="💡 受眾專屬推薦風格">
                                <option value={AUDIENCE_STYLES[audienceTheme].id}>
                                  ✨ {AUDIENCE_STYLES[audienceTheme].name} (預設推薦)
                                </option>
                              </optgroup>
                            )}
                            <optgroup label="🔥 流行與其他風格">
                              {POPULAR_STYLES.map((style) => (
                                <option key={style.id} value={style.id}>
                                  {style.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                          <div className="text-[9px] text-[#64748B]/80 mt-1 leading-relaxed italic">
                            已套用風格詞綴：{currentImageStyle.promptSuffix.slice(0, 45)}...
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#64748B] font-bold block mb-1 mt-3">輸出比例</label>
                          <select 
                            value={visualStep}
                            onChange={(e) => setVisualStep(Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-[#1E293B] focus:outline-none mb-3 backdrop-blur-sm"
                          >
                            <option value={6}>{STEPS.find(s => s.id === 6)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 6)?.name || '橫幅縮圖 (YouTube / FB)'}</option>
                            <option value={7}>{STEPS.find(s => s.id === 7)?.aspectRatio || '9:16'} - {STEPS.find(s => s.id === 7)?.name || '短片直式封面 (Shorts / Reels)'}</option>
                            <option value={8}>{STEPS.find(s => s.id === 8)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 8)?.name || '意象圖 / 海報'}</option>
                            <option value={10}>{STEPS.find(s => s.id === 10)?.aspectRatio || '1:1 / 4:3'} - {STEPS.find(s => s.id === 10)?.name || '社群推播 / 視覺素材'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#64748B] font-bold block mb-1">影像生成引擎</label>
                          <select 
                            value={imageEngine}
                            onChange={(e) => setImageEngine(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-[#1E293B] focus:outline-none backdrop-blur-sm"
                          >
                            {IMAGE_ENGINES.map(engine => (
                              <option key={engine.id} value={engine.id}>{engine.name}</option>
                            ))}
                          </select>
                          <p className="text-[9px] text-[#64748B]/80 mt-1.5 leading-relaxed">
                            {IMAGE_ENGINES.find(e => e.id === imageEngine)?.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Controls */}
        <div className="p-4 border-t border-slate-200 space-y-3">


          {/* Light Mode Switcher */}
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#64748B] hover:text-[#1E293B] text-xs hover:bg-white transition-all">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-[#64748B]" />
              <span className="font-medium text-[#64748B] text-[11px]">淺色模式</span>
            </div>
            <div className="w-8 h-4 rounded-full bg-slate-50 flex items-center p-0.5 justify-start">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
            </div>
          </button>
        </div>
      </aside >     

      {/* --- STREAMING_CHUNK:Center Main Workspace Area --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        
        {/* Top Header */}
        <header className="h-16 bg-transparent border-b-0 flex items-center justify-between px-4 lg:px-6 z-10 shrink-0 gap-4">
          <div className="flex items-center gap-3 flex-1 lg:flex-none lg:w-96">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#64748B] hover:text-[#1E293B] transition-colors"
           
            >
              <Menu className="w-5 h-5" />
            </button>
            
          </div>
  
           

            
        </header>

        {/* --- Central Main Content Panels --- */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          {/* CONTENT TABS */}
          {activeTab === 'creation' && (
            viewState === 'hub' ? (
              /* --- STREAMING_CHUNK:Rendering Central Creator Welcome Hub --- */
              <div className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto relative bg-transparent">
                
                {/* Glowing Background Glows */}
                <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-40 transition-colors duration-1000 -z-10 pointer-events-none ${curTheme.ambientGlow || 'bg-slate-200'}`} />

                <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl p-6 md:p-8 relative space-y-6 my-auto shrink-0">
                  {/* Glowing Top Frame Accent Line */}
                  <div className={`absolute left-0 right-0 top-0 h-[2px] rounded-t-3xl bg-gradient-to-r ${curTheme.gradient}`} />
                  
                  {!isAuthenticated ? (
                    // --- 密碼輸入模式 (和輸入主題模式相同) ---
                    <>
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#0A2E5C] text-white hover:-translate-y-0.5 rounded-full shadow-md rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                          <Lock className="w-8 h-8 text-[#1E293B]" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#1E293B]">
                          系統已鎖定
                        </h2>
                        <p className="text-[11px] md:text-xs text-[#64748B] font-medium max-w-md mx-auto leading-relaxed">
                          請輸入您的專屬受眾授權碼以進入 OmniScript Pro 核心系統。
                        </p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4 mt-8">
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#10B981] to-[#0A2E5C] text-white hover:-translate-y-0.5 rounded-full shadow-md rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
                          <input 
                            type="password"
                            placeholder="輸入授權碼"
                            value={passcode}
                            onChange={(e) => { setPasscode(e.target.value); setAuthError(''); }}
                            className="w-full relative bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-semibold text-center text-[#1E293B] placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner tracking-widest backdrop-blur-sm"
                            autoFocus
                          />
                        </div>
                        
                        {authError && <p className="text-red-400 text-[10px] text-center font-bold">{authError}</p>}
                        
                        <button 
                          type="submit"
                          className="w-full py-4 rounded-full bg-gradient-to-r from-[#10B981] to-[#0A2E5C] hover:opacity-90 text-white font-bold text-sm transition-all duration-300 hover:-translate-y-[2px] shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          解鎖並登入工作區
                        </button>
                      </form>
                    </>
                  ) : (
                    // --- 原有的 Hub 內容 ---
                    <>
                      {/* Hub Header */}
                      <div className="text-center space-y-2">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#1E293B]">
                          今天想創作什麼？
                        </h2>
                        <p className="text-[11px] md:text-xs text-[#64748B] font-medium max-w-md mx-auto leading-relaxed">
                          輸入你想探討的主題，AI 將為你生成從研究、長短影音腳本到社群貼文的全域企劃。
                        </p>
                      </div>

                  {/* Dynamic Theme Select Buttons (Horizontal Row as requested) */}
                  <div className="space-y-3">
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {Object.values(audienceThemes).map((themeObj: any) => {
                        const isSel = audienceTheme === themeObj.id;
                        
                        return (
                          <button
                            key={themeObj.id}
                            onClick={() => handleThemeChange(themeObj.id)}
                            disabled={!isSel && !isGlobalMaster}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                              isSel
                                ? `${themeObj.bgActive} ${themeObj.borderActive} ${themeObj.textActive}`
                                : isGlobalMaster 
                                  ? 'border-slate-200 text-[#64748B] hover:text-[#1E293B] hover:border-slate-500 cursor-pointer'
                                  : 'border-slate-200 text-[#64748B] opacity-50 cursor-not-allowed'
                            }`}
                          >
                            {themeObj.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main Creative Input Container */}
                  <div className="space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#10B981] to-[#0A2E5C] text-white hover:-translate-y-0.5 rounded-full shadow-md rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
                      <input 
                        type="text"
                        placeholder="例如：日本京阪神五日遊攻略"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full relative bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-semibold text-[#1E293B] placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner backdrop-blur-sm"
                      />
                    </div>

                    {/* --- 新增：自訂背景資料區 --- */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-[#64748B] font-bold">自訂背景資料 / 參考文件 (選填)</label>
                        <label className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 hover:bg-slate-200 text-[#1E293B] text-[9px] cursor-pointer transition-colors border border-slate-200">
                          <UploadCloud className="w-3 h-3" />
                          <span>上傳 TXT/MD/CSV</span>
                          <input type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                      </div>
                      <div className="relative">
                        <textarea
                          maxLength={5000}
                          placeholder="請貼上參考文章或官方新聞稿 (建議限制在 5000 字以內，避免 AI 超載或觸發高流量限制)。系統會在啟動時自動將此內容匯入至 Step 1 作為基準資料..."
                          value={customContext}
                          onChange={(e) => setCustomContext(e.target.value)}
                          className={`w-full bg-white border ${customContext.length >= 5000 ? 'border-red-500/50' : 'border-slate-200'} rounded-xl px-4 py-3 text-xs text-[#1E293B] focus:outline-none focus:border-indigo-500/50 h-28 resize-none shadow-inner custom-scrollbar pb-6 backdrop-blur-sm`}
                        />
                        <div className={`absolute bottom-2 right-3 text-[9px] font-mono ${customContext.length >= 5000 ? 'text-red-400 font-bold' : 'text-[#64748B]'}`}>
                          {customContext.length} / 5000
                        </div>
                      </div>
                    </div>



                    {/* --- 新增：模組化勾選清單 (Checkbox List) --- */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-[#64748B] font-bold">📦 選擇要生成的素材矩陣 (可自由勾選)</label>
                      </div>
                      <div className="flex flex-wrap gap-2 pb-2">
                        {STEPS.map((step, idx) => {
                          const stepNum = idx + 1;
                          const isRequired = stepNum === 1 || stepNum === 2;
                          const isSelected = selectedSteps.includes(stepNum);
                          return (
                            <button
                              key={stepNum}
                              type="button"
                              disabled={isRequired}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedSteps(prev => prev.filter(s => s !== stepNum));
                                } else {
                                  setSelectedSteps(prev => [...prev, stepNum].sort((a, b) => a - b));
                                }
                              }}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                                isRequired
                                  ? 'bg-indigo-900/50 text-[#10B981] border border-indigo-500/30 cursor-not-allowed opacity-80'
                                  : isSelected
                                  ? 'bg-indigo-500 text-[#1E293B] shadow-md hover:bg-indigo-600'
                                  : 'bg-slate-50 text-[#64748B] border border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                {(isSelected || isRequired) && <Check className="w-3 h-3" />}
                                <span>{step.name}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Big Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: 一鍵全自動模式 */}
                      <button
                        onClick={() => {
                          isResumeIntentRef.current = false;
                          handleStartAuto();
                        }}
                        className={`py-4 rounded-2xl ${curTheme.primaryBtn} font-black text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-98`}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 fill-white" />
                          <span>一鍵全自動模式</span>
                        </div>
                        <span className="text-[10px] opacity-70 font-normal">單次呼叫，自動化處理所有步驟與歸檔</span>
                      </button>

                      {/* Right: 手動分步編輯 */}
                      <button
                        onClick={startManualWorkspace}
                        className="py-4 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 text-[#1E293B] font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-2 text-[#1E293B]">
                          <Sliders className="w-4 h-4 text-[#64748B]" />
                          <span>分步編輯工作流</span>
                        </div>
                        <span className="text-[10px] text-[#64748B] font-normal">手手動調校，逐步建構客製化矩陣腳本</span>
                      </button>
                    </div>
                  </div>

                  {/* Notion Load Project Component */}
                  {isGlobalMaster && (
                    <div className="flex pt-4 border-t border-slate-200/60 flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-[#10B981]">
                        <UploadCloud className="w-4.5 h-4.5" />
                        <span className="text-xs font-bold">從 Notion 載入已歸檔專案</span>
                      </div>
                    
                    {/* Simulated dropdown */}
                    <div className="w-full relative">
                      <select 
                        value={selectedArchive}
                        onChange={handleLoadArchive}
                        disabled={!isGlobalMaster}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] focus:outline-none appearance-none cursor-pointer text-center disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                      >
                        <option value="">-- {archiveList.length === 0 ? '載入清單中...' : '點擊選擇團隊專案'} --</option>
                        
                        {/* 這裡會自動把 Notion 裡面的專案名稱跟日期列出來！ */}
                        {archiveList.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            📄 {item.title} ({item.createdTime})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                    </div>
                  </div>
                  )}
                  
                  {/* 清空按鈕 */}
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={clearAllData}
                      className="text-[10px] text-red-500/70 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>清空企劃</span>
                    </button>
                  </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* --- STREAMING_CHUNK:Rendering ${STEPS.length}-Step Flow Editor Workspace --- */
              <div className="flex-1 flex overflow-hidden">
                
                {/* Steps Navigator Left Column */}
                <div className="relative shrink-0 h-full flex flex-col">
                  <div className="relative flex flex-col border-r border-slate-200 bg-white/10 transition-all duration-300 h-full backdrop-blur-sm">
                    {isGlobalMaster && (
                      <button
                        onClick={() => setIsStepFlowHidden(!isStepFlowHidden)}
                        className="absolute top-4 -right-3 z-20 flex items-center justify-center w-6 h-6 bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] rounded-full border-2 border-[#0a0f1d] shadow-lg transition-transform hover:scale-110"
                        title={isStepFlowHidden ? "展開 Step Flow" : "隱藏 Step Flow"}
                      >
                        {isStepFlowHidden ? <ChevronRight className="w-3 h-3 ml-0.5" /> : <ChevronLeft className="w-3 h-3 pr-0.5" />}
                      </button>
                    )}

                    <div className={`flex-1 overflow-y-auto space-y-1.5 custom-scrollbar transition-all duration-300 ${isStepFlowHidden ? 'w-0 p-0 overflow-hidden opacity-0' : 'w-64 p-4 opacity-100'}`}>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{STEPS.length}-Step Flow</span>
                        <span className={`${curTheme.accentText} text-[10px] font-mono`}>{completedSteps.length}/{STEPS.length} 已完成</span>
                      </div>
                  {STEPS.map((step: any) => {
                    const isActive = activeStep === step.id;
                    const isDone = completedSteps.includes(step.id);
                    const Icon = iconMap[step.icon] || FileText; 
                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border group ${
                          isActive 
                            ? `${curTheme.bgActive} ${curTheme.borderActive} ${curTheme.textActive} shadow-md` 
                            : 'bg-transparent hover:bg-white text-[#64748B] border-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? `${curTheme.bgActive} ${curTheme.textActive}` : 'bg-white text-[#64748B] group-hover:text-[#1E293B]'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isDone && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-md">
                              <Check className="w-2 h-2 text-[#1E293B]" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] text-[#64748B] uppercase tracking-widest">Step {step.id}</div>
                          <div className="text-xs font-bold truncate">{step.name}</div>
                        </div>
                      </button>
                    );
                  })}
                    </div>
                  </div>
              </div>

              {/* Markdown editor screen */}
                <div className="flex-1 bg-transparent p-6 overflow-y-auto relative flex flex-col custom-scrollbar pb-24">
                  <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
                    
                    {/* Workspace steps Header */}
                    <div className="flex items-center justify-between mb-6 shrink-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <button 
                            onClick={() => {
                              setActiveTab('creation');
                              setViewState('hub');
                            }}
                            className="text-xs text-[#64748B] hover:text-[#10B981] flex items-center gap-1 font-bold transition-all"
                          >
                            ← 返回創作大廳
                          </button>
                          <span className="text-slate-600">•</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${curTheme.bgBadge}`}>
                            STEP {activeStep} • {STEPS[activeStep-1]?.category || 'Loading'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
                          {STEPS[activeStep-1]?.name || '載入中...'}
                        </h3>
                        <p className="text-xs text-[#64748B] mt-1">{STEPS[activeStep-1]?.desc || '正在同步伺服器設定檔...'}</p>
                      </div>

                      <div className="flex items-center gap-3">

                        <button 
                          onClick={handleDownloadZip}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          📥 下載企劃包 (.zip)
                        </button>
                        <button 
                          onClick={handleDownloadPdf}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          📄 匯出完整企劃 (.PDF)
                        </button>

                        <button 
                          onClick={triggerSingleStepAi}
                          disabled={isGenerating}
                          className={`flex items-center gap-2 px-4 py-2.5 ${curTheme.primaryBtn} disabled:opacity-50 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95`}
                        >
                          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          {isGenerating ? 'AI 優化生成中...' : 'AI 重新生成與潤飾'}
                        </button>
                      </div>
                    </div>
 
{/* 接續生成 / 中斷生成 */}
 <div className="flex items-center gap-3 lg:gap-4 shrink-0"> 

            {isGenerating ? (
              <button 
                onClick={() => {
                  setIsGenerating(false);
                  addLog("[System] 生成作業已由使用者手動中斷。", "info");
                  setViewState('workspace');
                }}
                className="px-4 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all animate-pulse"
              >
                <X className="w-3.5 h-3.5" />
                <span>中斷生成</span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  isResumeIntentRef.current = completedSteps.length > 1 && completedSteps.length < STEPS.length;
                  handleStartAuto();
                }}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#10B981] to-[#0A2E5C] hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.5)] active:scale-95 transition-all duration-300 hover:-translate-y-[2px]"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{completedSteps.length > 1 && completedSteps.length < STEPS.length ? '接續生成' : '一鍵全自動模式'}</span>
              </button>
            )}
          
           
          </div>


                    {/* Markdown text editor card */}
                    <div className="relative flex-1 flex flex-col">
                      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                        <div className="px-4 py-2.5 bg-white/30 border-b border-slate-200 backdrop-blur-md flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-[10px] font-mono text-[#64748B] ml-2">Markdown Editor</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {stepContents[activeStep] && stepContents[activeStep].trim() !== '' && (
                            <button
                              onClick={() => {
                                const text = stepContents[activeStep];
                                const blob = new Blob([text], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${theme || '企劃'}_Step${activeStep}_${STEPS[activeStep-1]?.name.split(' ')[0] || 'Doc'}.md`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="text-[10px] text-[#10B981] hover:text-[#1E293B] flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/30 transition-all border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer shadow-sm"
                              title="下載此步驟內容為 Markdown 檔案"
                            >
                              <Download className="w-3 h-3" />
                              下載 .md
                            </button>
                          )}
                          <div className="text-[10px] text-[#64748B] font-medium">
                            Auto-saved locally
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 relative min-h-[500px]">
                        {/* AI 撰寫時，顯示 MP4 讀取動畫 */}
                        {isGenerating ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFC]/60 z-10 backdrop-blur-md">
                            <div className="relative group w-[600px] h-[340px] mb-6">
                              <video 
                                src={LOADING_VIDEOS_LIST[loadingVideoIdx]} 
                                autoPlay 
                                muted={isVideoMuted}
                                playsInline
                                webkit-playsinline="true"
                                onEnded={() => setLoadingVideoIndex(prev => (prev + 1) % LOADING_VIDEOS_LIST.length)}
                                className="w-full h-full object-cover rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] pointer-events-none"
                              />
                              <button
                                onClick={() => setIsVideoMuted(!isVideoMuted)}
                                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-[#1E293B] p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-slate-200 shadow-lg pointer-events-auto"
                              >
                                {isVideoMuted ? <VolumeX className="w-5 h-5 text-[#1E293B]" /> : <Volume2 className="w-5 h-5 text-[#10B981]" />}
                              </button>
                            </div>
                            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse tracking-wider">
                              AI 核心引擎高速運算中...
                            </h3>
                            <p className="text-[#64748B] mt-3 text-sm flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              正在抓取資料，請稍候
                            </p>
                          </div>
                        ) : (
                          /* 生成完畢後，顯示原本的文字編輯器 */
                          <textarea 
                            value={stepContents[activeStep]}
                            onChange={(e) => setStepContents(prev => ({ ...prev, [activeStep]: e.target.value }))}
                            className="absolute inset-0 p-6 font-mono text-sm text-[#1E293B] focus:outline-none overflow-y-auto whitespace-pre-wrap leading-relaxed select-text cursor-text bg-transparent resize-none border-none w-full h-full custom-scrollbar"
                          />
                        )}
                      </div>
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
            <div className="flex-1 p-6 overflow-y-auto bg-transparent custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Visual Intro banner */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2.5">
                      <ImageIcon className="w-5 h-5 text-[#10B981]" />
                      視覺調度中心
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">控制與生成 16:9 YouTube 橫向縮圖、9:16 短片直式封面及社群視覺素材。</p>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start relative">
                  
                  {isGlobalMaster && (
                    <div className={`hidden lg:flex absolute top-4 z-20 transition-all duration-300 ${isVisualSidebarHidden ? '-left-3' : 'left-[305px]'}`}>
                      <button
                        onClick={() => setIsVisualSidebarHidden(!isVisualSidebarHidden)}
                        className="flex items-center justify-center w-6 h-6 bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] rounded-full border-2 border-[#0a0f1d] shadow-lg transition-transform hover:scale-110"
                        title={isVisualSidebarHidden ? "展開 Prompt 控制台" : "隱藏 Prompt 控制台"}
                      >
                        {isVisualSidebarHidden ? <ChevronRight className="w-3 h-3 ml-0.5" /> : <ChevronLeft className="w-3 h-3 pr-0.5" />}
                      </button>
                    </div>
                  )}

                  {/* Left Controls column */}
                  <div className={`transition-all duration-300 ease-in-out shrink-0 bg-white border border-slate-200 rounded-2xl backdrop-blur-lg flex flex-col relative ${isVisualSidebarHidden ? 'w-0 h-0 p-0 overflow-hidden border-transparent opacity-0 m-0' : 'w-full lg:w-[320px] p-5 space-y-4 opacity-100'}`}>

<div className="relative w-full flex-1 min-h-[500px]">
  
  {/* AI 撰寫時，顯示 MP4 讀取動畫 */}
  {isGenerating ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-xl z-10 backdrop-blur-md">
       
      <div className="relative group w-[600px] h-[340px] mb-6">
        <video 
          src={LOADING_VIDEOS_LIST[loadingVideoIdx]} 
          autoPlay 
          muted={isVideoMuted}
          playsInline
          webkit-playsinline="true"
          onEnded={() => setLoadingVideoIndex(prev => (prev + 1) % LOADING_VIDEOS_LIST.length)}
          className="w-full h-full object-cover rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] pointer-events-none"
        />
        <button
          onClick={() => setIsVideoMuted(!isVideoMuted)}
          className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-[#1E293B] p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-slate-200 shadow-lg pointer-events-auto"
        >
          {isVideoMuted ? <VolumeX className="w-5 h-5 text-[#1E293B]" /> : <Volume2 className="w-5 h-5 text-[#10B981]" />}
        </button>
      </div>
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse tracking-wider">
        AI 引擎高速運算中...
      </h3>
      <p className="text-purple-300/60 mt-3 text-sm flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        正在抓取資料，請稍候
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
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isGeneratingImage ? '正在批次渲染中...' : ((!geminiApiKey.trim() && !isCanvasEnv) ? '輸入Gemini API 繪製圖像' : '✨ AI 批次繪製全部影像')}</span>
                    </button>
                  </div>

                  {/* Right Masonry Grid of images */}
                  <div className="flex-1 w-full space-y-4 min-w-0">
                    <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-widest">已渲染媒體資產庫 ({visualGroups.length})</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visualGroups.map((group: any) => (
                        <div key={group.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-lg flex flex-col">
                          {/* Image Area */}
                          <div className="w-full h-40 bg-black/40 relative flex items-center justify-center overflow-hidden">
                            {groupImages[group.id] ? (
                               <img src={groupImages[group.id]} alt={group.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                            ) : generatingGroups[group.id] ? (
                               <div className="flex flex-col items-center gap-2">
                                 <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
                                 <span className="text-[10px] text-[#10B981]">正在透過 {IMAGE_ENGINES.find(e => e.id === imageEngine)?.name || 'AI'} 生成...</span>
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
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-[#10B981] border border-indigo-500/20 font-semibold">
                                  {IMAGE_ENGINES.find(e => e.id === imageEngine)?.name || 'AI'}
                                </span>
                                <div className="flex gap-1.5">
                                  <button 
                                    onClick={() => handleDownloadImage(groupImages[group.id], group.title)}
                                    className="p-1 rounded bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#1E293B] transition-all"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="p-1 rounded bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#1E293B] transition-all">
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <h5 className="text-[11px] font-bold text-[#1E293B]">{group.title}</h5>
                              <p className="text-[9px] text-[#64748B] font-mono truncate mt-1" title={group.prompt}>{group.prompt}</p>
                            </div>
                            
                            <button
                              onClick={() => generateGroupImage(group)}
                              disabled={generatingGroups[group.id]}
                              className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{generatingGroups[group.id] ? '正在渲染...' : ((!geminiApiKey.trim() && !isCanvasEnv) ? '輸入Gemini API 繪製圖像' : '✨ AI 繪製影像 (-5 點)')}</span>
                            </button>
                            
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleCopyAndGo(group, 'gemini')}
                                className="flex-1 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-800 text-[#10B981] text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-indigo-700/50"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                複製開啟 Gemini
                              </button>
                              <button
                                onClick={() => handleCopyAndGo(group, 'chatgpt')}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-emerald-700/50"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                ChatGPT
                              </button>
                            </div>
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
            <div className="flex-1 p-6 overflow-y-auto bg-transparent custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2.5">
                      <Music className="w-5 h-5 text-[#10B981]" />
                      Suno 配樂中心
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">基於影片受眾調性與腳本節奏，一鍵調用 Suno API 自動生成原創、無版權問題的配樂。</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Lyrics generation */}
                  <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 backdrop-blur-lg">
                    <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-widest">配樂歌詞生成</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-[#64748B] font-bold block mb-1">配樂風格 (Style of Music)</label>
                        <input 
                          type="text" 
                          value={musicGenre} 
                          onChange={(e) => setMusicGenre(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none backdrop-blur-sm"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#64748B] font-bold block mb-1">歌詞內容 / 音調環境</label>
                        <textarea
                          value={stepContents[9]} 
                          onChange={(e) => setStepContents(prev => ({ ...prev, 9: e.target.value }))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none h-36 resize-none backdrop-blur-sm"
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
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-[#1E293B] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>重新調製音訊軌跡</span>
                    </button>
                  </div>

                  {/* Active sound visualizer */}
                  <div className="col-span-2 space-y-4">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                      {/* Active equalizer simulation */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-[#1E293B] flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0"
                          >
                            {isPlayingMusic ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                          </button>
                          <div>
                            <p className="text-xs font-bold text-[#1E293B]">SaaS Dreamscape - Vol.3</p>
                            <p className="text-[10px] text-[#64748B]">Style: Synthwave, Cyberpunk Lofi Beat</p>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-[#10B981]">
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
                      <div className="h-1 w-full bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${musicProgress}%` }} />
                      </div>
                    </div>

                    {/* Suno Audio Archive Library */}
                    <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-widest pt-2">配樂生成庫</h4>
                    <div className="space-y-2">
                      {[
                        { title: 'SaaS Dreamscape - Vol.3', style: 'Synthwave', dur: '02:00' },
                        { title: 'Neon Coding Vibes', style: 'Lofi Cyberpunk', dur: '01:45' },
                        { title: 'The travelpreneur Spirit', style: 'Acoustic Bright', dur: '02:30' }
                      ].map((track) => (
                        <div key={track.title} className="flex items-center justify-between p-3 rounded-xl bg-white/30 border border-slate-200/60 hover:border-purple-500/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center text-[#10B981]">
                              <Music className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1E293B]">{track.title}</p>
                              <p className="text-[10px] text-[#64748B]">Style: {track.style}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[#64748B]">{track.dur}</span>
                            <button className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-[10px] text-[#64748B] hover:text-[#1E293B] font-bold border border-slate-200">
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
            <div className="flex-1 p-6 overflow-y-auto bg-transparent custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2.5">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                      NotebookLM 影片整合中心
                    </h3>
                    <p className="text-xs text-[#64748B] mt-1">匯入長影片、外部文檔或錄音檔，自動生成主題關係圖並轉譯為結構化對談與學習指南。</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left input container */}
                  <div className="col-span-1 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 backdrop-blur-lg">
                    <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-widest">外部資料庫匯入</h4>
                    
                    <div className="space-y-3">
                      <div className="p-4 border border-dashed border-slate-200 hover:border-emerald-500/40 rounded-xl bg-white/10 text-center cursor-pointer transition-all">
                        <UploadCloud className="w-7 h-7 text-[#64748B] mx-auto mb-2" />
                        <span className="text-xs font-bold text-[#64748B] block">拖曳 Markdown/PDF 到這裡</span>
                        <span className="text-[10px] text-slate-600 block mt-1">或 點擊選擇上傳</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-[#64748B] font-bold block mb-1">YouTube 長影片 URL</label>
                        <input 
                          type="text" 
                          placeholder="[https://www.youtube.com/watch?v=](https://www.youtube.com/watch?v=)..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none focus:border-emerald-500/40 backdrop-blur-sm"
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
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#1E293B] text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      <span>解析影片並載入背景庫</span>
                    </button>
                  </div>

                  {/* NotebookLM key points display */}
                  <div className="col-span-2 space-y-4">
                    <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Award className="w-4 h-4" />
                        <span>AI 生成長影片知識卡 (影片時長 35 mins)</span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed text-[#1E293B]">
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-[#1E293B]">關鍵摘要 01 - 跨平台分流之必然趨勢</p>
                          <p className="text-[#64748B] mt-1">2026年單一社群平台流量正在緊縮，頂尖創作者必須建立 YouTube（長格式）- TikTok（短格式）- FB/IG（社群宣傳）的自動分流系統。</p>
                        </div>
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-[#1E293B]">關鍵摘要 02 - 多工 AI 優勢</p>
                          <p className="text-[#64748B] mt-1">使用整合型 Prompt 比分批下達能更好留存上下文關係。一次解構全域步驟能有效避免宣傳文案與腳本調性不一致的痛點。</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick interactive Q&As */}
                    <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-widest pt-1">快速導讀問答</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {[
                        { q: '這段內容的受眾痛點是什麼？', a: '主要在於重複的發文格式排版以及腳本靈感瓶頸。' },
                        { q: '全域企劃與單純寫腳本差在哪？', a: '全域企劃整合了背景、長短分鏡、Suno 配樂與 SEO，一次完成多重產出。' }
                      ].map((qa, i) => (
                        <div key={i} className="p-4 bg-white/30 border border-slate-200/80 rounded-xl space-y-1.5">
                          <p className="font-bold text-[#1E293B]">❓ {qa.q}</p>
                          <p className="text-[#64748B] text-[11px] leading-relaxed">{qa.a}</p>
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
      <aside className="hidden lg:flex w-80 bg-transparent border-l border-transparent flex-col justify-between z-20 shrink-0">
        
        {/* Top Part: AI Engine Monitor & Live Logs */}
        <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-6">
          
          {/* AI 狀態監控 Panel */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                  <Sliders className="w-3 h-3 text-[#10B981]" />
                </span>
                <h4 className="text-[11px] font-bold text-[#1E293B] uppercase tracking-wider">AI 狀態監控</h4>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Quota Metric Button */}
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-600 font-bold text-[10px]">
                  <Zap className="w-3 h-3 fill-amber-500/20" />
                  <span>{credits} 點</span>
                </div>
                {/* User Avatar */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#10B981] to-[#0A2E5C] flex items-center justify-center text-[10px] font-extrabold text-white shadow-md cursor-pointer hover:scale-105 transition-all">
                  SH
                </div>
              </div>
            </div>

            {/* Active Engine Card */}
            <div className="border-transparent border border-slate-200 p-4 rounded-xl flex flex-col gap-2 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#10B981] to-emerald-300"></div>
              <div className="flex items-center gap-2.5 pl-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">Active Engine</span>
              </div>
              <div className="text-xl font-black tracking-widest text-[#1E293B] pl-2 mt-1">
                PRO
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#64748B] font-mono mt-3 border-transparent border-t border-slate-100 pt-3 pl-2">
                <div>Uptime: <span className="text-[#10B981] font-bold">99.99%</span></div>
                <div>Latency: <span className="text-[#1E293B] font-bold">1.2s</span></div>
              </div>
            </div>
          </div>

          {/* _> 系統與日誌 (Log Terminal Box) */}
          <div className="flex-1 flex flex-col overflow-hidden border-transparent border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-transparent border-b border-slate-100 bg-transparent">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#64748B]" />
                <h4 className="text-[11px]  font-bold text-[#1E293B] uppercase tracking-wider">系統與日誌</h4>
              </div>
              
              {/* Simulated MacOS close icons */}
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 border  border-red-500/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border  border-amber-500/20" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border  border-emerald-500/20" />
              </div>
            </div>

            {/* Active Logs Terminal Container */}
            <div className="flex-1 bg-transparent p-4 font-mono text-[12px] overflow-y-auto space-y-3 custom-scrollbar text-slate-300">
              {logs.map((log, index) => {
                let colorClass = "text-slate-300";
                if (log.type === 'info') colorClass = "text-blue-400";
                if (log.type === 'success') colorClass = "text-emerald-400";
                if (log.type === 'warning') colorClass = "text-amber-400";
                if (log.type === 'error') colorClass = "text-red-400";
                
                return (
                  <div key={index} className="leading-relaxed whitespace-pre-wrap break-words">
                    <span className="text-slate-500">[{log.time}]</span>{' '}
                    <span className={colorClass}>{log.text}</span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        {/* Bottom Part (Matches Left Panel's padding and border-t) */}
        <div className="p-4 border-transparent border-t border-slate-200 space-y-3">
          <button
            onClick={() => {
              setActiveTab('creation');
              setViewState('hub');
            }}
            className="w-full py-3 px-4 text-xs font-bold 'text-[#64748B] border-transparent hover:text-[#1E293B] hover:bg-slate-50  border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            返回創作大廳
          </button>
        </div>

      </aside>
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white/60 backdrop-blur-2xl border-transparent border border-slate-200 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
                <Key className="w-6 h-6 text-[#10B981]" />
                設定 Gemini API Key
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-[#64748B] hover:text-[#1E293B] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                <input
                  type="password"
                  placeholder="輸入 API Key..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-white border-transparent border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm text-[#1E293B] placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner backdrop-blur-sm"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] font-bold transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  確認並儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden container for PDF export */}
      <div id="pdf-export-container" style={{ display: 'none', position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: '#ffffff', padding: '40px', color: '#1E293B' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="data:image/png;base64,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" alt="Logo" style={{ height: '60px', margin: '0 auto', display: 'block' }} />
          <h1 style={{ fontSize: '28px', marginTop: '20px', color: '#0A2E5C', fontWeight: 'bold' }}>{theme || 'OmniScript'} 完整企劃報告</h1>
        </div>
        {STEPS.map((step, idx) => {
          const content = stepContents[idx + 1];
          if (!content || content.trim() === '') return null;
          return (
            <div key={idx} style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '22px', color: '#0A2E5C', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', marginBottom: '20px', fontWeight: 'bold' }}>
                Step {idx + 1}: {step.name}
              </h2>
              <div className="pdf-markdown-content">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
