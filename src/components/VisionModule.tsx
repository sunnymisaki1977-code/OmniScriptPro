"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Database, AlertCircle, Image as ImageIcon, Sparkles, Maximize2, Minimize2, X, Copy, ExternalLink, BotMessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { STEP_CONFIGS } from "./LoadingOverlay";

interface NotionPage {
  id: string;
  title: string;
}

// Extract English prompts and Titles using block splitting
const extractOptions = (text: string, title: string) => {
  if (!text) return [];
  
  const cleanText = text.replace(/[*#]/g, '');
  let blocks = cleanText.split(/(?=第[一二三四五六七八九十\d]+組|設計組?\s*\d+|意象圖組?\s*\d+|[一二三四五六七八九十]、\s*(?:意象圖|縮圖意象|設計|縮圖))/);
  
  if (blocks.length <= 1) {
     blocks = cleanText.split(/---/);
  }

  const options = [];

  const getTemplate = (content: string, mTitle: string, poem: string, subTitle: string = "") => {
    if (title === "道・大象無形") {
      let fullContent = content;
      if (poem) {
        // Automatically add poem formatting text if a poem is found
        fullContent += `，搭配藝術詩詞文字直式排版（由上到下，從右到左）設計詩詞：${poem}`;
      }
      return `（colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, , no humans, ultra detailed和文字設計風格。) ${fullContent}`;
    } else if (title === "道・見素抱樸") { // 短影音
      const textTitle = mTitle ? `* **高點擊文案**：${mTitle}\n` : "";
      return `（一幅具有強烈視覺衝擊力的YouTube縮圖，融合了(colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed和文字設計風格。) 大而醒目的藝術文字設計用於放置粗體大字。\n${textTitle}${content}`;
    } else { // 長影音
      const mainPrefix = mTitle ? `* **主標**：${mTitle}\n` : "";
      const subPrefix = subTitle ? `* **副標**：${subTitle}\n` : "";
      return `（一幅具有強烈視覺衝擊力的YouTube縮圖，融合了(colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed和文字設計風格。) 大而醒目的藝術文字設計用於放置粗體大字。\n${mainPrefix}${subPrefix}${content}`;
    }
  };
  
  for (const block of blocks) {
    const enPromptMatch = block.match(/(?:AI Prompt \(English\)|English|英文)\s*[:：]\s*\n*\s*([^\n]+)/i);
    const zhPromptMatch = block.match(/中文\s*[:：]\s*\n*\s*([^\n]+)/i);
    
    if (zhPromptMatch || enPromptMatch) {
      const mainTitleMatch = block.match(/(?:主標(?:題)?|高點擊文案)\s*[:：]\s*([^\n]+)/i);
      const subTitleMatch = block.match(/副標(?:題)?\s*[:：]\s*([^\n]+)/i);
      const fallbackTitleMatch = block.match(/縮圖名稱\s*[:：]\s*([^\n]+)/i);
      
      let mTitle = mainTitleMatch ? mainTitleMatch[1].trim() : "";
      if (!mTitle && fallbackTitleMatch) mTitle = fallbackTitleMatch[1].trim();
      
      let content = zhPromptMatch ? zhPromptMatch[1].trim() : enPromptMatch![1].trim();
      // Remove style suffix if present to avoid duplication with template
      content = content.replace(/(?:畫面風格|風格)\s*[：:].*$/i, "").trim();

      // Extract poem if present (usually at the end of the block)
      let poem = "";
      const poemMatch = block.match(/(?:七言四句詩詞|詩詞)\s*[:：]\s*\n*([\s\S]+)/i);
      if (poemMatch) {
        poem = poemMatch[1].trim().replace(/\s+/g, ' '); // replace newlines/spaces with a single space
      }

      const extractedSubTitle = subTitleMatch ? subTitleMatch[1].trim() : "";
      const template = getTemplate(content, mTitle, poem, extractedSubTitle);
      
      // Optionally extract group name as title if mTitle is empty
      const groupMatch = block.match(/(意象圖組?\s*\d+|第[一二三四五六七八九十\d]+組|設計組?\s*\d+)/);
      if (!mTitle && groupMatch) {
         mTitle = groupMatch[1].trim();
      }

      options.push({
        prompt: template,
        mainTitle: mTitle,
        subTitle: extractedSubTitle
      });
    }
  }
  
  if (options.length === 0) {
    const globalMatches = Array.from(cleanText.matchAll(/中文\s*[:：]\s*\n*\s*([^\n]+)/gi));
    if (globalMatches.length > 0) {
       return globalMatches.map(m => {
         const content = m[1].replace(/(?:畫面風格|風格)\s*[：:].*$/i, "").trim();
         return { 
           prompt: getTemplate(content, "", "", ""), 
           mainTitle: "", 
           subTitle: "" 
         };
       });
    }
    return [{ prompt: getTemplate(text.trim(), "", "", ""), mainTitle: "", subTitle: "" }];
  }
  return options;
};

const VisionCard = ({
  stepId,
  title,
  subtitle,
  aspectRatio,
  prompt,
}: {
  stepId: number;
  title: string;
  subtitle: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
}) => {
  const [editableOptions, setEditableOptions] = useState<{prompt: string, mainTitle: string, subTitle: string}[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setEditableOptions(extractOptions(prompt, title));
  }, [prompt, title]);

  const handleCopyAndGo = (opt: { prompt: string }) => {
    const textToCopy = `${opt.prompt}\n--ar ${aspectRatio}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success("指令已複製！正在開啟 Gemini...");
        window.open("https://gemini.google.com/app", "_blank");
      })
      .catch(() => {
        toast.error("複製失敗，請手動複製");
      });
  };

  const handlePromptChange = (index: number, newPrompt: string) => {
    const newOptions = [...editableOptions];
    newOptions[index].prompt = newPrompt;
    setEditableOptions(newOptions);
  };

  const isVertical = aspectRatio === "9:16";

  const CardContent = (
    <>
      <div className="bg-stone-900 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">{subtitle} ({aspectRatio})</div>
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
          {prompt || <span className="text-stone-400 italic">尚未載入 Prompt...</span>}
        </div>

        <div className={`relative bg-stone-100 rounded-2xl border-2 border-dashed border-stone-300 overflow-y-auto flex flex-col gap-6 transition-all ${isExpanded ? 'flex-1 p-8' : 'h-80 p-4'}`}>
          <div className="sticky top-0 z-10 flex justify-center mb-2 pointer-events-none">
            <span className="bg-stone-200/80 backdrop-blur text-stone-500 text-xs px-4 py-1.5 rounded-full font-bold shadow-sm border border-stone-300">
              對話氣泡與派發中心
            </span>
          </div>
          
          <AnimatePresence mode="wait">
            {editableOptions.length > 0 ? (
              editableOptions.map((opt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex justify-end w-full"
                >
                  <div className={`bg-stone-800 text-stone-100 rounded-[2rem] rounded-tr-sm ${isExpanded ? 'p-6 max-w-[85%]' : 'p-4 max-w-[95%]'} shadow-xl border border-stone-700 relative flex flex-col gap-3 group hover:border-amber-500/50 transition-colors`}>
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-2">
                        <BotMessageSquare size={16} className="text-amber-500" />
                        <span className="text-amber-400 font-bold text-sm tracking-wider truncate max-w-[200px]">
                          {opt.mainTitle || `預設設計組 ${i+1}`}
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleCopyAndGo(opt)} 
                        className="bg-amber-500 hover:bg-amber-400 text-stone-900 h-9 px-4 rounded-full text-xs font-bold shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] transition-all flex shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5"/> 複製並前往
                        <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                      </Button>
                    </div>
                    
                    {opt.subTitle && (
                       <p className="text-stone-400 text-xs font-medium -mt-1">{opt.subTitle}</p>
                    )}

                    <div className="relative">
                      <textarea 
                        value={opt.prompt}
                        onChange={(e) => handlePromptChange(i, e.target.value)}
                        className={`w-full bg-stone-900/50 rounded-xl p-3.5 text-sm text-stone-300 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-inner ${isExpanded ? 'h-48' : 'h-32'}`}
                        spellCheck={false}
                      />
                      <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] text-stone-500 font-bold bg-stone-900/80 px-2 py-1 rounded">
                        --ar {aspectRatio}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
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

      {/* Removed automated generation button to focus on manual Copy & Go dispatch */}
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
              layoutId={`vision-card-${stepId}`}
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

export const VisionModule = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loadingPages, setLoadingPages] = useState(false);
  const [fetchingPrompts, setFetchingPrompts] = useState(false);
  const [prompts, setPrompts] = useState({ step6: "", step7: "", step8: "" });
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
    setPrompts({ step6: "", step7: "", step8: "" });
    try {
      const res = await fetch("/api/notion/get-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setPrompts(data.prompts);
      toast.success("成功載入 Prompt 指令");
    } catch (err: any) {
      toast.error("抓取 Prompt 失敗: " + err.message);
    } finally {
      setFetchingPrompts(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 font-calligraphy flex items-center gap-4">
          <Sparkles className="text-amber-500" size={36} />
          Gemini 視覺發控中心
        </h1>
        <p className="text-stone-500 text-lg">
          全自動視覺產製閉環。自 Notion 資料庫提取對應主題之分鏡指令，直接驅動 Gemini 進行彩墨美學繪圖。
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
            <VisionCard 
              stepId={6}
              title="道・聚炁成形"
              subtitle="長影音縮圖"
              aspectRatio="16:9"
              prompt={prompts.step6}
            />
            <VisionCard 
              stepId={7}
              title="道・見素抱樸"
              subtitle="短影音縮圖"
              aspectRatio="9:16"
              prompt={prompts.step7}
            />
            <VisionCard 
              stepId={8}
              title="道・大象無形"
              subtitle="彩墨空景"
              aspectRatio="16:9"
              prompt={prompts.step8}
            />
          </div>
        )}
      </div>
    </div>
  );
};
