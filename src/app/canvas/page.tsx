'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, RefreshCw, Image as ImageIcon, ArrowLeft } from 'lucide-react';

export default function GeminiCanvasPage() {
  const [promptData, setPromptData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Load prompt data from localStorage
    const data = localStorage.getItem('canvas_prompt_data');
    if (data) {
      try {
        setPromptData(JSON.parse(data));
      } catch (e) {
        console.error('Failed to parse prompt data');
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!promptData) return;
    setIsGenerating(true);
    setErrorMsg('');
    
    try {
      // Fetch gemini API key (assuming stored in localStorage by main app, or we can prompt for it)
      let apiKey = localStorage.getItem('gemini_api_key');
      if (!apiKey) {
         // Fallback or prompt
         apiKey = window.prompt("請輸入您的 Gemini API Key (為確保獨立環境運行安全，此金鑰僅存於當前瀏覽器階段):");
         if (!apiKey) {
            throw new Error('未提供 Gemini API Key。');
         }
         localStorage.setItem('gemini_api_key', apiKey);
      }

      const { prompt, imageEngine, aspectRatio } = promptData;
      let base64 = "";

      let apiUrl = '';
      let bodyStr = '';
      
      // Determine if it's the new generateContent endpoint or old predict
      if (imageEngine && imageEngine.includes('gemini')) {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${imageEngine}:generateContent?key=${apiKey}`;
        bodyStr = JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio: aspectRatio || "16:9" }
          }
        });
      } else {
        const engine = imageEngine || 'imagen-3.0-generate-002';
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${engine}:predict?key=${apiKey}`;
        bodyStr = JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1, aspectRatio: aspectRatio || "16:9" }
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(`API Error: ${data.error?.message || response.status}`);
      
      if (imageEngine && imageEngine.includes('gemini')) {
        if (data.candidates && data.candidates[0] && data.candidates[0].content?.parts?.[0]?.inlineData?.data) {
          base64 = data.candidates[0].content.parts[0].inlineData.data;
        } else {
          throw new Error("未收到圖片資料 (generateContent 回傳格式錯誤)");
        }
      } else {
        if (data.predictions && data.predictions[0]) {
          base64 = data.predictions[0].bytesBase64Encoded;
        } else {
          throw new Error("未收到圖片資料 (predict 回傳格式錯誤)");
        }
      }
      
      if (base64) {
        setGeneratedImageUrl(`data:image/jpeg;base64,${base64}`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || '生成失敗，請檢查 API Key 或網路連線');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl || !promptData) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `GeminiCanvas_${promptData.title || 'Image'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!promptData) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p>正在載入繪圖資料...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-slate-800/60 bg-[#0a0f1d] flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.close()} 
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              GEMINI CANVAS 獨立運行環境
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5 tracking-wider">
              {promptData.theme} | {promptData.title}
            </p>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex p-6 gap-6 max-w-[1600px] mx-auto w-full h-[calc(100vh-80px)]">
        {/* Left: Prompt & Settings */}
        <div className="w-[400px] flex flex-col gap-4 h-full">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              生圖指令配置
            </h2>
            
            <div className="space-y-4 flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">
                  使用的模型引擎
                </label>
                <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
                  {promptData.imageEngine || '預設模型'}
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">
                  長寬比例
                </label>
                <div className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
                  {promptData.aspectRatio || '16:9'}
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-[200px]">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 block">
                  Prompt 提示詞
                </label>
                <textarea 
                  readOnly
                  className="w-full flex-1 bg-[#070b16] border border-slate-800 rounded-xl p-3 text-xs text-slate-400 font-mono resize-none focus:outline-none custom-scrollbar"
                  value={promptData.prompt}
                />
              </div>
            </div>

            <div className="shrink-0 pt-4 mt-2 border-t border-slate-800">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    正在深度渲染中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    開始生成影像
                  </>
                )}
              </button>
              
              {errorMsg && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium break-all">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Canvas Preview */}
        <div className="flex-1 bg-[#0a0f1d] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col relative shadow-2xl h-full">
          {/* Canvas Toolbar */}
          <div className="px-4 py-3 bg-[#0f172a]/80 border-b border-slate-800 flex justify-end shrink-0 z-20">
            <button
              onClick={handleDownload}
              disabled={!generatedImageUrl}
              className="px-4 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              下載無浮水印原圖
            </button>
          </div>
          
          {/* Canvas Area */}
          <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f1d]/80 pointer-events-none z-10" />
            
            {/* Texture background */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')" }} 
            />

            {isGenerating ? (
              <div className="relative z-20 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Gemini Canvas 正在繪製您的畫面...
                </h3>
              </div>
            ) : generatedImageUrl ? (
              <img 
                src={generatedImageUrl} 
                alt="Generated Canvas" 
                className="relative z-20 max-w-full max-h-full rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700/50 object-contain"
              />
            ) : (
              <div className="relative z-20 text-slate-600 flex flex-col items-center gap-3">
                <ImageIcon className="w-16 h-16 opacity-20" />
                <p className="text-sm font-medium tracking-widest uppercase">Canvas Ready</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
      `}} />
    </div>
  );
}
