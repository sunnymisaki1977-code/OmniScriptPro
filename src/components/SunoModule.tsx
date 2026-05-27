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
  const blocks = cleanText.split(/(?=(?:\s*\#\#+\s*)?(?:\*\*)?(?:\d+\.\s*(?:史詩|敘事|活力|音樂|【)|【?音樂\s*\d+|第[一二三]首|組別\s*\d+|第[一二三四五六七八九十]組))/i);
  const options = [];
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    // Match various ways the AI might introduce the prompt
    const promptMatch = block.match(/(?:Suno AI Prompt|Prompt|指令|Suno指令|音樂生成提示詞|音樂提示詞|生成提示詞|Music Style|Style)\s*[：:]\s*\n*(?:\*\*)?\s*([\s\S]*)/i);
    
    if (promptMatch) {
      const titleMatch = block.match(/(?:^|\n)(?:\s*\#\#+\s*)?(?:\*\*)?(?:【?音樂\s*\d+\s*[：:]?\s*|第[一二三]首\s*[：:]?\s*|\d+\.\s*|組別\s*\d+\s*[：:]?\s*|第[一二三四五六七八九十]組\s*[：:]?\s*)([^\n】*(]+)/i);
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
  const [fullText, setFullText] = useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFullText(promptData?.prompt || "");
  }, [promptData]);

  const getSelectedText = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd, value } = textareaRef.current;
      if (selectionStart !== selectionEnd) {
        return value.substring(selectionStart, selectionEnd);
      }
    }
    return fullText;
  };

  const handleCopyAndGo = () => {
    const selected = getSelectedText();
    if (!selected.trim()) {
      toast.error("無可複製的內容");
      return;
    }
    navigator.clipboard.writeText(selected)
      .then(() => {
        toast.success("已複製！正在開啟 Suno...");
        window.open("https://suno.com/create", "_blank");
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
    navigator.clipboard.writeText(selected)
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
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">{subtitle}</div>
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
            <Music size={24}/>
         </div>
         <div className="flex-1 flex flex-col relative z-10">
           <textarea 
             ref={textareaRef}
             value={fullText}
             onChange={(e) => setFullText(e.target.value)}
             className="w-full flex-1 min-h-[300px] bg-white rounded-2xl p-6 text-sm text-stone-600 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm border border-stone-200 leading-relaxed"
             spellCheck={false}
             placeholder={promptData?.prompt ? "解析中..." : "尚未載入 Prompt..."}
           />
         </div>
      </div>
    </div>
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
          <div className="flex flex-col gap-8">
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
