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
// --- ?àÊ??ëÈë∞Â∞çÊ?Ë°?(5 ?ãÂ??æÁæ§ + 1 ?ãÁÆ°?ÜÂì°) ---
// ============================================================================
const ACCESS_CODES: Record<string, string> = {
  'TECH2026': 'heritage',   // Ê∞ë‰?‰ø°‰ª∞?ªÊ??ñÂÇ≥??
  'GLAM2026': 'beauty',        // ÁæéÂ?‰øùÈ??ªÊ?Â∑±Á?Â≠?
  'INDIE2026': 'travelpreneur',// ?ÖÈ??üÊ¥ª?ª‰??åÊº´??
  'RUBY2026': 'food',          // ÁæéÈ??ôÁ??ªÈ¢®?≥Êé¢Á¥?
  'PET2026': 'pet',            // ÂØµÁâ©?ßË≠∑?ªÂπ∏Á¶èÈô™‰º?
  'SKY2026': 'pet',            // ?∏ÂÆπ?äÁ¢º
  'MASTER': 'heritage'      // ÁÆ°Á???
};

const IMAGE_ENGINES = [
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 Lite',
    desc: '?ôÊòØ?üÂ∫¶?ÄÂø´„ÄÅÊ??¨Ê?‰ΩéÁ? Gemini ?ñÂ?Ê®°Â?ÔºåÂ??∫ÈÄüÂ∫¶?åË?Ê®°ËÄåË®≠Ë®àÔ??©Áî®?ºÈÄüÂ∫¶?åÊ??¨ÊòØ‰∏ªË??üÈ??êÂà∂?ÑÊ?Ê≥Å„ÄÇ‰??©Â?Â§öÂÄãÂ??ÉËº∏?•ÂÖßÂÆπÊ?Â§öËº™???Á∑®ËºØ??
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Nano Banana 2',
    desc: '?®ÈÄîÊ?Âª???ÑÊ®°?ãÔ??©Áî®?ºÊ??âÂ∑•‰Ωú„ÄÇÂèØ?ºÈ°ß?üÂ∫¶?áÊ??àÈÄ≤Á? 4K ?üÊ??ÄË°ì„ÄÅ‰??åÁü•Ë≠òÂ??ØÈ??ÑÊ?Â≠óË?Ë≠ØÂ??Ω„ÄÇÊ??∑Ë??ÜÂ?ÂºµÂ??ÉÂ??èÔ?‰∏¶Á¢∫‰øù‰??¥ÊÄß„Ä?
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Nano Banana Pro',
    desc: '?Ä?©Â??ïÁ?Ë§áÈ??ÑË?Ë¶∫Â?Â∑•‰?ÔºåÊ?‰æõÊ?È´òÁ?Â∫¶Á?‰∏ñÁ??•Ë??ÅÈÄ≤È??¨Âú∞?ñ„ÄÅÊ?Á¢∫Á??ÅÁ?‰∏Ä?¥ÊÄßÔ?‰ª•Â?Á≤æÁ¢∫?ÑÂâµ?èÊéß?∂„Ä?
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana',
    desc: 'Nano Banana Á≥ªÂ??ÑÂ?È©ÖÊ®°?ã„ÄÇÈ???Nano Banana 2 Lite ‰∏Ä?¥ÊòØ?ØÈ??ÑÂ∑•?∑Ô?‰ΩÜÊ??ëÂº∑?àÂª∫Ë≠∞ÂÆ¢?∂Êîπ?®ÈÄôÈ?Ê®°Â?Ôºå‰∫´?óÊõ¥?™Ë≥™?ÑÈ?È©ó„ÄÅÊõ¥Âø´Á??üÊ??üÂ∫¶Ôºå‰ª•?äÊõ¥‰ΩéÁ? API ?πÊ†º??
  }
];

// ============================================================================
// --- ÁµêÂ? Vercel ?èËºØ??Gemini Canva API ?ÑÂÖ®?∞Á??êÂáΩ??---
async function callVercelApi(stepId: any, context: any, audienceTheme: string, userApiKey: string = "") {
    // Ê≠•È? 1ÔºöÂ? Vercel Ë´ãÊ??åË©≤Ê≠•È?Â∞àÂ±¨??Prompt Â≠ó‰∏≤??
    const VERCEL_API_URL = '/api/gemini';
    const promptResponse = await fetch(VERCEL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepId, context, audienceTheme })
    });
    if (!promptResponse.ok) {
        throw new Error(`Vercel ?èËºØÂºïÊ??ØË™§: ${promptResponse.status}`);
    }
    const { prompt } = await promptResponse.json();
    // Ê≠•È? 2ÔºöÊãø??Prompt ÂæåÔ??®Â?Á´ØÁõ¥?•Ê? Gemini Canva ÂÆòÊñπ API
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
        throw new Error(`Google API ?ØË™§: ${aiResponse.status}`);
    }
    
    const data = await aiResponse.json();
    return data.candidates[0].content.parts[0].text;
}

// ============================================================================
// 2. ?¶Ë∫´??STEPS (Â∑≤Áßª??PromptÔºå‰∫§??Vercel ÂæåÁ´Ø?ïÁ?)
// ============================================================================
// ?∞Â?ÔºöMP4 Ëº™Êí≠ÂΩ±Á?Ê∏ÖÂñÆ (?®ÂèØ‰ª•Âú®Ê≠§Èô£?óÂ??•Â??ãÂΩ±?áÁ∂≤?Ä)
const LOADING_VIDEOS_LIST = [
  "https://res.cloudinary.com/dhvzfeo7p/video/upload/q_auto/f_auto/v1780920395/_%E5%9C%96%E7%94%9F%E5%8B%95%E7%95%AB%E8%A6%8F%E5%8A%83_Animation_Planning__o5hw6k.mp4",
  "https://res.cloudinary.com/dhvzfeo7p/video/upload/v1780920477/_%E5%9C%96%E7%94%9F%E5%8B%95%E7%95%AB%E8%A6%8F%E5%8A%83_Animation_Planning__1_umfge3.mp4" // Ë´ãÊõø?õÊ??®Á?Á¨¨‰??ãÂΩ±?áÁ∂≤?Ä
];

const getInitialStepContent = (stepId, themeText, previousContents = {}) => {
  if (!stepId) return "Ë´ãÈÅ∏?á‰??ãÊ≠•È©üÈÄ≤Ë?Ê™¢Ë???;
  
  return `?êÁ?ÂæÖÂ? Vercel ‰º∫Ê??®Áç≤?ñË???..?ë\n\nÈªûÊ??å‰??µÂÖ®?™Â?Ê®°Â??çÊ??ÆÊ≠•?åÈ??∞Á??ê„Äç‰??ë‰º∫?çÂô®?ºÈÄÅË?Ê±Ç„ÄÇ`;
};

