"use client";

import React from "react";
import { useWorkflow } from "@/context/WorkflowContext";
import { cn } from "./ui";
import { LayoutGrid, Cloud, Image as ImageIcon, Music, MessageSquareShare } from "lucide-react";

export const Tabs = () => {
  const { activeView, setActiveView } = useWorkflow();

  return (
    <div className="flex items-center gap-1 py-1 px-6 bg-stone-100/50 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
      <button
        onClick={() => setActiveView("workflow")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
          activeView === "workflow"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-400 hover:text-stone-600 hover:bg-white/50"
        )}
      >
        <LayoutGrid size={16} />
        主工作流 (現有)
      </button>
      <button
        onClick={() => setActiveView("export")}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
          activeView === "export"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-400 hover:text-stone-600 hover:bg-white/50"
        )}
      >
        <Cloud size={16} />
        純淨資料匯出 (NotebookLM 橋接)
      </button>
      <button
        onClick={() => setActiveView("vision")}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
          activeView === "vision"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-400 hover:text-stone-600 hover:bg-white/50"
        )}
      >
        <ImageIcon size={16} />
        Gemini 視覺發控中心
      </button>
      <button
        onClick={() => setActiveView("suno")}
        className={cn(
          "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
          activeView === "suno"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-400 hover:text-stone-600 hover:bg-white/50"
        )}
      >
        <Music size={16} />
        Suno 配樂發控中心
      </button>
    </div>
  );
};
