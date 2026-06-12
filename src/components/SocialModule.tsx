"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Database, AlertCircle, MessageSquareShare, Sparkles, Copy, ExternalLink, BotMessageSquare, ImagePlus, Settings, Send } from "lucide-react";
import { toast } from "react-hot-toast";

interface NotionPage {
  id: string;
  title: string;
}

const extractSection = (text: string, keyword: string) => {
  if (!text) return "";
  
  const blocks = text.split(/### /);
  if (keyword === "視覺 Prompt") {
     const visuals = blocks.filter(b => b.includes("視覺 Prompt")).map(b => "### " + b.trim()).join("\n\n");
     return visuals;
  }
  const found = blocks.find(b => b.includes(keyword));
  return found ? ("### " + found).trim() : "";
};

const SocialSubCard = ({ title, content, icon: Icon }: { title: string; content: string; icon: any }) => {
  const [text, setText] = useState(content);
  
  useEffect(() => {
    setText(content);
  }, [content]);

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200 p-6 flex flex-col gap-4 shadow-sm relative group transition-all hover:shadow-md h-full">
      <h4 className="font-bold text-stone-700 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
          <Icon size={16} />
        </div>
        {title}
      </h4>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 w-full bg-stone-50 rounded-xl p-5 text-sm text-stone-600 resize-none min-h-[300px] border border-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all leading-relaxed font-medium"
      />
      <Button
        onClick={() => {
          navigator.clipboard.writeText(text);
          toast.success("已複製！");
        }}
        className="absolute bottom-10 right-10 bg-stone-900 hover:bg-stone-800 text-white h-10 px-5 rounded-xl text-xs transition-all opacity-0 group-hover:opacity-100 shadow-xl shadow-black/10 flex items-center gap-2"
      >
        <Copy size={16} /> 複製文案
      </Button>
    </div>
  );
};