// ============================================================================
// 3. React ?É‰ª∂‰∏ªÈ??áÁ???
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

  // --- ?Ä?ãÁÆ°?Ü‰??Å‰?ËÆ?---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // ?∞Â?ÔºöÊéß?∂ÊòØ?¶È°ØÁ§∫Â?Á¢ºËº∏?•Ê?
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [activeTab, setActiveTab] = useState('creation'); 

  // ====== ?∏Â??Ä?ãÁÆ°??(?†‰? SSR ?≤Ë≠∑) ======
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

  // ?øÂ? Hydration MismatchÔºåÁ??É‰ª∂?õË?ÂæåÂ?Âæ?localStorage ËÆÄ?ñÁ???
  useEffect(() => {
    setIsMounted(true);
    const savedAudienceTheme = localStorage.getItem('os_pro_audienceTheme');
    if (savedAudienceTheme) setAudienceTheme(savedAudienceTheme);
  }, []);

  const [loadingVideoIdx, setLoadingVideoIndex] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
   
   // --- ?∞Â?ÔºöÁç®Á´?Gemini API Key ?Ä?ãË??∞Â??µÊ∏¨ ---
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

 // ?îΩ ?∞Â??ô‰??ãË??∏‰??ßÂà∂ Notion ‰∏ãÊ??∏ÂñÆ ?îΩ
  const [archiveList, setArchiveList] = useState([]); 
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");
  // ?îΩ ?∞Â??ôÂÄãÂáΩ?∏Ô???Vercel ??Notion Ê∏ÖÂñÆ ?îΩ
  const fetchArchives = async () => {
    try {
      const response = await fetch('/api/notion/history');
      const data = await response.json();
      if (data.history) {
        setArchiveList(data.history);
      }
    } catch (err) {
      console.error("?°Ê?ËºâÂÖ• Notion Â∞àÊ?Ê∏ÖÂñÆ", err);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const [logs, setLogs] = useState([
    { time: "23:22:36", text: "[System] OmniScript Pro OS ?ùÂ??ñÂ??¢„Ä?, type: "info" },
    { time: "23:22:40", text: "[System] Á≥ªÁµ±Â∞±Á??Ç‰∏ªÁæéÂ≠∏?çÁΩÆÔºöÂÖ®?∑ÂΩ±?≥Ââµ‰ΩúËÄ?(Cinematic Pink)", type: "default" }
  ]);
  
  const [aiStatus, setAiStatus] = useState('pro'); 
  const [credits, setCredits] = useState(125);
  const [isNotionExporting, setIsNotionExporting] = useState(false);
  const [notionStatus, setNotionStatus] = useState('Â∞öÊú™Ê≠∏Ê?');
  const [notionUrl, setNotionUrl] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [musicProgress, setMusicProgress] = useState(35);
  const [musicGenre, setMusicGenre] = useState('Synthwave');
  const [lyricsText, setLyricsText] = useState('?®È??πÈ??çÁ?Ê∑±Â?... ‰ª?¢º?®Ëû¢Âπï‰?Ë∑≥Â?ÔºåÈÄôÊòØ‰∏Ä?ã‰∫∫?ÑÊà∞??..');
  const [midjourneyPrompt, setMidjourneyPrompt] = useState('A futuristic 3D render of a content creator workspace in 2026, holographic displays, neon glowing colors --ar 16:9');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [generatedImages, setGeneratedImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: 'Á¨¨‰?ÁµÑ‰∏≠?áPrompt' },
    { id: 2, url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: 'Á¨¨‰?ÁµÑ‰∏≠?áPrompt' },
    { id: 3, url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80', engine: 'Imagen 4.0', prompt: 'Á¨¨‰?ÁµÑ‰∏≠?áPrompt' }
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
        
        // --- ?®Ê?Â§öÊ®£?ñÈ¢®?ºÂ?Áæ?(??AI ?®Ê??ñÊ®£) ---
        const palettes = [
          { main: 'rgba(255, 251, 240, 1)', mainShadow: 'rgba(20, 10, 0, 0.7)', sub: 'rgba(240, 200, 80, 1)', subShadow: 'rgba(0, 0, 0, 0.58)' },
          { main: 'rgba(255, 223, 130, 1)', mainShadow: 'rgba(0, 0, 0, 0.8)', sub: 'rgba(255, 255, 255, 1)', subShadow: 'rgba(0, 0, 0, 0.7)' },
          { main: 'rgba(240, 245, 255, 1)', mainShadow: 'rgba(5, 15, 40, 0.8)', sub: 'rgba(150, 220, 255, 1)', subShadow: 'rgba(0, 5, 20, 0.7)' },
          { main: 'rgba(255, 200, 100, 1)', mainShadow: 'rgba(20, 10, 5, 0.8)', sub: 'rgba(255, 150, 80, 1)', subShadow: 'rgba(20, 5, 0, 0.7)' },
          { main: 'rgba(255, 240, 245, 1)', mainShadow: 'rgba(30, 10, 40, 0.8)', sub: 'rgba(230, 180, 255, 1)', subShadow: 'rgba(20, 0, 30, 0.7)' }
        ];
        const style = palettes[Math.floor(Math.random() * palettes.length)];
        
        // ?ùË??∏Ê?Â≠óÂÑ™??(?†ÂÖ• Google Fonts Ë°åÊõ∏/ÊØõÁ?/Â∞èË?È´?ÂÆãÈ? ?®Ê??ΩÊ®£)
        const fontFamilies = [
          '"Ma Shan Zheng", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // È¶¨Â??øÊ?Á≠ÜÊ•∑??
          '"Zhi Mang Xing", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // ÂøóËéΩË°åÊõ∏
          '"ZCOOL XiaoWei", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif', // Á´ôÈÖ∑Â∞èË?È´?
          '"Noto Serif TC", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif'  // ?ùÊ?ÂÆãÈ?
        ];
        const randomFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
        const fontStr = (size) => `bold ${size}px ${randomFontFamily}`;
        
        if (visualStep === 7 && mainTitle) {
          // Step 7 ‰∏ªÊ??¥Â? (?∫Ê?Á∑öÂè≥??25%)
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
          // Step 8 Ë©©Ë??¥Â? (?∫Ê?Á∑öÂè≥??25%ÔºåÁßª?§Ê?Èª?
          const startX = width * 0.75;
          const startY = height * 0.15;
          ctx.font = fontStr(poetryFontSize);
          const cleanText = poetry.replace(/[Ôºå„ÄÇÔ?ÔºüÔ??Å\s]/g, "");
          const lines = [];
          // ‰∏ÉË??õÂè•: ÊØ?7 Â≠óÊ?Ë°?
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
            xOffset -= poetryFontSize * 1.3; // ÂæÄÂ∑¶Ê?Ë°?
          });
        } else {
          // ‰∏Ä?¨Ê©´Âº?(‰∏ªÊ?‰∏ãÁßª??25%)
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
    addLog(`[${engineName}] ?üÂ? ${groupId} Áπ™Ë£Ω?≤Á?...`, 'info');
    
    try {
      const apiKey = geminiApiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : ""); // Canvas ?êË¶Ω?∞Â??ÉËá™?ïÂ∏∂??
      
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
        throw new Error("?™Êî∂?∞Â??áË???);
      }
      
      if (base64) {
        const originalImage = `data:image/png;base64,${base64}`;
        const finalImage = await applyTextOverlayToImageBase64(originalImage, mainTitle, subTitle, poetry);
        
        setGroupImages(prev => ({ ...prev, [groupId]: finalImage }));
        addLog(`[${engineName}] ??${groupId} Ê∏≤Ê?ÂÆåÊ?ÔºÅ`, 'success');
        setCredits(prev => Math.max(0, prev - 5));
      }
    } catch (err) {
      const engineConfig = IMAGE_ENGINES.find(e => e.id === imageEngine) || IMAGE_ENGINES[0];
      const engineName = engineConfig.name;
      addLog(`[${engineName}] Áπ™Ë£ΩÂ§±Ê?: ${err.message}`, 'error');
    } finally {
      setGeneratingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleDownloadImage = (url, filename) => {
    if (!url) {
      addLog(`[System] Â∞öÊú™?üÊ?ÂΩ±Â?ÔºåÁÑ°Ê≥ï‰?Ëºâ`, 'error');
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
  // 4. ?πÂØ´?®Ëá™?ïÁ??êÂ???(??Vercel API)
  // ============================================================================
  const runAutoGeneration = async (startTheme) => {
      
    setIsGenerating(true);
        setMode('auto');
    setViewState('workspace');
    
    let currentContextContents = { ...stepContents }; 
    let startStep = 1;

    // --- ?∞Â?ÔºöÂÅµÊ∏¨‰∏ªÈ°åË??¥‰∏¶?™Â??êÁ§∫Ê∏ÖÁ©∫ ---
    const savedLastTheme = localStorage.getItem('os_pro_lastGeneratedTheme') || '';
    const isCanvasEmpty = currentContextContents[1] === getInitialStepContent(1, "");
    if (startTheme !== savedLastTheme && !isCanvasEmpty) {
      const wantsNew = window.confirm(`?®Ëº∏?•‰??®Êñ∞‰∏ªÈ?Ôºö„Ä?{startTheme}?ç\nË´ãÂ??ØÂê¶Ë¶ÅÊ?Á©∫Áï´Â∏É‰??ÑË?‰ºÅÂ?ÔºåÈ??∞È?ÂßãÂª∫Á´ãÔ?\n(?•ÈÅ∏?áÂ?Ê∂àÔ?Â∞áÂ?Ë©¶Êô∫?ßÊé•Á∫åÊú™ÂÆåÊ??ÑÊ≠•È©?`);
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

    // Â¶ÇÊ?‰ΩøÁî®?ÖÊ??™Ë??åÊôØË≥áÊ?‰∏?Step 1 ?∫Á©∫ÔºàÊ??™ÊòØ?êË®≠‰Ωî‰??áÂ?ÔºâÔ?Â∞±Ê?ÂÆÉÁï∂‰Ω?Step 1
    if (customContext.trim() && isStepEmpty(1)) {
      currentContextContents[1] = customContext;
      setStepContents(prev => ({ ...prev, 1: customContext }));
      addLog(`[System] ?µÊ∏¨?∞ÊÇ®Â∑≤Ê?‰æõ„ÄåËá™Ë®ÇË??ØË??ô„ÄçÔ?Á≥ªÁµ±Â∑≤Ëá™?ïÂ??∂Ë??•ÁÇ∫ Step 1 ?∫Á??áÁçªÔºåÁÇ∫?®Á?‰∏ãÁ¨¨‰∏Ä?éÊÆµ?ÑÊü•?∏Ê??ìÔ?`, 'success');
    }

    // ?∫ËÉΩ?•Á??èËºØÔºöÂ??æÁ¨¨‰∏Ä?ãÊ??âÂÖßÂÆπÁ?Ê≠•È?
    for (let i = 1; i <= STEPS.length; i++) {
      if (isStepEmpty(i)) {
        startStep = i;
        break;
      }
    }

    if (startStep > STEPS.length) {
      addLog(`[System] ${STEPS.length} ?ãÊ≠•È©üÁ?Â∑≤Â??®ÂÖßÂÆπÔ??•Á?ÂÆåÊ?ÔºÅ`, 'success');
      setIsGenerating(false);
      return;
    }

    // ==========================================
    // Stage 1: Â∞àÊ≥®‰∫ãÂØ¶?•Ê†∏ (Step 1)
    // ==========================================
    if (startStep === 1) {
      addLog(`[Process] Stage 1ÔºöÊ≠£?®Â?Ê≥®Á???Step 1: ${STEPS[0].name}...`);
      setActiveStep(1);
      
      try {
        // ?πÁî®ÂæåÁ´Ø /api/generate-all ‰æÜË? Step 1Ôºå‰∫´?âËá™?ïÈ?Ë©¶Ë???503 Ê©üÂà∂
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
          throw new Error(`‰º∫Ê??®Â??âÈåØË™? ${response.status}`);
        }

        const responseData = await response.json();
        const resultText = responseData.data[1] || "";
        
        currentContextContents[1] = resultText;
        setStepContents(prev => ({ ...prev, 1: resultText }));
        setCompletedSteps(prev => [...new Set([...prev, 1])]);
        
        addLog(`[System] Á¨¨‰??éÊÆµ?∫Á??îÁ©∂Â∑≤Á??êÂ??¢Ô?Á≥ªÁµ±?™Â??•Á??≤Ë? Stage 2 ?πÊ¨°?üÊ?...`, 'info');
        startStep = 2; // ?™Â??•Á??≤ÂÖ•Á¨¨‰??éÊÆµ
      } catch (error) {
        addLog(`[Error] Step 1 ?üÊ?Â§±Ê?: ${error.message}Ôºå‰∏≠Ê≠¢ÂÖ®?™Â?ÊµÅÁ??Ç`, 'error');
        setIsGenerating(false);
        return;
      }
    }

    // ==========================================
    // Stage 2: ‰æùÂ??üÊ??∂Â?Ê≠•È? (Step 2 ~ 10 ‰∏Ä??∞£Ë∑ëÂ?)
    // ==========================================
    addLog(`[Process] Stage 2ÔºöÊ≠£?®Âëº?´Èõ≤Á´ØÊâπÊ¨°Â??éÔ?Ê∫ñÂ?‰∏Ä??∞£?üÊ? Step ${startStep} ~ ${STEPS.length}...`, 'info');
    
    // Ë®≠Â??üÂØ¶?ÑÂ??ÇÁ??ãÂ??±Ô??íÁ∑©Á≠âÂ?ÂæåÁ´Ø 30~45 ÁßíÁ??¶ÊÖÆ?üÔ??åÊ?Ë™†ÂØ¶?çÊ?Á≥ªÁµ±?Ä??
    const progressMessages = [
      { msg: `[System] ?≤Á´ØÂºïÊ?Ê≠?ú®?≤Ë?Ë∂ÖÂ§ß?áÊú¨?àÁµ°?ÜÊ??áÁ??õÂ???.. (Ê≠§ÊâπÊ¨°Á??êÈÄöÂ∏∏?ÄË¶?30~45 Áß?` },
      { msg: `[System] Ê≠?ú®?åÊ≠•?ãÁ??≥Êú¨?∂Ê??ÅË?Ë¶∫Ê?‰ª§Ë?Á§æÁæ§Ë≤ºÊ?ÔºåÈÄôÊòØ‰∏Ä?ÖÈ?ÁÆóÂ?‰ªªÂ?ÔºåË?Á®çÂÄ?..` },
      { msg: `[System] Ê∑±Â∫¶?üÊ??ÅÁ??≤Ë?‰∏≠Ô?Á≥ªÁµ±Ê≠?ú®Á¢∫‰???${STEPS.length - 1} ?ãÊ≠•È©üÁ??èËºØÂÆåÁ?Â∞çÈ?‰∏çÁ???..` },
      { msg: `[System] ?≤ÂÖ•?ÄÂæåÂ?Ë£ùÈ?ÊÆµÔ??≥Â??∫ÊÇ®?êÂá∫ÂÆåÊï¥?Ñ‰??ÉÁü©???` }
    ];
    let msgIndex = 0;
    const progressInterval = setInterval(() => {
      if (msgIndex < progressMessages.length) {
        addLog(progressMessages[msgIndex].msg, 'info');
        msgIndex++;
      }
    }, 8000); // ÊØ?8 ÁßíÂ??±‰?Ê¨°Á≥ªÁµ±Á???

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
        throw new Error(errData.error || `‰º∫Ê??®Â??âÈåØË™? ${response.status}`);
      }

      const responseData = await response.json();
      const generatedData = responseData.data;

      const newCompleted = [];
      const updatedContents = { ...currentContextContents };
      
      for (let i = startStep; i <= STEPS.length; i++) {
        if (generatedData[i]) {
          updatedContents[i] = generatedData[i];
          newCompleted.push(i);
          addLog(`[AI] ??Step ${i} ?ßÂÆπÂæûÊâπÊ¨°Â??éÂ??≥Â??¢Ô?`, 'success');
        }
      }

      setStepContents(updatedContents);
      setCompletedSteps(prev => [...new Set([...prev, ...newCompleted])]);

      addLog(`[System] ??${STEPS.length}-Step ?®Ëá™?ï‰??ÉÁî¢?∫Â??¢Ô??®Á??©Èô£?ßÂÆπÂ∑≤Â?Â¶•„ÄÇ`, 'success');
      setCredits(prevCredits => Math.max(0, prevCredits - 15));
      
      // ?™Â??ØÂá∫??Notion
      await startNotionExport(updatedContents, startTheme);

    } catch (error) {
      addLog(`[Error] ?πÊ¨°?üÊ?Â§±Ê?: ${error.message}ÔºåË?Á¢∫Ë? API Key È°çÂ∫¶?ñÁ∂≤Ë∑ØÈÄ???Ç`, 'error');
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
    addLog(`[Notion] Ê≠?ú®ÂæûÈõ≤Á´ØË??•Â?Ê°àË???..`, 'info');

    try {
      // ??Vercel Ë´ãÊ?Ë©?Notion ?ÅÈù¢?ÑË©≥Á¥∞ÂÖßÂÆ?
      const response = await fetch(`/api/notion/history?id=${pageId}`);
      const data = await response.json();

      if (data.stepsData) {
        // ?êÂ??ìÂ?ÂæåÔ?‰∏Ä?µÊ??ßÂÆπÂ°´Â?Á∑®ËºØ?®Ô?
        if (data.theme) setTheme(data.theme); 
        // Á¢∫‰?‰∏çÊ?Â∞?"undefined" Â≠ó‰∏≤Ë¶ÜË??â‰Ωø?®ËÄÖÈÅ∏Â•ΩÁ??óÁúæ
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
        addLog(`[Notion] ??Â∞àÊ?ËºâÂÖ•?êÂ?ÔºÅ`, 'success');
        setNotionStatus('??Â∑≤Ê??üÊ≠∏Ê™?);
        setNotionUrl(`https://www.notion.so/${pageId.replace(/-/g, '')}`);
        setViewState('workspace');
      }
    } catch (error) {
      addLog(`[Error] ËºâÂÖ•Â§±Ê?: ${error.message}`, 'error');
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
      alert(`Â≠óÊï∏Á∏ΩÂ? (${customContext.length} Â≠? Ë∂ÖÈ? 5000 Â≠ó‰??êÔ?Ë´ãÂà™Ê∏õÂÖßÂÆπÂ??çÂü∑Ë°åÔ?`);
      return;
    }
    if (!theme.trim() && !customContext.trim()) {
      alert("Ë´ãËº∏?•„Äå‰??É‰∏ªÈ°å„ÄçÊ??ê‰??åËá™Ë®ÇË??ØË??ô„ÄçÔ?Á≥ªÁµ±?çËÉΩ?∫ÊÇ®?≤Ë?‰ºÅÂ?Ôº?);
      return;
    }
    const finalTheme = theme.trim() || '?™Ë?‰ºÅÂ? (?™ÂëΩ??';
    addLog(`[System] ?? ?üÂ? ${STEPS.length}-Step ?≤Á´ØÂºïÊ?ÔºÅÁõÆÊ®ô‰??ÉÔ???{finalTheme}?è`, 'info');
    runAutoGeneration(finalTheme);
  };

  const startManualWorkspace = () => {
    if (customContext.length > 5000) {
      alert(`Â≠óÊï∏Á∏ΩÂ? (${customContext.length} Â≠? Ë∂ÖÈ? 5000 Â≠ó‰??êÔ?Ë´ãÂà™Ê∏õÂÖßÂÆπÂ??çÂü∑Ë°åÔ?`);
      return;
    }
    if (!theme.trim() && !customContext.trim()) {
      alert("Ë´ãËº∏?•„Äå‰??É‰∏ªÈ°å„ÄçÊ??ê‰??åËá™Ë®ÇË??ØË??ô„ÄçÔ?‰ª•‰æø?≤ÂÖ•?ãÂ?Â∑•‰??ÄÔº?);
      return;
    }
    const finalTheme = theme.trim() || '?™Ë?‰ºÅÂ? (?™ÂëΩ??';
    setMode('manual');
    setViewState('workspace');
    addLog(`[System] ?≤ÂÖ•?ãÂ?Á∑®ËºØÊ®°Â??ÇÁõÆÊ®ô‰??ÉÔ???{finalTheme}?è`, 'info');
  };

  const handleEditorChange = (e) => {
    const text = e.target.innerText;
    setStepContents(prev => ({ ...prev, [activeStep]: text }));
  };

  // --- ?∞Â?ÔºöË??ñÊú¨?∞Ê?‰ª∂ÂÖßÂÆ?---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setCustomContext(prev => {
        const newText = prev + (prev ? '\n\n' : '') + text;
        if (newText.length > 5000) {
          addLog(`[Error] ?ØÂÖ•Â§±Ê?ÔºöÂ?‰∏?${file.name} ?ßÂÆπÂæåÂ??∏È? ${newText.length} Â≠óÔ?Ë∂ÖÈ? 5000 Â≠ó‰??êÔ??∫ÈÅø?çË?ËºâË??™Ê??áÂ?ÔºÅ`, 'error');
          alert(`?ØÂÖ•Â§±Ê?ÔºöÂ??∏Á∏Ω??(${newText.length} Â≠? Ë∂ÖÈ? 5000 Â≠ó‰??êÔ?\\nÂª∫Ë≠∞?¥Êé•?∑Â?Á≤æËèØÊÆµËêΩ?≥ÂèØ?Ç`);
          return prev; // ?æÊ??ØÂÖ•ÔºåÁ∂≠?ÅÂ?Ê®?
        }
        addLog(`[System] Â∑≤Ê??üË??ñÊ?‰ª∂Ô?${file.name}`, 'success');
        return newText;
      });
    };
    reader.readAsText(file);
    e.target.value = null; // ?çÁΩÆ input ËÆìÂ?‰∏Ä?ãÊ?Ê°àÂèØ‰ª•È?Ë§á‰???
  };

  // --- ?∞Â?ÔºöÁõ¥?•ÂØ´??Step 1 ---
  const handleImportToStep1 = () => {
    if (!customContext.trim()) {
      addLog('[System] Ê≤íÊ??ßÂÆπ?ØÂåØ?•Ô?Ë´ãÂ?Ë≤º‰??ñ‰??≥Ë???, 'warning');
      return;
    }
    setStepContents(prev => ({ ...prev, 1: customContext }));
    setCompletedSteps(prev => [...new Set([...prev, 1])]); // Ê®ôË? Step 1 ?∫Â∑≤ÂÆåÊ?
    addLog('[System] ?? ?ÉËÄÉË??ôÂ∑≤?êÂ??ØÂÖ• Step 1 ?´Â?Ôº?, 'success');
  };

  const clearAllData = () => {
    if (window.confirm('Á¢∫Â?Ë¶ÅÊ?Á©∫Áï´Â∏ÉË??Ä?âÂ??çÁ?‰ºÅÂ?Ë≥áÊ??éÔ?ÔºàÊ≠§?ï‰??°Ê??ÑÂ?Ôº?)) {
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
      addLog('[System] ??Ô∏??ä‰??ÉË??ôÂ∑≤?®Êï∏Ê∏ÖÁ©∫ÔºåÈö®?ÇÂèØ?ãÂ??∞Â?Ê°à„Ä?, 'info');
    }
  };

  // ============================================================================
  // 5. ?πÂØ´?ãÂ??ÆÊ≠•?üÊ? (??Vercel API)
  // ============================================================================
  const triggerSingleStepAi = async () => {
    addLog(`[AI] Ê≠?ú®?≤Á´ØË´ãÊ?... ?çÊñ∞?∞ÂØ´ Step ${activeStep}`, 'info');
        setIsGenerating(true);
    
    try {
      const context = {
        theme: theme || "?™ÂëΩ?ç‰??É‰∏ªÈ°?,
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
      addLog(`[AI] ??Step ${activeStep} ?ßÂÆπ?üÊ?ÂÆåÁï¢ÔºÅÂ∑≤?êÂ?Ê∏≤Ê??≥Á∑®ËºØÂô®?Ç`, 'success');

    } catch (error) {
      console.error("?üÊ?Â§±Ê?:", error);
      addLog(`[Error] ?üÊ?Â§±Ê?: ${error.message}`, 'error');
      alert(`API ?ºÂè´Â§±Ê?ÔºåÈåØË™§Â??? ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

// --- ?ØÂá∫Ë≥áÊ???Notion ---
const startNotionExport = async (customContents = null, customTheme = null) => {
  setIsNotionExporting(true);
  setNotionStatus('Ê≠?ú®?åÊ≠•??Notion...');
  addLog(`[System] ?ãÂ?Â∞ÅË?‰ºÅÂ?Ë≥áÊ?ÔºåËá™?ïÊ??ôÂåØ??..`, 'info');

  try {
    // ?ºÂè´?ëÂÄëËá™Â∑±Á? Vercel ÂæåÁ´Ø Notion API
    const VERCEL_NOTION_URL = '/api/notion';
    
    const targetTheme = customTheme || theme || "?™ÂëΩ?ç‰??É‰∏ªÈ°?;
    const targetContents = customContents || stepContents;

    // Â∞ÅË??ÆÂ??Ä?âÁ?Ëº∏ÂÖ•?áÁ??êÁ??úÔ?Á¨¶Â?ÂæåÁ´Ø /api/notion ?êÊ??ÑÊ†ºÂº?
    const payload = {
      theme: targetTheme,
      stepsData: targetContents,
      creatorName: curTheme.title, // ?ïÊ??ìÂ??ÆÂ??∏Ê??ÑË??≤Â?Á®±Ô?‰æãÂ?ÔºöÂÖ®?∑ÂΩ±?≥Ââµ‰ΩúËÄÖÔ?
      audienceTheme: audienceTheme
    };

    const response = await fetch(VERCEL_NOTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`‰º∫Ê??®ÈåØË™? ${response.status}`);
    }

    const data = await response.json();
    
    setNotionStatus('??Â∑≤Ê??üÊ≠∏Ê™?);
    addLog(`[Notion] ??‰ºÅÂ??ØÂá∫?êÂ?ÔºÅ`, 'success');
    
    // ?™Â??ãÂ??õÂ?Âª∫Â•Ω??Notion ?ÅÈù¢‰∏¶ÂÑ≤Â≠?URL
    if (data.url) {
      setNotionUrl(data.url);
      fetchArchives(); // ?êÂ?ÂæåÁ??≥Âà∑?∞Ê≠∑?≤Ê???
      if (passcode.trim().toUpperCase() === 'MASTER') {
        window.open(data.url, '_blank');
      }
    }
    
  } catch (error) {
    console.error("Notion ?ØÂá∫Â§±Ê?:", error);
    setNotionStatus('??Ê≠∏Ê?Â§±Ê?');
    addLog(`[Error] ?ØÂá∫Â§±Ê?: ${error.message}`, 'error');
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
    addLog(`[Visual Hub] ?ãÂ??πÊ¨°?ºÈÄ?${visualGroups.length} Áµ?Prompt ??Imagen 4.0 API Á´ØÈ?...`, 'info');
    
    await Promise.all(visualGroups.map(group => generateGroupImage(group)));
    
    setIsGeneratingImage(false);
    addLog(`[Visual Hub] ?é® ?Ä??Imagen 4.0 ÂΩ±Â??üÊ?ÂÆåÁï¢ÔºÅ`, 'success');
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
      setAudienceTheme(ACCESS_CODES[code]); // ?πÊ?ÂØÜÁ¢º?™Â??áÊ?Â∞çÊ??ÑÂ??æ‰∏ªÈ°?
      setAuthError('');
      setLogs([{ time: new Date().toLocaleTimeString('en-US', { hour12: false }), text: `[System] ?àÊ??êÂ??ÇË???${ACCESS_CODES[code]} Â∑•‰??Ä?Ç`, type: "success" }]);
    } else {
      setAuthError('?°Ê??ÑÊ?Ê¨äÁ¢ºÔºåË??çÊñ∞Ëº∏ÂÖ•');
    }
  };

  // ?∞Â?ÔºöÂÖ®Â±Ä?îÊà™‰ΩøÁî®?ÖÁ?‰ªª‰??ç‰?ÔºàÈ??ä„ÄÅÈçµ?§Ô?ÔºåÂú®Ëß∏Áôº‰ªª‰? UI ?çÊ??™‰∏¶È°ØÁ§∫ÂØÜÁ¢ºÊ°?
  useEffect(() => {
    const handleInteraction = (e) => {
      if (!isAuthenticated && !showLoginPrompt) {
        setShowLoginPrompt(true);
        e.stopPropagation(); // ?ªÊ≠¢‰∫ã‰ª∂ÂæÄ‰∏ãÂÇ≥?ûÁµ¶Â∫ïÂ±§?ÑÊ???
        e.preventDefault();
      }
    };

    if (!isAuthenticated && !showLoginPrompt) {
      // ‰ΩøÁî® capture ?éÊÆµ?îÊà™‰∫ã‰ª∂ÔºåÁ¢∫‰øùËÉΩÁ¨¨‰??ÇÈ??ì‰?‰ΩøÁî®?ÖÁ??ç‰?
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
    return null; // Ëß?±∫ Hydration MismatchÔºåÁ??çÁ´Ø?õË?ÂÆåÊ??çÁπ™Ë£?UI
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
              { id: 'creation', icon: FileText, label: '?ßÂÆπ?µ‰?‰∏≠Â?' },
              { id: 'visual', icon: ImageIcon, label: 'Ë¶ñË¶∫?ºÊéß‰∏≠Â?' },
              { id: 'suno', icon: Music, label: 'Suno ?çÊ?‰∏≠Â?' },
              { id: 'notebook', icon: BookOpen, label: 'NotebookLM ÂΩ±Á?‰∏≠Â?' }
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
                  
                  {/* Ë¶ñË¶∫Ë£ÇË? (?®Â∑¶?¥ÈÅ∏?ÆË?Ë¶∫Áôº?ß‰∏≠ÂøÉ‰?) */}
                  {isActive && tab.id === 'visual' && (
                    <div className="mx-2 p-4 bg-[#0f172a]/70 border border-slate-800/80 rounded-xl space-y-4 backdrop-blur-md">
                      <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        Ë¶ñË¶∫Ë£ÇË?
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">ÂΩ±Èü≥Á∏ÆÂ?</label>
                          <select className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none">
                            <option>?∑ÂΩ±??/option>
                            <option>?≠ÂΩ±??/option>
                            <option>Á§æÁæ§FB/IG</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">Ëº∏Âá∫ÊØî‰?</label>
                          <select 
                            value={visualStep}
                            onChange={(e) => setVisualStep(Number(e.target.value))}
                            className="w-full bg-[#070b16] border border-slate-950 rounded-lg px-2 py-1.5 text-[11px] text-slate-300 focus:outline-none mb-3"
                          >
                            <option value={6}>{STEPS.find(s => s.id === 6)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 6)?.name || 'Ê©´Â?Á∏ÆÂ? (YouTube / FB)'}</option>
                            <option value={7}>{STEPS.find(s => s.id === 7)?.aspectRatio || '9:16'} - {STEPS.find(s => s.id === 7)?.name || '?≠Á??¥Â?Â∞ÅÈù¢ (Shorts / Reels)'}</option>
                            <option value={8}>{STEPS.find(s => s.id === 8)?.aspectRatio || '16:9'} - {STEPS.find(s => s.id === 8)?.name || '?èË±°??/ Êµ∑Â†±'}</option>
                            <option value={10}>{STEPS.find(s => s.id === 10)?.aspectRatio || '1:1 / 4:3'} - {STEPS.find(s => s.id === 10)?.name || 'Á§æÁæ§?®Êí≠ / Ë¶ñË¶∫Á¥†Ê?'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">ÂΩ±Â??üÊ?ÂºïÊ?</label>
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
                          <label className="text-[10px] text-slate-500 font-bold block mb-1">?´È¢®ÊøæÈè°</label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {['?ìËôπ?ªÁ´∂', 'ÂØ´ÂØ¶Ê•µÁ∞°', '3D Ë≥ΩÂ?', '?ãÁπ™?ïÊº´'].map((style, idx) => (
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
                <p className="font-semibold text-slate-300">Notion ???‰∏?/p>
                <p className="text-[9px] text-slate-500">v2.4.1 Active</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Light Mode Switcher */}
          <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs hover:bg-slate-900/40 transition-all">
            <div className="flex items-center gap-2.5">
              <Sun className="w-4 h-4 text-slate-500" />
              <span className="font-medium text-slate-400 text-[11px]">Ê∑∫Ëâ≤Ê®°Â?</span>
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
              placeholder="‰æãÂ?ÔºöÊó•?¨ÂØ∫ÂªüÊäΩÁ±§Êîª??
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-[#111827]/60 border border-slate-800/80 rounded-xl py-2 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
          </div>

          {/* Top Action Buttons & Metrics */}
          <div className="flex items-center gap-4">
            {/* ?ïÊ?È°ØÁ§∫?∞Â??àÊ??Ä??*/}
            {isCanvasEnv && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Canvas ?∞Â?Â∑≤Ê?Ê¨?/span>
              </div>
            )}

            {/* Ê∏ÖÁ©∫‰ºÅÂ??âÈ? (ÂæûÂ∑•‰ΩúÂ?Áßª‰?‰æ? */}
            <button 
              onClick={clearAllData}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Ê∏ÖÁ©∫‰ºÅÂ?</span>
            </button>

            {/* ‰∏Ä?µÂÖ®?™Â?Ê®°Â? Header Button / ‰∏≠Êñ∑?üÊ? */}
            {isGenerating ? (
              <button 
                onClick={() => {
                  setIsGenerating(false);
                  addLog("[System] ?üÊ?‰ΩúÊ•≠Â∑≤Áî±‰ΩøÁî®?ÖÊ??ï‰∏≠?∑„Ä?, "info");
                  setViewState('workspace');
                }}
                className="px-4 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all animate-pulse"
              >
                <X className="w-3.5 h-3.5" />
                <span>‰∏≠Êñ∑?üÊ?</span>
              </button>
            ) : (
              <button 
                onClick={handleStartAuto}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{completedSteps.length > 0 ? '?•Á??™Â??üÊ?' : '‰∏Ä?µÂÖ®?™Â?Ê®°Â?'}</span>
              </button>
            )}

            {/* Quota Metric Button */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500/20" />
              <span>{credits} ÈªûÈ?Â∫?/span>
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
                      ‰ªäÂ§©?≥Ââµ‰Ωú‰?È∫ºÔ?
                    </h2>
                    <p className="text-[11px] md:text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                      Ëº∏ÂÖ•‰Ω†ÊÉ≥?¢Ë??Ñ‰∏ªÈ°åÔ?AI Â∞áÁÇ∫‰Ω†Á??êÂ??îÁ©∂?ÅÈï∑?≠ÂΩ±?≥ËÖ≥?¨Âà∞Á§æÁæ§Ë≤ºÊ??ÑÂÖ®?ü‰??É„Ä?
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
                        placeholder="‰æãÂ?ÔºöÊó•?¨‰∫¨?™Á?‰∫îÊó•?äÊîª??
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        className="w-full relative bg-[#070b16] border border-slate-900 rounded-2xl px-6 py-4 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 transition-all shadow-inner"
                      />
                    </div>

                    {/* --- ?∞Â?ÔºöËá™Ë®ÇË??ØË??ôÂ? --- */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] text-slate-400 font-bold">?™Ë??åÊôØË≥áÊ? / ?ÉËÄÉÊ?‰ª?(?∏Â°´)</label>
                        <label className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-300 text-[9px] cursor-pointer transition-colors border border-slate-700">
                          <UploadCloud className="w-3 h-3" />
                          <span>‰∏äÂÇ≥ TXT/MD/CSV</span>
                          <input type="file" accept=".txt,.md,.csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                      </div>
                      <div className="relative">
                        <textarea
                          maxLength={5000}
                          placeholder="Ë´ãË≤º‰∏äÂ??ÉÊ?Á´†Ê?ÂÆòÊñπ?∞Ë?Á®?(Âª∫Ë≠∞?êÂà∂??5000 Â≠ó‰ª•?ßÔ??øÂ? AI Ë∂ÖË??ñËß∏?ºÈ?ÊµÅÈ??êÂà∂)?ÇÁ≥ªÁµ±Ê??®Â??ïÊ??™Â?Â∞áÊ≠§?ßÂÆπ?ØÂÖ•??Step 1 ‰ΩúÁÇ∫?∫Ê?Ë≥áÊ?..."
                          value={customContext}
                          onChange={(e) => setCustomContext(e.target.value)}
                          className={`w-full bg-[#070b16] border ${customContext.length >= 5000 ? 'border-red-500/50' : 'border-slate-900'} rounded-xl px-4 py-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/30 h-28 resize-none shadow-inner custom-scrollbar pb-6`}
                        />
                        <div className={`absolute bottom-2 right-3 text-[9px] font-mono ${customContext.length >= 5000 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                          {customContext.length} / 5000
                        </div>
                      </div>
                    </div>

                    {/* --- ?∞Â?ÔºöAPI Key Ëº∏ÂÖ•?Ä --- */}
                    {!isCanvasEnv && (
                      <div className="space-y-2 pt-2 border-t border-slate-900/50">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-slate-400 font-bold">Gemini API Key</label>
                          <span className="text-[9px] text-indigo-400 font-medium">???ØÊè¥Â§öÊ??ëÈë∞Ëº™Êõø (‰ª•ÈÄóË??ÜÈ?)</span>
                        </div>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="password"
                            placeholder="Ëº∏ÂÖ• API Key (?ØË≤º‰∏äÂ??äÈ??∞‰∏¶?®Â?ÂΩ¢ÈÄóË? , ?ÜÈ?)..."
                            value={geminiApiKey}
                            onChange={(e) => setGeminiApiKey(e.target.value)}
                            className="w-full bg-[#070b16] border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                          />
                        </div>
                      </div>
                    )}

                    {/* Big Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left: ‰∏Ä?µÂÖ®?™Â?Ê®°Â? */}
                      <button
                        onClick={handleStartAuto}
                        className={`py-4 rounded-2xl ${curTheme.primaryBtn} font-black text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-xl active:scale-98`}
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 fill-white" />
                          <span>{completedSteps.length > 0 ? '?•Á??™Â??üÊ?' : '‰∏Ä?µÂÖ®?™Â?Ê®°Â?'}</span>
                        </div>
                        <span className="text-[10px] opacity-70 font-normal">?ÆÊ¨°?ºÂè´ÔºåËá™?ïÂ??ïÁ??Ä?âÊ≠•È©üË?Ê≠∏Ê?</span>
                      </button>

                      {/* Right: ?ãÂ??ÜÊ≠•Á∑®ËºØ */}
                      <button
                        onClick={startManualWorkspace}
                        className="py-4 rounded-2xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-98"
                      >
                        <div className="flex items-center gap-2 text-slate-200">
                          <Sliders className="w-4 h-4 text-slate-400" />
                          <span>?ÜÊ≠•Á∑®ËºØÂ∑•‰?Êµ?/span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal">?ãÂ?Ë™øÊ†°ÔºåÈÄêÊ≠•Âª∫Ê?ÂÆ¢Ë£Ω?ñÁü©??Ö≥??/span>
                      </button>
                    </div>
                  </div>

                  {/* Notion Load Project Component */}
                  <div className="pt-4 border-t border-slate-900/60 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <UploadCloud className="w-4.5 h-4.5" />
                      <span className="text-xs font-bold">Âæ?Notion ËºâÂÖ•Â∑≤Ê≠∏Ê™îÂ?Ê°?/span>
                    </div>
                    
                    {/* Simulated dropdown */}
                    <div className="w-full relative">
                      <select 
                        value={selectedArchive}
                        onChange={handleLoadArchive}
                        disabled={passcode.trim().toUpperCase() !== 'MASTER'}
                        className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-4 py-3 text-xs font-semibold text-slate-400 hover:text-slate-200 focus:outline-none appearance-none cursor-pointer text-center disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <option value="">-- {archiveList.length === 0 ? 'ËºâÂÖ•Ê∏ÖÂñÆ‰∏?..' : 'ÈªûÊ??∏Ê??òÈ?Â∞àÊ?'} --</option>
                        
                        {/* ?ôË£°?ÉËá™?ïÊ? Notion Ë£°Èù¢?ÑÂ?Ê°àÂ?Á®±Ë??•Ê??óÂá∫‰æÜÔ? */}
                        {archiveList.map((item) => (
                          <option key={item.id} value={item.id}>
                            ?? {item.title} ({item.createdTime})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Ê∏ÖÁ©∫?âÈ? */}
                  <div className="pt-4 flex justify-center">
                    <button 
                      onClick={clearAllData}
                      className="text-[10px] text-red-500/70 hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Ê∏ÖÁ©∫?´Â??áË?‰ºÅÂ?Ë≥áÊ?
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
                    <span className={`${curTheme.accentText} text-[10px] font-mono`}>{completedSteps.length}/{STEPS.length} Â∑≤Â???/span>
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
                            ??ËøîÂ??µ‰?Â§ßÂª≥
                          </button>
                          <span className="text-slate-600">??/span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${curTheme.bgBadge}`}>
                            STEP {activeStep} ??{STEPS[activeStep-1]?.category || 'Loading'}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          {STEPS[activeStep-1]?.name || 'ËºâÂÖ•‰∏?..'}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{STEPS[activeStep-1]?.desc || 'Ê≠?ú®?åÊ≠•‰º∫Ê??®Ë®≠ÂÆöÊ?...'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button 
                          onClick={triggerSingleStepAi}
                          disabled={isGenerating}
                          className={`flex items-center gap-2 px-4 py-2.5 ${curTheme.primaryBtn} disabled:opacity-50 text-xs font-bold rounded-xl transition-all shadow-lg active:scale-95`}
                        >
                          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                          {isGenerating ? 'AI ?™Â??üÊ?‰∏?..' : 'AI ?çÊñ∞?üÊ??áÊΩ§È£?}
                        </button>
                      </div>
                    </div>

                    {/* Notion synced alert banner */}
                    {notionStatus === 'Â∑≤Â?Ê≠•Ëá≥ Notion' && (
                      <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4.5 h-4.5" />
                        <span>?¨‰??ÉÊ≠•È©üÂÖßÂÆπÂ∑≤??Notion ?≤Á´ØÊ™îÊ??≥Ê??åÊ≠•?ô‰ªΩ??/span>
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
                                a.download = `${theme || '‰ºÅÂ?'}_Step${activeStep}_${STEPS[activeStep-1]?.name.split(' ')[0] || 'Doc'}.md`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                              className="text-[10px] text-indigo-400 hover:text-white flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/30 transition-all border border-indigo-500/20 hover:border-indigo-500/50 cursor-pointer shadow-sm"
                              title="‰∏ãË?Ê≠§Ê≠•È©üÂÖßÂÆπÁÇ∫ Markdown Ê™îÊ?"
                            >
                              <Download className="w-3 h-3" />
                              ‰∏ãË? .md
                            </button>
                          )}
                          <div className="text-[10px] text-slate-500 font-medium">
                            Auto-saved locally
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 relative min-h-[500px]">
                        {/* AI ?∞ÂØ´?ÇÔ?È°ØÁ§∫ MP4 ËÆÄ?ñÂ???*/}
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
                              AI ?∏Â?ÂºïÊ?È´òÈÄüÈ?ÁÆó‰∏≠...
                            </h3>
                            <p className="text-slate-400 mt-3 text-sm flex items-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Ê≠?ú®?ìÂ?Ë≥áÊ?ÔºåË?Á®çÂÄ?
                            </p>
                          </div>
                        ) : (
                          /* ?üÊ?ÂÆåÁï¢ÂæåÔ?È°ØÁ§∫?üÊú¨?ÑÊ?Â≠óÁ∑®ËºØÂô® */
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
                      Ë¶ñË¶∫Ë™øÂ∫¶‰∏≠Â?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">?ßÂà∂?áÁ???16:9 YouTube Ê©´Â?Á∏ÆÂ???:16 ?≠Á??¥Â?Â∞ÅÈù¢?äÁ§æÁæ§Ë?Ë¶∫Á??ê„Ä?/p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Left Controls column */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md flex flex-col">

<div className="relative w-full flex-1 min-h-[500px]">
  
  {/* AI ?∞ÂØ´?ÇÔ?È°ØÁ§∫ MP4 ËÆÄ?ñÂ???*/}
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
        AI ÂºïÊ?È´òÈÄüÈ?ÁÆó‰∏≠...
      </h3>
      <p className="text-purple-300/60 mt-3 text-sm flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" />
        Ê≠?ú®?ìÂ?Ë≥áÊ?ÔºåË?Á®çÂÄ?
      </p>
    </div>
  ) : (
    
    /* ?üÊ?ÂÆåÁï¢ÂæåÔ?È°ØÁ§∫?üÊú¨?ÑÊ?Â≠óÁ∑®ËºØÂô® */
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
                      <span>{isGeneratingImage ? 'Ê≠?ú®?πÊ¨°Ê∏≤Ê?‰∏?..' : '??AI ?πÊ¨°Áπ™Ë£Ω?®ÈÉ®ÂΩ±Â?'}</span>
                    </button>
                  </div>

                  {/* Right Masonry Grid of images */}
                  <div className="col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Â∑≤Ê∏≤?ìÂ?È´îË??¢Â∫´ ({visualGroups.length})</h4>
                    
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
                                 <span className="text-[10px] text-purple-400">Ê≠?ú®?èÈ? {IMAGE_ENGINES.find(e => e.id === imageEngine)?.name || 'AI'} ?üÊ?...</span>
                               </div>
                            ) : (
                               <div className="text-slate-700 font-medium text-xs flex items-center gap-2">
                                 <ImageIcon className="w-4 h-4" /> Â∞öÊú™?üÊ?ÂΩ±Â?
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
                              <span>{generatingGroups[group.id] ? 'Ê≠?ú®Ê∏≤Ê?...' : '??AI Áπ™Ë£ΩÂΩ±Â? (-5 Èª?'}</span>
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

          {/* TAB 3: Suno ?çÊ?‰∏≠Â? */}
          {activeTab === 'suno' && (
            /* --- STREAMING_CHUNK:Rendering Suno AI Audio Center --- */
            <div className="flex-1 p-6 overflow-y-auto bg-[#0a0f1d] custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
                      <Music className="w-5 h-5 text-purple-400" />
                      Suno ?çÊ?‰∏≠Â?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">?∫ÊñºÂΩ±Á??óÁúæË™øÊÄßË??≥Êú¨ÁØÄÂ•èÔ?‰∏Ä?µË™ø??Suno API ?™Â??üÊ??üÂâµ?ÅÁÑ°?àÊ??èÈ??ÑÈ?Ê®Ç„Ä?/p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Lyrics generation */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">?çÊ?Ê≠åË??üÊ?</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">?çÊ?È¢®Ê†º (Style of Music)</label>
                        <input 
                          type="text" 
                          value={musicGenre} 
                          onChange={(e) => setMusicGenre(e.target.value)}
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Ê≠åË??ßÂÆπ / ?≥Ë™ø?∞Â?</label>
                        <textarea
                          value={stepContents[9]} 
                          onChange={(e) => setStepContents(prev => ({ ...prev, 9: e.target.value }))}
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl p-3 text-xs text-slate-300 focus:outline-none h-36 resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addLog("[Suno API] Ê≠?ú®Ë™øÂ∫¶?≥Ë?ÂºïÊ??∞ÂØ´?ÖÁ?ËªåË∑°...", "info");
                        setTimeout(() => {
                          addLog("[Suno API] ???≥Ë??üÊ??êÂ?ÔºÅÂ∑≤?†ÂÖ•‰∏ãÊñπ?çÊ?Â∫´„Ä?, "success");
                        }, 1500);
                      }}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span>?çÊñ∞Ë™øË£Ω?≥Ë?ËªåË∑°</span>
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
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest pt-2">?çÊ??üÊ?Â∫?/h4>
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
                              ‰ΩøÁî®Ê≠§Èü≥Ëª?
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
                      NotebookLM ÂΩ±Á??¥Â?‰∏≠Â?
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">?ØÂÖ•?∑ÂΩ±?á„ÄÅÂ??®Ê?Ê™îÊ??ÑÈü≥Ê™îÔ??™Â??üÊ?‰∏ªÈ??ú‰??ñ‰∏¶ËΩâË≠Ø?∫Á?ÊßãÂ?Â∞çË??áÂ≠∏ÁøíÊ??ó„Ä?/p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {/* Left input container */}
                  <div className="col-span-1 bg-[#0f172a]/70 border border-slate-900/80 rounded-2xl p-5 space-y-4 backdrop-blur-md">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Â§ñÈÉ®Ë≥áÊ?Â∫´ÂåØ??/h4>
                    
                    <div className="space-y-3">
                      <div className="p-4 border border-dashed border-slate-800 hover:border-emerald-500/40 rounded-xl bg-slate-900/10 text-center cursor-pointer transition-all">
                        <UploadCloud className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                        <span className="text-xs font-bold text-slate-400 block">?ñÊõ≥ Markdown/PDF ?∞ÈÄôË£°</span>
                        <span className="text-[10px] text-slate-600 block mt-1">??ÈªûÊ??∏Ê?‰∏äÂÇ≥</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">YouTube ?∑ÂΩ±??URL</label>
                        <input 
                          type="text" 
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full bg-[#070b16] border border-slate-950 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/40"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        addLog("[NotebookLM] Ê≠?ú®Ëß??ÂΩ±Á?Ë™ûÈü≥ÔºåÈÄ≤Ë?Ë™ûÊ??ú‰??ñÂ??âÂ???..", "info");
                        setTimeout(() => {
                          addLog("[NotebookLM] ???êÂ?Ëß???∑ÂΩ±?áÔ??òË?Ë≥áË?Â∑≤Á??ê„Ä?, "success");
                        }, 1200);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-500/10 active:scale-95"
                    >
                      <span>Ëß??ÂΩ±Á?‰∏¶Ë??•Ë??ØÂ∫´</span>
                    </button>
                  </div>

                  {/* NotebookLM key points display */}
                  <div className="col-span-2 space-y-4">
                    <div className="p-5 bg-[#0f172a]/40 border border-slate-900 rounded-2xl space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Award className="w-4 h-4" />
                        <span>AI ?üÊ??∑ÂΩ±?áÁü•Ë≠òÂç° (ÂΩ±Á??ÇÈï∑ 35 mins)</span>
                      </div>

                      <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-slate-200">?úÈçµ?òË? 01 - Ë∑®Âπ≥?∞Â?ÊµÅ‰?ÂøÖÁÑ∂Ë∂®Âã¢</p>
                          <p className="text-slate-400 mt-1">2026Âπ¥ÂñÆ‰∏ÄÁ§æÁæ§Âπ≥Âè∞ÊµÅÈ?Ê≠?ú®Á∑äÁ∏ÆÔºåÈ?Â∞ñÂâµ‰ΩúËÄÖÂ??àÂª∫Á´?YouTubeÔºàÈï∑?ºÂ?Ôº? TikTokÔºàÁü≠?ºÂ?Ôº? FB/IGÔºàÁ§æÁæ§ÂÆ£?≥Ô??ÑËá™?ïÂ?ÊµÅÁ≥ªÁµ±„Ä?/p>
                        </div>
                        <div className="border-l-2 border-emerald-500/40 pl-3">
                          <p className="font-bold text-slate-200">?úÈçµ?òË? 02 - Â§öÂ∑• AI ?™Âã¢</p>
                          <p className="text-slate-400 mt-1">‰ΩøÁî®?¥Â???Prompt ÊØîÂ??π‰??îËÉΩ?¥Â•Ω?ôÂ?‰∏ä‰??áÈ?‰øÇ„ÄÇ‰?Ê¨°Ëß£ÊßãÂÖ®?üÊ≠•È©üËÉΩ?âÊ??øÂ?ÂÆ?Ç≥?áÊ??áËÖ≥?¨Ë™ø?ß‰?‰∏Ä?¥Á??õÈ???/p>
                        </div>
                      </div>
                    </div>

                    {/* Quick interactive Q&As */}
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest pt-1">Âø´ÈÄüÂ?ËÆÄ?èÁ?</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { q: '?ôÊÆµ?ßÂÆπ?ÑÂ??æÁ?ÈªûÊòØ‰ªÄÈ∫ºÔ?', a: '‰∏ªË??®Êñº?çË??ÑÁôº?áÊ†ºÂºèÊ??à‰ª•?äËÖ≥?¨È??üÁì∂?∏„Ä? },
                        { q: '?®Â?‰ºÅÂ??áÂñÆÁ¥îÂØ´?≥Êú¨Â∑ÆÂú®?™Ô?', a: '?®Â?‰ºÅÂ??¥Â?‰∫ÜË??Ø„ÄÅÈï∑?≠Â??°„ÄÅSuno ?çÊ???SEOÔºå‰?Ê¨°Â??êÂ??çÁî¢?∫„Ä? }
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
          
          {/* AI ?Ä?ãÁõ£??Panel */}
          <div className="p-5 border-b border-slate-900/80">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3.5 h-3.5 rounded bg-slate-900 flex items-center justify-center">
                <Sliders className="w-2.5 h-2.5 text-slate-500" />
              </span>
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI ?Ä?ãÁõ£??/h4>
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

          {/* _> Á≥ªÁµ±?áÊó•Ë™?(Log Terminal Box) */}
          <div className="flex-1 p-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Á≥ªÁµ±?áÊó•Ë™?/h4>
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

        {/* ËøîÂ??µ‰?Â§ßÂª≥ */}
        <div className="flex justify-center pb-2 pt-2 border-t border-slate-900 bg-slate-950/20">
          <button
            onClick={() => {
              setActiveTab('creation');
              setViewState('hub');
            }}
            className="py-1.5 px-4 text-[11px] font-bold text-slate-400 bg-slate-900/50 hover:bg-slate-800 hover:text-white border border-slate-800 rounded transition-colors"
          >
            ËøîÂ??µ‰?Â§ßÂª≥
          </button>
        </div>

        {/* Bottom Part: Notion Synchronization Center */}
        <div className="p-5 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center gap-2 mb-3.5">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notion ?åÊ≠•‰∏≠Â?</h4>
          </div>

          <div className="space-y-4">
            {/* Sync status feedback */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Â≠òÊ??åÊ≠•?Ä??/span>
              <span className={`font-bold ${notionStatus === 'Â∑≤Â?Ê≠•Ëá≥ Notion' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {notionStatus}
              </span>
            </div>

            {/* Notion sync execution button */}
            {notionStatus === '??Â∑≤Ê??üÊ≠∏Ê™? ? (
              <div className="space-y-2 w-full">
                {/* ËÆ?MASTER ?ΩÈ??äÈ??üÂ?Ê°?*/}
                {(notionUrl && passcode.trim().toUpperCase() === 'MASTER') && (
                  <button
                    onClick={() => window.open(notionUrl, '_blank')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 shadow-inner active:scale-95 transition-all animate-pulse"
                  >
                    <Link className="w-4 h-4" />
                    <span>?çÂ? Notion ?•Á?Ê≠§‰???/span>
                  </button>
                )}
                {/* ?òÈ?Â∞àÊ?‰∏ãÊ??∏ÂñÆ (??MASTER ?ØÁî®) */}
                <div className="w-full relative mt-2">
                  <select
                    className="w-full py-2 pl-8 pr-8 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 text-slate-400 text-xs font-medium appearance-none cursor-pointer outline-none text-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    onChange={handleLoadArchive}
                    value={selectedArchive}
                    disabled={isLoadingArchive || passcode.trim().toUpperCase() !== 'MASTER'}
                  >
                    <option value="">?òÈ?Â∞àÊ?Â∫?(?ÖÈ? Master)</option>
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
                <span>{isNotionExporting ? 'Ê≠?ú®?≥Ëº∏?∏Ê?Â∫?..' : '?™Â??ØÂá∫ Notion'}</span>
              </button>
            )}
          </div>
        </div>

      </aside>

      {/* --- Global Auth Overlay (?èÊ??≤Ë≠∑ÁΩ©Ë?ÂØÜÁ¢º?ñÂ?) --- */}
      {(!isAuthenticated && showLoginPrompt) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#030712]/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
          <div 
            className="relative z-10 w-full max-w-sm p-8 bg-[#0f172a]/90 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} // ÈªûÊ?ÂØÜÁ¢ºÊ°ÜÂÖß?®‰??ÉÂ?Ê≥?
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 relative z-10">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider mb-2 relative z-10">OmniScript Pro</h2>
            <p className="text-xs text-slate-400 mb-8 text-center relative z-10">Ë´ãËº∏?•ÊÇ®?ÑÂ?Â±¨Â??æÊ?Ê¨äÁ¢º‰ª•Ëß£?ñÁ≥ªÁµ?/p>
            
            <form onSubmit={handleLogin} className="w-full space-y-4 relative z-10">
              <div>
                <input 
                  type="password"
                  value={passcode}
                  onChange={(e) => { setPasscode(e.target.value); setAuthError(''); }}
                  placeholder="Ëº∏ÂÖ•?àÊ?Á¢?
                  className="w-full bg-[#070b16] border border-slate-700 rounded-xl px-4 py-3 text-sm text-center text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all tracking-widest"
                  autoFocus
                />
              </div>
              {authError && <p className="text-red-400 text-[10px] text-center font-bold">{authError}</p>}
              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                Ëß??‰∏¶Áôª?•Â∑•‰ΩúÂ?
              </button>
            </form>

            {/* ?ãÁôºÊ∏¨Ë©¶?®Â???(‰∏äÁ?Áµ¶ÂÆ¢?∂Ê??ØÂ??ôÂ? div ?™Èô§) */}
            <div className="mt-12 grid grid-cols-4 gap-x-6 gap-y-2 text-[12px] text-slate-600 font-mono relative z-10">
              <span>TECH2026 (Ê∞ë‰?)</span>
              <span>GLAM2026 (ÁæéÂ?)</span>
              <span>INDIE2026 (?ÖÈ?)</span>
              <span>RUBY2026 (ÁæéÈ?)</span>
              <span>SKY2026 (ÂØµÁâ©)</span>
              
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
                ?ÄË¶?Gemini API Key
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              ?®ÁõÆ?çË??ºÁç®Á´ãÈ?Ë°åÊ®°ÂºèÔ?ÂøÖÈ?Ëº∏ÂÖ• Gemini API Key ?çËÉΩ?∑Ë???
              <br />
              <span className="text-indigo-400 font-medium mt-1 inline-block">??Á≥ªÁµ±?ØÊè¥?≤È?ÊµÅÊ??∂Ô??®ÂèØ‰ª•‰?Ê¨°Ë≤º‰∏äÂ??äÈ??∞Ô?‰∏¶‰Ωø?®Â?ÂΩ¢ÈÄóË? <code className="bg-indigo-500/20 px-1 rounded text-indigo-300">,</code> ?ÜÈ???/span>
            </p>
            
            <div className="space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Ëº∏ÂÖ• API Key (‰æãÂ?ÔºöAIzaSy..., AIzaSy..., AIzaSy...)"
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
                  Á¢∫Ë?‰∏¶È?ÂßãÂü∑Ë°?
                </button>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  ?çÂ??≥Ë? Gemini API Key
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
