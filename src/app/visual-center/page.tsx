"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  ImageIcon, RefreshCw, Download, Share2, 
  Sparkles, Sliders, ChevronDown, Image as ImageLucide, Cloud,
  Key, CheckCircle2, X
} from 'lucide-react';

export default function VisualCenterApp() {
  // ==========================================
  // 1. 狀態管理
  // ==========================================
  const [visualStep, setVisualStep] = useState(6);
  const [stepContents, setStepContents] = useState<Record<number, string>>({});
  const [parsedVisualGroups, setParsedVisualGroups] = useState<any[]>([]);
  const [isParsingVisuals, setIsParsingVisuals] = useState(false);
  
  // 影像生成狀態
  const [groupImages, setGroupImages] = useState<Record<string, string>>({});
  const [generatingGroups, setGeneratingGroups] = useState<Record<string, boolean>>({});
  const [imageEngine, setImageEngine] = useState('flash'); // 'flash' | 'imagen4'
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  // Notion 專案狀態
  const [currentProjectTitle, setCurrentProjectTitle] = useState('尚未載入專案');
  const [archiveList, setArchiveList] = useState<any[]>([]); 
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");
 
  // API Key 狀態
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), text: "[System] 視覺發控中心已啟動", type: "info" }
  ]);

 
  
  // 自動載入 Notion 存檔清單
  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const response = await fetch('https://omni-script-pro.vercel.app/api/notion/history');
        const data = await response.json();
        if (data.history) {
          setArchiveList(data.history);
        }
      } catch (err) {
        console.error("無法載入 Notion 歷史存檔", err);
      }
    };
    fetchArchives();
  }, []);

  // 當選擇的步驟內容改變時，自動解析 Prompt
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

  // ==========================================
  // 3. 核心功能邏輯
  // ==========================================
  const addLog = (message: string, type = 'default') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time: timestamp, text: message, type }]);
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
          6: data.stepsData[6] || "",
          7: data.stepsData[7] || "",
          8: data.stepsData[8] || "",
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
    
    const engineName = imageEngine === 'flash' ? 'Gemini 2.5 Flash' : 'Imagen 4.0';
    addLog(`[${engineName}] 啟動 ${groupId} 繪製進程...`, 'info');
    
    try {
      const activeApiKey = apiKey || (typeof window !== 'undefined' && (window as any).__GEMINI_API_KEY__ ? (window as any).__GEMINI_API_KEY__ : "");
      
      let aspectRatio = "1:1";
      if (visualStep === 6 || visualStep === 8) aspectRatio = "16:9";
      if (visualStep === 7) aspectRatio = "9:16";
      if (visualStep === 10) aspectRatio = "4:3";
      
      let base64 = "";

      if (imageEngine === 'flash') {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${activeApiKey}`;
        
        let flashPrompt = prompt;
        if (mainTitle || subTitle || poetry) {
          flashPrompt += `\n\nMust integrate the following text into the image explicitly with beautiful typography matching the theme:`;
          if (mainTitle) flashPrompt += `\nMain Title: ${mainTitle}`;
          if (subTitle) flashPrompt += `\nSubtitle: ${subTitle}`;
          if (poetry) flashPrompt += `\nPoetry (vertical layout preferred): ${poetry.replace(/\s+/g, ' ')}`;
        }
        
        // Flash Image 尚未直接支援 aspectRatio 參數，因此附加在 Prompt 結尾引導模型
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
            instances: [{ prompt: prompt }],
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
        if (imageEngine !== 'flash') {
          // 只有 Imagen 4 需要本地端字型疊加，Gemini 2.5 Flash 直接由模型產出內建字體
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

  const handleDownloadImage = (url: string | undefined, filename: string) => {
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

  // ==========================================
  // 4. UI 渲染
  // ==========================================
  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden">
      
      {/* --- 左側控制面板 --- */}
      <aside className="w-80 bg-[#070b16] border-r border-slate-900 flex flex-col z-20 shrink-0">
        
        {/* Header Logo */}
        <div className="p-6 border-b border-slate-900/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <ImageLucide className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-white">OmniScript PRO</h1>
                <p className="text-[10px] text-slate-400 font-mono">Standalone Engine</p>
              </div>
            </div>
            <button onClick={() => setShowApiKeyModal(true)} className="p-2 bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-800" title="設定 API Key">
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Section 1: 匯入資料 (Notion) */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-400" /> 歷史專案庫
            </h4>
            <div className="relative">
              <select 
                value={selectedArchive}
                onChange={handleLoadArchive}
                disabled={isLoadingArchive}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold text-slate-300 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">{isLoadingArchive ? '讀取中...' : '-- 請選擇 Notion 專案 --'}</option>
                {archiveList.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>當前專案: <strong className="text-slate-300">{currentProjectTitle}</strong></span>
              {isLoadingArchive && <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />}
            </div>
          </div>

          <div className="h-px bg-slate-900 w-full" />

          {/* Section 2: 繪圖參數設定 */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> 渲染參數設定
            </h4>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">影像生成模型 (直接前端呼叫)</label>
              <select 
                value={imageEngine}
                onChange={(e) => setImageEngine(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="flash">Gemini 2.5 Flash Image Preview (generateContent)</option>
                <option value="imagen4">Imagen 4.0 Generate (predict)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">指定輸出格式</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { val: 6, label: '16:9 長影音縮圖 (YouTube)' },
                  { val: 7, label: '9:16 短影音封面 (Shorts)' },
                  { val: 8, label: '16:9 橫向情境意象圖' },
                  { val: 10, label: '4:3 社群視覺素材 (IG/FB)' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setVisualStep(opt.val)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                      visualStep === opt.val 
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300' 
                        : 'bg-[#0a0f1d] border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-px bg-slate-900 w-full" />

          {/* Section 3: Markdown 指令預覽 */}
          <div className="space-y-2 flex-1 flex flex-col min-h-[250px]">
             <div className="flex items-center justify-between">
               <label className="text-[10px] text-slate-400 font-bold">當前步驟 Markdown 劇本</label>
               {isParsingVisuals && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
             </div>
             <textarea
               value={stepContents[visualStep] || ''}
               onChange={(e) => setStepContents(prev => ({ ...prev, [visualStep]: e.target.value }))}
               placeholder="從 Notion 載入專案，或直接貼上 Markdown 劇本..."
               className="w-full flex-1 bg-[#0a0f1d] border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 font-mono resize-none focus:outline-none focus:border-indigo-500/50 custom-scrollbar"
             />
          </div>

        </div>
      </aside>

      {/* --- 右側展示與渲染區 --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0f1d] relative">
        
        {/* Top Action Bar */}
        <header className="h-16 border-b border-slate-900 bg-[#0a0f1d]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-400">
              就緒數量： {parsedVisualGroups.length > 0 ? <span className="text-emerald-400 font-bold">{parsedVisualGroups.length} 組</span> : '等待載入'}
            </div>
          </div>

          <button
            onClick={generateBatchImages}
            disabled={isGeneratingBatch || parsedVisualGroups.length === 0}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingBatch ? '正在批次渲染中...' : '✨ 一鍵批次渲染全部'}</span>
          </button>
        </header>

        {/* Masonry Canvas Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {parsedVisualGroups.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
               <ImageLucide className="w-16 h-16 opacity-20" />
               <p className="text-sm font-medium tracking-widest uppercase">請載入專案以檢視預定圖庫</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {parsedVisualGroups.map((group) => (
                <div key={group.id} className="group bg-[#0f172a]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all hover:border-slate-700">
                  
                  {/* Image Display Area */}
                  <div className="w-full bg-[#030712] relative flex items-center justify-center overflow-hidden aspect-video border-b border-slate-800">
                    {groupImages[group.id] ? (
                        <img src={groupImages[group.id]} alt={group.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                    ) : generatingGroups[group.id] ? (
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                          <span className="text-xs text-indigo-400 font-medium tracking-wider">AI 繪製中...</span>
                        </div>
                    ) : (
                        <div className="text-slate-700 flex flex-col items-center gap-2">
                          <ImageIcon className="w-8 h-8 opacity-50" />
                          <span className="text-[10px] font-medium tracking-widest">尚未生成</span>
                        </div>
                    )}
                  </div>
                  
                  {/* Info & Controls */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                          {group.id}
                        </span>
                        <div className="flex gap-1.5">
                          <button onClick={() => handleDownloadImage(groupImages[group.id], group.title)} className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h5 className="text-sm font-bold text-slate-200 mb-1">{group.title}</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">{group.prompt}</p>
                    </div>
                    
                    <button
                      onClick={() => generateGroupImage(group)}
                      disabled={generatingGroups[group.id]}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 shadow-inner active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{generatingGroups[group.id] ? '處理中...' : '單張強制重新繪製'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* 底部 Log 視窗 (可選) */}
      <div className="fixed bottom-4 right-8 w-80 max-h-40 bg-[#070b16]/95 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-4 flex flex-col z-50">
        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
          系統日誌
        </h4>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-2">
          {logs.map((log, i) => (
            <div key={i} className="text-[10px] font-mono leading-relaxed">
              <span className="text-slate-500 mr-2">[{log.time}]</span>
              <span className={
                log.type === 'success' ? 'text-emerald-400' :
                log.type === 'error' ? 'text-red-400' :
                log.type === 'info' ? 'text-indigo-400' : 'text-slate-300'
              }>{log.text}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700/50 p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-indigo-400" />
                設定 Gemini API Key
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  placeholder="輸入 API Key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#070b16] border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  確認並儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
      `}} />
    </div>
  );
}
