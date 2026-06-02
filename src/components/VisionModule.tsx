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
  let blocks = cleanText.split(/(?=(?:^|\n)\s*(?:第[一二三四五六七八九十\d]+組|設計組?\s*\d+|意象圖組?\s*\d+|組別\s*\d+|[一二三四五六七八九十]、\s*(?:意象圖|縮圖意象|設計|縮圖|高點擊文案|方案)|\d+\.\s*(?:縮圖名稱|意象圖名稱|設計|意象圖|組別|高點擊文案|主標題|方案)|高點擊文案\s*[:：]|主標題\s*[:：]|方案\s*[一二三四五六七八九十\d]+))/i);
  
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

const VisionSubCard = ({
  opt,
  aspectRatio,
  index
}: {
  opt: {prompt: string, mainTitle: string, subTitle: string},
  aspectRatio: string,
  index: number
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(opt.prompt);

  const getSelectedText = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd, value } = textareaRef.current;
      if (selectionStart !== selectionEnd) {
        return value.substring(selectionStart, selectionEnd);
      }
    }
    return text;
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
        toast.success(`已複製！正在開啟 Gemini...`);
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
        toast.success(`已複製！`);
      })
      .catch(() => {
        toast.error("複製失敗，請手動複製");
      });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col gap-4 group hover:border-amber-500/30 transition-colors">
      <div className="flex items-center gap-2">
        <BotMessageSquare size={16} className="text-amber-500" />
        <span className="text-stone-700 font-bold text-sm tracking-wider">
          {opt.mainTitle || `設計組 ${index + 1}`}
        </span>
      </div>
      
      {opt.subTitle && (
         <p className="text-stone-500 text-xs font-medium -mt-2">{opt.subTitle}</p>
      )}

      <div className="relative flex-1">
        <textarea 
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 bg-stone-50 rounded-xl p-4 text-sm text-stone-600 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 border border-stone-200 leading-relaxed shadow-inner"
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-6 pointer-events-none text-xs text-stone-400 font-bold bg-white/80 px-2 py-1 rounded">
          --ar {aspectRatio}
        </div>
      </div>
      
      <div className="flex items-center gap-3 justify-end mt-2">
        <Button 
          onClick={handleCopyOnly} 
          className="bg-stone-700 hover:bg-stone-600 text-stone-200 h-10 px-6 rounded-xl text-xs font-bold transition-all flex shrink-0"
        >
          <Copy className="w-3.5 h-3.5 mr-2"/> 複製框選文字
        </Button>
        <Button 
          onClick={handleCopyAndGo} 
          className="bg-amber-500 hover:bg-amber-400 text-stone-900 h-10 px-6 rounded-xl text-xs font-bold shadow-[0_4px_14px_0_rgba(245,158,11,0.39)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.23)] transition-all flex shrink-0"
        >
          <Copy className="w-3.5 h-3.5 mr-2"/> 複製並前往
          <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-50" />
        </Button>
      </div>
    </div>
  );
};

const VisionCard = ({
  stepId,
  title,
  subtitle,
  aspectRatio,
  prompt,
  pageId,
}: {
  stepId: number;
  title: string;
  subtitle: string;
  aspectRatio: "16:9" | "9:16";
  prompt: string;
  pageId: string;
}) => {
  const [options, setOptions] = useState<{prompt: string, mainTitle: string, subTitle: string}[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    setOptions(extractOptions(prompt, title));
  }, [prompt, title]);

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-stone-200 shadow-xl overflow-hidden flex flex-col lg:flex-row w-full min-h-[400px]">
      {/* Left Panel */}
      <div className="bg-stone-900 w-full lg:w-72 p-6 md:p-8 flex flex-col shrink-0">
        <div className="sticky top-8">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">{subtitle} ({aspectRatio})</div>
          <h3 className="text-white text-2xl font-bold tracking-wider mb-6">{title}</h3>
          <p className="text-stone-400 text-sm leading-relaxed mb-8">
            每張卡片皆分為三個獨立小組。<br/><br/>
            請在右側文字框中反白框選您需要的段落，然後點擊小卡下方的按鈕進行複製。<br/><br/>未框選則預設複製該小卡的全部內容。
          </p>

          <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="text-xs font-bold text-stone-300">匯入生成圖像至 Notion</label>
            <label className="flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed border-stone-700 hover:border-amber-500 bg-stone-900/50 rounded-lg cursor-pointer transition-colors relative overflow-hidden group">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    const reader = new FileReader();
                    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }} 
              />
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                  <span className="text-white text-xs font-bold z-10 bg-black/50 px-2 py-1 rounded shadow">點擊更換圖片</span>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 p-4 text-center">
                  <ImageIcon size={24} className="text-stone-500 group-hover:text-amber-500 transition-colors" />
                  <span className="text-stone-400 text-xs font-medium">點擊上傳 Gemini 下載圖片</span>
                </div>
              )}
            </label>
            <Button 
              onClick={async () => {
                if (!imageFile) return;
                setIsImporting(true);
                try {
                  const formData = new FormData();
                  formData.append("pageId", pageId);
                  formData.append("stepName", subtitle);
                  formData.append("file", imageFile);

                  const res = await fetch("/api/notion/upload-file", {
                    method: "POST",
                    body: formData,
                  });
                  const data = await res.json();
                  if (data.error) throw new Error(data.error);
                  toast.success("成功上傳實體圖片至 Notion！");
                  setImageFile(null);
                  setImagePreview(null);
                } catch (error: any) {
                  toast.error("匯入失敗: " + error.message);
                } finally {
                  setIsImporting(false);
                }
              }}
              disabled={!imageFile || isImporting || !pageId}
              className="w-full bg-stone-700 hover:bg-amber-500 text-white hover:text-stone-900 rounded-lg h-8 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isImporting ? "上傳中..." : "寫入 Notion"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 md:p-8 bg-stone-50/50 flex flex-col gap-6 relative">
         <div className="absolute top-10 right-10 text-stone-300 pointer-events-none z-0">
            <Database size={24}/>
         </div>
         
         <div className="relative z-10 flex flex-col gap-6">
           {options.length > 0 ? (
             options.map((opt, index) => (
               <VisionSubCard key={index} opt={opt} aspectRatio={aspectRatio} index={index} />
             ))
           ) : (
             <div className="w-full flex-1 min-h-[300px] bg-white rounded-2xl p-6 text-sm text-stone-400 font-mono flex items-center justify-center border border-stone-200 shadow-inner">
               {prompt ? "解析中..." : "尚未載入 Prompt..."}
             </div>
           )}
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
              pageId={selectedPageId}
            />
            <VisionCard 
              stepId={7}
              title="道・見素抱樸"
              subtitle="短影音縮圖"
              aspectRatio="9:16"
              prompt={prompts.step7}
              pageId={selectedPageId}
            />
            <VisionCard 
              stepId={8}
              title="道・大象無形"
              subtitle="彩墨空景"
              aspectRatio="16:9"
              prompt={prompts.step8}
              pageId={selectedPageId}
            />
          </div>
        )}
      </div>
    </div>
  );
};
