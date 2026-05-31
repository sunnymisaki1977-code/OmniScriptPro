"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Database, AlertCircle, MessageSquareShare, Sparkles, Copy, ExternalLink, BotMessageSquare, ImagePlus, Settings, Send } from "lucide-react";
import { toast } from "react-hot-toast";

interface NotionPage {
  id: string;
  title: string;
}

export const SocialModule = () => {
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState("");
  const [loadingPages, setLoadingPages] = useState(false);
  const [fetchingPrompts, setFetchingPrompts] = useState(false);
  const [prompts, setPrompts] = useState<{ step2?: string }>({});
  const [error, setError] = useState<string | null>(null);

  // Generation & Publishing State
  const [isGenerating, setIsGenerating] = useState(false);
  const [fbContent, setFbContent] = useState("");
  const [lineContent, setLineContent] = useState("");
  
  // Facebook Settings
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
    }
  }, [selectedPageId]);

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
    if (!prompts.step2) {
      toast.error("缺少 Step 2 影片腳本內容作為背景");
      return;
    }
    const theme = pages.find(p => p.id === selectedPageId)?.title || "未知主題";
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, step2Content: prompts.step2 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Parse blocks
      const text = data.content;
      const blocks = text.split(/(?=###\s*(?:FB|LINE))/i);
      let fb = "";
      let line = "";
      
      for (const block of blocks) {
        if (block.match(/###\s*FB社群/i)) {
          fb = block.trim();
        } else if (block.match(/###\s*LINE官方帳號/i)) {
          line = block.trim();
        }
      }
      
      if (!fb && !line) {
         const cleanBlocks = text.split(/(?=###)/).filter((b: string) => b.trim().length > 10);
         fb = cleanBlocks[0] || text;
         line = cleanBlocks[1] || "";
      }
      
      setFbContent(fb);
      setLineContent(line);
      toast.success("成功生成社群貼文！");
    } catch (err: any) {
      toast.error("生成失敗: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const postToFacebook = async () => {
    if (!pageId || !accessToken) {
      toast.error("請先設定 Facebook Page ID 與 Access Token！");
      setShowSettings(true);
      return;
    }
    if (!imageFile) {
      toast.error("請上傳一張圖片才能發佈至 Facebook！");
      return;
    }
    if (!fbContent) {
      toast.error("請先生成或撰寫貼文內容！");
      return;
    }

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("pageId", pageId);
      formData.append("accessToken", accessToken);
      // Remove the "### FB社群 (深度長文)" title for a cleaner post
      const cleanMessage = fbContent.replace(/###\s*FB社群[^\n]*/i, "").trim();
      formData.append("message", cleanMessage);
      formData.append("image", imageFile);

      const res = await fetch("/api/facebook/post", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      
      toast.success(
        <div>
          <p>成功發佈至 Facebook！</p>
          <a href={\`https://facebook.com/\${data.post_id}\`} target="_blank" rel="noreferrer" className="underline font-bold mt-1 block">
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

            <Button 
              onClick={generateSocialPost} 
              disabled={isGenerating || fetchingPrompts || !prompts.step2}
              className="bg-amber-500 hover:bg-amber-600 text-white h-auto py-5 px-8 rounded-2xl font-bold shadow-lg shadow-amber-500/20 text-lg"
            >
              <Sparkles size={20} className={\`mr-2 \${isGenerating ? 'animate-spin' : ''}\`} />
              {isGenerating ? "生成中..." : "AI 自動生成貼文"}
            </Button>
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
          <div className="flex flex-col lg:flex-row gap-8 min-h-[400px]">
            {/* FB Posting Section */}
            <div className="flex-1 bg-stone-50 rounded-[2rem] border border-stone-200 p-8 flex flex-col gap-6 relative shadow-inner">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#1877F2] flex items-center gap-2">
                  <MessageSquareShare size={24}/>
                  Facebook 發布設定
                </h3>
                <Button 
                  onClick={postToFacebook}
                  disabled={isPosting || !fbContent || !imageFile}
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white px-6 font-bold rounded-xl shadow-lg shadow-[#1877F2]/20"
                >
                  {isPosting ? <Sparkles size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                  一鍵發送至 FB
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-stone-500">FB 貼文內容 (可編輯)</label>
                  <textarea 
                    value={fbContent}
                    onChange={(e) => setFbContent(e.target.value)}
                    className="flex-1 w-full bg-white rounded-xl p-4 text-sm text-stone-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1877F2]/50 border border-stone-200 leading-relaxed min-h-[250px]"
                    placeholder="點擊上方「AI 自動生成貼文」..."
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-stone-500">附帶圖片 (必須上傳)</label>
                  <label className="flex-1 w-full bg-white rounded-xl border-2 border-dashed border-stone-300 hover:border-[#1877F2]/50 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group min-h-[250px]">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    {imagePreview ? (
                      <div className="relative w-full h-full p-2">
                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg m-2">
                            <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full">點擊更換圖片</span>
                         </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-stone-400 group-hover:text-[#1877F2]">
                        <ImagePlus size={48} className="opacity-50" />
                        <span className="font-bold">點擊上傳 AI 生成圖片</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
