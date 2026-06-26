"use client";

import React, { useState, useEffect } from "react";
import { useWorkflow } from "@/context/WorkflowContext";
import { WORKFLOW_STEPS } from "@/utils/promptConfigs";
import { Button, Skeleton, cn } from "./ui";
import { Sparkles, Save, ArrowRight, BookOpen, Edit3, Send, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { GoogleGenAI } from "@google/genai";
import { List, X } from "lucide-react";

import { ChannelStats } from "./ChannelStats";
import { LoadingOverlay, STEP_CONFIGS } from "./LoadingOverlay";
import { SequentialVideoPlayer } from "./SequentialVideoPlayer";
import { SocialModule } from "./SocialModule";

export const Workspace = () => {
  const { currentStep, setCurrentStep, stepsData, updateStepData, getStepContext, theme } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const [isArchiving, setIsArchiving] = useState(false);
  
  const [editedContent, setEditedContent] = useState("");
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/notion/history");
      const data = await res.json();
      if (data.history) setHistoryList(data.history);
    } catch (err) {
      console.error("載入歷史紀錄失敗", err);
    }
  };

  const loadHistoryItem = async (id: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/notion/history?id=${id}`);
      const data = await res.json();
      if (data.stepsData) {
        for (let i = 1; i <= 10; i++) {
           updateStepData(i, data.stepsData[i] || "");
        }
        setCurrentStep(1);
        toast.success("成功載入歷史紀錄");
        setShowHistory(false);
      }
    } catch (err) {
      toast.error("載入紀錄失敗");
    } finally {
      setIsLoadingHistory(false);
    }
  };


  const step = WORKFLOW_STEPS.find((s) => s.id === currentStep);

  // Load current step data into editor
  useEffect(() => {
    setEditedContent(stepsData[currentStep] || "");
  }, [currentStep, stepsData]);

  // Load current step data into editor
  useEffect(() => {
    setEditedContent(stepsData[currentStep] || "");
  }, [currentStep, stepsData]);

  const handleGenerate = async (stepIdInput?: any, customStepsData = stepsData) => {
    const stepId = typeof stepIdInput === "number" ? stepIdInput : currentStep;
    if (!theme) return toast.error("請先設定主題");
    
    setIsGenerating(true);
    try {
      // Use local data if provided (important for batch generation context)
      const context: Record<string, any> = { theme };
      const stepConfig = WORKFLOW_STEPS.find(s => s.id === stepId);
      stepConfig?.dependsOn.forEach(dep => {
        if (dep.startsWith("step")) {
          const depId = parseInt(dep.replace("step", ""));
          context[dep] = customStepsData[depId] || "";
        }
      });

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, context }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      updateStepData(stepId, data.text);
      if (stepId === currentStep) setEditedContent(data.text);
      return data.text;
    } catch (err: any) {
      toast.error(`Step ${stepId} 失敗: ${err.message}`);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const startAutoGenerate = async (isResume = false) => {
    setIsAutoGenerating(true);
    
    // 判斷要從哪一步開始
    let startFromStep = 1;
    if (isResume) {
      for (let i = 1; i <= 10; i++) {
        if (!stepsData[i]) {
          startFromStep = i;
          break;
        }
      }
      if (startFromStep > 10) {
        toast.success("所有步驟已完成！");
        setIsAutoGenerating(false);
        return;
      }
    }
    
    setAutoProgress(startFromStep);
    setCurrentStep(startFromStep);
    
    // Start a visual timer to cycle through steps to simulate progress
    const visualTimer = setInterval(() => {
      setAutoProgress((prev) => (prev < 10 ? prev + 1 : startFromStep));
      setCurrentStep((prev) => (prev < 10 ? prev + 1 : startFromStep));
    }, 3500);
    
    try {
      let currentDocText = stepsData[1] || "";
      let currentData = { ...stepsData };
      let lastSuccessStep = startFromStep - 1;
      
      const CHUNK_SIZE = 3;
      let currentStart = startFromStep;

      // 迴圈分段請求，每次處理 CHUNK_SIZE 個步驟
      while (currentStart <= 10) {
        const currentEnd = Math.min(currentStart + CHUNK_SIZE - 1, 10);
        
        // 更新畫面進度
        setAutoProgress(currentStart);
        setCurrentStep(currentStart);

        const res = await fetch("/api/generate-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            theme, 
            customDocText: currentDocText,
            startFromStep: currentStart,
            endStep: currentEnd,
            existingData: currentData
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          if (res.status === 504 || text.includes("An error occurred")) {
            throw new Error("伺服器回應逾時 (504 Gateway Timeout)！\n這通常是因為您部署在 Vercel 免費版，其 API 執行時間被嚴格限制在 10 秒內。建議您在「本地端 (localhost)」執行，或升級 Vercel 方案。");
          }
          if (text.includes("<!DOCTYPE") || text.includes("<html")) {
            throw new Error(`伺服器發生異常 (${res.status})，傳回了非 JSON 格式的內容。`);
          }
          try {
            const errJson = JSON.parse(text);
            throw new Error(errJson.error || "未知錯誤");
          } catch {
            throw new Error(text || "未知錯誤");
          }
        }

        const json = await res.json();
        if (json.error && !json.isPartial) throw new Error(json.error);

        const newData = json.data;
        
        // 若後端有查核出新的文獻，更新到前端狀態中
        if (json.contextUsed && !currentDocText) {
          currentDocText = json.contextUsed;
          currentData[1] = currentDocText;
          updateStepData(1, currentDocText);
        }
        
        for (let i = currentStart; i <= currentEnd; i++) {
           if (newData[i] || newData[String(i)]) {
              const val = newData[i] || newData[String(i)];
              currentData[i] = val;
              updateStepData(i, val);
              lastSuccessStep = i;
           }
        }
        
        if (json.isPartial) {
          clearInterval(visualTimer);
          setCurrentStep(lastSuccessStep + 1 > 10 ? 10 : lastSuccessStep + 1);
          toast.error(`自動生成中斷！已為您自動存檔至第 ${lastSuccessStep} 步。您可以點擊左側「接續全自動生成」繼續。`);
          setIsAutoGenerating(false);
          setAutoProgress(0);
          return;
        }

        // 推進下一個區塊
        currentStart = currentEnd + 1;
      }
      
      // 全部完成
      clearInterval(visualTimer);
      setCurrentStep(1);
      setEditedContent(currentDocText || currentData[1] || "");
      toast.success("全自動生成完成！您可以開始審閱與編輯。");
    } catch (err: any) {
      clearInterval(visualTimer);
      console.error("Auto generate failed", err);
      toast.error(`全自動生成失敗: ${err.message}`);
    } finally {
      clearInterval(visualTimer);
      setIsAutoGenerating(false);
      setAutoProgress(0);
    }
  };

  useEffect(() => {
    const handler = () => startAutoGenerate(true);
    window.addEventListener("resume-auto-generate", handler);
    return () => window.removeEventListener("resume-auto-generate", handler);
  }, [theme, stepsData]);


  // Trigger auto-generate if we just entered Step 1 and it's empty, OR entered Step 2 and it's empty but Step 1 has custom document (Mode B)
  useEffect(() => {
    if ((currentStep === 1 && !stepsData[1]) || (currentStep === 2 && !stepsData[2] && stepsData[1])) {
      if (!isAutoGenerating) {
        startAutoGenerate();
      }
    }
  }, [theme, currentStep]); // Run when theme is set or step changes

  const handleConfirmNext = () => {
    updateStepData(currentStep, editedContent);
    if (currentStep < 10) {
      setCurrentStep(currentStep + 1);
      toast.success("已確認，進入下一步");
    }
  };

  const handleArchive = async () => {
    // If not on step 10, save the current edited content
    if (currentStep !== 10) {
      updateStepData(currentStep, editedContent);
    }
    
    setIsArchiving(true);
    try {
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, stepsData: currentStep === 10 ? stepsData : { ...stepsData, [currentStep]: editedContent } }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("成功歸檔至 Notion！");
    } catch (err: any) {
      toast.error(err.message || "歸檔失敗");
    } finally {
      setIsArchiving(false);
    }
  };

  if (!step) return null;

  // Resolve dependencies for the reference area
  const dependencies = step.dependsOn
    .filter(dep => dep.startsWith("step"))
    .map(dep => {
      const id = parseInt(dep.replace("step", ""));
      return { id, title: WORKFLOW_STEPS.find(s => s.id === id)?.title, content: stepsData[id] };
    });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col overflow-hidden relative"
    >
      {/* Dynamic Background Image - Moved to cover entire Workspace including header */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#f5f2eb] bg-[url('/color_ink_bg.jpg')] bg-cover bg-center bg-blend-soft-light">
        <AnimatePresence mode="wait">
          {currentStep >= 1 && currentStep <= 9 && (
            <motion.img
              key={currentStep}
              src={STEP_CONFIGS[currentStep]?.image}
              alt={`Step ${currentStep} Background`}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.9, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
        {/* Subtle overlay to enhance ink-wash feel without making it too dark */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#e8e4d8]/60" />
      </div>

      {/* Header - Calligraphy Style */}
      <header className="relative z-10 bg-white/40 backdrop-blur-md border-b border-white/20 sticky top-0 px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo_script.png" alt="世代銘印" className="h-10 object-contain drop-shadow-md" />
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleGenerate()} 
            disabled={isGenerating}
            className="border-white/50 bg-white/30 text-stone-900 hover:bg-white/60 font-bold backdrop-blur-sm"
          >
            <Sparkles size={16} className={isGenerating ? "animate-spin" : "text-amber-600"} />
            {editedContent ? "重新生成稿件" : "AI 撰稿"}
          </Button>
          {currentStep === 10 ? (
            <Button 
              variant="primary" 
              onClick={handleArchive} 
              disabled={isArchiving || !stepsData[10]}
              className="bg-cinnabar/90 backdrop-blur hover:bg-red-800 text-white shadow-lg shadow-red-900/20 border border-white/20"
            >
              <Send size={16} className={isArchiving ? "animate-bounce" : ""} />
              歸檔至雲端文庫
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleConfirmNext} 
              disabled={!editedContent}
              className="bg-stone-900/80 backdrop-blur hover:bg-stone-900 text-white shadow-lg shadow-stone-900/20 border border-white/20"
            >
              確認並進入下一步
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden p-6 gap-6">
        <LoadingOverlay isVisible={isGenerating} stepId={currentStep} />
        <AnimatePresence mode="wait">
          {!isAutoGenerating ? (
            <motion.div 
              key="workspace-content"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="flex-1 flex flex-col overflow-hidden gap-6"
            >
              {/* Horizontal Stats Bar */}
              <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm p-4">
                <ChannelStats />
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden gap-6 w-full">
                {/* Left Column: Context */}
                <div className="w-full md:w-80 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                {/* Reference Area */}
                <div className="flex-1 bg-white/30 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg flex flex-col overflow-hidden">
                  <div className="bg-white/40 px-4 py-2 border-b border-white/30 flex items-center gap-2 backdrop-blur-md">
                    <BookOpen size={14} className="text-stone-800 drop-shadow-sm" />
                    <span className="text-xs font-black text-stone-800 uppercase drop-shadow-sm">依賴參考區</span>
                  </div>
                  <div className="p-6 flex-1 text-stone-800">
                    {dependencies.length > 0 ? (
                      <div className="space-y-6">
                        {dependencies.map((dep) => (
                          <div key={dep.id} className="space-y-2">
                            <h4 className="text-xs font-black text-stone-800 uppercase tracking-tighter flex items-center gap-2 drop-shadow-sm">
                              <div className="w-1 h-3 bg-amber-500 rounded-full" />
                              Step {dep.id}: {dep.title}
                            </h4>
                            <div className="bg-white/40 backdrop-blur-sm border border-white/30 p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap italic text-stone-800 shadow-inner">
                              {dep.content || "尚無內容"}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-stone-600 font-medium italic gap-2 py-12 drop-shadow-sm">
                        <BookOpen size={32} strokeWidth={1} />
                        <p className="text-xs text-center">初始步驟，暫無依賴資料。</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden ring-4 ring-white/20">
                <div className="bg-stone-900/80 backdrop-blur-md px-6 py-3 flex items-center justify-between border-b border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="bg-cinnabar text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">STEP {step.id}</div>
                    <h2 className="text-sm font-bold text-white tracking-wide drop-shadow-sm">{step.title}</h2>
                  </div>
                  {isGenerating && <span className="text-[10px] text-amber-400 animate-pulse font-mono tracking-tighter drop-shadow-sm">INK BLEEDING...</span>}
                </div>
                
                <div className="flex-1 relative">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    placeholder={isGenerating ? "" : "請輸入內容或點擊 AI 撰稿..."}
                    className={cn(
                      "w-full h-full p-8 resize-none focus:outline-none text-stone-900 font-bold leading-loose font-sans text-lg bg-transparent drop-shadow-sm placeholder:text-stone-500",
                      step.type === "code" && "font-mono text-sm bg-stone-900/80 text-stone-100"
                    )}
                  />
                </div>
                
                <footer className="px-6 py-3 bg-white/40 border-t border-white/30 flex justify-between items-center backdrop-blur-md">
                  <div className="flex items-center gap-2 text-[10px] text-stone-600 font-bold drop-shadow-sm">
                    <Edit3 size={10} />
                    最後編輯於 {new Date().toLocaleTimeString()}
                  </div>
                  <div className="text-[10px] text-stone-600 font-bold font-mono drop-shadow-sm">
                    CHARS: {editedContent.length}
                  </div>
                </footer>
              </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="cinematic-progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-8"
            >
              {/* Central Video Player during auto generation */}
              <div className="w-[600px] h-[337px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                <SequentialVideoPlayer className="w-full h-full bg-black" />
              </div>

              <div className="bg-stone-900/60 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-6 w-[600px]">
                <div className="text-white/90 font-bold uppercase tracking-[0.4em] text-sm flex items-center gap-3">
                  <Sparkles size={20} className="text-amber-400 animate-spin" />
                  AI 脈絡生成中
                </div>
                <div className="text-4xl font-black text-white drop-shadow-lg tracking-widest">
                  STEP {autoProgress} <span className="text-2xl text-white/50">/ 9</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800/80 rounded-full overflow-hidden border border-white/10 mt-2">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,1)]" 
                    style={{ width: `${(autoProgress / 9) * 100}%` }} 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      
        {/* Notion History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute top-0 left-0 bottom-0 w-80 bg-stone-900/95 backdrop-blur-xl border-r border-white/20 z-50 p-6 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <BookOpen size={18} className="text-amber-400" />
                  Notion 歷史紀錄
                </h3>
                <button onClick={() => setShowHistory(false)} className="text-white/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                {historyList.length === 0 ? (
                  <div className="text-white/50 text-sm text-center mt-10">尚無紀錄</div>
                ) : (
                  historyList.map(item => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item.id)}
                      disabled={isLoadingHistory}
                      className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
                    >
                      <div className="text-white font-medium text-sm line-clamp-2 group-hover:text-amber-400">{item.title}</div>
                      <div className="text-white/40 text-xs mt-2">{new Date(item.createdAt).toLocaleString()}</div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </motion.div>
  );
};