export const SocialModule = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loadingPages, setLoadingPages] = useState(false);
  const [fetchingPrompts, setFetchingPrompts] = useState(false);
  const [prompts, setPrompts] = useState<{ step1?: string; step2?: string }>({});
  const [error, setError] = useState<string | null>(null);

  // Generation & Publishing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [fbContent, setFbContent] = useState("");
  const [lineContent, setLineContent] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isGeneratingImagePrompt, setIsGeneratingImagePrompt] = useState(false);
  
  // Facebook Settings
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // Notion Images
  const [notionImages, setNotionImages] = useState<{url: string; name: string}[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPages();
    // Load saved FB credentials
    const savedPageId = localStorage.getItem("FB_PAGE_ID");
    const savedToken = localStorage.getItem("FB_ACCESS_TOKEN");
    if (savedPageId) setPageId(savedPageId);
    if (savedToken) setAccessToken(savedToken);
  }, []);

  useEffect(() => {
    if (selectedPageId) {
      fetchPrompts(selectedPageId);
      fetchImages(selectedPageId);
    }
  }, [selectedPageId]);

  const fetchImages = async (pageId: string) => {
    setIsFetchingImages(true);
    setNotionImages([]);
    setSelectedImageUrl("");
    try {
      const res = await fetch("/api/notion/get-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setNotionImages(data.images);
        setSelectedImageUrl(data.images[0].url);
      }
    } catch (err) {
      console.error("Failed to fetch images", err);
    } finally {
      setIsFetchingImages(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem("FB_PAGE_ID", pageId);
    localStorage.setItem("FB_ACCESS_TOKEN", accessToken);
    toast.success("FB 設定已儲存至瀏覽器");
    setShowSettings(false);
  };

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
    setPrompts({});
    setFbContent("");
    setLineContent("");
    setImagePrompt("");
    try {
      const res = await fetch("/api/notion/get-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setPrompts(data.prompts);
      toast.success("成功載入背景資料");
    } catch (err: any) {
      toast.error("抓取資料失敗: " + err.message);
    } finally {
      setFetchingPrompts(false);
    }
  };

  const generateSocialPost = async () => {
    if (!prompts.step1) {
      toast.error("缺少 Step 1 基礎背景研究內容作為背景");
      return;
    }
    const theme = pages.find(p => p.id === selectedPageId)?.title || "未知主題";
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, step1Content: prompts.step1 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setFbContent(data.content);
      toast.success("成功生成社群圖文懶人包！");
    } catch (err: any) {
      toast.error("生成失敗: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImagePrompt = async () => {
    if (!prompts.step1) {
      toast.error("缺少 Step 1 基礎背景研究內容作為背景");
      return;
    }
    const theme = pages.find(p => p.id === selectedPageId)?.title || "未知主題";
    
    setIsGeneratingImagePrompt(true);
    try {
      const res = await fetch("/api/social/generate-image-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, step1Content: prompts.step1 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setImagePrompt(data.content);
      toast.success("成功生成圖像提示詞！");
    } catch (err: any) {
      toast.error("圖像提示詞生成失敗: " + err.message);
    } finally {
      setIsGeneratingImagePrompt(false);
    }
  };

  const postToFacebook = async () => {
    if (!pageId || !accessToken) {
      toast.error("請先設定 Facebook Page ID 與 Access Token！");
      setShowSettings(true);
      return;
    }
    if (!selectedImageUrl) {
      toast.error("請選擇一張 Notion 圖像網址才能發佈至 Facebook！");
      return;
    }
    if (!fbContent) {
      toast.error("請先生成或撰寫貼文內容！");
      return;
    }

    setIsPosting(true);
    try {
      // Remove the "### FB社群 (深度長文)" title for a cleaner post
      const cleanMessage = fbContent.replace(/###\s*FB社群[^\n]*/i, "").trim();
      
      const res = await fetch("/api/facebook/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          accessToken,
          message: cleanMessage,
          imageUrl: selectedImageUrl,
        })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      toast.success(
        <div>
          <p>成功發佈至 Facebook！</p>
          <a href={`https://facebook.com/${data.post_id}`} target="_blank" rel="noreferrer" className="underline font-bold mt-1 block">
            點此查看貼文
          </a>
        </div>,
        { duration: 5000 }
      );
    } catch (err: any) {
      toast.error("發佈失敗: " + err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 font-calligraphy flex items-center gap-4">
            <Sparkles className="text-amber-500" size={36} />
            社群推播發控中心
          </h1>
          <p className="text-stone-500 text-lg mt-4">
            讀取影片腳本，由 AI 一鍵生成社群圖文並透過 Graph API 發布至 Facebook 粉專。
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowSettings(!showSettings)}
          className="border-stone-200 text-stone-600 bg-white"
        >
          <Settings size={16} className="mr-2" />
          Facebook 設定
        </Button>
      </div>

      {showSettings && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="font-bold text-stone-800">Facebook Graph API 設定</h3>
          <p className="text-sm text-stone-500 mb-2">請填入開發者後台取得的粉專 ID 與 Page Access Token（將存在您的瀏覽器中）。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Page ID</label>
              <input type="text" value={pageId} onChange={e => setPageId(e.target.value)} className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="1234567890..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-400 mb-1">Page Access Token</label>
              <input type="password" value={accessToken} onChange={e => setAccessToken(e.target.value)} className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none" placeholder="EAAB..." />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={saveSettings} className="bg-stone-900 text-white hover:bg-stone-800">儲存設定</Button>
          </div>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-stone-200 shadow-2xl p-10 space-y-8">
        <div className="space-y-4">
          <label className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] ml-1">
            選擇來源主題
          </label>
          
          <div className="flex gap-4">
            <div className="relative group flex-1 max-w-2xl">
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
          <div className="flex flex-col gap-8 min-h-[400px]">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-stone-200 p-10 flex flex-col gap-8 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-stone-900 flex items-center gap-3 font-calligraphy">
                    <MessageSquareShare size={28} className="text-amber-500"/>
                    社群推播發控中心
                  </h3>
                  <p className="text-stone-500 text-sm ml-10">一鍵生成動態視覺提示詞、圖卡排版字卡與社群正文</p>
                </div>
                <Button 
                  onClick={generateSocialPost} 
                  disabled={isGenerating || fetchingPrompts || !prompts.step1}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-[0_8px_30px_rgb(245,158,11,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                  <Sparkles size={20} className={isGenerating ? 'animate-spin' : ''} />
                  {isGenerating ? "AI 煉製中..." : "一鍵生成社群懶人包"}
                </Button>
              </div>

              {fbContent ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  <SocialSubCard 
                    title="視覺動態 Prompt" 
                    content={extractSection(fbContent, "視覺 Prompt")} 
                    icon={ImagePlus} 
                  />
                  <SocialSubCard 
                    title="圖卡排版字卡" 
                    content={extractSection(fbContent, "圖卡排版字卡")} 
                    icon={BotMessageSquare} 
                  />
                  <SocialSubCard 
                    title="社群發布正文" 
                    content={extractSection(fbContent, "社群發布正文")} 
                    icon={MessageSquareShare} 
                  />
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center gap-6 text-stone-400 bg-stone-50/50 rounded-[2rem] border-2 border-stone-100 border-dashed mt-4">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Sparkles size={32} className="text-stone-300" />
                  </div>
                  <p className="font-medium text-stone-500 tracking-wide">點擊右上角按鈕，即可一鍵產出完整圖文懶人包</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
