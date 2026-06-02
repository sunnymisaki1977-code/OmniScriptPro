"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui";
import { Sparkles, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CURRENT_VERSION = "v1.1.0"; // Update this when deploying new changes

const CHANGELOG = [
  {
    version: "v1.1.0",
    date: "2024-06-02",
    title: "社群推播與穩定性升級 🚀",
    changes: [
      "【新增】「開啟網頁跳出小視窗更新日誌」功能上線，掌握最新改版動態",
      "【新增】社群發控中心全新上線，支援 Facebook 一鍵圖文發布",
      "【優化】移除主工作流 Step 10，保持 1~9 步核心產製流程穩定",
      "【優化】修復了全自動生成因為 Token 長度過長導致 JSON 解析失敗 (500 Error) 的問題",
      "【優化】將社群貼文生成拆分為獨立模組，即時讀取「影片腳本」產出對應文案",
    ]
  },
  {
    version: "v1.0.2",
    date: "2024-05-31",
    title: "影音模組與介面優化 🎬",
    changes: [
      "【新增】Suno 音樂生成模組，支援一鍵產生背景配樂",
      "【新增】頻道數據儀表板，即時觀測 YouTube 流量趨勢",
      "【優化】重構左側邊欄導覽介面，操作更直覺流暢",
    ]
  },
  {
    version: "v1.0.1",
    date: "2024-05-28",
    title: "內容產製核心上線 ✨",
    changes: [
      "【新增】Notion 自動化串接，支援一鍵讀取企劃案背景",
      "【新增】九大工作流全自動生成，涵蓋標題、大綱到腳本",
      "【新增】支援輸出為 Docs 歸檔與 HTML 格式",
      "【優化】導入 Gemini 2.5 核心，大幅提升文字生成速度",
    ]
  }
];

export const ChangelogModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check local storage after mount
    const lastSeenVersion = localStorage.getItem("genimprint_last_seen_version");
    if (lastSeenVersion !== CURRENT_VERSION) {
      setIsOpen(true);
    }

    // Listen for manual trigger
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-changelog", handleOpen);
    return () => window.removeEventListener("open-changelog", handleOpen);
  }, []);

  const handleClose = () => {
    localStorage.setItem("genimprint_last_seen_version", CURRENT_VERSION);
    setIsOpen(false);
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200"
          >
            <div className="bg-amber-500 p-6 flex items-start justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4">
                <Sparkles size={100} className="text-white" />
              </div>
              <div className="relative z-10 text-white space-y-1">
                <h2 className="text-2xl font-bold font-calligraphy tracking-widest">更新日誌</h2>
                <p className="text-amber-100 font-medium tracking-wider">世代銘印系統升級 {CURRENT_VERSION}</p>
              </div>
              <button 
                onClick={handleClose}
                className="relative z-10 text-white/80 hover:text-white transition-colors bg-black/10 hover:bg-black/20 rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {CHANGELOG.map((log) => (
                <div key={log.version} className="space-y-4">
                  <div className="flex items-end gap-3 border-b border-stone-100 pb-2">
                    <h3 className="text-lg font-bold text-stone-800">{log.title}</h3>
                    <span className="text-xs font-bold text-stone-400 mb-0.5">{log.date}</span>
                  </div>
                  <ul className="space-y-3">
                    {log.changes.map((change, i) => (
                      <li key={i} className="flex gap-3 text-stone-600 text-sm leading-relaxed">
                        <CheckCircle2 size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="p-6 bg-stone-50 border-t border-stone-100 flex justify-end">
              <Button 
                onClick={handleClose}
                className="bg-stone-900 text-white hover:bg-stone-800 rounded-xl px-8 font-bold tracking-widest"
              >
                我知道了
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
