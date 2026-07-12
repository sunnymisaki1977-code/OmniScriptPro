// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Settings, 
  Play, Pause, FastForward, Sparkles, CheckCircle2, Circle, 
  Terminal, ServerCrash, Share2, UploadCloud, ChevronRight, ChevronLeft,
  Database, Video, Search, Music, Facebook, MousePointerClick,
  Sliders, Link, RefreshCw, Key, HelpCircle, HardDrive, 
  Eye, Check, ListTodo, Send, Volume2, VolumeX, Download, Zap, X, Copy,
  Users, Palette, ShieldAlert, BookOpen, Sun, ChevronDown, Award, Lock, ExternalLink, Trash2, Menu, Globe
} from 'lucide-react';


const IMAGE_ENGINES = [
  {
    id: 'gemini-2.5-flash',
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
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana',
    desc: 'Nano Banana 系列的先驅模型。雖然 Nano Banana 2 Lite 一直是可靠的工具，但我們強烈建議客戶改用這項模型，享受更優質的體驗、更快的生成速度，以及更低的 API 價格。'
  }
];

 // ============================================================================
// --- 結合 Vercel 邏輯與 Gemini Canva API 的全新生成函數 ---
async function callVercelApi(stepId, context, audienceTheme, userApiKey = "") {
    // 取得 API Key 的邏輯保持不變
    const apiKey = userApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "");
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    
    
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

    // 步驟 2：拿到 Prompt 後，在前端直接打 Gemini Canva 官方 API
    const geminiPayload: any = {
        contents: [{ parts: [{ text: finalPrompt }] }],
        generationConfig: {
            maxOutputTokens: 8192
        }
    };

    if (isSearchEnabled) {
        geminiPayload.tools = [{ googleSearch: {} }];
    } else if (responseSchema) {
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
    
    // 如果有使用 Schema，它回傳的會是帶有 stepId 作為 key 的 JSON
    if (!isSearchEnabled) {
        try {
            // 清理可能包含的 markdown json block
            cleanText = cleanText.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```$/i, "").trim();
            const parsedData = JSON.parse(cleanText);
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
export default function App() {
  const [audienceThemes, setAudienceThemes] = useState({});
  const [themeSteps, setThemeSteps] = useState({});
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [parsedVisualGroups, setParsedVisualGroups] = useState([]);
  const [isParsingVisuals, setIsParsingVisuals] = useState(false);

  useEffect(() => {
    fetch(`https://omni-script-pro.vercel.app/api/config`)
      .then(res => res.json())
      .then(data => {
        setAudienceThemes(data.AUDIENCE_THEMES);
        setThemeSteps(data.THEME_STEPS);
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
   
     // --- 新增：獨立 Gemini API Key 狀態與環境偵測 ---
   const [isCanvasEnv, setIsCanvasEnv] = useState(false);
   
   useEffect(() => {
     if (typeof window !== 'undefined' && !!(window as any).__GEMINI_API_KEY__) {
       setIsCanvasEnv(true);
     }
   }, []);
   const [geminiApiKey, setGeminiApiKey] = useState('');
   const [showApiKeyModal, setShowApiKeyModal] = useState(false);
   const [pendingImageTask, setPendingImageTask] = useState<Function | null>(null);

  const [visualStep, setVisualStep] = useState(6);
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
  const [imageEngine, setImageEngine] = useState('gemini-3.1-flash-lite-image');

  useEffect(() => {
    const content = stepContents[visualStep];
    if (!content || !isConfigLoaded) return;
    
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
  }, [stepContents, visualStep, isConfigLoaded]);

  const visualGroups = parsedVisualGroups;

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

  const handleCopyAndGo = (group: any, target: 'gemini' | 'chatgpt') => {
    const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
    const engineName = engineConfig.name;
    const { id: groupId, prompt, mainTitle, subTitle, poetry } = group;
    
    let aspectRatio = "16:9";
    const currentStep = STEPS.find((s: any) => s.id === visualStep);
    if (currentStep && currentStep.aspectRatio) {
      aspectRatio = currentStep.aspectRatio;
    } else if (visualStep === 10) {
      aspectRatio = "4:3";
    }
    
    const fullPrompt = `[${engineName}] Masterpiece, extremely detailed, highest quality, ultra-high definition, 8k resolution. Theme: ${mainTitle}. ${subTitle}. Context: ${poetry}. ${prompt} --ar ${aspectRatio}`;
    
    navigator.clipboard.writeText(fullPrompt).then(() => {
      addLog(`[Copy & Go] 已複製完整提示詞並前往 ${target === 'gemini' ? 'Gemini' : 'ChatGPT'}！`, 'success');
      if (target === 'gemini') {
        window.open('https://gemini.google.com/app', '_blank');
      } else {
        window.open('https://chatgpt.com/', '_blank');
      }
    }).catch(err => {
      console.error('Copy failed:', err);
      addLog(`[Copy & Go] 複製失敗，請檢查瀏覽器剪貼簿權限。`, 'error');
    });
  };

  const generateGroupImage = async (group) => {
     if (!isCanvasEnv && !geminiApiKey.trim()) {
      setPendingImageTask(() => () => generateGroupImage(group));
      setShowApiKeyModal(true);
      return;
    }
    const { id: groupId, prompt, mainTitle, subTitle, poetry } = group;
    if (!prompt) return;
    setGeneratingGroups(prev => ({ ...prev, [groupId]: true }));
    
    const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
    const engineName = engineConfig.name;
    addLog(`[${engineName}] 啟動 ${groupId} 繪製進程...`, 'info');
    
    try {
      const apiKey = geminiApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : ""); // Canvas 預覽環境會自動帶入
      
      let aspectRatio = "1:1";
      const currentStep = STEPS.find(s => s.id === visualStep);
      if (currentStep && currentStep.aspectRatio) {
        aspectRatio = currentStep.aspectRatio;
      } else if (visualStep === 10) {
        aspectRatio = "4:3";
      }
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mainTitle,
          subTitle,
          poetry,
          aspectRatio,
          apiKey
        })
      });

      
      const data = await response.json();
      if (!response.ok) throw new Error(`API Error: ${data.error || response.statusText}`);
      
      if (data.success && data.image) {
        const originalImage = data.image;
        const finalImage = await applyTextOverlayToImageBase64(originalImage, mainTitle, subTitle, poetry);
        
        setGroupImages(prev => ({ ...prev, [groupId]: finalImage }));
        addLog(`[${engineName}] ✨ ${groupId} 渲染完成！(使用模型: ${data.modelUsed})`, 'success');
        setCredits(prev => Math.max(0, prev - 5));
      } else {
        throw new Error(data.error || "未收到圖片資料");
      }
    } catch (err) {
      const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
      const engineName = engineConfig.name;
      addLog(`[${engineName}] 繪製失敗: ${err.message}`, 'error');
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
            const configRes = await fetch(`${API_BASE_URL}/api/config`, {
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
            outputText = await callVercelApi(i, context, audienceTheme, activeApiKey, isCanvasEnv);
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

    const handleLoadArchive = async (e) => {
    const pageId = e.target.value;
    if (!pageId) return;

    if (pageId === "open_current") {
      if (notionUrl) window.open(notionUrl, '_blank');
      setSelectedArchive(""); // Reset selection
      return;
    }

    setSelectedArchive(pageId);
    setIsLoadingArchive(true);
    addLog(`[Notion] 正在從雲端載入專案資料...`, 'info');

    try {
      // 向 Vercel 請求該 Notion 頁面的詳細內容
      const response = await fetch(`/api/notion/history?id=${pageId}`);
      const data = await response.json();

      if (data.stepsData) {
        // 成功抓取後，一鍵把內容填回編輯器！
        if (data.theme) setTheme(data.theme); 
        // 確保不會將 "undefined" 字串覆蓋掉使用者選好的受眾
        if (data.audienceTheme && data.audienceTheme !== "undefined" && data.audienceTheme !== "null") {
          setAudienceTheme(data.audienceTheme);
        }
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
  addLog(`[System] 開始封裝企劃資料，自動準備匯出...`, 'info');

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
    
    setNotionStatus('✅ 已成功歸檔');
    addLog(`[Notion] ✨ 企劃匯出成功！`, 'success');
    
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
    if (aiStatus === 'pro') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (aiStatus === 'flash') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
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
    <div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* --- STREAMING<CHUNK:Left Navigation Bar --- */}
       <aside className={`fixed inset-y-0 left-0 w-64 bg-[#070b16] border-r border-slate-900 flex flex-col justify-between z-50 shrink-0 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}`}>
        <div className="p-5">
          
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${curTheme.gradient} flex items-center justify-center shadow-lg transition-all duration-700`}>
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                OmniScript Pro
              </h1>
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
                      if (tab.id === 'creation') {
                        setActiveTab(tab.id);
                      }
                    }}
                    disabled={tab.id !== 'creation'}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left border relative ${
                      isActive 
                        ? `${curTheme.bgActive} ${curTheme.textActive} ${curTheme.borderActive}` 
                        : 'text-slate-500 border-transparent disabled:cursor-not-allowed'
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
                    <div className="mx-2 p-4 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl space-y-4 backdrop-blur-md">
                      <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        視覺裂變
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">影音縮圖</label>
                          <select className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none">
                            <option>長影音</option>
                            <option>短影音</option>
                            <option>社群FB/IG</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">輸出比例</label>
                          <select 
                            value={visualStep}
                            onChange={(e) => setVisualStep(Number(e.target.value))}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none mb-3"
                          >
                            <option value={6}>{STEPS.find(s => s.id === 6)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 6)?.name || '橫幅縮圖 (YouTube / FB)'}</option>
                            <option value={7}>{STEPS.find(s => s.id === 7)?.aspectRatio || '9:16'} - {STEPS.find(s => s.id === 7)?.name || '短片直式封面 (Shorts / Reels)'}</option>
                            <option value={8}>{STEPS.find(s => s.id === 8)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 8)?.name || '意象圖 / 海報'}</option>
                            <option value={10}>{STEPS.find(s => s.id === 10)?.aspectRatio || '1:1 / 4:3'} - {STEPS.find(s => s.id === 10)?.name || '社群推播 / 視覺素材'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">影像生成引擎</label>
                          <select 
                            value={imageEngine}
                            onChange={(e) => setImageEngine(e.target.value)}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none"
                          >
                            {IMAGE_ENGINES.map(engine => (
                              <option key={engine.id} value={engine.id}>{engine.name}</option>
                            ))}
                          </select>
                          <p className="text-[9px] text-slate-500/80 mt-1.5 leading-relaxed">
                            {IMAGE_ENGINES.find(e => e.id === imageEngine)?.desc}
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">畫風濾鏡</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {['霓虹電競', '寫實極簡', '3D 賽博', '手繪動漫'].map((style, idx) => (
                              <button 
                                key={style}
                                className={`px-2 py-1.5 rounded-lg text-[9px] font-bold border text-center ${idx === 0 ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'border-slate-800 text-slate-500'}`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
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
        <div className="p-4 border-t border-slate-900 space-y-3">


          {/* Light Mode Switcher */}
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-900/40 transition-all">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-400 text-[11px]">淺色模式</span>
            </div>
            <div className="w-8 h-4 rounded-full bg-slate-800 flex items-center p-0.5 justify-start">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
            </div>
          </button>
        </div>
      </aside >     

      {/* --- STREAMING_CHUNK:Center Main Workspace Area --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1d] relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-900 bg-[#0a0f1d]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 z-10 shrink-0 gap-4">
          <div className="flex items-center gap-3 flex-1 lg:flex-none lg:w-96">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors"
           
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Top Search Input Box */}
            <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="例如：日本寺廟抽籤攻略"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-[#111827]/60 border border-slate-800/80 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            </div>
          </div>

          {/* Top Action Buttons & Metrics */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
           

            {activeTab === 'creation' && (
              <>
                <button 
                  onClick={clearAllData}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清空企劃</span>
                </button>

                {/* 一鍵全自動模式 Header Button / 中斷生成 */}
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
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{completedSteps.length > 1 && completedSteps.length < STEPS.length ? '自動接續生成' : '一鍵全自動模式'}</span>
                  </button>
                )}
              </>
            )}

            {/* Quota Metric Button */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>{credits} 點額度</span>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-extrabold text-white shadow-lg border border-indigo-500/20 cursor-pointer hover:scale-105 transition-all">
              SH
            </div>
          </div>
        </header>

        {/* --- Central Main Content Panels --- */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          
          {/* CONTENT TABS */}
          {activeTab === 'creation' && (
            viewState === 'hub' ? (
              /* --- STREAMING_CHUNK:Rendering Central Creator Welcome Hub --- */
              <div className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0a0f1d] to-[#030712]">
                
                {/* Glowing Background Glows */}
                <div className={`absolute top-1/4 w-96 h-96 rounded-full bg-gradient-to-br ${curTheme.gradient} opacity-5 blur-[120px] pointer-events-none`} />

                <div className="w-full max-w-2xl bg-[#0f172a]/60 border border-slate-900/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative shadow-2xl space-y-6 my-auto shrink-0">
                  {/* Glowing Top Frame Accent Line */}
                  <div className={`absolute left-0 right-0 top-0 h-[2px] rounded-t-3xl bg-gradient-to-r ${curTheme.gradient}`} />
                  
                  {!isAuthenticated ? (
                    // --- 密碼輸入模式 (和輸入主題模式相同) ---
                    <>
                      <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                          系統已鎖定
                        </h2>
                        <p className="text-[11px] md:text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                          請輸入您的專屬受眾授權碼以進入 OmniScript Pro 核心系統。
                        </p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4 mt-8">
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
                          <input 
                            type="password"
                            placeholder="輸入授權碼"
                            value={passcode}
                            onChange={(e) => { setPasscode(e.target.value); setAuthError(''); }}
                            className="w-full relative bg-[#070b16] border border-slate-900 rounded-2xl px-6 py-4 text-sm font-semibold text-center text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner tracking-widest"
                            autoFocus
                          />
                        </div>
                        
                        {authError && <p className="text-red-400 text-[10px] text-center font-bold">{authError}</p>}
                        
                        <button 
                          type="submit"
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 active:scale-95 flex items-center justify-center gap-2"
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
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                          今天想創作什麼？
                        </h2>
                        <p className="text-[11px] md:text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
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
                                  ? 'border-slate-800 text-slate-400 hover:text-white hover:border-slate-500 cursor-pointer'
                                  : 'border-slate-900/50 text-slate-500 opacity-50 cursor-not-allowed'
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
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-1000"></div>
                      <input 
                        type="text"
                        placeholder="例如：日本京阪神五日遊攻略"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full relative bg-[#070b16] border border-slate-900 rounded-2xl px-6 py-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner"
                      />
                    </div>

                    {/* --- 新增：自訂背景資料區 --- */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-400 font-bold">自訂背景資料 / 參考文件 (選填)</label>
                        <label className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-[9px] cursor-pointer transition-colors border border-slate-700">
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
                          className={`w-full bg-[#070b16] border ${customContext.length >= 5000 ? 'border-red-500/50' : 'border-slate-900'} rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/30 h-28 resize-none shadow-inner custom-scrollbar pb-6`}
                        />
                        <div className={`absolute bottom-2 right-3 text-[9px] font-mono ${customContext.length >= 5000 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                          {customContext.length} / 5000
                        </div>
                      </div>
                    </div>



                    {/* --- 新增：模組化勾選清單 (Checkbox List) --- */}
                    <div className="space-y-2 pt-2 border-t border-slate-900/50">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-400 font-bold">📦 選擇要生成的素材矩陣 (可自由勾選)</label>
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
                                  ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 cursor-not-allowed opacity-80'
                                  : isSelected
                                  ? 'bg-indigo-500 text-white shadow-md hover:bg-indigo-600'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
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
                        className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-2 text-slate-200">
                          <Sliders className="w-4 h-4 text-slate-400" />
                          <span>分步編輯工作流</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">手動調校，逐步建構客製化矩陣腳本</span>
                      </button>
                    </div>
                  </div>

                  {/* Notion Load Project Component */}
                  <div className="hidden pt-4 border-t border-slate-900/60 flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <UploadCloud className="w-4.5 h-4.5" />
                      <span className="text-xs font-bold">從 Notion 載入已歸檔專案</span>
                    </div>
                    
                    {/* Simulated dropdown */}
                    <div className="w-full relative">
                      <select 
                        value={selectedArchive}
                        onChange={handleLoadArchive}
                        disabled={!isGlobalMaster}
                        className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-4 py-3 text-xs font-semibold text-slate-400 hover:text-slate-200 focus:outline-none appearance-none cursor-pointer text-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <option value="">-- {archiveList.length === 0 ? '載入清單中...' : '點擊選擇團隊專案'} --</option>
                        
                        {/* 這裡會自動把 Notion 裡面的專案名稱跟日期列出來！ */}
                        {archiveList.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            📄 {item.title} ({item.createdTime})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* 清空按鈕 */}
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={clearAllData}
                      className="text-[10px] text-red-500/70 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      清空畫布與舊企劃資料
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
                  <div className="relative flex flex-col border-r border-slate-900/60 bg-[#070b16]/30 transition-all duration-300 h-full">
                    {isGlobalMaster && (
                      <button
                        onClick={() => setIsStepFlowHidden(!isStepFlowHidden)}
                        className="absolute top-4 -right-3 z-20 flex items-center justify-center w-6 h-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border-2 border-[#0a0f1d] shadow-lg transition-transform hover:scale-110"
                        title={isStepFlowHidden ? "展開 Step Flow" : "隱藏 Step Flow"}
                      >
                        {isStepFlowHidden ? <ChevronRight className="w-3 h-3 ml-0.5" /> : <ChevronLeft className="w-3 h-3 pr-0.5" />}
                      </button>
                    )}

                    <div className={`flex-1 overflow-y-auto space-y-1.5 custom-scrollbar transition-all duration-300 ${isStepFlowHidden ? 'w-0 p-0 overflow-hidden opacity-0' : 'w-64 p-4 opacity-100'}`}>
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{STEPS.length}-Step Flow</span>
                        <span className={`${curTheme.accentText} text-[10px] font-mono`}>{completedSteps.length}/{STEPS.length} 已完成</span>
                      </div>
                  {STEPS.map((step: any) => {
                    const isActive = activeStep === step.id;
                    const isDone = completedSteps.includes(step.id);
                    const Icon = iconMap[step.icon] || FileText; // 確保有圖示，退防 fallback
                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border group ${
                          isActive 
                            ? `${curTheme.bgActive} ${curTheme.borderActive} ${curTheme.textActive} shadow-md` 
                            : 'bg-transparent hover:bg-slate-900/40 text-slate-400 border-transparent'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? `${curTheme.bgActive} ${curTheme.textActive}` : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isDone && (
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-md">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest">Step {step.id}</div>
                          <div className="text-xs font-bold truncate">{step.name}</div>
                        </div>
                      </button>
                    );
                  })}
                    </div>
                  </div>
              </div>

              {/* Markdown editor screen */}
                <div className="flex-1 bg-[#090d19]/40 p-6 overflow-y-auto relative flex flex-col custom-scrollbar pb-24">
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
                            className="text-xs text-slate-500 hover:text-indigo-400 flex items-center gap-1 font-bold transition-all"
                          >
                            ← 返回創作大廳
                          </button>
                          <span className="text-slate-600">•</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${curTheme.bgBadge}`}>
                            STEP {activeStep} • {STEPS[activeStep-1]?.category || 'Loading'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {STEPS[activeStep-1]?.name || '載入中...'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{STEPS[activeStep-1]?.desc || '正在同步伺服器設定檔...'}</p>
                      </div>

                      <div className="flex items-center gap-3">
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



                    {/* Markdown text editor card */}
                    <div className="relative flex-1 flex flex-col">
                      <div className="flex-1 bg-[#0f172a]/50 border border-slate-900 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                        <div className="px-4 py-2.5 bg-[#0a0f1d] border-b border-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                          <span className="text-[10px] font-mono text-slate-500 ml-2">Markdown Editor</span>
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
                              className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/30 transition-all border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer shadow-sm"
                              title="下載此步驟內容為 Markdown 檔案"
                            >
                              <Download className="w-3 h-3" />
                              下載 .md
                            </button>
                          )}
                          <div className="text-[10px] text-slate-500 font-medium">
                            Auto-saved locally
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 relative min-h-[500px]">
                        {/* AI 撰寫時，顯示 MP4 讀取動畫 */}
                        {isGenerating ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d19]/90 z-10 backdrop-blur-md">
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
                                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/20 shadow-lg pointer-events-auto"
                              >
                                {isVideoMuted ? <VolumeX className="w-5 h-5 text-slate-300" /> : <Volume2 className="w-5 h-5 text-indigo-400" />}
                              </button>
                            </div>
                            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse tracking-wider">
                              AI 核心引擎高速運算中...
                            </h3>
                            <p className="text-slate-400 mt-3 text-sm flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              正在抓取資料，請稍候
                            </p>
                          </div>
                        ) : (
                          /* 生成完畢後，顯示原本的文字編輯器 */
                          <textarea 
                            value={stepContents[activeStep]}
                            onChange={(e) => setStepContents(prev => ({ ...prev, [activeStep]: e.target.value }))}
                            className="absolute inset-0 p-6 font-mono text-sm text-slate-300 focus:outline-none overflow-y-auto whitespace-pre-wrap leading-relaxed select-text cursor-text bg-transparent resize-none border-none w-full h-full custom-scrollbar"
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

                <div className="flex flex-col lg:flex-row gap-6 items-start relative">
                  
                  {isGlobalMaster && (
                    <div className={`hidden lg:flex absolute top-4 z-20 transition-all duration-300 ${isVisualSidebarHidden ? '-left-3' : 'left-[305px]'}`}>
                      <button
                        onClick={() => setIsVisualSidebarHidden(!isVisualSidebarHidden)}
                        className="flex items-center justify-center w-6 h-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border-2 border-[#0a0f1d] shadow-lg transition-transform hover:scale-110"
                        title={isVisualSidebarHidden ? "展開 Prompt 控制台" : "隱藏 Prompt 控制台"}
                      >
                        {isVisualSidebarHidden ? <ChevronRight className="w-3 h-3 ml-0.5" /> : <ChevronLeft className="w-3 h-3 pr-0.5" />}
                      </button>
                    </div>
                  )}

                  {/* Left Controls column */}
                  <div className={`transition-all duration-300 ease-in-out shrink-0 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl backdrop-blur-md flex flex-col relative ${isVisualSidebarHidden ? 'w-0 h-0 p-0 overflow-hidden border-transparent opacity-0 m-0' : 'w-full lg:w-[320px] p-5 space-y-4 opacity-100'}`}>

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
          className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm border border-white/20 shadow-lg pointer-events-auto"
        >
          {isVideoMuted ? <VolumeX className="w-5 h-5 text-slate-300" /> : <Volume2 className="w-5 h-5 text-indigo-400" />}
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
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isGeneratingImage ? '正在批次渲染中...' : (!geminiApiKey.trim() ? '輸入Gemini API 繪製圖像' : '✨ AI 批次繪製全部影像')}</span>
                    </button>
                  </div>

                  {/* Right Masonry Grid of images */}
                  <div className="flex-1 w-full space-y-4 min-w-0">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">已渲染媒體資產庫 ({visualGroups.length})</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visualGroups.map((group: any) => (
                        <div key={group.id} className="group bg-[#0f172a]/40 border border-slate-900 rounded-2xl overflow-hidden relative shadow-lg flex flex-col">
                          {/* Image Area */}
                          <div className="w-full h-40 bg-[#070b16] relative flex items-center justify-center overflow-hidden">
                            {groupImages[group.id] ? (
                               <img src={groupImages[group.id]} alt={group.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                            ) : generatingGroups[group.id] ? (
                               <div className="flex flex-col items-center gap-2">
                                 <RefreshCw className="w-5 h-5 animate-spin text-purple-500" />
                                 <span className="text-[10px] text-purple-400">正在透過 {IMAGE_ENGINES.find(e => e.id === imageEngine)?.name || 'AI'} 生成...</span>
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
                                  {IMAGE_ENGINES.find(e => e.id === imageEngine)?.name || 'AI'}
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
                              onClick={() => generateGroupImage(group)}
                              disabled={generatingGroups[group.id]}
                              className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{generatingGroups[group.id] ? '正在渲染...' : (!geminiApiKey.trim() ? '輸入Gemini API 繪製圖像' : '✨ AI 繪製影像 (-5 點)')}</span>
                            </button>
                            
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleCopyAndGo(group, 'gemini')}
                                className="flex-1 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-800 text-indigo-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm border border-indigo-700/50"
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          value={stepContents[9]} 
                          onChange={(e) => setStepContents(prev => ({ ...prev, 9: e.target.value }))}
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
                        { title: 'The travelpreneur Spirit', style: 'Acoustic Bright', dur: '02:30' }
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
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
            onClick={() => {
              setActiveTab('creation');
              setViewState('hub');
            }}
            className="py-1.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-900/50 hover:bg-slate-800 hover:text-white border border-slate-800 rounded transition-colors"
          >
            返回創作大廳
          </button>
        </div>



      </aside>
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700/50 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-indigo-400" />
                需要 Gemini API Key
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              您目前處於獨立運行模式，必須輸入 Gemini API Key 才能執行。
              <br />
              <span className="text-indigo-400 font-medium mt-1 inline-block">✨ 系統支援防限流機制：您可以一次貼上多把金鑰，並使用半形逗號 <code className="bg-indigo-500/20 px-1 rounded text-indigo-300">,</code> 分隔。</span>
            </p>

            <div className="mb-6 bg-slate-900/50 rounded-2xl p-4 border border-slate-700">
              <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-indigo-400" />
                本次將生成的素材矩陣：
              </h4>
              <div className="flex flex-wrap gap-2">
                {STEPS.filter(s => selectedSteps.includes(s.id) || s.id === 1 || s.id === 2).map(step => (
                  <span key={step.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] border ${step.id === 1 || step.id === 2 ? 'bg-indigo-900/50 text-indigo-300 border-indigo-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                    <Check className="w-3 h-3" />
                    {step.name}
                    {(step.id === 1 || step.id === 2) && <span className="opacity-60">(必需)</span>}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="輸入 API Key (例如：AIzaSy..., AIzaSy..., AIzaSy...)"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-[#070b16] border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    if (geminiApiKey.trim()) {
                      if (activeTab === 'creation') {
                        handleStartAuto();
                      } else if (activeTab === 'visual' && pendingImageTask) {
                        pendingImageTask();
                        setPendingImageTask(null);
                      }
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {activeTab === 'creation' ? '確認並開始執行' : (pendingImageTask ? '確認並開始生成' : '確認並儲存金鑰')}
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  前往申請 Gemini API Key
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
