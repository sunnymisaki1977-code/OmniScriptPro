// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, FileText, Image as ImageIcon, Settings, 
  Play, Pause, FastForward, Sparkles, CheckCircle2, Circle, 
  Terminal, ServerCrash, Share2, UploadCloud, ChevronRight,
  Database, Video, Search, Music, Facebook, MousePointerClick,
  Sliders, Link, RefreshCw, Key, HelpCircle, HardDrive, 
  Eye, Check, ListTodo, Send, Volume2, Download, Zap, X,
  Users, Palette, ShieldAlert, BookOpen, Sun, ChevronDown, Award, Lock, ExternalLink, Trash2
} from 'lucide-react';

// ============================================================================
// --- ?��??�鑰對�?�?(5 ?��??�群 + 1 ?�管?�員) ---
// ============================================================================
const ACCESS_CODES: Record<string, string> = {
  'TECH2026': 'heritage',   // 民�?信仰?��??�傳??
  'GLAM2026': 'beauty',        // 美�?保�??��?己�?�?
  'INDIE2026': 'travelpreneur',// ?��??�活?��??�漫??
  'RUBY2026': 'food',          // 美�??��??�風?�探�?
  'PET2026': 'pet',            // 寵物?�護?�幸福陪�?
  'SKY2026': 'pet',            // ?�容?�碼
  'MASTER': 'heritage'      // 管�???
};

const IMAGE_ENGINES = [
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 Lite',
    desc: '?�是?�度?�快、�??��?低�? Gemini ?��?模�?，�??�速度?��?模而設計�??�用?�速度?��??�是主�??��??�制?��?況。�??��?多個�??�輸?�內容�?多輪???編輯??
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Nano Banana 2',
    desc: '?�途�?�???�模?��??�用?��??�工作。可?�顧?�度?��??�進�? 4K ?��??�術、�??�知識�??��??��?字�?譯�??�。�??��??��?張�??��??��?並確保�??�性�?
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Nano Banana Pro',
    desc: '?�?��??��?複�??��?覺�?工�?，�?供�?高�?度�?世�??��??�進�??�地?�、�?確�??��?一?�性�?以�?精確?�創?�控?��?
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana',
    desc: 'Nano Banana 系�??��?驅模?�。�???Nano Banana 2 Lite 一?�是?��??�工?��?但�??�強?�建議客?�改?�這�?模�?，享?�更?�質?��?驗、更快�??��??�度，以?�更低�? API ?�格??
  }
];

// ============================================================================
// --- 結�? Vercel ?�輯??Gemini Canva API ?�全?��??�函??---
async function callVercelApi(stepId: any, context: any, audienceTheme: string, userApiKey: string = "") {
    // 步�? 1：�? Vercel 請�??�該步�?專屬??Prompt 字串??
    const VERCEL_API_URL = '/api/gemini';
    const promptResponse = await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, context, audienceTheme })
    });
    if (!promptResponse.ok) {
        throw new Error(`Vercel ?�輯引�??�誤: ${promptResponse.status}`);
    }
    const { prompt } = await promptResponse.json();
    // 步�? 2：拿??Prompt 後�??��?端直?��? Gemini Canva 官方 API
    const apiKey = userApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "");
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const aiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ googleSearch: {} }]
        })
    });
    if (!aiResponse.ok) {
        throw new Error(`Google API ?�誤: ${aiResponse.status}`);
    }
    
    const data = await aiResponse.json();
    return data.candidates[0].content.parts[0].text;
}

// ============================================================================
// 2. ?�身??STEPS (已移??Prompt，交??Vercel 後端?��?)
// ============================================================================
// ?��?：MP4 輪播影�?清單 (?�可以在此陣?��??��??�影?�網?�)
const LOADING_VIDEOS_LIST = [
  "https://res.cloudinary.com/dhvzfeo7p/video/upload/q_auto/f_auto/v1780920395/_%E5%9C%96%E7%94%9F%E5%8B%95%E7%95%AB%E8%A6%8F%E5%8A%83_Animation_Planning__o5hw6k.mp4",
  "https://res.cloudinary.com/dhvzfeo7p/video/upload/v1780920477/_%E5%9C%96%E7%94%9F%E5%8B%95%E7%95%AB%E8%A6%8F%E5%8A%83_Animation_Planning__1_umfge3.mp4" // 請替?��??��?第�??�影?�網?�
];

const getInitialStepContent = (stepId, themeText, previousContents = {}) => {
  if (!stepId) return "請選?��??�步驟進�?檢�???;
  
  return `?��?待�? Vercel 伺�??�獲?��???..?�\n\n點�??��??�全?��?模�??��??�步?��??��??�」�??�伺?�器?�送�?求。`;
};

