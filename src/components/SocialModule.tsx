"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { ChevronDown, Database, AlertCircle, MessageSquareShare, Sparkles, Copy, ExternalLink, BotMessageSquare, ImagePlus, Settings, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import { useWorkflow } from "@/context/WorkflowContext";

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
  const { theme, stepsData } = useWorkflow();
  const [isGenerating, setIsGenerating] = useState(false);
  const [fbContent, setFbContent] = useState("");

  const generateSocialPost = async () => {
    if (!stepsData[1]) {
      toast.error("缺少 Step 1 基礎背景研究內容作為背景");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: theme || "未知主題", step1Content: stepsData[1] }),
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

  return (
    <div className="flex flex-col gap-8 h-full w-full">
      <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-stone-200 p-10 flex flex-col gap-8 shadow-2xl relative h-full">
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
            disabled={isGenerating || !stepsData[1]}
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
  );
};
