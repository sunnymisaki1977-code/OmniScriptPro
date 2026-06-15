"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Database, AlertCircle, Image as ImageIcon, Sparkles, Copy, ExternalLink, BotMessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

interface NotionPage {
  id: string;
  title: string;
}

// 提取視覺 Prompt (16:9 和 9:16)
const extractVisionPrompts = (text: string) => {
  if (!text) return [];
  const sectionMatch = text.match(/###.*?視覺.*Prompt[\s\S]*?(?=###|$)/i);
  if (!sectionMatch) return [];
  const section = sectionMatch[0];
  
  const options = [];
  
  // 尋找 16:9
  const match169 = section.match(/(?:16:9|橫式).*?(?:提示詞|Prompt)[：:]\s*([\s\S]*?)(?=\n\s*\d|\n\s*\*\*9:16|\n\s*9:16|$)/i);
  if (match169 && match169[1].trim()) {
    options.push({
      prompt: match169[1].trim(),
      mainTitle: "動態分割構圖",
      subTitle: "16:9 橫式比例",
      aspectRatio: "16:9"
    });
  }
  
  // 尋找 9:16
  const match916 = section.match(/(?:9:16|直式).*?(?:提示詞|Prompt)[：:]\s*([\s\S]*?)(?=\n\s*\d|\n\s*\*\*16:9|\n\s*16:9|$)/i);
  if (match916 && match916[1].trim()) {
    options.push({
      prompt: match916[1].trim(),
      mainTitle: "動態分割構圖",
      subTitle: "9:16 直式比例",
      aspectRatio: "9:16"
    });
  }

  // Fallback
  if (options.length === 0) {
     options.push({
        prompt: section.replace(/###.*?視覺.*?Prompt/i, '').trim(),
        mainTitle: "視覺動態 Prompt",
        subTitle: "預設抓取",
        aspectRatio: "16:9"
     });
  }
  
  return options;
};

// 提取圖卡排版字卡
const extractTextCards = (text: string) => {
  if (!text) return [];
  const sectionMatch = text.match(/###.*?圖卡排版字卡[\s\S]*?(?=###|$)/i);
  if (!sectionMatch) return [];
  const section = sectionMatch[0];
  
  const options = [];
  
  const blocks = section.split(/(?=\n\s*\d+\.\s*)/);
  for (const block of blocks) {
    if (block.trim().length < 10) continue;
    if (block.includes("圖卡排版字卡") && block.replace(/###.*?圖卡排版字卡/i, '').trim().length < 10) continue;
    
    let cleanBlock = block.replace(/###.*?圖卡排版字卡/i, '').trim();
    
    const titleMatch = cleanBlock.match(/(?:圖卡標題|標題)[：:]\s*([^\n]+)/i);
    const descMatch = cleanBlock.match(/(?:一句話說明|說明)[：:]\s*([^\n]+)/i);
    
    let mTitle = titleMatch ? titleMatch[1].trim() : "圖卡字卡";
    let mDesc = descMatch ? descMatch[1].trim() : "";
    
    // 如果沒有抓到結構化標題，用第一行當標題
    if (!titleMatch && !descMatch) {
       const lines = cleanBlock.split('\n').filter(l => l.trim().length > 0);
       if (lines.length > 0) {
         mTitle = lines[0].replace(/^\d+\.\s*\*\*|\*\*$/g, '').replace(/\*\*/g, '');
       }
    }
    
    options.push({
      prompt: cleanBlock,
      mainTitle: mTitle.replace(/\*\*/g, ''),
      subTitle: mDesc.replace(/\*\*/g, ''),
      aspectRatio: "1:1"
    });
  }
  
  if (options.length === 0 && section.trim().length > 20) {
      options.push({
          prompt: section.replace(/###.*?圖卡排版字卡/i, '').trim(),
          mainTitle: "排版字卡",
          subTitle: "預設內容",
          aspectRatio: "1:1"
      });
  }
  
  return options;
};

// 提取社群發布正文
const extractSocialPost = (text: string) => {
  if (!text) return [];
  const sectionMatch = text.match(/###.*?社群發布正文[\s\S]*?(?=###|$)/i);
  if (!sectionMatch) return [];
  const section = sectionMatch[0].replace(/###.*?社群發布正文/i, '').trim();
  
  if (section.length > 10) {
    return [{
      prompt: section,
      mainTitle: "社群發布正文",
      subTitle: "請直接複製使用",
      aspectRatio: "文字"
    }];
  }
  return [];
};


const VisionSubCard = ({
  opt,
  aspectRatio,
  index
}: {
  opt: {prompt: string, mainTitle: string, subTitle: string, aspectRatio?: string},
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
    const ratio = opt.aspectRatio || aspectRatio;
    const textToCopy = ratio === "文字" ? selected : `${selected}\n--ar ${ratio}`;
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
    const ratio = opt.aspectRatio || aspectRatio;
    const textToCopy = ratio === "文字" ? selected : `${selected}\n--ar ${ratio}`;
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
          {opt.mainTitle || `選項 ${index + 1}`}
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
        {opt.aspectRatio !== "文字" && (
            <div className="absolute bottom-4 right-6 pointer-events-none text-xs text-stone-400 font-bold bg-white/80 px-2 py-1 rounded">
            --ar {opt.aspectRatio || aspectRatio}
            </div>
        )}
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

const SocialVisionCard = ({
  stepId,
  title,
  subtitle,
  aspectRatio,
  options,
  pageId,
}: {
  stepId: number;
  title: string;
  subtitle: string;
  aspectRatio: string;
  options: {prompt: string, mainTitle: string, subTitle: string, aspectRatio?: string}[];
  pageId: string;
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleUploadImage = async () => {
    if (!imageFile || !pageId) return;
    setIsImporting(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64data = reader.result;
        const res = await fetch("/api/notion/upload-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId, fileData: base64data, fileName: `social_${stepId}_${Date.now()}.png`, blockTitle: title }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        toast.success(`${title} 圖片已成功匯入 Notion！`);
        setImageFile(null);
        setImagePreview(null);
      };
    } catch (err: any) {
      toast.error(err.message || "匯入失敗");
    } finally {
      setIsImporting(false);
    }
  };

  if (!options || options.length === 0) return null;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] border border-stone-200 shadow-xl overflow-hidden flex flex-col lg:flex-row w-full min-h-[400px]">
      {/* Left Panel */}
      <div className="bg-stone-900 w-full lg:w-72 p-6 md:p-8 flex flex-col shrink-0">
        <div className="sticky top-8">
          <div className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">{subtitle}</div>
          <h3 className="text-white text-2xl font-bold tracking-wider mb-6">{title}</h3>
          <p className="text-stone-400 text-sm leading-relaxed mb-8">
            請在右側文字框中反白框選您需要的段落，然後點擊小卡下方的按鈕進行複製。<br/><br/>未框選則預設複製該小卡的全部內容。
          </p>

          <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
            <label className="text-xs font-bold text-stone-300">匯入配圖至 Notion</label>
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
                  <span className="text-stone-400 text-xs font-medium">點擊上傳圖片</span>
                </div>
              )}
            </label>
            <Button
              onClick={handleUploadImage}
              disabled={!imageFile || isImporting || !pageId}
              className="w-full mt-2 bg-stone-700 hover:bg-stone-600 disabled:opacity-50 disabled:hover:bg-stone-700 text-white font-bold h-10 rounded-lg text-xs transition-all"
            >
              {isImporting ? "上傳中..." : "確認匯入"}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 md:p-8 bg-stone-100/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch content-start h-full">
          {options.map((opt, i) => (
            <VisionSubCard key={i} opt={opt} aspectRatio={aspectRatio} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const SocialVisionModule = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loadingPages, setLoadingPages] = useState(true);
  
  const [prompts, setPrompts] = useState<{step10: string}>({ step10: "" });
  const [fetchingPrompts, setFetchingPrompts] = useState(false);
  const [error, setError] = useState("");

  const fetchPages = async () => {
    setLoadingPages(true);
    setError("");
    try {
      const res = await fetch("/api/notion/list-pages");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPages(data.pages);
      if (data.pages.length > 0) {
        setSelectedPageId(data.pages[0].id);
      }
    } catch (err: any) {
      setError(err.message || "無法載入歸檔列表");
    } finally {
      setLoadingPages(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    if (!selectedPageId) return;
    const fetchPrompts = async () => {
      setFetchingPrompts(true);
      try {
        const res = await fetch("/api/notion/get-prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId: selectedPageId }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setPrompts({
          step10: data.prompts.step10 || "",
        });
      } catch (err: any) {
        toast.error("載入 Prompt 失敗");
      } finally {
        setFetchingPrompts(false);
      }
    };
    fetchPrompts();
  }, [selectedPageId]);

  return (
    <div className="flex flex-col gap-8 h-full overflow-y-auto pr-2 custom-scrollbar p-6">
      
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
            {prompts.step10 ? (
                <>
                <SocialVisionCard 
                stepId={10}
                title="視覺動態 Prompt"
                subtitle="二張卡片"
                aspectRatio="16:9"
                options={extractVisionPrompts(prompts.step10)}
                pageId={selectedPageId}
                />
                <SocialVisionCard 
                stepId={10}
                title="圖卡排版字卡"
                subtitle="四張卡片"
                aspectRatio="1:1"
                options={extractTextCards(prompts.step10)}
                pageId={selectedPageId}
                />
                <SocialVisionCard 
                stepId={10}
                title="社群發布正文"
                subtitle="一張卡片"
                aspectRatio="文字"
                options={extractSocialPost(prompts.step10)}
                pageId={selectedPageId}
                />
                </>
            ) : (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-stone-500 bg-white/50 rounded-2xl border-2 border-dashed border-stone-200">
                    <p className="font-medium">此主題尚未包含 Step 10 社群推播資料，請確認是否已透過主工作流完成全自動生成並歸檔。</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
