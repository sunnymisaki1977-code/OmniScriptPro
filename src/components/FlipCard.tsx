"use client";

import { useState } from 'react';
import { Music, CheckCircle2, Sparkles } from 'lucide-react';

interface FlipCardProps {
  theme: string;
  frontImage: string;
  frontText: string;
  frontTags: string;
  backInput: string;
  systemTasks: string[];
}

export default function FlipCard({
  theme,
  frontImage,
  frontText,
  frontTags,
  backInput,
  systemTasks
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-[320px] sm:h-[400px] perspective-1000 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`w-full h-full relative transform-style-3d transition-transform duration-700 ease-in-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ==================== 
            卡片正面 (The Wow) 
            ==================== */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-700">
          {/* 背景圖片 (或漸層佔位) */}
          {frontImage.startsWith('/') || frontImage.startsWith('http') ? (
            <img 
              src={frontImage} 
              alt={theme} 
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${frontImage} opacity-80`} />
          )}

          {/* 漸層黑色遮罩 (收斂至底部 50%) */}
          <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/95 to-transparent pointer-events-none" />

          {/* 右上角：Suno 音軌指示器 */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2">
            <Music className="w-4 h-4 text-emerald-400" />
            <span className="text-white text-xs font-medium tracking-wider">Audio Active</span>
            <div className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_100ms]"></span>
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
              <span className="w-1 h-2 bg-emerald-400 rounded-full animate-[bounce_1s_infinite_300ms]"></span>
            </div>
          </div>

          {/* 左上角：受眾標籤 */}
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
            <span className="text-white text-xs font-bold">{theme}</span>
          </div>

          {/* 底部內容：腳本與標籤 */}
          <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
            <p className="text-white text-sm sm:text-base font-medium leading-relaxed mb-3 line-clamp-3 text-shadow">
              {frontText}
            </p>
            <p className="text-emerald-400 font-bold text-xs sm:text-sm mb-6">
              {frontTags}
            </p>
            
            {/* 呼吸燈按鈕提示 (強化發光與質感) */}
            <div className="flex items-center justify-center">
              <div className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-yellow-400/50 shadow-[0_0_15px_rgba(250,204,21,0.3)] px-6 py-2.5 rounded-full inline-flex items-center gap-2 transition-all animate-pulse">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span className="text-white font-bold text-sm">揭密背後魔法</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 
            卡片背面 (The How) 
            ==================== */}
        <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl bg-slate-900 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] border border-slate-700 rotate-y-180 p-6 sm:p-8 flex flex-col justify-center relative">
          
          {/* 背景裝飾 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 w-full max-w-sm mx-auto">
            {/* 使用者輸入區 (極簡) */}
            <div className="mb-8">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                User Input
              </p>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 relative">
                {/* 對話框小尾巴 */}
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white/5 border-b border-r border-white/10 transform rotate-45"></div>
                <p className="text-white text-lg font-medium leading-relaxed">
                  "{backInput}"
                </p>
              </div>
            </div>

            {/* 系統處理任務清單 */}
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                System Orchestration
              </p>
              <ul className="space-y-3">
                {systemTasks.map((task, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm leading-relaxed">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 翻轉回來提示 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-slate-500 text-xs">
            Tap to flip back
          </div>
        </div>
      </div>
    </div>
  );
}
