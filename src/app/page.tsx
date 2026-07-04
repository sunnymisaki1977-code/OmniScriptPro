"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  Globe, 
  ShieldCheck, 
  ArrowRight, 
  Moon, 
  Sun,
  LayoutTemplate,
  Database,
  Share2,
  Video,
  PenTool,
  CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  // 預設為深色模式，符合高階科技 SaaS 質感
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 定義六大受眾模組資料
  const audiences = [
    { title: "歷史迷因", desc: "極速 5-Step 短影音爆款矩陣，用現代迷因吐槽歷史人物", color: "from-amber-500 to-red-500" },
    { title: "民俗信仰", desc: "冷冽科技感、高對比度的深邃紫與霓虹粉，專為歷史解密設計", color: "from-purple-500 to-pink-500" },
    { title: "美妝保養", desc: "高質感、溫柔優雅、奢華玫瑰粉與香檳金，專為高感性視覺設計", color: "from-rose-400 to-amber-500" },
    { title: "旅遊生活", desc: "極速執行力、黃金極簡微光，專為單兵作業與快速發布設計", color: "from-amber-500 to-yellow-500" },
    { title: "美食料理", desc: "溫暖、勾引食慾的漸層橘與焦糖色，專為美食探店設計", color: "from-orange-400 to-yellow-500" },
    { title: "寵物照護", desc: "傳遞信任與安定的天空藍，專為動物行為與友善排版設計", color: "from-sky-500 to-indigo-500" }
  ];

  if (!mounted) return null;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
        
        {/* 背景裝飾光暈 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-rose-500/10 dark:bg-rose-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* 導覽列 */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-[#070b16]/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-xl tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                OmniScript PRO
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-slate-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              <Link 
                href="/workspace"
                className="px-5 py-2 text-sm font-bold rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform shadow-lg shadow-slate-900/20 dark:shadow-white/20"
              >
                進入工作區
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-8 animate-fade-in-up">
            <Sparkles className="w-3.5 h-3.5" />
            <span>全新 5-Step / 10-Step 智能矩陣引擎已上線</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
            您的全自動化 <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              多模態生成引擎
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed animate-fade-in-up delay-200">
            專為自媒體創作者與內容團隊打造。只需輸入靈感或上傳背景資料，系統將為您自動延展為長短影音腳本、SEO 標籤、社群貼文與 AI 視覺指令。
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
            <Link 
              href="/workspace"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg flex items-center gap-2 shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all"
            >
              開始自動生成
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="px-8 py-4 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-lg transition-all"
            >
              了解核心架構
            </a>
          </div>
        </section>

        {/* 核心痛點與解決方案 */}
        <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">打破創作瓶頸，一鍵完成所有繁雜流程</h2>
            <p className="text-slate-600 dark:text-slate-400">不再需要在多個工具間來回切換，我們為您整合了從文本到視覺的完整生產線。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-2 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6">
                <LayoutTemplate className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">動態工作流引擎</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                支援 5-Step 極速短影音或 10-Step 完整矩陣。Stage 1 連網查核建立基準，Stage 2 雲端批次處理確保邏輯連貫。
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-2 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">5,000 字自訂脈絡</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                不再受限於簡單的提問。您可以貼上高達 5,000 字的新聞稿、維基百科或採訪逐字稿，強制 AI 依據您的真實資料展開企劃。
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none hover:-translate-y-2 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">智能金鑰輪替與防禦</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                無縫相容舊版與 2026 新版 Google API 金鑰。遇到 401 錯誤或 429 流量限制時，系統將在一秒內自動退膛換彈匣，確保產出絕不中斷。
              </p>
            </div>
          </div>
        </section>

        {/* 六大受眾模組展示 */}
        <section className="py-20 px-6 bg-slate-100 dark:bg-[#0a0f1c] border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4">6 大專業受眾模組</h2>
              <p className="text-slate-600 dark:text-slate-400">根據您的內容定位，系統會自動切換專屬的 UI 風格與提示詞引擎。</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {audiences.map((aud, i) => (
                <div key={i} className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-transparent transition-all">
                  <div className={`absolute inset-0 bg-gradient-to-br ${aud.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className={`absolute inset-0 border-2 border-transparent bg-gradient-to-br ${aud.color} [mask-composite:exclude] [mask-image:linear-gradient(white,white),linear-gradient(white,white)] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl`} style={{ maskClip: 'padding-box, border-box' }} />
                  <h3 className={`text-xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r ${aud.color}`}>{aud.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{aud.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 功能亮點清單 */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-black mb-6 leading-tight">不僅僅是生成器，<br />更是您的數位大腦</h2>
              <ul className="space-y-6">
                {[
                  { icon: <Zap />, title: "Smart Resume (中斷接續)", desc: "網路斷線不擔心，系統自動掃描畫布，無縫接續未完成的步驟。" },
                  { icon: <Share2 />, title: "一鍵歸檔 Notion", desc: "串聯 Vercel 後端 API，將 10 個步驟的企劃矩陣直接推送到您的 Notion 資料庫。" },
                  { icon: <PenTool />, title: "視覺發控中心", desc: "自動將生成的圖片疊加標題與排版，支援 Imagen 4.0 頂級畫質。" }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">{item.title}</h4>
                      <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-3xl opacity-20 dark:opacity-30 rounded-full" />
              <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                  <div className="flex gap-2 pt-4">
                    <div className="h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg w-24" />
                    <div className="h-8 bg-pink-50 dark:bg-pink-500/20 rounded-lg w-32" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 relative overflow-hidden border-t border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50 dark:to-indigo-950/20 -z-10" />
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">準備好顛覆您的創作流程了嗎？</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
              馬上進入工作區，體驗自動化生成與無縫串接的強大威力。
            </p>
            <Link 
              href="/workspace"
              className="inline-flex px-10 py-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xl items-center gap-3 hover:scale-105 transition-transform shadow-2xl shadow-slate-900/20 dark:shadow-white/20"
            >
              進入 OmniScript PRO 系統
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800">
          <p>© 2026 OmniScript PRO. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
