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
  
  const cleanText = text.replace(/[*#]/g, '').replace(/\r/g, '');
  
  // Split by common group headers
  let blocks = cleanText.split(/(?=(?:^|\n)\s*(?:第[一二三四五六七八九十\d]+組|設計組?\s*\d+|意象圖組?\s*\d+|組別\s*\d+|[一二三四五六七八九十]、\s*(?:意象圖|縮圖意象|設計|縮圖)|\d+\.\s*(?:縮圖名稱|意象圖名稱|設計|意象圖|組別)))/i);
  
  if (blocks.length <= 1) {
     blocks = cleanText.split(/---/);
  }

  const options = [];

  const getTemplate = (content: string) => {
    if (title === "道・大象無形") {
      return `（colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, , no humans, ultra detailed和文字設計風格。) \n\n${content}`;
    } else if (title === "道・見素抱樸") { // 短影音
      return `（一幅具有強烈視覺衝擊力的YouTube短影音縮圖，融合了(colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed和文字設計風格。) 大而醒目的藝術文字設計用於放置粗體大字。\n\n${content}`;
    } else { // 長影音
      return `（一幅具有強烈視覺衝擊力的YouTube縮圖，融合了(colorful ink wash, vivid diffusion, golden particles, energy flow, eastern fantasy, gold flowing accents, rice paper texture, eastern mythology, spiritual energy, cinematic lighting, ultra detailed和文字設計風格。) 大而醒目的藝術文字設計用於放置粗體大字。\n\n${content}`;
    }
  };
  
  for (const block of blocks) {
    if (block.trim().length < 10) continue;

    // More robust matching for prompts
    const promptMatch = block.match(/(?:AI Prompt.*?|English|英文|中文|Prompt|提示詞|指令)\s*[:：)]*\s*\n*\s*([^\n]+)/i);
    
    if (promptMatch) {
      const mainTitleMatch = block.match(/(?:主標(?:題)?|高點擊文案)\s*[:：]\s*([^\n]+)/i);
      const subTitleMatch = block.match(/副標(?:題)?\s*[:：]\s*([^\n]+)/i);
      const fallbackTitleMatch = block.match(/(?:縮圖名稱|意象圖名稱)\s*[:：]\s*([^\n]+)/i);
      const headerTitleMatch = block.match(/(?:第[一二三四五六七八九十\d]+組|設計組?\s*\d+|意象圖組?\s*\d+|組別\s*\d+|[一二三四五六七八九十]、\s*(?:意象圖|縮圖意象|設計|縮圖)|\d+\.\s*(?:縮圖名稱|意象圖名稱|設計|意象圖|組別))\s*[:：]?\s*【?([^\n】]+)/i);
      
      let mTitle = mainTitleMatch ? mainTitleMatch[1].trim() : "";
      if (!mTitle && fallbackTitleMatch) mTitle = fallbackTitleMatch[1].trim();
      if (!mTitle && headerTitleMatch) mTitle = headerTitleMatch[1].trim();
      
      let content = block.trim();
      
      const extractedSubTitle = subTitleMatch ? subTitleMatch[1].trim() : "";
      const template = getTemplate(content);
      
      if (!mTitle) {
         mTitle = "設計組";
      }

      options.push({
        prompt: template,
        mainTitle: mTitle,
        subTitle: extractedSubTitle
      });
    }
  }
  
  // Fallback if structured matching fails
  if (options.length === 0) {
    const validBlocks = blocks.filter(b => b.trim().length > 30);
    if (validBlocks.length > 0 && blocks.length > 1) {
       return validBlocks.map((b, i) => {
         return {
           prompt: getTemplate(b.trim()),
           mainTitle: `設計組 ${i+1}`,
           subTitle: ""
         };
       });
    }
    return [{ prompt: getTemplate(text.trim()), mainTitle: "預設設計組", subTitle: "" }];
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
  const [fullText, setFullText] = useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const opts = extractOptions(prompt, title);
    if (opts.length > 0) {
      setFullText(opts.map(o => o.prompt).join('\n\n------------------------\n\n'));
    } else {
      setFullText("");
    }
  }, [prompt, title]);

  const getSelectedText = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd, value } = textareaRef.current;
      if (selectionStart !== selectionEnd) {
        return value.substring(selectionStart, selectionEnd);
      }
    }
    return fullText; // Fallback to full text if nothing selected
  };

  const handleCopyAndGo = () => {
    const selected = getSelectedText();
    if (!selected.trim()) {
      toast.error("無可複製的內容");
      return;
    }
    const textToCopy = `${selected}\n--ar ${aspectRatio}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success("已複製！正在開啟 Gemini...");
        window.open("https://gemini.google.com/app", "_blank");
      })
      .catch(() => {
        toast.error("複製失敗，請手動複製");
      });
  };

  const handleCopyOnly = () => {
    const selected = getSelectedText();
    if (!selected.trim()) {
      toast.error("無可複製的內容");
      return;
    }
    const textToCopy = `${selected}\n--ar ${aspectRatio}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success("已複製！");
      })
      .catch(() => {
        toast.error("複製失敗，請手動複製");
      });
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-stone-200 shadow-xl overflow-hidden flex flex-col lg:flex-row w-full min-h-[400px]">
      {/* Left Panel */}
      <div className="bg-stone-900 w-full lg:w-72 p-6 md:p-8 flex flex-col justify-between shrink-0">
        <div>
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">{subtitle} ({aspectRatio})</div>
          <h3 className="text-white text-2xl font-bold tracking-wider mb-6">{title}</h3>
          <p className="text-stone-400 text-sm leading-relaxed">
            請在右側文字框中反白框選您需要的段落，然後點擊下方按鈕進行複製。未框選則複製全部。
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-8">
          <Button 
            onClick={handleCopyOnly} 
            className="w-full bg-stone-700 hover:bg-stone-600 text-stone-200 h-12 rounded-xl text-sm font-bold transition-all flex justify-center items-center"
          >
            <Copy className="w-4 h-4 mr-2"/> 複製框選文字
          </Button>
          <Button 
            onClick={handleCopyAndGo} 
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-900 h-12 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] transition-all flex justify-center items-center"
          >
            <Copy className="w-4 h-4 mr-2"/> 複製並前往
            <ExternalLink className="w-4 h-4 ml-1.5 opacity-50" />
          </Button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 md:p-8 bg-stone-50 flex flex-col relative">
         <div className="absolute top-10 right-10 text-stone-300 pointer-events-none">
            <Database size={24}/>
         </div>
         <div className="flex-1 flex flex-col relative z-10">
           <textarea 
             ref={textareaRef}
             value={fullText}
             onChange={(e) => setFullText(e.target.value)}
             className="w-full flex-1 min-h-[300px] bg-white rounded-2xl p-6 text-sm text-stone-600 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm border border-stone-200 leading-relaxed"
             spellCheck={false}
             placeholder={prompt ? "解析中..." : "尚未載入 Prompt..."}
           />
           <div className="absolute bottom-4 right-6 pointer-events-none text-xs text-stone-400 font-bold bg-white/80 px-2 py-1 rounded">
             --ar {aspectRatio}
           </div>
         </div>
      </div>
    </div>
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
          <div className="flex flex-col gap-8">
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
