"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Database, AlertCircle, Music, Sparkles, Maximize2, Minimize2, X, Copy, ExternalLink, BotMessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface NotionPage {
  id: string;
  title: string;
}

const extractOptions = (text: string) => {
  if (!text) return [];
  
  const cleanText = text.replace(/\r/g, '');
  
  // Split robustly against leading asterisks, hash marks, numbers, or spaces
  const blocks = cleanText.split(/(?=(?:\s*\#\#+\s*)?(?:\*\*)?(?:\d+\.\s*(?:史詩|敘事|活力|音樂|【)|【?音樂\s*\d+|第[一二三]首))/i);
  const options = [];
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    // Match various ways the AI might introduce the prompt
    const promptMatch = block.match(/(?:Suno AI Prompt|Prompt|指令|Suno指令|音樂生成提示詞|音樂提示詞|生成提示詞)\s*[：:]\s*\n*(?:\*\*)?\s*([\s\S]*)/i);
    
    if (promptMatch) {
      const titleMatch = block.match(/(?:^|\n)(?:\s*\#\#+\s*)?(?:\*\*)?(?:【?音樂\s*\d+\s*[：:]?\s*|第[一二三]首\s*[：:]?\s*|\d+\.\s*)([^\n】*(]+)/i);
      const descMatch = block.match(/(?:適用場景說明|適用場景|場景描述|場景)\s*[：:]\s*([^\n]+)/i);
      
      let mTitle = titleMatch ? titleMatch[1].trim() : "";
      if (!mTitle) {
        const altTitleMatch = block.match(/(?:史詩|敘事|活力)感/i);
        mTitle = altTitleMatch ? altTitleMatch[0] : "配樂設計";
      }
      
      let pContent = promptMatch[1].trim();
      // Remove trailing asterisks if any
      pContent = pContent.replace(/\*\*$/g, '').trim();
      
      options.push({
        prompt: pContent,
        mainTitle: mTitle,
        subTitle: descMatch ? descMatch[1].trim() : ""
      });
    }
  }
  
  // Fallback if the strict prompt keyword matching failed
  if (options.length === 0) {
    const validBlocks = blocks.filter(b => b.trim().length > 20);
    return validBlocks.map(b => {
      const altTitleMatch = b.match(/(?:史詩|敘事|活力)感/i);
      return {
        prompt: b.trim(),
        mainTitle: altTitleMatch ? altTitleMatch[0] : "配樂草稿",
        subTitle: ""
      };
    });
  }
  
  return options;
};

const SunoCard = ({
  title,
  subtitle,
  promptData,
}: {
  title: string;
  subtitle: string;
  promptData: { prompt: string; mainTitle: string; subTitle: string };
}) => {
  const [editablePrompt, setEditablePrompt] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setEditablePrompt(promptData?.prompt || "");
  }, [promptData]);

  const handleCopyAndGo = () => {
    if (!editablePrompt) return;
    navigator.clipboard.writeText(editablePrompt)
      .then(() => {
        toast.success("指令已複製！正在開啟 Suno...");
        window.open("https://suno.com/create", "_blank");
      })
      .catch(() => {
        toast.error("複製失敗，請手動複製");
      });
  };

  const CardContent = (
    <>
      <div className="bg-stone-900 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">{subtitle}</div>
          <h3 className="text-white text-lg font-bold tracking-wider">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white/70 hover:text-white transition-colors"
            title={isExpanded ? "縮小" : "放大"}
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          {isExpanded && (
            <button 
              onClick={() => setIsExpanded(false)} 
              className="bg-red-500/20 hover:bg-red-500 p-2 rounded-lg text-red-100 hover:text-white transition-colors"
              title="關閉"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-4 overflow-hidden bg-stone-50">
        <div className={`bg-white rounded-2xl p-4 border border-stone-200 overflow-y-auto text-xs font-mono text-stone-500 leading-relaxed whitespace-pre-wrap shrink-0 shadow-inner ${isExpanded ? 'max-h-40' : 'flex-1 max-h-24'} relative`}>
          <div className="absolute top-2 right-2 text-stone-300">
             <Database size={16}/>
          </div>
          {promptData?.prompt || <span className="text-stone-400 italic">尚未載入 Prompt...</span>}
        </div>

        <div className={`relative bg-stone-100 rounded-2xl border-2 border-dashed border-stone-300 overflow-y-auto flex flex-col gap-6 transition-all ${isExpanded ? 'flex-1 p-8' : 'h-80 p-4'}`}>
          <div className="sticky top-0 z-10 flex justify-center mb-2 pointer-events-none">
            <span className="bg-stone-200/80 backdrop-blur text-stone-500 text-xs px-4 py-1.5 rounded-full font-bold shadow-sm border border-stone-300">
              對話氣泡與派發中心
            </span>
          </div>
          
          <AnimatePresence mode="wait">
            {promptData?.prompt ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end w-full"
                >
                  <div className={`bg-stone-800 text-stone-100 rounded-[2rem] rounded-tr-sm ${isExpanded ? 'p-6 max-w-[85%]' : 'p-4 max-w-[95%]'} shadow-xl border border-stone-700 relative flex flex-col gap-3 group hover:border-amber-500/50 transition-colors`}>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-2">
                        <BotMessageSquare size={16} className="text-amber-500" />
                        <span className="text-amber-400 font-bold text-sm tracking-wider truncate max-w-[200px]">
                          {promptData.mainTitle || `預設設計組`}
                        </span>
                      </div>
                      <Button 
                        onClick={handleCopyAndGo} 
                        className="bg-amber-500 hover:bg-amber-400 text-stone-900 h-9 px-4 rounded-full text-xs font-bold shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] transition-all flex shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5"/> 複製並前往
                        <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                      </Button>
                    </div>
                    
                    {promptData.subTitle && (
                       <p className="text-stone-400 text-xs font-medium -mt-1">{promptData.subTitle}</p>
                    )}

                    <div className="relative">
                      <textarea 
                        value={editablePrompt}
                        onChange={(e) => setEditablePrompt(e.target.value)}
                        className={`w-full bg-stone-900/50 rounded-xl p-3.5 text-sm text-stone-300 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-inner ${isExpanded ? 'h-48' : 'h-32'}`}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-stone-400 flex flex-col items-center gap-3 m-auto"
              >
                <BotMessageSquare size={40} className="opacity-40" />
                <span className="text-sm font-medium tracking-widest uppercase">解析失敗或無指令</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-stone-200 shadow-xl overflow-hidden flex flex-col h-full">
        {!isExpanded && CardContent}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 md:p-12"
          >
            <div className="absolute inset-0 cursor-zoom-out" onClick={() => setIsExpanded(false)} />
            <motion.div 
              layoutId={`suno-card-${title}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-stone-200 shadow-2xl overflow-hidden flex flex-col w-full max-w-5xl h-full max-h-[90vh] z-10 ring-1 ring-white/50"
            >
              {CardContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SunoModule = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loadingPages, setLoadingPages] = useState(false);
  const [fetchingPrompts, setFetchingPrompts] = useState(false);
  const [prompts, setPrompts] = useState({ step9: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (selectedPageId) {
      fetchPrompts(selectedPageId);
    }
  }, [selectedPageId]);

  const fetchPages = async () => {
    setLoadingPages(true);
    setError(null);
    try {
      const res = await fetch("/api/notion/list-pages");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPages(data.pages || []);
      if (data.pages?.length > 0) {
        setSelectedPageId(data.pages[0].id);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error("讀取 Notion 清單失敗");
    } finally {
      setLoadingPages(false);
    }
  };

  const fetchPrompts = async (pageId: string) => {
    setFetchingPrompts(true);
    setPrompts({ step9: "" });
    try {
      const res = await fetch("/api/notion/get-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setPrompts(data.prompts);
      toast.success("成功載入 配樂 指令");
    } catch (err: any) {
      toast.error("抓取 Prompt 失敗: " + err.message);
    } finally {
      setFetchingPrompts(false);
    }
  };

  const extractedOptions = extractOptions(prompts.step9);
  const opt1 = extractedOptions[0] || { prompt: "", mainTitle: "", subTitle: "" };
  const opt2 = extractedOptions[1] || { prompt: "", mainTitle: "", subTitle: "" };
  const opt3 = extractedOptions[2] || { prompt: "", mainTitle: "", subTitle: "" };

  return (
    <div className="max-w-7xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 font-calligraphy flex items-center gap-4">
          <Sparkles className="text-amber-500" size={36} />
          Suno 配樂發控中心
        </h1>
        <p className="text-stone-500 text-lg">
          全自動音樂產製閉環。自 Notion 資料庫提取對應主題之音樂指令，直接驅動 Suno AI 進行配樂創作。
        </p>
      </div>

      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-stone-200 shadow-2xl p-10 space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] ml-1">
            選擇歸檔主題
          </label>
          
          <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-stone-400">
              <Database size={20} />
            </div>
            <select
              value={selectedPageId}
              onChange={(e) => setSelectedPageId(e.target.value)}
              disabled={loadingPages}
              className="w-full text-xl pl-16 pr-12 py-5 rounded-2xl border-2 border-stone-100 bg-white/50 focus:bg-white focus:border-stone-900 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loadingPages ? (
                <option>載入中...</option>
              ) : pages.length > 0 ? (
                pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))
              ) : (
                <option value="">(無可用主題)</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-stone-400">
              <ChevronDown size={20} />
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-2 ml-1">
              <AlertCircle size={14} />
              <span>{error}</span>
              <button onClick={fetchPages} className="underline ml-2 hover:text-red-700">重試</button>
            </div>
          )}
        </div>

        {fetchingPrompts ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-stone-500">
            <Sparkles size={32} className="animate-spin text-amber-500" />
            <p className="font-medium tracking-widest uppercase">解析脈絡中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SunoCard 
              title="音・史詩開場"
              subtitle="史詩感配樂"
              promptData={opt1}
            />
            <SunoCard 
              title="音・敘事細節"
              subtitle="敘事感配樂"
              promptData={opt2}
            />
            <SunoCard 
              title="音・現代活力"
              subtitle="活力感配樂"
              promptData={opt3}
            />
          </div>
        )}
      </div>
    </div>
  );
};
