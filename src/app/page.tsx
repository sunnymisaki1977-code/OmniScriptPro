"use client";

import { useWorkflow } from "@/context/WorkflowContext";
import { Workspace } from "@/components/Workspace";
import { Button } from "@/components/ui";
import { Sparkles, History, ArrowRight, FileText, Bot } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { ChannelStats } from "@/components/ChannelStats";

import { ExportModule } from "@/components/ExportModule";
import { VisionModule } from "@/components/VisionModule";
import { SunoModule } from "@/components/SunoModule";
import { Tabs } from "@/components/Tabs";
import { LockedOverlay } from "@/components/LockedOverlay";

type InputMode = 'AI_GENERATED' | 'CUSTOM_DOCUMENT';

export default function Home() {
  const { theme, setTheme, currentStep, setCurrentStep, resetWorkflow, stepsData, activeView, isUnlocked, setStepsData } = useWorkflow();
  const [inputTheme, setInputTheme] = useState(theme);
  const [inputMode, setInputMode] = useState<InputMode>('AI_GENERATED');
  const [customDocText, setCustomDocText] = useState<string>('');

  const handleStart = () => {
    let finalTheme = inputTheme.trim();

    if (inputMode === 'CUSTOM_DOCUMENT') {
      if (!finalTheme) {
        toast.error("請輸入聖蹟文獻主題");
        return;
      }
      
      if (customDocText.trim().length < 50) {
        toast.error("輸入內容過短，建議提供 500~2000 字的完整文獻以利後續腳本提煉。");
        return;
      }

      // 直接將使用者自訂文本寫入 Step 1 的資料槽
      setStepsData(prev => ({
        ...prev,
        1: customDocText
      }));
      toast.success("📜 聖蹟文獻載入成功！系統已將其定錨為基礎背景。");
      setTheme(finalTheme);
      setCurrentStep(2); // 跳過 Step 1，直接進入 Step 2 (長影音腳本撰寫)
    } else {
      if (!finalTheme) {
        toast.error("請輸入內容主題");
        return;
      }
      setTheme(finalTheme);
      setCurrentStep(1); // 進入 Step 1 (基礎背景研究)
    }
  };

  const hasProgress = Object.keys(stepsData).length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Navigation Tabs */}
      <Tabs />

      <div className="flex-1 overflow-y-auto">
        {activeView === "workflow" ? (
          <div className={`relative w-full flex flex-col ${!isUnlocked ? 'h-full overflow-hidden' : 'min-h-full'}`}>
            {currentStep === 0 ? (
              <div className="flex-1 flex flex-col items-start p-6 bg-transparent">
                {/* Top Stats Bar */}
                <div className="w-full max-w-6xl mb-12">
                  <ChannelStats />
                </div>

                <div className="max-w-2xl w-full space-y-12 flex flex-col items-center text-center mt-4 mx-auto">
                  <div className="space-y-4 flex flex-col items-center">
                    <img src="/logo_script.png" alt="世代銘印" className="h-24 md:h-32 object-contain" />
                    <p className="text-stone-500 font-bold text-xl tracking-[0.3em] uppercase">AI 內容產製工作流系統</p>
                  </div>

                  <div className="bg-white/70 backdrop-blur-md p-10 rounded-[2.5rem] border border-stone-200 shadow-2xl shadow-stone-900/10 space-y-8">
                    <div className="space-y-3 text-left">
                      <label className="text-xs font-black text-stone-400 ml-1 uppercase tracking-[0.2em]">
                        請輸入內容主題
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          value={inputTheme}
                          onChange={(e) => setInputTheme(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleStart()}
                          placeholder="例如：天上聖母、玄天上帝、傳統美學..."
                          className="w-full text-2xl px-8 py-5 rounded-2xl border-2 border-stone-100 bg-white/50 focus:bg-white focus:border-stone-900 focus:ring-8 focus:ring-stone-900/5 outline-none transition-all pr-16 font-medium placeholder:text-stone-300"
                        />
                        <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 text-gold group-focus-within:animate-pulse" size={28} />
                      </div>
                    </div>

                    <div className="flex bg-stone-100 p-1 rounded-xl">
                      <button
                        onClick={() => setInputMode('AI_GENERATED')}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                          inputMode === 'AI_GENERATED' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        <Bot size={16} />
                        模式 A：全自動背景生成
                      </button>
                      <button
                        onClick={() => setInputMode('CUSTOM_DOCUMENT')}
                        className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all ${
                          inputMode === 'CUSTOM_DOCUMENT' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        <FileText size={16} />
                        模式 B：聖蹟文獻載入
                      </button>
                    </div>

                    {inputMode === 'CUSTOM_DOCUMENT' && (
                      <div className="space-y-3 text-left animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-black text-stone-400 ml-1 uppercase tracking-[0.2em]">
                          貼上文獻內容 (作為 Step 1 基礎背景)
                        </label>
                        <textarea
                          value={customDocText}
                          onChange={(e) => setCustomDocText(e.target.value)}
                          placeholder="請貼上已經整理好的文獻、廟宇沿革或歷史資料..."
                          className="w-full h-40 p-4 resize-none rounded-2xl border-2 border-stone-100 bg-white/50 focus:bg-white focus:border-stone-900 focus:ring-8 focus:ring-stone-900/5 outline-none transition-all font-medium placeholder:text-stone-300 custom-scrollbar"
                        />
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button 
                        onClick={handleStart} 
                        className="flex-1 py-7 text-xl rounded-2xl shadow-xl shadow-cinnabar/20 bg-cinnabar hover:bg-red-800 disabled:opacity-50"
                      >
                        開始生成流程
                        <ArrowRight size={24} />
                      </Button>
                      
                      {hasProgress && (
                        <Button variant="outline" onClick={() => setCurrentStep(1)} className="py-7 px-10 rounded-2xl border-stone-200 text-stone-600 hover:bg-white">
                          <History size={24} />
                          繼續進度
                        </Button>
                      )}
                    </div>

                    {hasProgress && (
                      <button 
                        onClick={resetWorkflow}
                        className="text-[10px] text-red-400 hover:text-red-600 hover:underline font-black uppercase tracking-[0.3em] transition-colors"
                      >
                        重置所有資料
                      </button>
                    )}
                  </div>

                  {/* Decorative Elements */}
                  <div className="flex justify-center gap-12 pt-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                     <div className="w-12 h-12 rounded-full border-2 border-stone-300 bg-white/50" />
                     <div className="w-12 h-12 rounded-full border-2 border-stone-300 bg-white/50" />
                     <div className="w-12 h-12 rounded-full border-2 border-stone-300 bg-white/50" />
                  </div>
                </div>
              </div>
            ) : (
              <Workspace />
            )}
            <LockedOverlay title="主工作流" subtitle="解鎖全自動化 AI 內容產製與控管中樞" />
          </div>
        ) : activeView === "export" ? (
          <div className={`relative w-full ${!isUnlocked ? 'h-full overflow-hidden' : 'min-h-full'}`}>
            <ExportModule />
            <LockedOverlay title="純淨資料匯出" subtitle="解鎖原始數據與未經修飾的文本資料" />
          </div>
        ) : activeView === "vision" ? (
          <div className={`relative w-full ${!isUnlocked ? 'h-full overflow-hidden' : 'min-h-full'}`}>
            <VisionModule />
            <LockedOverlay title="Gemini 視覺" subtitle="解鎖全自動視覺產製與 Notion 雲端同步" />
          </div>
        ) : activeView === "suno" ? (
          <div className={`relative w-full ${!isUnlocked ? 'h-full overflow-hidden' : 'min-h-full'}`}>
            <SunoModule />
            <LockedOverlay title="Suno 配樂" subtitle="解鎖專屬配樂產製與情緒節奏控制" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
