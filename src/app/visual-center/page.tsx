"use client";
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  ImageIcon, Search, HardDrive, RefreshCw, Download, Share2, 
  Sparkles, Sliders, ChevronDown, Terminal, Image as ImageLucide, Zap, Cloud
} from 'lucide-react';

export default function VisualCenterApp() {
  // ==========================================
  // 1. ??恣??  // ==========================================
  const [visualStep, setVisualStep] = useState(6);
  const [stepContents, setStepContents] = useState({});
  const [parsedVisualGroups, setParsedVisualGroups] = useState([]);
  const [isParsingVisuals, setIsParsingVisuals] = useState(false);
  
  // ???賊????  const [groupImages, setGroupImages] = useState({});
  const [generatingGroups, setGeneratingGroups] = useState({});
  const [imageEngine, setImageEngine] = useState('gemini-3.1-flash-image');

  // Notion ?賊????  const [currentProjectTitle, setCurrentProjectTitle] = useState('撠頛撠?');
  const [archiveList, setArchiveList] = useState([]); 
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState("");
 
  const logsEndRef = useRef(null);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), text: "[System] Visual Center Standalone ?????Ｕ?, type: "info" },
    { time: new Date().toLocaleTimeString('en-US', { hour12: false }), text: "[System] 蝟餌絞撠梁???敺??亥?閬箄?研?, type: "default" }
  ]);

  // ==========================================
  // 2. ???? API ??
  // ==========================================
  
  // ?芸?頛 Notion 皜
  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const response = await fetch('https://gen-imprint.vercel.app/api/notion/history');
        const data = await response.json();
        if (data.history) {
          setArchiveList(data.history);
        }
      } catch (err) {
        console.error("?⊥?頛 Notion 撠?皜", err);
      }
    };
    fetchArchives();
  }, []);

  // ?園??甇仿??摰寞霈?嚗??啗圾??閬箏???  useEffect(() => {
    const content = stepContents[visualStep];
    if (!content) return;
    
    setIsParsingVisuals(true);
    fetch('https://gen-imprint.vercel.app/api/parse-visuals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, visualStep })
    })
      .then(res => res.json())
      .then(data => {
        setParsedVisualGroups(data.parsedGroups || []);
        setIsParsingVisuals(false);
        addLog(`[System] ??閫?? ${data.parsedGroups?.length || 0} 蝯?閬箇?Ｘ?隞亡, 'success');
      })
      .catch(err => {
        console.error('Parse visuals error:', err);
        setIsParsingVisuals(false);
        addLog(`[Error] ?單閫??憭望?`, 'error');
      });
  }, [stepContents, visualStep]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // ==========================================
  // 3. ?詨???摩
  // ==========================================
  const addLog = (message, type = 'default') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev, { time: timestamp, text: message, type }]);
  };

  const handleLoadArchive = async (e) => {
    const pageId = e.target.value;
    if (!pageId) return;

    setSelectedArchive(pageId);
    setIsLoadingArchive(true);
    addLog(`[Notion] 甇?敺蝡航??亙?獢???..`, 'info');

    try {
      const response = await fetch(`https://gen-imprint.vercel.app/api/notion/history?id=${pageId}`);
      const data = await response.json();

      if (data.stepsData) {
        setCurrentProjectTitle(data.theme || archiveList.find(a => a.id === pageId)?.title || '?芸??獢?);
        setStepContents({
          6: data.stepsData[6] || "",
          7: data.stepsData[7] || "",
          8: data.stepsData[8] || "",
          10: data.stepsData[10] || ""
        });
        addLog(`[Notion] ??撠?頛??嚗歇撠閬死?單鞈?摨怒, 'success');
      }
    } catch (error) {
      addLog(`[Error] 頛憭望?: ${error.message}`, 'error');
    } finally {
      setIsLoadingArchive(false);
    }
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
        
        const palettes = [
          { main: 'rgba(255, 251, 240, 1)', mainShadow: 'rgba(20, 10, 0, 0.7)', sub: 'rgba(240, 200, 80, 1)', subShadow: 'rgba(0, 0, 0, 0.58)' },
          { main: 'rgba(255, 223, 130, 1)', mainShadow: 'rgba(0, 0, 0, 0.8)', sub: 'rgba(255, 255, 255, 1)', subShadow: 'rgba(0, 0, 0, 0.7)' },
          { main: 'rgba(240, 245, 255, 1)', mainShadow: 'rgba(5, 15, 40, 0.8)', sub: 'rgba(150, 220, 255, 1)', subShadow: 'rgba(0, 5, 20, 0.7)' },
          { main: 'rgba(255, 200, 100, 1)', mainShadow: 'rgba(20, 10, 5, 0.8)', sub: 'rgba(255, 150, 80, 1)', subShadow: 'rgba(20, 5, 0, 0.7)' },
          { main: 'rgba(255, 240, 245, 1)', mainShadow: 'rgba(30, 10, 40, 0.8)', sub: 'rgba(230, 180, 255, 1)', subShadow: 'rgba(20, 0, 30, 0.7)' }
        ];
        const style = palettes[Math.floor(Math.random() * palettes.length)];
        
        const fontFamilies = [
          '"Ma Shan Zheng", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif',
          '"Zhi Mang Xing", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif',
          '"ZCOOL XiaoWei", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif',
          '"Noto Serif TC", "DFKai-SB", "BiauKai", "Kaiti TC", "STKaiti", serif' 
        ];
        const randomFontFamily = fontFamilies[Math.floor(Math.random() * fontFamilies.length)];
        const fontStr = (size) => `bold ${size}px ${randomFontFamily}`;
        
        if (visualStep === 7 && mainTitle) {
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
          const startX = width * 0.75;
          const startY = height * 0.15;
          ctx.font = fontStr(poetryFontSize);
          const cleanText = poetry.replace(/[嚗?嚗??s]/g, "");
          const lines = [];
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
    
    const engineName = imageEngine.includes('gemini') ? 'Gemini 3.1' : 'Imagen 3';
    addLog(`[${engineName}] ?? ${groupId} 蝜芾ˊ?脩?...`, 'info');
    
    try {
      let aspectRatio = "1:1";
      if (visualStep === 6 || visualStep === 8) aspectRatio = "16:9";
      if (visualStep === 7) aspectRatio = "9:16";
      if (visualStep === 10) aspectRatio = "4:3";
      
      let flashPrompt = prompt;
      if (imageEngine.includes('gemini') && (mainTitle || subTitle || poetry)) {
        flashPrompt += `\n\nMust integrate the following text into the image explicitly with beautiful typography matching the theme:`;
        if (mainTitle) flashPrompt += `\nMain Title: ${mainTitle}`;
        if (subTitle) flashPrompt += `\nSubtitle: ${subTitle}`;
        if (poetry) flashPrompt += `\nPoetry (vertical layout preferred): ${poetry.replace(/\\s+/g, ' ')}`;
      }
      
      const finalPrompt = imageEngine.includes('gemini') 
        ? `${flashPrompt}\n(Please generate image with aspect ratio ${aspectRatio})`
        : flashPrompt;

      const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://gen-imprint.vercel.app';
      const apiUrl = `${baseUrl}/api/generate-image`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspectRatio: aspectRatio,
          model: imageEngine
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(`API Error: ${data.error || response.statusText}`);
      
      let base64 = "";
      if (data.image) {
        base64 = data.image.split(',')[1];
      } else {
        throw new Error("璅∪??芸??喳?????);
      }
      
      if (base64) {
        const originalImage = `data:image/png;base64,${base64}`;
        
        let finalImage = originalImage;
        if (!imageEngine.includes('gemini')) {
          finalImage = await applyTextOverlayToImageBase64(originalImage, mainTitle, subTitle, poetry);
        }
        
        setGroupImages(prev => ({ ...prev, [groupId]: finalImage }));
        addLog(`[${engineName}] ??${groupId} 皜脫?摰?嚗, 'success');
      }
    } catch (err) {
      const engineName = imageEngine.includes('gemini') ? 'Gemini 3.1' : 'Imagen 3';
      addLog(`[${engineName}] 蝜芾ˊ憭望?: ${err.message}`, 'error');
    } finally {
      setGeneratingGroups(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const generateBatchImages = async () => {
    if (parsedVisualGroups.length === 0) return;
    setIsGeneratingBatch(true);
    addLog(`[Visual Hub] ???寞活?潮?${parsedVisualGroups.length} 蝯?Prompt...`, 'info');
    
    await Promise.all(parsedVisualGroups.map(group => generateGroupImage(group)));
    
    setIsGeneratingBatch(false);
    addLog(`[Visual Hub] ? ??蔣?????ｇ?`, 'success');
  };

  const handleDownloadImage = (url, filename) => {
    if (!url) {
      addLog(`[System] 撠??敶勗?嚗瘜?頛, 'error');
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
  // 4. UI 皜脫?
  // ==========================================
  return (
    <div className="flex h-screen bg-[#030712] text-slate-100 font-sans overflow-hidden">
      
      {/* --- 撌血閮剖?????皞??--- */}
      <aside className="w-80 bg-[#070b16] border-r border-slate-900 flex flex-col z-20 shrink-0">
        
        {/* Header Logo */}
        <div className="p-6 border-b border-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <ImageLucide className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white">Visual Center</h1>
              <p className="text-[10px] text-slate-400 font-mono">Standalone Engine</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Section 1: 鞈?靘? (Notion) */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-400" /> 鞈?摨怠???            </h4>
            <div className="relative">
              <select 
                value={selectedArchive}
                onChange={handleLoadArchive}
                disabled={isLoadingArchive}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl px-4 py-3 text-xs font-semibold text-slate-300 appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">{isLoadingArchive ? '頛銝?..' : '-- 暺??豢? Notion ?脩垢撠? --'}</option>
                {archiveList.map(item => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>?桀?撠?: <strong className="text-slate-300">{currentProjectTitle}</strong></span>
              {isLoadingArchive && <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />}
            </div>
          </div>

          <div className="h-px bg-slate-900 w-full" />

          {/* Section 2: 閬死? */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> 閬死?閮剖?
            </h4>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">敶勗???撘?</label>
              <select 
                value={imageEngine}
                onChange={(e) => setImageEngine(e.target.value)}
                className="w-full bg-[#0a0f1d] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="gemini-3.1-flash-lite-image">Nano Banana 2 Lite (璆菟??雿?</option>
                <option value="gemini-3.1-flash-image">Nano Banana 2 (?祉/擃?鞈?</option>
                <option value="gemini-3-pro-image">Nano Banana Pro (銴?閬死/蝎曄Ⅱ?批)</option>
                <option value="imagen-3.0-generate-002">Imagen 3.0 (???箇?甈?</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold block mb-1">頛詨瘥???雿?/label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { val: 6, label: '16:9 璈怠?蝮桀? (YouTube/FB)', icon: '?儭? },
                  { val: 7, label: '9:16 ?剔??游?撠 (Shorts)', icon: '?' },
                  { val: 8, label: '16:9 敶拙◢憸冽?情??, icon: '?' },
                  { val: 10, label: '4:3 蝷曄黎閬死蝝? (IG Post)', icon: '?儭? }
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
                    <span>{opt.icon}</span> {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="h-px bg-slate-900 w-full" />

          {/* Section 3: ???單?汗 (?迂??靽格) */}
          <div className="space-y-2 flex-1 flex flex-col min-h-[250px]">
             <div className="flex items-center justify-between">
               <label className="text-[10px] text-slate-400 font-bold">?? Markdown ?單鞈?摨?/label>
               {isParsingVisuals && <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />}
             </div>
             <textarea
               value={stepContents[visualStep] || ''}
               onChange={(e) => setStepContents(prev => ({ ...prev, [visualStep]: e.target.value }))}
               placeholder="敺??寡??亙?獢???亙甇方票銝?閬?Markdown ?單..."
               className="w-full flex-1 bg-[#0a0f1d] border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 font-mono resize-none focus:outline-none focus:border-indigo-500/50 custom-scrollbar"
             />
          </div>

        </div>
      </aside>

      {/* --- ?喳銝餃極雿?嚗??????怠? --- */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0a0f1d] relative">
        
        {/* Top Action Bar */}
        <header className="h-16 border-b border-slate-900 bg-[#0a0f1d]/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 rounded bg-slate-900/50 border border-slate-800 text-xs font-mono text-slate-400">
              閫????? {parsedVisualGroups.length > 0 ? <span className="text-emerald-400 font-bold">{parsedVisualGroups.length} 蝯??/span> : '蝑?頛詨'}
            </div>
          </div>

          <button
            onClick={generateBatchImages}
            disabled={isGeneratingBatch || parsedVisualGroups.length === 0}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingBatch ? '甇??寞活皜脫?銝?..' : '???寞活皜脫??桀??恍'}</span>
          </button>
        </header>

        {/* Masonry Canvas Area */}
        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
          {parsedVisualGroups.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
               <ImageLucide className="w-16 h-16 opacity-20" />
               <p className="text-sm font-medium tracking-widest uppercase">蝑?閬死?單鞈?頛詨</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parsedVisualGroups.map((group) => (
                <div key={group.id} className="group bg-[#0f172a]/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all hover:border-slate-700">
                  
                  {/* Image Display Area */}
                  <div className="w-full bg-[#030712] relative flex items-center justify-center overflow-hidden aspect-video border-b border-slate-800">
                    {groupImages[group.id] ? (
                        <img src={groupImages[group.id]} alt={group.title} className="w-full h-full object-cover" />
                    ) : generatingGroups[group.id] ? (
                        <div className="flex flex-col items-center gap-3">
                          <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
                          <span className="text-xs text-indigo-400 font-medium tracking-wider">AI 皜脫?銝?..</span>
                        </div>
                    ) : (
                        <div className="text-slate-700 flex flex-col items-center gap-2">
                          <ImageIcon className="w-8 h-8 opacity-50" />
                          <span className="text-[10px] font-medium tracking-widest">蝑???</span>
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
                        </div>
                      </div>
                      <h5 className="text-sm font-bold text-slate-200 mb-1">{group.title}</h5>
                      <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-3">{group.prompt}</p>
                    </div>
                    
                    <button
                      onClick={() => generateGroupImage(group)}
                      disabled={generatingGroups[group.id]}
                      className="w-full py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{generatingGroups[group.id] ? '蝜芾ˊ銝?..' : '?桀撐???'}</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs Terminal (Bottom) */}
        <div className="h-48 border-t border-slate-900 bg-[#070b16] shrink-0 flex flex-col">
          <div className="px-6 py-2 bg-slate-900/40 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">蝟餌絞鈭辣?亥?</span>
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[10px] overflow-y-auto space-y-1.5 custom-scrollbar bg-black/20">
            {logs.map((log, index) => {
              let colorClass = "text-slate-400";
              if (log.type === 'info') colorClass = "text-blue-400";
              if (log.type === 'success') colorClass = "text-emerald-400";
              if (log.type === 'error') colorClass = "text-red-400";
              return (
                <div key={index} className="leading-relaxed">
                  <span className="text-slate-600">[{log.time}]</span>{' '}
                  <span className={colorClass}>{log.text}</span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        </div>

      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(71, 85, 105, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99, 102, 241, 0.5); }
      `}} />
    </div>
  );
}