// ============================================================================
// 3. React ?�件主�??��???
// ============================================================================
export default function App() {
  const [audienceThemes, setAudienceThemes] = useState({});
  const [themeSteps, setThemeSteps] = useState({});
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [parsedVisualGroups, setParsedVisualGroups] = useState([]);
  const [isParsingVisuals, setIsParsingVisuals] = useState(false);

  useEffect(() => {
    fetch('/api/config')
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

  // --- ?�?�管?��??��?�?---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // ?��?：控?�是?�顯示�?碼輸?��?
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [activeTab, setActiveTab] = useState('creation'); 

  // ====== ?��??�?�管??(?��? SSR ?�護) ======
  const [isMounted, setIsMounted] = useState(false);
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

  // ?��? Hydration Mismatch，�??�件?��?後�?�?localStorage 讀?��???
  useEffect(() => {
    setIsMounted(true);
    const savedAudienceTheme = localStorage.getItem('os_pro_audienceTheme');
    if (savedAudienceTheme) setAudienceTheme(savedAudienceTheme);
  }, []);

  const [loadingVideoIdx, setLoadingVideoIndex] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
   
   // --- ?��?：獨�?Gemini API Key ?�?��??��??�測 ---
   const isCanvasEnv = typeof window !== 'undefined' && !!(window as any).__GEMINI_API_KEY__;
   const [geminiApiKey, setGeminiApiKey] = useState('');
   const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const [visualStep, setVisualStep] = useState(6);
  const iconMap: any = { Database, FileText, Search, Video, ImageIcon, Music, Facebook };

  const curTheme = audienceThemes[audienceTheme] || {};
  const STEPS = themeSteps[audienceTheme] || themeSteps.heritage || [];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('os_pro_audienceTheme', audienceTheme);
    }
  }, [audienceTheme]);

 // ?�� ?��??��??��??��??�制 Notion 下�??�單 ?��
  const [archiveList, setArchiveList] = useState([]); 
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");
  // ?�� ?��??�個函?��???Vercel ??Notion 清單 ?��
  const fetchArchives = async () => {
    try {
      const response = await fetch('/api/notion/history');
      const data = await response.json();
      if (data.history) {
        setArchiveList(data.history);
      }
    } catch (err) {
      console.error("?��?載入 Notion 專�?清單", err);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const [logs, setLogs] = useState([
    { time: "23:22:36", text: "[System] OmniScript Pro OS ?��??��??��?, type: "info" },
    { time: "23:22:40", text: "[System] 系統就�??�主美學?�置：全?�影?�創作�?(Cinematic Pink)", type: "default" }
  ]);
  
  const [aiStatus, setAiStatus] = useState('pro'); 
  const [credits, setCredits] = useState(125);
  const [isNotionExporting, setIsNotionExporting] = useState(false);
  const [notionStatus, setNotionStatus] = useState('尚未歸�?');
  const [notionUrl, setNotionUrl] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState(35);
  const [musicGenre, setMusicGenre] = useState('Synthwave');
  const [lyricsText, setLyricsText] = useState('?��??��??��?深�?... �?��?�螢幕�?跳�?，這是一?�人?�戰??..');
  const [midjourneyPrompt, setMidjourneyPrompt] = useState('A futuristic 3D render of a content creator workspace in 2026, holographic displays, neon glowing colors --ar 16:9');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [generatedImages, setGeneratedImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: '第�?組中?�Prompt' },
    { id: 2, url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: '第�?組中?�Prompt' },
    { id: 3, url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: '第�?組中?�Prompt' }
  ]);

  const [groupImages, setGroupImages] = useState({});
  const [generatingGroups, setGeneratingGroups] = useState({});
  const [imageEngine, setImageEngine] = useState('gemini-3.1-flash-lite-image');

  useEffect(() => {
    const content = stepContents[visualStep];
    if (!content || !isConfigLoaded) return;
    
    setIsParsingVisuals(true);
    fetch('/api/parse-visuals', {
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
        
        ctx.drawImage(img, 0, 0);
        
        const mainFontSize = Math.floor(width * 0.065);
        const subFontSize = Math.floor(width * 0.028);
        const poetryFontSize = Math.floor(width * 0.04);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // --- ?��?多樣?�風?��?�?(??AI ?��??�樣) ---
        const palettes = [
          { main: 'rgba(255, 251, 240, 1)', mainShadow: 'rgba(20, 10, 0, 0.7)', sub: 'rgba(240, 200, 80, 1)', subShadow: 'rgba(0, 0, 0, 0.58)' },
          { main: 'rgba(255, 223, 130, 1)', mainShadow: 'rgba(0, 0, 0, 0.8)', sub: 'rgba(255, 255, 255, 1)', subShadow: 'rgba(0, 0, 0, 0.7)' },
          { main: 'rgba(240, 245, 255, 1)', mainShadow: 'rgba(5, 15, 40, 0.8)', sub: 'rgba(150, 220, 255, 1)', subShadow: 'rgba(0, 5, 20, 0.7)' },
          { main: 'rgba(255, 200, 100, 1)', mainShadow: 'rgba(20, 10, 5, 0.8)', sub: 'rgba(255, 150, 80, 1)', subShadow: 'rgba(20, 5, 0, 0.7)' },
          { main: 'rgba(255, 240, 245, 1)', mainShadow: 'rgba(30, 10, 40, 0.8)', sub: 'rgba(230, 180, 255, 1)', subShadow: 'rgba(20, 0, 30, 0.7)' }
        ];
        const style = palettes[Math.floor(Math.random() * palettes.length)];
        
        // ?��??��?字優??(?�入 Google Fonts 行書/毛�?/小�?�?宋�? ?��??�樣)
        const fontFamilies = [
          '"Ma Shan Zheng", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // 馬�??��?筆楷??
          '"Zhi Mang Xing", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // 志莽行書
          '"ZCOOL XiaoWei", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // 站酷小�?�?
          '"Noto Serif TC", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif'  // ?��?宋�?
        ];
        const randomFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
        const fontStr = (size) => `bold ${size}px ${randomFontFamily}`;
        
        if (visualStep === 7 && mainTitle) {
          // Step 7 主�??��? (?��?線右??25%)
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
          // Step 8 詩�??��? (?��?線右??25%，移?��?�?
          const startX = width * 0.75;
          const startY = height * 0.15;
          ctx.font = fontStr(poetryFontSize);
          const cleanText = poetry.replace(/[，。�?？�??�\s]/g, "");
          const lines = [];
          // 七�??�句: �?7 字�?�?
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
            xOffset -= poetryFontSize * 1.3; // 往左�?�?
          });
        } else {
          // 一?�橫�?(主�?下移??25%)
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
    const isMaster = passcode.trim().toUpperCase() === 'MASTER';
    if (!isCanvasEnv && !isMaster && !geminiApiKey.trim()) {
      setShowApiKeyModal(true);
      return;
    }
    const { id: groupId, prompt, mainTitle, subTitle, poetry } = group;
    if (!prompt) return;
    setGeneratingGroups(prev => ({ ...prev, [groupId]: true }));
    
    const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
    const engineName = engineConfig.name;
    addLog(`[${engineName}] ?��? ${groupId} 繪製?��?...`, 'info');
    
    try {
      const apiKey = geminiApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : ""); // Canvas ?�覽?��??�自?�帶??
      
      let aspectRatio = "1:1";
      const currentStep = STEPS.find(s => s.id === visualStep);
      if (currentStep && currentStep.aspectRatio) {
        aspectRatio = currentStep.aspectRatio;
      } else if (visualStep === 10) {
        aspectRatio = "4:3";
      }
      
      let base64 = "";

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageEngine}:predict?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1, aspectRatio: aspectRatio }
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(`API Error: ${data.error?.message || response.status}`);
      if (data.predictions && data.predictions[0]) {
        base64 = data.predictions[0].bytesBase64Encoded;
      } else {
        throw new Error("?�收?��??��???);
      }
      
      if (base64) {
        const originalImage = `data:image/png;base64,${base64}`;
        const finalImage = await applyTextOverlayToImageBase64(originalImage, mainTitle, subTitle, poetry);
        
        setGroupImages(prev => ({ ...prev, [groupId]: finalImage }));
        addLog(`[${engineName}] ??${groupId} 渲�?完�?！`, 'success');
        setCredits(prev => Math.max(0, prev - 5));
      }
    } catch (err) {
      const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
      const engineName = engineConfig.name;
      addLog(`[${engineName}] 繪製失�?: ${err.message}`, 'error');
    } finally {
      setGeneratingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleDownloadImage = (url, filename) => {
    if (!url) {
      addLog(`[System] 尚未?��?影�?，無法�?載`, 'error');
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
    addLog(selectedTheme.themeLogMessage, 'info');  
  };

  // ============================================================================
  // 4. ?�寫?�自?��??��???(??Vercel API)
  // ============================================================================
  const runAutoGeneration = async (startTheme) => {
      
    setIsGenerating(true);
        setMode('auto');
    setViewState('workspace');
    
    let currentContextContents = { ...stepContents }; 
    let startStep = 1;

    // --- ?��?：偵測主題�??�並?��??�示清空 ---
    const savedLastTheme = localStorage.getItem('os_pro_lastGeneratedTheme') || '';
    const isCanvasEmpty = currentContextContents[1] === getInitialStepContent(1, "");
    if (startTheme !== savedLastTheme && !isCanvasEmpty) {
      const wantsNew = window.confirm(`?�輸?��??�新主�?：�?{startTheme}?�\n請�??�否要�?空畫布�??��?企�?，�??��?始建立�?\n(?�選?��?消�?將�?試智?�接續未完�??�步�?`);
      if (wantsNew) {
        currentContextContents = {
          1: getInitialStepContent(1, ""), 2: getInitialStepContent(2, ""), 3: getInitialStepContent(3, ""),
          4: getInitialStepContent(4, ""), 5: getInitialStepContent(5, ""), 6: getInitialStepContent(6, ""),
          7: getInitialStepContent(7, ""), 8: getInitialStepContent(8, ""), 9: getInitialStepContent(9, ""),
          10: getInitialStepContent(10, "")
        };
        setCompletedSteps([1]);
        setCustomContext('');
      }
    }
    localStorage.setItem('os_pro_lastGeneratedTheme', startTheme);

    const isStepEmpty = (stepId: number) => {
      const content = currentContextContents[stepId];
      return !content || content.trim() === '' || content === getInitialStepContent(stepId, "");
    };

    // 如�?使用?��??��??�景資�?�?Step 1 ?�空（�??�是?�設佔�??��?）�?就�?它當�?Step 1
    if (customContext.trim() && isStepEmpty(1)) {
      currentContextContents[1] = customContext;
      setStepContents(prev => ({ ...prev, 1: customContext }));
      addLog(`[System] ?�測?�您已�?供「自訂�??��??�」�?系統已自?��??��??�為 Step 1 ?��??�獻，為?��?下第一?�段?�查?��??��?`, 'success');
    }

    // ?�能?��??�輯：�??�第一?��??�內容�?步�?
    for (let i = 1; i <= STEPS.length; i++) {
      if (isStepEmpty(i)) {
        startStep = i;
        break;
      }
    }

    if (startStep > STEPS.length) {
      addLog(`[System] ${STEPS.length} ?�步驟�?已�??�內容�??��?完�?！`, 'success');
      setIsGenerating(false);
      return;
    }

    // ==========================================
    // Stage 1: 專注事實?�核 (Step 1)
    // ==========================================
    if (startStep === 1) {
      addLog(`[Process] Stage 1：正?��?注�???Step 1: ${STEPS[0].name}...`);
      setActiveStep(1);
      
      try {
        // ?�用後端 /api/generate-all 來�? Step 1，享?�自?��?試�???503 機制
        const response = await fetch('/api/generate-all', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
          },
          body: JSON.stringify({
            theme: startTheme,
            startFromStep: 1,
            endStep: 1,
            audienceTheme: audienceTheme
          })
        });

        if (!response.ok) {
          throw new Error(`伺�??��??�錯�? ${response.status}`);
        }

        const responseData = await response.json();
        const resultText = responseData.data[1] || "";
        
        currentContextContents[1] = resultText;
        setStepContents(prev => ({ ...prev, 1: resultText }));
        setCompletedSteps(prev => [...new Set([...prev, 1])]);
        
        addLog(`[System] 第�??�段?��??�究已�??��??��?系統?��??��??��? Stage 2 ?�次?��?...`, 'info');
        startStep = 2; // ?��??��??�入第�??�段
      } catch (error) {
        addLog(`[Error] Step 1 ?��?失�?: ${error.message}，中止全?��?流�??�`, 'error');
        setIsGenerating(false);
        return;
      }
    }

    // ==========================================
    // Stage 2: 依�??��??��?步�? (Step 2 ~ 10 一??��跑�?)
    // ==========================================
    addLog(`[Process] Stage 2：正?�呼?�雲端批次�??��?準�?一??��?��? Step ${startStep} ~ ${STEPS.length}...`, 'info');
    
    // 設�??�實?��??��??��??��??�緩等�?後端 30~45 秒�??�慮?��??��?誠實?��?系統?�??
    const progressMessages = [
      { msg: `[System] ?�端引�?�?��?��?超大?�本?�絡?��??��??��???.. (此批次�??�通常?��?30~45 �?` },
      { msg: `[System] �?��?�步?��??�本?��??��?覺�?令�?社群貼�?，這是一?��?算�?任�?，�?稍�?..` },
      { msg: `[System] 深度?��??��??��?中�?系統�?��確�???${STEPS.length - 1} ?�步驟�??�輯完�?對�?不�???..` },
      { msg: `[System] ?�入?�後�?裝�?段�??��??�您?�出完整?��??�矩???` }
    ];
    let msgIndex = 0;
    const progressInterval = setInterval(() => {
      if (msgIndex < progressMessages.length) {
        addLog(progressMessages[msgIndex].msg, 'info');
        msgIndex++;
      }
    }, 8000); // �?8 秒�??��?次系統�???

    try {
      const response = await fetch('/api/generate-all', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {})
        },
        body: JSON.stringify({
          theme: startTheme,
          customDocText: currentContextContents[1] || "",
          startFromStep: startStep,
          endStep: STEPS.length,
          audienceTheme: audienceTheme,
          existingData: currentContextContents
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `伺�??��??�錯�? ${response.status}`);
      }

      const responseData = await response.json();
      const generatedData = responseData.data;

      const newCompleted = [];
      const updatedContents = { ...currentContextContents };
      
      for (let i = startStep; i <= STEPS.length; i++) {
        if (generatedData[i]) {
          updatedContents[i] = generatedData[i];
          newCompleted.push(i);
          addLog(`[AI] ??Step ${i} ?�容從批次�??��??��??��?`, 'success');
        }
      }

      setStepContents(updatedContents);
      setCompletedSteps(prev => [...new Set([...prev, ...newCompleted])]);

      addLog(`[System] ??${STEPS.length}-Step ?�自?��??�產?��??��??��??�陣?�容已�?妥。`, 'success');
      setCredits(prevCredits => Math.max(0, prevCredits - 15));
      
      // ?��??�出??Notion
      await startNotionExport(updatedContents, startTheme);

    } catch (error) {
      addLog(`[Error] ?�次?��?失�?: ${error.message}，�?確�? API Key 額度?�網路�???�`, 'error');
    } finally {
      clearInterval(progressInterval);
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
    addLog(`[Notion] �?��從雲端�??��?案�???..`, 'info');

    try {
      // ??Vercel 請�?�?Notion ?�面?�詳細內�?
      const response = await fetch(`/api/notion/history?id=${pageId}`);
      const data = await response.json();

      if (data.stepsData) {
        // ?��??��?後�?一?��??�容填�?編輯?��?
        if (data.theme) setTheme(data.theme); 
        // 確�?不�?�?"undefined" 字串覆�??�使?�者選好�??�眾
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
        addLog(`[Notion] ??專�?載入?��?！`, 'success');
        setNotionStatus('??已�??�歸�?);
        setNotionUrl(`https://www.notion.so/${pageId.replace(/-/g, '')}`);
        setViewState('workspace');
      }
    } catch (error) {
      addLog(`[Error] 載入失�?: ${error.message}`, 'error');
    } finally {
      setIsLoadingArchive(false);
      setSelectedArchive("");
    }
  };

  const handleStartAuto = () => {
    const isMaster = passcode.trim().toUpperCase() === 'MASTER';
    if (!isCanvasEnv && !isMaster && !geminiApiKey.trim()) {
      setShowApiKeyModal(true);
      return;
    }
    if (customContext.length > 5000) {
      alert(`字數總�? (${customContext.length} �? 超�? 5000 字�??��?請刪減內容�??�執行�?`);
      return;
    }
    if (!theme.trim() && !customContext.trim()) {
      alert("請輸?�「�??�主題」�??��??�自訂�??��??�」�?系統?�能?�您?��?企�?�?);
      return;
    }
    const finalTheme = theme.trim() || '?��?企�? (?�命??';
    addLog(`[System] ?? ?��? ${STEPS.length}-Step ?�端引�?！目標�??��???{finalTheme}?�`, 'info');
    runAutoGeneration(finalTheme);
  };

  const startManualWorkspace = () => {
    if (customContext.length > 5000) {
      alert(`字數總�? (${customContext.length} �? 超�? 5000 字�??��?請刪減內容�??�執行�?`);
      return;
    }
    if (!theme.trim() && !customContext.trim()) {
      alert("請輸?�「�??�主題」�??��??�自訂�??��??�」�?以便?�入?��?工�??��?);
      return;
    }
    const finalTheme = theme.trim() || '?��?企�? (?�命??';
    setMode('manual');
    setViewState('workspace');
    addLog(`[System] ?�入?��?編輯模�??�目標�??��???{finalTheme}?�`, 'info');
  };

  const handleEditorChange = (e) => {
    const text = e.target.innerText;
    setStepContents(prev => ({ ...prev, [activeStep]: text }));
  };

  // --- ?��?：�??�本?��?件內�?---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCustomContext(prev => {
        const newText = prev + (prev ? '\n\n' : '') + text;
        if (newText.length > 5000) {
          addLog(`[Error] ?�入失�?：�?�?${file.name} ?�容後�??��? ${newText.length} 字�?超�? 5000 字�??��??�避?��?載�??��??��?！`, 'error');
          alert(`?�入失�?：�??�總??(${newText.length} �? 超�? 5000 字�??��?\\n建議?�接?��?精華段落?�可?�`);
          return prev; // ?��??�入，維?��?�?
        }
        addLog(`[System] 已�??��??��?件�?${file.name}`, 'success');
        return newText;
      });
    };
    reader.readAsText(file);
    e.target.value = null; // ?�置 input 讓�?一?��?案可以�?複�???
  };

  // --- ?��?：直?�寫??Step 1 ---
  const handleImportToStep1 = () => {
    if (!customContext.trim()) {
      addLog('[System] 沒�??�容?�匯?��?請�?貼�??��??��???, 'warning');
      return;
    }
    setStepContents(prev => ({ ...prev, 1: customContext }));
    setCompletedSteps(prev => [...new Set([...prev, 1])]); // 標�? Step 1 ?�已完�?
    addLog('[System] ?? ?�考�??�已?��??�入 Step 1 ?��?�?, 'success');
  };

  const clearAllData = () => {
    if (window.confirm('確�?要�?空畫布�??�?��??��?企�?資�??��?（此?��??��??��?�?)) {
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
      addLog('[System] ??�??��??��??�已?�數清空，隨?�可?��??��?案�?, 'info');
    }
  };

  // ============================================================================
  // 5. ?�寫?��??�步?��? (??Vercel API)
  // ============================================================================
  const triggerSingleStepAi = async () => {
    addLog(`[AI] �?��?�端請�?... ?�新?�寫 Step ${activeStep}`, 'info');
        setIsGenerating(true);
    
    try {
      const context = {
        theme: theme || "?�命?��??�主�?,
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
      addLog(`[AI] ??Step ${activeStep} ?�容?��?完畢！已?��?渲�??�編輯器?�`, 'success');

    } catch (error) {
      console.error("?��?失�?:", error);
      addLog(`[Error] ?��?失�?: ${error.message}`, 'error');
      alert(`API ?�叫失�?，錯誤�??? ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

// --- ?�出資�???Notion ---
const startNotionExport = async (customContents = null, customTheme = null) => {
  setIsNotionExporting(true);
  setNotionStatus('�?��?�步??Notion...');
  addLog(`[System] ?��?封�?企�?資�?，自?��??�匯??..`, 'info');

  try {
    // ?�叫?�們自己�? Vercel 後端 Notion API
    const VERCEL_NOTION_URL = '/api/notion';
    
    const targetTheme = customTheme || theme || "?�命?��??�主�?;
    const targetContents = customContents || stepContents;

    // 封�??��??�?��?輸入?��??��??��?符�?後端 /api/notion ?��??�格�?
    const payload = {
      theme: targetTheme,
      stepsData: targetContents,
      creatorName: curTheme.title, // ?��??��??��??��??��??��?稱�?例�?：全?�影?�創作者�?
      audienceTheme: audienceTheme
    };

    const response = await fetch(VERCEL_NOTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`伺�??�錯�? ${response.status}`);
    }

    const data = await response.json();
    
    setNotionStatus('??已�??�歸�?);
    addLog(`[Notion] ??企�??�出?��?！`, 'success');
    
    // ?��??��??��?建好??Notion ?�面並儲�?URL
    if (data.url) {
      setNotionUrl(data.url);
      fetchArchives(); // ?��?後�??�刷?�歷?��???
      if (passcode.trim().toUpperCase() === 'MASTER') {
        window.open(data.url, '_blank');
      }
    }
    
  } catch (error) {
    console.error("Notion ?�出失�?:", error);
    setNotionStatus('??歸�?失�?');
    addLog(`[Error] ?�出失�?: ${error.message}`, 'error');
  } finally {
    setIsNotionExporting(false);
  }
};

  const generateNewImage = async () => {
    const isMaster = passcode.trim().toUpperCase() === 'MASTER';
    if (!isCanvasEnv && !isMaster && !geminiApiKey.trim()) {
      setShowApiKeyModal(true);
      return;
    }
    if (visualGroups.length === 0) return;
    setIsGeneratingImage(true);
    addLog(`[Visual Hub] ?��??�次?��?${visualGroups.length} �?Prompt ??Imagen 4.0 API 端�?...`, 'info');
    
    await Promise.all(visualGroups.map(group => generateGroupImage(group)));
    
    setIsGeneratingImage(false);
    addLog(`[Visual Hub] ?�� ?�??Imagen 4.0 影�??��?完畢！`, 'success');
  };

  

  const getAiStatusColor = () => {
    if (aiStatus === 'pro') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (aiStatus === 'flash') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const code = passcode.trim().toUpperCase();
    if (ACCESS_CODES[code]) {
      setIsAuthenticated(true);
      setShowLoginPrompt(false);
      setAudienceTheme(ACCESS_CODES[code]); // ?��?密碼?��??��?對�??��??�主�?
      setAuthError('');
      setLogs([{ time: new Date().toLocaleTimeString('en-US', { hour12: false }), text: `[System] ?��??��??��???${ACCESS_CODES[code]} 工�??�?�`, type: "success" }]);
    } else {
      setAuthError('?��??��?權碼，�??�新輸入');
    }
  };

  // ?��?：全局?�截使用?��?任�??��?（�??�、鍵?��?，在觸發任�? UI ?��??�並顯示密碼�?
  useEffect(() => {
    const handleInteraction = (e) => {
      if (!isAuthenticated && !showLoginPrompt) {
        setShowLoginPrompt(true);
        e.stopPropagation(); // ?�止事件往下傳?�給底層?��???
        e.preventDefault();
      }
    };

    if (!isAuthenticated && !showLoginPrompt) {
      // 使用 capture ?�段?�截事件，確保能第�??��??��?使用?��??��?
      window.addEventListener('click', handleInteraction, { capture: true });
      window.addEventListener('mousedown', handleInteraction, { capture: true });
      window.addEventListener('keydown', handleInteraction, { capture: true });
    }

    return () => {
      window.removeEventListener('click', handleInteraction, { capture: true });
      window.removeEventListener('mousedown', handleInteraction, { capture: true });
      window.removeEventListener('keydown', handleInteraction, { capture: true });
    };
  }, [isAuthenticated, showLoginPrompt]);

  if (!isMounted) {
    return null; // �?�� Hydration Mismatch，�??�端?��?完�??�繪�?UI
  }

  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* --- STREAMING_CHUNK:Left Navigation Bar --- */}
      <aside className="w-64 bg-[#070b16] border-r border-slate-900 flex flex-col justify-between z-20 shrink-0">
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
              { id: 'creation', icon: FileText, label: '?�容?��?中�?' },
              { id: 'visual', icon: ImageIcon, label: '視覺?�控中�?' },
              { id: 'suno', icon: Music, label: 'Suno ?��?中�?' },
              { id: 'notebook', icon: BookOpen, label: 'NotebookLM 影�?中�?' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div key={tab.id} className="space-y-1.5">
                  <button 
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'creation' && viewState === 'workspace') {
                        // Stay in workspace if already open
                      } else {
                        setViewState('hub');
                      }
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-xs transition-all text-left border relative ${
                      isActive 
                        ? `${curTheme.bgActive} ${curTheme.textActive} ${curTheme.borderActive}` 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                    }`}
                  >
                    {/* Left indicator active line */}
                    {isActive && (
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-gradient-to-b ${curTheme.gradient}`} />
                    )}
                    <tab.icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                  
                  {/* 視覺裂�? (?�左?�選?��?覺發?�中心�?) */}
                  {isActive && tab.id === 'visual' && (
                    <div className="mx-2 p-4 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl space-y-4 backdrop-blur-md">
                      <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        視覺裂�?
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">影音縮�?</label>
                          <select className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none">
                            <option>?�影??/option>
                            <option>?�影??/option>
                            <option>社群FB/IG</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">輸出比�?</label>
                          <select 
                            value={visualStep}
                            onChange={(e) => setVisualStep(Number(e.target.value))}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none mb-3"
                          >
                            <option value={6}>{STEPS.find(s => s.id === 6)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 6)?.name || '橫�?縮�? (YouTube / FB)'}</option>
                            <option value={7}>{STEPS.find(s => s.id === 7)?.aspectRatio || '9:16'} - {STEPS.find(s => s.id === 7)?.name || '?��??��?封面 (Shorts / Reels)'}</option>
                            <option value={8}>{STEPS.find(s => s.id === 8)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 8)?.name || '?�象??/ 海報'}</option>
                            <option value={10}>{STEPS.find(s => s.id === 10)?.aspectRatio || '1:1 / 4:3'} - {STEPS.find(s => s.id === 10)?.name || '社群?�播 / 視覺素�?'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">影�??��?引�?</label>
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
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">?�風濾鏡</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {['?�虹?�競', '寫實極簡', '3D 賽�?', '?�繪?�漫'].map((style, idx) => (
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
          {/* Notion Connected Indicator */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/30 border border-slate-900">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center font-black text-xs text-white border border-slate-800">
                N
              </div>
              <div className="text-[11px]">
                <p className="font-semibold text-slate-300">Notion ???�?/p>
                <p className="text-[9px] text-slate-500">v2.4.1 Active</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Light Mode Switcher */}
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-900/40 transition-all">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-400 text-[11px]">淺色模�?</span>
            </div>
            <div className="w-8 h-4 rounded-full bg-slate-800 flex items-center p-0.5 justify-start">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
            </div>
          </button>
        </div>
      </aside>

      {/* --- STREAMING_CHUNK:Center Main Workspace Area --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0f1d] relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-900 bg-[#0a0f1d]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          {/* Top Search Input Box */}
          <div className="w-96 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="例�?：日?�寺廟抽籤攻??
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-[#111827]/60 border border-slate-800/80 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Top Action Buttons & Metrics */}
          <div className="flex items-center gap-4">
            {/* ?��?顯示?��??��??�??*/}
            {isCanvasEnv && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Canvas ?��?已�?�?/span>
              </div>
            )}

            {/* 清空企�??��? (從工作�?移�?�? */}
            <button 
              onClick={clearAllData}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空企�?</span>
            </button>

            {/* 一?�全?��?模�? Header Button / 中斷?��? */}
            {isGenerating ? (
              <button 
                onClick={() => {
                  setIsGenerating(false);
                  addLog("[System] ?��?作業已由使用?��??�中?��?, "info");
                  setViewState('workspace');
                }}
                className="px-4 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all animate-pulse"
              >
                <X className="w-3.5 h-3.5" />
                <span>中斷?��?</span>
              </button>
            ) : (
              <button 
                onClick={handleStartAuto}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{completedSteps.length > 0 ? '?��??��??��?' : '一?�全?��?模�?'}</span>
              </button>
            )}

            {/* Quota Metric Button */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>{credits} 點�?�?/span>
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
                  
                  {/* Hub Header */}
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                      今天?�創作�?麼�?
                    </h2>
                    <p className="text-[11px] md:text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                      輸入你想?��??�主題�?AI 將為你�??��??�究?�長?�影?�腳?�到社群貼�??�全?��??��?
                    </p>
                  </div>

                  {/* Dynamic Theme Select Buttons (Horizontal Row as requested) */}
                  <div className="space-y-3">
                    <div className="flex justify-center gap-1.5 flex-wrap">
                      {Object.values(audienceThemes).map((themeObj) => {
                        const isSel = audienceTheme === themeObj.id;
                        const isMaster = passcode.trim().toUpperCase() === 'MASTER';
                        return (
                          <button
                            key={themeObj.id}
                            onClick={() => handleThemeChange(themeObj.id)}
                            disabled={!isSel && !isMaster}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                              isSel
                                ? `${themeObj.bgActive} ${themeObj.borderActive} ${themeObj.textActive}`
                                : isMaster 
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
                        placeholder="例�?：日?�京?��?五日?�攻??
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full relative bg-[#070b16] border border-slate-900 rounded-2xl px-6 py-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner"
                      />
                    </div>

                    {/* --- ?��?：自訂�??��??��? --- */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-400 font-bold">?��??�景資�? / ?�考�?�?(?�填)</label>
                        <label className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-[9px] cursor-pointer transition-colors border border-slate-700">
                          <UploadCloud className="w-3 h-3" />
                          <span>上傳 TXT/MD/CSV</span>
                          <input type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                      </div>
                      <div className="relative">
                        <textarea
                          maxLength={5000}
                          placeholder="請貼上�??��?章�?官方?��?�?(建議?�制??5000 字以?��??��? AI 超�??�觸?��?流�??�制)?�系統�??��??��??��?將此?�容?�入??Step 1 作為?��?資�?..."
                          value={customContext}
                          onChange={(e) => setCustomContext(e.target.value)}
                          className={`w-full bg-[#070b16] border ${customContext.length >= 5000 ? 'border-red-500/50' : 'border-slate-900'} rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/30 h-28 resize-none shadow-inner custom-scrollbar pb-6`}
                        />
                        <div className={`absolute bottom-2 right-3 text-[9px] font-mono ${customContext.length >= 5000 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                          {customContext.length} / 5000
                        </div>
                      </div>
                    </div>

                    {/* --- ?��?：API Key 輸入?� --- */}
                    {!isCanvasEnv && (
                      <div className="space-y-2 pt-2 border-t border-slate-900/50">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-400 font-bold">Gemini API Key</label>
                          <span className="text-[9px] text-indigo-400 font-medium">???�援多�??�鑰輪替 (以逗�??��?)</span>
                        </div>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="password"
                            placeholder="輸入 API Key (?�貼上�??��??�並?��?形逗�? , ?��?)..."
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            className="w-full bg-[#070b16] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    )}

                    {/* Big Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left: 一?�全?��?模�? */}
                      <button
                        onClick={handleStartAuto}
                        className={`py-4 rounded-2xl ${curTheme.primaryBtn} font-black text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-98`}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 fill-white" />
                          <span>{completedSteps.length > 0 ? '?��??��??��?' : '一?�全?��?模�?'}</span>
                        </div>
                        <span className="text-[10px] opacity-70 font-normal">?�次?�叫，自?��??��??�?�步驟�?歸�?</span>
                      </button>

                      {/* Right: ?��??�步編輯 */}
                      <button
                        onClick={startManualWorkspace}
                        className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-2 text-slate-200">
                          <Sliders className="w-4 h-4 text-slate-400" />
                          <span>?�步編輯工�?�?/span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">?��?調校，逐步建�?客製?�矩??��??/span>
                      </button>
                    </div>
                  </div>

                  {/* Notion Load Project Component */}
                  <div className="pt-4 border-t border-slate-900/60 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <UploadCloud className="w-4.5 h-4.5" />
                      <span className="text-xs font-bold">�?Notion 載入已歸檔�?�?/span>
                    </div>
                    
                    {/* Simulated dropdown */}
                    <div className="w-full relative">
                      <select 
                        value={selectedArchive}
                        onChange={handleLoadArchive}
                        disabled={passcode.trim().toUpperCase() !== 'MASTER'}
                        className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-4 py-3 text-xs font-semibold text-slate-400 hover:text-slate-200 focus:outline-none appearance-none cursor-pointer text-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <option value="">-- {archiveList.length === 0 ? '載入清單�?..' : '點�??��??��?專�?'} --</option>
                        
                        {/* ?�裡?�自?��? Notion 裡面?��?案�?稱�??��??�出來�? */}
                        {archiveList.map((item) => (
                          <option key={item.id} value={item.id}>
                            ?? {item.title} ({item.createdTime})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* 清空?��? */}
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={clearAllData}
                      className="text-[10px] text-red-500/70 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      清空?��??��?企�?資�?
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- STREAMING_CHUNK:Rendering ${STEPS.length}-Step Flow Editor Workspace --- */
              <div className="flex-1 flex overflow-hidden">
                
                {/* Steps Navigator Left Column */}
                <div className="w-64 border-r border-slate-900/60 overflow-y-auto bg-[#070b16]/30 p-4 space-y-1.5 custom-scrollbar shrink-0">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{STEPS.length}-Step Flow</span>
                    <span className={`${curTheme.accentText} text-[10px] font-mono`}>{completedSteps.length}/{STEPS.length} 已�???/span>
                  </div>
                  {STEPS.map((step) => {
                    const isActive = activeStep === step.id;
                    const isDone = completedSteps.includes(step.id);
                    const Icon = step.icon;
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
                            ??返�??��?大廳
                          </button>
                          <span className="text-slate-600">??/span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${curTheme.bgBadge}`}>
                            STEP {activeStep} ??{STEPS[activeStep-1]?.category || 'Loading'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {STEPS[activeStep-1]?.name || '載入�?..'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{STEPS[activeStep-1]?.desc || '�?��?�步伺�??�設定�?...'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={triggerSingleStepAi}
                          disabled={isGenerating}
                          className={`flex items-center gap-2 px-4 py-2.5 ${curTheme.primaryBtn} disabled:opacity-50 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95`}
                        >
                          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          {isGenerating ? 'AI ?��??��?�?..' : 'AI ?�新?��??�潤�?}
                        </button>
                      </div>
                    </div>

                    {/* Notion synced alert banner */}
                    {notionStatus === '已�?步至 Notion' && (
                      <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>?��??�步驟內容已??Notion ?�端檔�??��??�步?�份??/span>
                      </div>
                    )}

                    {/* Markdown text editor card */}
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
                                a.download = `${theme || '企�?'}_Step${activeStep}_${STEPS[activeStep-1]?.name.split(' ')[0] || 'Doc'}.md`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/30 transition-all border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer shadow-sm"
                              title="下�?此步驟內容為 Markdown 檔�?"
                            >
                              <Download className="w-3 h-3" />
                              下�? .md
                            </button>
                          )}
                          <div className="text-[10px] text-slate-500 font-medium">
                            Auto-saved locally
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 relative min-h-[500px]">
                        {/* AI ?�寫?��?顯示 MP4 讀?��???*/}
                        {isGenerating ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#090d19]/90 z-10 backdrop-blur-md">
                            <video 
                              src={LOADING_VIDEOS_LIST[loadingVideoIdx]} 
                              autoPlay 
                              
                              playsInline
                              onEnded={() => setLoadingVideoIndex(prev => (prev + 1) % LOADING_VIDEOS_LIST.length)}
                              className="w-[600px] h-[340px] object-cover rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] mb-6"
                            />
                            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 animate-pulse tracking-wider">
                              AI ?��?引�?高速�?算中...
                            </h3>
                            <p className="text-slate-400 mt-3 text-sm flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              �?��?��?資�?，�?稍�?
                            </p>
                          </div>
                        ) : (
                          /* ?��?完畢後�?顯示?�本?��?字編輯器 */
                          <div 
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleEditorChange}
                            className="absolute inset-0 p-6 font-mono text-sm text-slate-300 focus:outline-none overflow-y-auto whitespace-pre-wrap leading-relaxed select-text cursor-text"
                          >
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
                      視覺調度中�?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">?�制?��???16:9 YouTube 橫�?縮�???:16 ?��??��?封面?�社群�?覺�??��?/p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Left Controls column */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md flex flex-col">

<div className="relative w-full flex-1 min-h-[500px]">
  
  {/* AI ?�寫?��?顯示 MP4 讀?��???*/}
  {isGenerating ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 rounded-xl z-10 backdrop-blur-md">
       
      <video 
        src={LOADING_VIDEOS_LIST[loadingVideoIdx]} 
        autoPlay 
        
        playsInline
        onEnded={() => setLoadingVideoIndex(prev => (prev + 1) % LOADING_VIDEOS_LIST.length)}
        className="w-[600px] h-[340px] object-cover rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] mb-6"
      />
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse tracking-wider">
        AI 引�?高速�?算中...
      </h3>
      <p className="text-purple-300/60 mt-3 text-sm flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        �?��?��?資�?，�?稍�?
      </p>
    </div>
  ) : (
    
    /* ?��?完畢後�?顯示?�本?��?字編輯器 */
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
                      <span>{isGeneratingImage ? '�?��?�次渲�?�?..' : '??AI ?�次繪製?�部影�?'}</span>
                    </button>
                  </div>

                  {/* Right Masonry Grid of images */}
                  <div className="col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">已渲?��?體�??�庫 ({visualGroups.length})</h4>
                    
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
                                 <span className="text-[10px] text-purple-400">�?��?��? {IMAGE_ENGINES.find(e => e.id === imageEngine)?.name || 'AI'} ?��?...</span>
                               </div>
                            ) : (
                               <div className="text-slate-700 font-medium text-xs flex items-center gap-2">
                                 <ImageIcon className="w-4 h-4" /> 尚未?��?影�?
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
                              <span>{generatingGroups[group.id] ? '�?��渲�?...' : '??AI 繪製影�? (-5 �?'}</span>
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

          {/* TAB 3: Suno ?��?中�? */}
          {activeTab === 'suno' && (
            /* --- STREAMING_CHUNK:Rendering Suno AI Audio Center --- */
            <div className="flex-1 p-6 overflow-y-auto bg-[#0a0f1d] custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <Music className="w-5 h-5 text-purple-400" />
                      Suno ?��?中�?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">?�於影�??�眾調性�??�本節奏�?一?�調??Suno API ?��??��??�創?�無?��??��??��?樂�?/p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Lyrics generation */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">?��?歌�??��?</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">?��?風格 (Style of Music)</label>
                        <input 
                          type="text" 
                          value={musicGenre} 
                          onChange={(e) => setMusicGenre(e.target.value)}
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">歌�??�容 / ?�調?��?</label>
                        <textarea
                          value={stepContents[9]} 
                          onChange={(e) => setStepContents(prev => ({ ...prev, 9: e.target.value }))}
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl p-3 text-xs text-slate-300 focus:outline-none h-36 resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addLog("[Suno API] �?��調度?��?引�??�寫?��?軌跡...", "info");
                        setTimeout(() => {
                          addLog("[Suno API] ???��??��??��?！已?�入下方?��?庫�?, "success");
                        }, 1500);
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>?�新調製?��?軌跡</span>
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
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest pt-2">?��??��?�?/h4>
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
                              使用此音�?
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
                      NotebookLM 影�??��?中�?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">?�入?�影?�、�??��?檔�??�音檔�??��??��?主�??��??�並轉譯?��?構�?對�??�學習�??��?/p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Left input container */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">外部資�?庫匯??/h4>
                    
                    <div className="space-y-3">
                      <div className="p-4 border border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl bg-slate-900/10 text-center cursor-pointer transition-all">
                        <UploadCloud className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-400 block">?�曳 Markdown/PDF ?�這裡</span>
                        <span className="text-[10px] text-slate-600 block mt-1">??點�??��?上傳</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">YouTube ?�影??URL</label>
                        <input 
                          type="text" 
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/40"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addLog("[NotebookLM] �?���??影�?語音，進�?語�??��??��??��???..", "info");
                        setTimeout(() => {
                          addLog("[NotebookLM] ???��?�???�影?��??��?資�?已�??��?, "success");
                        }, 1200);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      <span>�??影�?並�??��??�庫</span>
                    </button>
                  </div>

                  {/* NotebookLM key points display */}
                  <div className="col-span-2 space-y-4">
                    <div className="p-5 bg-[#0f172a]/40 border border-slate-900 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Award className="w-4 h-4" />
                        <span>AI ?��??�影?�知識卡 (影�??�長 35 mins)</span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-slate-200">?�鍵?��? 01 - 跨平?��?流�?必然趨勢</p>
                          <p className="text-slate-400 mt-1">2026年單一社群平台流�?�?��緊縮，�?尖創作者�??�建�?YouTube（長?��?�? TikTok（短?��?�? FB/IG（社群宣?��??�自?��?流系統�?/p>
                        </div>
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-slate-200">?�鍵?��? 02 - 多工 AI ?�勢</p>
                          <p className="text-slate-400 mt-1">使用?��???Prompt 比�??��??�能?�好?��?上�??��?係。�?次解構全?�步驟能?��??��?�?��?��??�腳?�調?��?一?��??��???/p>
                        </div>
                      </div>
                    </div>

                    {/* Quick interactive Q&As */}
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest pt-1">快速�?讀?��?</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { q: '?�段?�容?��??��?點是什麼�?', a: '主�??�於?��??�發?�格式�??�以?�腳?��??�瓶?��? },
                        { q: '?��?企�??�單純寫?�本差在?��?', a: '?��?企�??��?了�??�、長?��??�、Suno ?��???SEO，�?次�??��??�產?��? }
                      ].map((qa, i) => (
                        <div key={i} className="p-4 bg-slate-900/30 border border-slate-900/80 rounded-xl space-y-1.5">
                          <p className="font-bold text-slate-200">??{qa.q}</p>
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
          
          {/* AI ?�?�監??Panel */}
          <div className="p-5 border-b border-slate-900/80">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3.5 h-3.5 rounded bg-slate-900 flex items-center justify-center">
                <Sliders className="w-2.5 h-2.5 text-slate-500" />
              </span>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI ?�?�監??/h4>
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

          {/* _> 系統?�日�?(Log Terminal Box) */}
          <div className="flex-1 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">系統?�日�?/h4>
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

        {/* 返�??��?大廳 */}
        <div className="flex justify-center pb-2 pt-2 border-t border-slate-900 bg-slate-950/20">
          <button
            onClick={() => {
              setActiveTab('creation');
              setViewState('hub');
            }}
            className="py-1.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-900/50 hover:bg-slate-800 hover:text-white border border-slate-800 rounded transition-colors"
          >
            返�??��?大廳
          </button>
        </div>

        {/* Bottom Part: Notion Synchronization Center */}
        <div className="p-5 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-2 mb-3.5">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notion ?�步中�?</h4>
          </div>

          <div className="space-y-4">
            {/* Sync status feedback */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">存�??�步?�??/span>
              <span className={`font-bold ${notionStatus === '已�?步至 Notion' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {notionStatus}
              </span>
            </div>

            {/* Notion sync execution button */}
            {notionStatus === '??已�??�歸�? ? (
              <div className="space-y-2 w-full">
                {/* �?MASTER ?��??��??��?�?*/}
                {(notionUrl && passcode.trim().toUpperCase() === 'MASTER') && (
                  <button
                    onClick={() => window.open(notionUrl, '_blank')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 shadow-inner active:scale-95 transition-all animate-pulse"
                  >
                    <Link className="w-4 h-4" />
                    <span>?��? Notion ?��?此�???/span>
                  </button>
                )}
                {/* ?��?專�?下�??�單 (??MASTER ?�用) */}
                <div className="w-full relative mt-2">
                  <select
                    className="w-full py-2 pl-8 pr-8 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 text-slate-400 text-xs font-medium appearance-none cursor-pointer outline-none text-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    onChange={handleLoadArchive}
                    value={selectedArchive}
                    disabled={isLoadingArchive || passcode.trim().toUpperCase() !== 'MASTER'}
                  >
                    <option value="">?��?專�?�?(?��? Master)</option>
                    {archiveList.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                  <Database className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ) : (
              <button
                onClick={startNotionExport}
                disabled={isNotionExporting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-inner active:scale-98 transition-all disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 text-slate-400 ${isNotionExporting ? 'animate-bounce' : ''}`} />
                <span>{isNotionExporting ? '�?��?�輸?��?�?..' : '?��??�出 Notion'}</span>
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* --- Global Auth Overlay (?��??�護罩�?密碼?��?) --- */}
      {(!isAuthenticated && showLoginPrompt) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
          <div 
            className="relative z-10 w-full max-w-sm p-8 bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // 點�?密碼框內?��??��?�?
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 relative z-10">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider mb-2 relative z-10">OmniScript Pro</h2>
            <p className="text-xs text-slate-400 mb-8 text-center relative z-10">請輸?�您?��?屬�??��?權碼以解?�系�?/p>
            
            <form onSubmit={handleLogin} className="w-full space-y-4 relative z-10">
              <div>
                <input 
                  type="password"
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setAuthError(''); }}
                  placeholder="輸入?��?�?
                  className="w-full bg-[#070b16] border border-slate-700 rounded-xl px-4 py-3 text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all tracking-widest"
                  autoFocus
                />
              </div>
              {authError && <p className="text-red-400 text-[10px] text-center font-bold">{authError}</p>}
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                �??並登?�工作�?
              </button>
            </form>

            {/* ?�發測試?��???(上�?給客?��??��??��? div ?�除) */}
            <div className="mt-12 grid grid-cols-4 gap-x-6 gap-y-2 text-[12px] text-slate-600 font-mono relative z-10">
              <span>TECH2026 (民�?)</span>
              <span>GLAM2026 (美�?)</span>
              <span>INDIE2026 (?��?)</span>
              <span>RUBY2026 (美�?)</span>
              <span>SKY2026 (寵物)</span>
              
            </div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700/50 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-indigo-400" />
                ?��?Gemini API Key
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              ?�目?��??�獨立�?行模式�?必�?輸入 Gemini API Key ?�能?��???
              <br />
              <span className="text-indigo-400 font-medium mt-1 inline-block">??系統?�援?��?流�??��??�可以�?次貼上�??��??��?並使?��?形逗�? <code className="bg-indigo-500/20 px-1 rounded text-indigo-300">,</code> ?��???/span>
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="輸入 API Key (例�?：AIzaSy..., AIzaSy..., AIzaSy...)"
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
                      handleStartAuto();
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  確�?並�?始執�?
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  ?��??��? Gemini API Key
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
