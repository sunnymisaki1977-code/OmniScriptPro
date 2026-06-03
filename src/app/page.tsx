"use client";

import { useWorkflow } from "@/context/WorkflowContext";
import { Workspace } from "@/components/Workspace";
import { Button } from "@/components/ui";
import { Sparkles, History, ArrowRight } from "lucide-react";
import { useState } from "react";

import { ChannelStats } from "@/components/ChannelStats";

import { ExportModule } from "@/components/ExportModule";
import { VisionModule } from "@/components/VisionModule";
import { SunoModule } from "@/components/SunoModule";
import { SocialModule } from "@/components/SocialModule";
import { Tabs } from "@/components/Tabs";
import { LockedOverlay } from "@/components/LockedOverlay";

export default function Home() {
  const { theme, setTheme, currentStep, setCurrentStep, resetWorkflow, stepsData, activeView } = useWorkflow();
  const [inputTheme, setInputTheme] = useState(theme);

  const handleStart = () => {
    if (!inputTheme.trim()) return;
    setTheme(inputTheme);
    setCurrentStep(1);
  };

  const hasProgress = Object.keys(stepsData).length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Navigation Tabs */}
      <Tabs />

      <div className="flex-1 overflow-y-auto">
        {activeView === "workflow" ? (
          <div className="relative w-full h-full overflow-hidden flex flex-col">
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

                    <div className="flex gap-4">
                      <Button 
                        onClick={handleStart} 
                        className="flex-1 py-7 text-xl rounded-2xl shadow-xl shadow-cinnabar/20 bg-cinnabar hover:bg-red-800"
                        disabled={!inputTheme.trim()}
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
          <div className="relative w-full h-full">
            <ExportModule />
            <LockedOverlay title="純淨資料匯出" subtitle="解鎖原始數據與未經修飾的文本資料" />
          </div>
        ) : activeView === "vision" ? (
          <div className="relative w-full h-full overflow-hidden">
            <VisionModule />
            <LockedOverlay title="Gemini 視覺" subtitle="解鎖全自動視覺產製與 Notion 雲端同步" />
          </div>
        ) : activeView === "suno" ? (
          <div className="relative w-full h-full overflow-hidden">
            <SunoModule />
            <LockedOverlay title="Suno 配樂" subtitle="解鎖專屬配樂產製與情緒節奏控制" />
          </div>
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <SocialModule />
            <LockedOverlay title="社群推播" subtitle="解鎖社群一鍵發佈與智慧分發核心" />
          </div>
        )}
      </div>
    </div>
  );
}
