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
    const rawApiKey = userApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "");
    const apiKey = rawApiKey.trim();
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // ==========================================
    // 階段 1：向 Vercel 請求「組裝好的 Prompt」
    // ==========================================
     const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://omni-script-pro.vercel.app' 
      : '';   
    const VERCEL_API_URL = 'https://omni-script-pro.vercel.app/api/generate-all';

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
        let errorDetails = "";
        try {
            const errorData = await aiResponse.json();
            errorDetails = errorData.error?.message || JSON.stringify(errorData);
        } catch(e) {
            errorDetails = await aiResponse.text();
        }
        throw new Error(`Google API 錯誤 (${aiResponse.status}): ${errorDetails}`);
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
  const isCanvasEnv = false; // Changed to false for Vercel deployment
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

  const [godsInput, setGodsInput] = useState('');
  const [isGeneratingGods, setIsGeneratingGods] = useState(false);
  const [godsCards, setGodsCards] = useState<any[]>([]);
  const [isSavingGods, setIsSavingGods] = useState(false);
 

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
    { time: "[System]", text: "[System] 系統就緒。主美學配置：全職影音創作者 (Cinematic Pink)", type: "info" }
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
    { id: 1, url: '[https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80)', engine: 'Gemini 2.5 Flash', prompt: '第一組中文Prompt' },
    { id: 2, url: '[https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80)', engine: 'Gemini 2.5 Flash', prompt: '第二組中文Prompt' },
    { id: 3, url: '[https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80)', engine: 'Gemini 2.5 Flash', prompt: '第三組中文Prompt' }
  ]);

  const [groupImages, setGroupImages] = useState({});
  const [generatingGroups, setGeneratingGroups] = useState({});
  const [imageEngine, setImageEngine] = useState('flash');

  const [notebookParsedGroups, setNotebookParsedGroups] = useState<any[]>([]);
  const [notebookImages, setNotebookImages] = useState<any[]>([]);
  const [isGeneratingNotebook, setIsGeneratingNotebook] = useState(false);
  const [isNotebookSidebarHidden, setIsNotebookSidebarHidden] = useState(false);

  

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
    if (activeTab === 'notebook' && stepContents[2]) {
      setIsGeneratingNotebook(true);
      fetch('https://omni-script-pro.vercel.app/api/notebooklm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: stepContents[2] })
      })
        .then(res => res.json())
        .then(data => {
          setNotebookParsedGroups(data.parsedScenes || []);
          setIsGeneratingNotebook(false);
        })
        .catch(err => {
          console.error('Parse notebookLM error:', err);
          setIsGeneratingNotebook(false);
        });
    }
  }, [stepContents, activeTab]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);



  const handleGenerateNotebookImages = async () => {
    if (notebookParsedGroups.length === 0) {
      safeAlert("請先確認腳本中包含有效的視覺畫面建議！");
      return;
    }
    
    setIsGeneratingNotebook(true);
    addLog(`[NotebookLM] 開始批次發送 ${notebookParsedGroups.length} 組 Prompt 進行動態組裝...`, 'info');
    
    await Promise.all(notebookParsedGroups.map(group => generateGroupImage(group)));
    
    setIsGeneratingNotebook(false);
    addLog(`[NotebookLM] 🎨 所有影像生成完畢！`, 'success');
  };

  const handleDownloadNotebookPython = async () => {
    if (notebookParsedGroups.length === 0) {
      safeAlert("請先產生分鏡卡片！");
      return;
    }
    
    addLog(`[System] 正在向後端請求產生 Python 自動化草稿...`, 'info');
    
    const scenesToExport = notebookParsedGroups.map(g => {
        return {
            title: g.title,
            caption: g.subTitle || "",
            voiceover: g.poetry || "",
            prompt: g.prompt || ""
        };
    });

    try {
        const response = await fetch('https://omni-script-pro.vercel.app/api/notebooklm/export', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenes: scenesToExport })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "匯出失敗");
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'capcut_generator.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        addLog(`[System] 成功下載 Python 剪映草稿腳本！`, 'success');
    } catch (err: any) {
        addLog(`[Error] 匯出 Python 腳本失敗: ${err.message}`, 'error');
        safeAlert("匯出失敗：" + err.message);
    }
  };

  const generateGroupImage = async (group: any) => {
    const { id: groupId, prompt, mainTitle, subTitle, poetry } = group;
    if (!prompt) return;
    setGeneratingGroups(prev => ({ ...prev, [groupId]: true }));
    
    const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
    const engineName = engineConfig.name;
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
      
      }
      if (base64) {
        const originalImage = `data:image/png;base64,${base64}`;
        let finalImage = originalImage;
        
        setGroupImages(prev => ({ ...prev, [groupId]: finalImage }));
        addLog(`[${engineName}] ✨ ${groupId} 渲染完成！`, 'success');
      }
    } catch (err: any) {
      const engineName = imageEngine === 'flash' ? 'Gemini 2.5 Flash' : 'Gemini 2.5 Flash';
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

  const handleDownloadCapCutJson = () => {
    try {
      const content = stepContents[activeStep] || "";
      if (!content.trim()) {
        safeAlert("當前步驟沒有腳本可以匯出！");
        return;
      }

      const jsonOutput = [];
      const blocks = content.split(/\*\*\[(\d{2}:\d{2}\s*-\s*\d{2}:\d{2})\]\*\*/g);
      
      for (let i = 1; i < blocks.length; i += 2) {
        const timecode = blocks[i].trim();
        const blockText = blocks[i+1] || "";
        
        const visualMatch = blockText.match(/視覺畫面建議[：:]\s*\*?\s*(.*?)(?=\n|$)/);
        const captionMatch = blockText.match(/畫面字卡[：:]\s*\*?\s*(.*?)(?=\n|$)/);
        const voiceoverMatch = blockText.match(/旁白配音\s*\(VO\)[：:]\s*\*?\s*(.*?)(?=\n|$)/);
        
        if (visualMatch || captionMatch || voiceoverMatch) {
          jsonOutput.push({
            timecode,
            visual_prompt: visualMatch ? visualMatch[1].replace(/\*+/g, '').trim() : "",
            caption: captionMatch ? captionMatch[1].replace(/\*+/g, '').trim() : "",
            voiceover: voiceoverMatch ? voiceoverMatch[1].replace(/\*+/g, '').trim() : ""
          });
        }
      }

      if (jsonOutput.length === 0) {
        safeAlert("無法解析腳本。請確認腳本格式是否包含時間軸與「旁白配音」等關鍵字。");
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsonOutput, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `capcut_script_step${activeStep}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();

      addLog(`[System] 剪映結構化 JSON 匯出成功！(${jsonOutput.length} 段分鏡)`, 'success');
    } catch (err: any) {
      console.error(err);
      addLog(`[Error] 剪映 JSON 匯出失敗: ${err.message}`, 'error');
    }
  };

        const handleDownloadPdf = async () => {
    try {
      addLog('[System] 正在生成 PDF，請稍候...', 'info');
      
      let html2pdf;
      try {
        const html2pdfModule = await import('html2pdf.js');
        html2pdf = html2pdfModule.default || html2pdfModule;
      } catch (importErr) {
        console.warn("Local import failed, trying CDN...", importErr);
        if (!window.html2pdf) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        html2pdf = window.html2pdf;
      }

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

        const activeApiKey = (geminiApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "")).trim();

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
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeApiKey}`;
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
        setViewState('workspace');
        setActiveTab('creation');
        addLog(`[Notion] 專案讀取成功，已導入內容創作中心！`, 'success');
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
       <div className="p-0">
          
          {/* Logo */}
         <div className="flex items-center gap-0 mb-0 px-0">
            
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
              { id: 'notebook', icon: BookOpen, label: 'NotebookLM 影片中心' },
              { id: 'gods_data', icon: Star, label: '諸神文化解碼中心' }
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
                  {isActive && (tab.id === 'visual' || tab.id === 'notebook' || tab.id === 'gods_data') && (
                    <div className="mx-2 p-4 bg-white border border-slate-200 rounded-xl space-y-4 backdrop-blur-lg">
                      <h4 className=" text-[14px] font-bold text-[#1E293B] uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
                        視覺裂變
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className=" text-[14px] text-[#64748B] font-bold block mb-1">畫風濾鏡</label>
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
                          <div className="text-[12px] text-[#64748B]/80 mt-1 leading-relaxed italic">
                            已套用風格詞綴：{currentImageStyle.promptSuffix.slice(0, 45)}...
                          </div>
                        </div>

                        <div>
                          <label className=" text-[14px] text-[#64748B] font-bold block mb-1 mt-3">輸出比例</label>
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
                          <label className=" text-[14px] text-[#64748B] font-bold block mb-1">影像生成引擎</label>
                          <select 
                            value={imageEngine}
                            onChange={(e) => setImageEngine(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[11px] text-[#1E293B] focus:outline-none backdrop-blur-sm"
                          >
                            {IMAGE_ENGINES.map(engine => (
                              <option key={engine.id} value={engine.id}>{engine.name}</option>
                            ))}
                          </select>
                          <p className="text-[12px] text-[#64748B]/80 mt-1.5 leading-relaxed">
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

          {/* API Key Settings Button */}
          <button 
            onClick={() => setShowApiKeyModal(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#1E293B] hover:text-[#10B981] hover:bg-[#10B981]/5 text-xs transition-all border border-transparent hover:border-[#10B981]/20 font-bold"
          >
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4" />
              <span>設定 Gemini API 金鑰</span>
            </div>
          </button>

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
                        
                        {authError && <p className="text-red-400  text-[14px] text-center font-bold">{authError}</p>}
                        
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
                        <label className=" text-[14px] text-[#64748B] font-bold">自訂背景資料 / 參考文件 (選填)</label>
                        <label className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 hover:bg-slate-200 text-[#1E293B] text-[12px] cursor-pointer transition-colors border border-slate-200">
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
                        <div className={`absolute bottom-2 right-3 text-[12px] font-mono ${customContext.length >= 5000 ? 'text-red-400 font-bold' : 'text-[#64748B]'}`}>
                          {customContext.length} / 5000
                        </div>
                      </div>
                    </div>



                    {/* --- 新增：模組化勾選清單 (Checkbox List) --- */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className=" text-[14px] text-[#64748B] font-bold">📦 選擇要生成的素材矩陣 (可自由勾選)</label>
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
                              className={`px-3 py-1.5 rounded-full  text-[14px] font-bold transition-all ${
                                isRequired ? 'bg-indigo-500 text-[#1E293B] shadow-md cursor-not-allowed opacity-80'
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
                        <span className=" text-[14px] opacity-70 font-normal">單次呼叫，自動化處理所有步驟與歸檔</span>
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
                        <span className=" text-[14px] text-[#64748B] font-normal">手手動調校，逐步建構客製化矩陣腳本</span>
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
                      className=" text-[14px] text-red-500/70 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10"
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
                        <span className=" text-[14px] font-bold text-[#64748B] uppercase tracking-widest">{STEPS.length}-Step Flow</span>
                        <span className={`${curTheme.accentText}  text-[14px] font-mono`}>{completedSteps.length}/{STEPS.length} 已完成</span>
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
                          <div className="text-[12px] text-[#64748B] uppercase tracking-widest">Step {step.id}</div>
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
                          <span className={`px-2 py-0.5 rounded  text-[14px] font-bold ${curTheme.bgBadge}`}>
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
                          onClick={handleDownloadCapCutJson}
                          className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          🎬 匯出剪映草稿 (.JSON)
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
                      <div className="flex items-center justify-between mb-2">
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
                        
                        <div className=" text-[14px] text-[#64748B] font-medium flex items-center">
                          <CheckCircle2 className="w-3 h-3 text-[#10B981] mr-1" />
                          Auto-saved locally
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
                                 <span className=" text-[14px] text-[#10B981]">正在透過 {IMAGE_ENGINES.find(e => e.id === imageEngine)?.name || 'AI'} 生成...</span>
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
                                <span className="px-1.5 py-0.5 rounded text-[12px] bg-indigo-500/10 text-[#10B981] border border-indigo-500/20 font-semibold">
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
                              <p className="text-[12px] text-[#64748B] font-mono truncate mt-1" title={group.prompt}>{group.prompt}</p>
                            </div>
                            
                            <button
                              onClick={() => generateGroupImage(group)}
                              disabled={generatingGroups[group.id]}
                              className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[#1E293B]  text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{generatingGroups[group.id] ? '正在渲染...' : ((!geminiApiKey.trim() && !isCanvasEnv) ? '輸入Gemini API 繪製圖像' : '✨ AI 繪製影像 (-5 點)')}</span>
                            </button>
                            
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleCopyAndGo(group, 'gemini')}
                                className="flex-1 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-800 text-[#10B981]  text-[14px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-indigo-700/50"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                複製開啟 Gemini
                              </button>
                              <button
                                onClick={() => handleCopyAndGo(group, 'chatgpt')}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-900/40 hover:bg-emerald-800 text-emerald-300  text-[14px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-emerald-700/50"
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
                        <label className=" text-[14px] text-[#64748B] font-bold block mb-1">配樂風格 (Style of Music)</label>
                        <input 
                          type="text" 
                          value={musicGenre} 
                          onChange={(e) => setMusicGenre(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:outline-none backdrop-blur-sm"
                        />
                      </div>

                      <div>
                        <label className=" text-[14px] text-[#64748B] font-bold block mb-1">歌詞內容 / 音調環境</label>
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
                            <p className=" text-[14px] text-[#64748B]">Style: Synthwave, Cyberpunk Lofi Beat</p>
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
                              <p className=" text-[14px] text-[#64748B]">Style: {track.style}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[#64748B]">{track.dur}</span>
                            <button className="px-2.5 py-1 rounded bg-white hover:bg-slate-50  text-[14px] text-[#64748B] hover:text-[#1E293B] font-bold border border-slate-200">
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

                <div className="flex flex-col lg:flex-row gap-6 items-start relative w-full h-full">
                  
                  {isGlobalMaster && (
                    <div className={`hidden lg:flex absolute top-4 z-20 transition-all duration-300 ${isNotebookSidebarHidden ? '-left-3' : 'left-[305px]'}`}>
                      <button
                        onClick={() => setIsNotebookSidebarHidden(!isNotebookSidebarHidden)}
                        className="flex items-center justify-center w-6 h-6 bg-indigo-600 hover:bg-indigo-500 text-[#1E293B] rounded-full border-2 border-[#0a0f1d] shadow-lg transition-transform hover:scale-110"
                        title={isNotebookSidebarHidden ? "展開腳本" : "收合腳本"}
                      >
                        {isNotebookSidebarHidden ? <ChevronRight className="w-3 h-3 ml-0.5" /> : <ChevronLeft className="w-3 h-3 pr-0.5" />}
                      </button>
                    </div>
                  )}

                  {/* Left Column: STEP 2 content */}
                  <div className={`transition-all duration-300 ease-in-out shrink-0 bg-white border border-slate-200 rounded-2xl backdrop-blur-lg flex flex-col relative ${isNotebookSidebarHidden ? 'w-0 h-0 p-0 overflow-hidden border-transparent opacity-0 m-0' : 'w-full lg:w-[320px] p-0 opacity-100'}`}>
                     <div className="p-4 bg-slate-100 rounded-t-2xl border-b border-slate-200 flex items-center justify-between">
                       <h4 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-widest flex items-center gap-1.5">
                         STEP 2 主軸腳本文案
                       </h4>
                     </div>
                     <div className="p-4 bg-slate-500 text-white font-mono text-sm leading-relaxed overflow-y-auto custom-scrollbar whitespace-pre-wrap" style={{ height: 'calc(100vh - 250px)' }}>
                       {stepContents[2] || "尚無內容"}
                     </div>
                  </div>

                  {/* Right Column: 16 Grid images & Buttons */}
                  <div className="flex-1 w-full min-h-[600px] flex flex-col gap-4">
                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row items-center justify-end w-full mb-2 gap-3">
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button 
                          onClick={handleGenerateNotebookImages}
                          disabled={isGeneratingNotebook}
                          className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isGeneratingNotebook ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Palette className="w-4 h-4" />
                              開始生成 16 張分鏡
                            </>
                          )}
                        </button>

                        <button 
                          onClick={handleDownloadNotebookPython}
                          className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#0A2E5C] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          匯出剪映草稿
                        </button>
                        
                        <button 
                          onClick={async () => {
                            if (!notebookParsedGroups || notebookParsedGroups.length === 0) return;
                            addLog(`[NotebookLM] 開始批次下載 ${notebookParsedGroups.length} 張分鏡圖...`, 'info');
                            let downloaded = 0;
                            for (let i = 0; i < notebookParsedGroups.length; i++) {
                              const g = notebookParsedGroups[i];
                              if (groupImages[g.id]) {
                                handleDownloadImage(groupImages[g.id], `notebooklm-scene-${i+1}`);
                                downloaded++;
                                await new Promise(r => setTimeout(r, 400));
                              }
                            }
                            addLog(`[NotebookLM] 批次下載完畢！共下載 ${downloaded} 張圖片。`, 'success');
                          }}
                          className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          一鍵下載全部影像
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {notebookParsedGroups.length === 0 ? (
                        <div className="col-span-full h-64 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                            <Palette className="w-6 h-6 text-slate-300" />
                          </div>
                          <h4 className="text-lg font-bold text-slate-700">準備生成分鏡圖片</h4>
                          <p className="text-slate-500 text-xs max-w-sm">請確認主軸腳本文案已載入，再「開始生成 16 張分鏡」</p>
                        </div>
                      ) : (
                        notebookParsedGroups.map((g: any, i: number) => {
                          const isGenerating = generatingGroups[g.id];
                          const imageBase64 = groupImages[g.id];
                          
                          return (
                          <div key={g.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                            {/* Image Placeholder or Actual Image */}
                            <div className="relative aspect-video bg-slate-400 group">
                              {isGenerating ? (
                                <div className="absolute inset-0 flex items-center justify-center flex-col bg-slate-50/80 backdrop-blur-sm z-10">
                                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
                                  <span className="text-[10px] text-emerald-600 font-bold">Generating...</span>
                                </div>
                              ) : imageBase64 ? (
                                <img src={imageBase64} alt={`Scene ${i+1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs gap-2 bg-slate-100">
                                  <ImageIcon className="w-4 h-4" /> 尚未生成影像
                                </div>
                              )}
                              <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[10px] text-white font-mono font-bold">
                                {String(i+1).padStart(2, '0')}
                              </div>
                            </div>
                            
                            {/* Card Content matching Visual Center */}
                            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-[#10B981] border border-indigo-500/20 font-semibold">
                                    AI
                                  </span>
                                  <div className="flex gap-1.5">
                                    <button 
                                      onClick={() => handleDownloadImage(imageBase64, `scene_${i+1}`)}
                                      className="p-1 rounded bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#1E293B] transition-all"
                                      title="下載"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <h5 className="text-[11px] font-bold text-[#1E293B] truncate">{g.title}</h5>
                                <p className="text-[10px] text-[#64748B] font-mono mt-1 line-clamp-2" title={g.prompt}>{g.prompt}</p>
                              </div>
                              
                              <button
                                onClick={() => generateGroupImage(g)}
                                disabled={isGenerating}
                                className="w-full mt-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>單張重新生成</span>
                              </button>
                            </div>
                          </div>
                        )})
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: Gods Data Center */}
          {activeTab === 'gods_data' && (
            <div className="flex-1 p-6 overflow-y-auto bg-transparent custom-scrollbar">
              <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#1E293B] flex items-center gap-2.5">
                      <Star className="w-5 h-5 text-indigo-500" />
                      諸神文化解碼中心
                    </h3>
                    <p className="text-sm text-[#64748B] mt-1">
                      批次輸入神佛尊號，考證文獻、文化脈絡並動態生成水墨圖卡。
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                  <button 
                    onClick={async () => {
                      if (!godsCards || godsCards.length === 0) return;
                      addLog(`[諸神解碼] 開始批次下載 ${godsCards.length} 張圖文卡片...`, 'info');
                      let downloaded = 0;
                      for (let i = 0; i < godsCards.length; i++) {
                        const c = godsCards[i];
                        if (groupImages[c.id]) {
                          handleDownloadImage(groupImages[c.id], c.name);
                          downloaded++;
                          await new Promise(r => setTimeout(r, 400));
                        }
                      }
                      addLog(`[諸神解碼] 批次下載完畢！共下載 ${downloaded} 張圖片。`, 'success');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-[#1E293B] rounded-xl shadow-sm transition-all font-medium text-sm disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    一鍵下載
                  </button>
                  <button 
                    onClick={async () => {
                      if (!godsCards || godsCards.length === 0) return;
                      setIsSavingGods(true);
                      addLog(`[Notion] 準備寫入 ${godsCards.length} 筆神明資料...`, 'info');
                      try {
                        const res = await fetch('https://omni-script-pro.vercel.app/api/gods-notion', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ cards: godsCards.map(c => ({ ...c, imageUrl: groupImages[c.id] || "" })), databaseId: "3a483ac4203780c89a41d8f53601c864" })
                        });
                        const data = await res.json();
                        if (data.error) throw new Error(data.error);
                        addLog(`[Notion] 成功寫入資料庫！`, 'success');
                      } catch (e: any) {
                        addLog(`[Notion] 寫入失敗: ${e.message}`, 'error');
                      }
                      setIsSavingGods(false);
                    }}
                    disabled={isSavingGods || godsCards.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl shadow-lg transition-all"
                  >
                    <Database className="w-4 h-4" />
                    {isSavingGods ? '儲存中...' : '儲存至 Notion'}
                  </button>
                  </div>
                </div>

                {/* Input Area */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4">
                  <input
                    value={godsInput}
                    onChange={(e) => setGodsInput(e.target.value)}
                    placeholder="輸入神明尊號，支援多筆以逗號分隔 (例: 天上聖母, 關聖帝君)"
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                  <button
                    onClick={async () => {
                      if (!godsInput.trim()) return;
                      const names = godsInput.split(/[,，\s]+/).map(n => n.trim()).filter(n => n);
                      if (names.length === 0) return;

                      setIsGeneratingGods(true);
                                            addLog(`[諸神解碼] 開始批次考證 ${names.length} 尊神明...`, 'info');
                      try {
                        const activeApiKey = (geminiApiKey || (typeof window !== 'undefined' && window.__GEMINI_API_KEY__ ? window.__GEMINI_API_KEY__ : "")).trim();

                        
                        if (!isCanvasEnv && !activeApiKey.trim()) {
                            setShowApiKeyModal(true);
                            setIsGeneratingGods(false);
                            return;
                        }

                        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeApiKey}`;
                        let data = { results: [] };
                        
                        for (const name of names) {
                            addLog(`[諸神解碼] 正在考證: ${name}...`, 'info');
                            const prompt = `請以客觀的台灣民間信仰與文化人類學角度，考證神明「${name}」。絕不可使用迷信或降乩語氣。語氣需完全客觀、學術。請嚴格按照以下 JSON 格式回傳，不可有其他多餘文字：{ "name": "神明聖號", "organization": "組織，只能填入 佛、道、儒", "title": "10-15 字副標題", "desc": "35-50 字簡介", "poem": "一句符合主題詩詞", "tags": ["標籤1", "標籤2", "標籤3"], "imagePrompt": "生成圖像的Prompt：結合形象描述與Poem，產生一段水墨風格英文提示詞" }`;
                            const response = await fetch(apiUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                                    generationConfig: { temperature: 0.7 }
                                })
                            });
                            const resultRaw = await response.json();
                            if (!response.ok) throw new Error(resultRaw.error?.message || "API Error");
                            const text = resultRaw.candidates?.[0]?.content?.parts?.[0]?.text || "";
                            const jsonMatch = text.match(/\{[\s\S]*\}/);
                            if (jsonMatch) {
                                const parsed = JSON.parse(jsonMatch[0]);
                                data.results.push({
                                    id: `god-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                    ...parsed,
                                    imageUrl: ""
                                });
                                addLog(`[諸神解碼] ✅ ${name} 考證完成！`, 'success');
                            }
                        }
                        if (data.error) throw new Error(data.error);
                        setGodsCards(prev => [...prev, ...data.results]);
                        addLog(`[諸神解碼] 成功生成 ${data.results.length} 張圖文卡片！`, 'success');
                        setGodsInput('');
                        
                        // 自動儲存至 Notion
                        addLog(`[Notion] 準備自動寫入 ${data.results.length} 筆神明資料...`, 'info');
                        try {
                          const res = await fetch('https://omni-script-pro.vercel.app//api/gods-notion', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ cards: data.results, databaseId: "3a483ac4203780c89a41d8f53601c864" })
                          });
                          const notionData = await res.json();
                          if (notionData.error) throw new Error(notionData.error);
                          addLog(`[Notion] 自動寫入資料庫成功！`, 'success');
                        } catch (e: any) {
                          addLog(`[Notion] 自動寫入失敗: ${e.message}`, 'error');
                        }

                      } catch (e: any) {
                        addLog(`[諸神解碼] 生成失敗: ${e.message}`, 'error');
                      }
                      setIsGeneratingGods(false);
                    }}
                    disabled={isGeneratingGods}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow transition-all font-medium whitespace-nowrap disabled:opacity-50"
                  >
                    {isGeneratingGods ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    開始考證
                  </button>
                </div>

                {/* Cards Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {godsCards.map((card, i) => (
                    <div key={card.id || i} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden group hover:shadow-lg transition-all">
                      
                      {/* Image Preview / Generation */}
                      <div className="relative aspect-[3/4] bg-slate-100 flex items-center justify-center border-b border-slate-200">
                        {groupImages[card.id] ? (
                          <img src={groupImages[card.id]} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-6 text-slate-400">
                            {generatingGroups[card.id] ? (
                              <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                            ) : (
                              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            )}
                            <span className="text-xs font-medium">{generatingGroups[card.id] ? '正在繪製水墨影像...' : '尚未生成水墨影像'}</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-x-4 bottom-4 z-10 flex gap-2">
                           <button
                             onClick={() => generateGroupImage({
                               id: card.id,
                               prompt: "Traditional East Asian ink wash painting (水墨畫) of the deity. Majestic, divine aura, ethereal, expressive brushstrokes, xieyi style. Minimalist abstract background. NO TEXT, NO LETTERS, NO SIGNATURES, NO STAMPS. High quality masterpiece. " + card.imagePrompt,
                               mainTitle: card.name,
                               subTitle: card.title,
                               poetry: card.poem
                             })}
                             disabled={generatingGroups[card.id]}
                             className="flex-1 py-2 rounded-lg bg-indigo-500/90 hover:bg-indigo-600 text-white text-xs font-medium backdrop-blur-sm transition flex justify-center items-center gap-1.5 disabled:opacity-50"
                           >
                             <Sparkles className="w-3.5 h-3.5" />
                             {generatingGroups[card.id] ? '單張渲染中...' : '單張重新生成'}
                           </button>
                           <button
                             onClick={() => handleDownloadImage(groupImages[card.id], card.name)}
                             disabled={!groupImages[card.id]}
                             className="px-3 py-2 rounded-lg bg-white/90 hover:bg-white text-indigo-600 font-medium backdrop-blur-sm transition flex justify-center items-center shadow-sm disabled:opacity-50 border border-slate-200 ml-2"
                             title="下載圖片"
                           >
                             <Download className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                      </div>

                      {/* Info Area */}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded">
                            {card.organization}
                          </span>
                          <h4 className="font-bold text-slate-800 truncate">{card.name}</h4>
                        </div>
                        <p className="text-xs font-bold text-indigo-600 mb-2 truncate">{card.title}</p>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-3 line-clamp-3">
                          {card.desc}
                        </p>
                        
                        <div className="mt-auto">
                           <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 mb-2 relative">
                             <span className="absolute top-1 left-2 text-3xl font-serif text-amber-200 opacity-50">"</span>
                             <p className="text-xs font-serif text-amber-900 text-center tracking-widest relative z-10">
                               {card.poem}
                             </p>
                           </div>
                           
                           <div className="flex flex-wrap gap-1">
                             {card.tags?.map((t: string, tidx: number) => (
                               <span key={tidx} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded-sm">
                                 #{t}
                               </span>
                             ))}
                           </div>
                        </div>
                      </div>

                    </div>
                  ))}
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
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-600 font-bold  text-[14px]">
                  <Zap className="w-3 h-3 fill-amber-500/20" />
                  <span>{credits} 點</span>
                </div>
                {/* User Avatar */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#10B981] to-[#0A2E5C] flex items-center justify-center  text-[14px] font-extrabold text-white shadow-md cursor-pointer hover:scale-105 transition-all">
                  SH
                </div>
              </div>
            </div>

            {/* Active Engine Card */}
            <div className="border-transparent border border-slate-200 p-4 rounded-xl flex flex-col gap-2 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#10B981] to-emerald-300"></div>
              <div className="flex items-center gap-2.5 pl-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <span className=" text-[14px] text-[#64748B] font-bold uppercase tracking-widest">Active Engine</span>
              </div>
              <div className="text-xl font-black tracking-widest text-[#1E293B] pl-2 mt-1">
                PRO
              </div>
              <div className="grid grid-cols-2 gap-2  text-[14px] text-[#64748B] font-mono mt-3 border-transparent border-t border-slate-100 pt-3 pl-2">
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
            <div className="flex-1 bg-transparent p-4 font-mono text-[14px] overflow-y-auto space-y-3 custom-scrollbar text-slate-300">
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
                  onClick={() => {
                    setShowApiKeyModal(false);
                    if (geminiApiKey.trim()) {
                      if (typeof window !== 'undefined') {
                        (window as any).__GEMINI_API_KEY__ = geminiApiKey.trim();
                      }
                      if (pendingImageTask) {
                        pendingImageTask();
                        setPendingImageTask(null);
                      }
                    }
                  }}
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
            <img src={"https://synxrphphbfg1mpw.public.blob.vercel-storage.com/OmniScript%20logo.png"} alt="Logo" style={{ height: '60px', margin: '0 auto', display: 'block' }} />

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
