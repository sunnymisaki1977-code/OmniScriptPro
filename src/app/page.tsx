"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Moon, 
  Sun,
  LayoutTemplate,
  Database,
  ShieldCheck,
  Play,
  Server,
  RefreshCw,
  Lock,
  Share2
} from 'lucide-react';

// --- LazyYoutube Component ---
interface LazyYoutubeProps {
  playlistId: string;
  title: string;
  isShorts?: boolean;
  colorClass?: string;
}

const LazyYoutube = ({ playlistId, title, isShorts = false, colorClass = "from-slate-700 to-slate-900" }: LazyYoutubeProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const aspectClass = isShorts ? 'aspect-[9/16] max-w-[320px] mx-auto' : 'aspect-video w-full';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 group shadow-2xl ${aspectClass}`}>
      {!isLoaded ? (
        <button 
          onClick={() => setIsLoaded(true)}
          className="absolute inset-0 w-full h-full"
          aria-label={`Play video ${title}`}
        >
          {/* 美化版 Playlist 縮圖 (因為無法直接透過 playlistId 取得預設縮圖) */}
          <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300 mb-4 border border-white/30">
              <Play className="w-8 h-8 text-white ml-1 fill-white" />
            </div>
            <span className="text-white font-bold text-sm tracking-widest uppercase opacity-80">Click to Play Series</span>
          </div>
        </button>
      ) : (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  );
};

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 定義六大受眾模組資料 (Audience Hub)
  const audiences = [
    { 
      id: "historyMeme",
      title: "歷史迷因", 
      desc: "用現代迷因與幽默視角，吐槽歷史人物的極限操作。專為 TikTok / Shorts 流量收割設計。", 
      color: "from-amber-400 to-red-500",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-500",
      features: ["極速 5-Step", "流量收割", "毒雞湯語錄"],
      playlistId: "PLS7BJQ4awAeM",
      isShorts: true
    },
    { 
      id: "heritage",
      title: "民俗信仰", 
      desc: "冷冽科技感、高對比度的深邃紫與霓虹粉，結合宗教解密與歷史知識的長篇深度解說。", 
      color: "from-purple-500 to-pink-500",
      bgClass: "bg-purple-500/10",
      textClass: "text-purple-500",
      features: ["完整 10-Step", "深度考究", "賽博龐克視覺"],
      playlistId: "PL0WZUXr5VzkfAeqC9BCtya9yRVCfyimyC",
      isShorts: false
    },
    { 
      id: "pet",
      title: "寵物照護", 
      desc: "傳遞信任與安定的天空藍。專為寵物醫療知識、動物行為分析打造的知性長篇影片。", 
      color: "from-sky-500 to-indigo-500",
      bgClass: "bg-sky-500/10",
      textClass: "text-sky-500",
      features: ["完整 10-Step", "知性信任感", "專業感排版"],
      playlistId: "PLC-IrJAPGBww",
      isShorts: false
    },
    { 
      id: "beauty",
      title: "美妝保養", 
      desc: "高質感、溫柔優雅的奢華玫瑰金。專為美妝開箱、高感性生活分享所設計的精緻腳本。", 
      color: "from-rose-400 to-amber-500",
      bgClass: "bg-rose-500/10",
      textClass: "text-rose-500",
      features: ["完整 10-Step", "高質感腳本", "暖光濾鏡"],
      playlistId: "PLA1T_pcDfevM",
      isShorts: false
    },
    { 
      id: "food",
      title: "美食料理", 
      desc: "溫暖、勾引食慾的漸層橘與焦糖色。專為餐飲品牌行銷、食譜教學與美食探店視覺設計。", 
      color: "from-orange-400 to-yellow-500",
      bgClass: "bg-orange-500/10",
      textClass: "text-orange-500",
      features: ["完整 10-Step", "勾引食慾視覺", "強烈 CTA"],
      playlistId: "PLF3eQyAQueV4",
      isShorts: false
    },
    { 
      id: "travelpreneur",
      title: "旅遊生活", 
      desc: "極速執行力、黃金極簡微光。專為單兵作業的自媒體 VLOG、產品發布與高商業價值轉換設計。", 
      color: "from-amber-500 to-yellow-500",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-500",
      features: ["完整 10-Step", "極速執行", "商業轉換"],
      playlistId: "PLCaj4rNP2njM",
      isShorts: false
    }
  ];

  if (!mounted) return null;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative scroll-smooth">
        
        {/* 背景裝飾光暈 */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        
        {/* 導覽列 */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#070b16]/70 backdrop-blur-xl">
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
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-slate-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
              <Link 
                href="/workspace"
                className="px-5 py-2.5 min-h-[44px] flex items-center justify-center text-sm font-bold rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-transform shadow-lg shadow-slate-900/20 dark:shadow-white/20"
              >
                進入工作區
              </Link>
            </div>
          </div>
        </nav>

        <main className="relative z-10">
          {/* 1. Hero Section */}
          <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs md:text-sm font-bold mb-8 animate-fade-in-up">
              <Sparkles className="w-4 h-4" />
              <span>智能矩陣引擎 v2.0 全面上線</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight animate-fade-in-up delay-100">
              您的全自動化 <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                多模態生成引擎
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed animate-fade-in-up delay-200">
              打破跨平台內容碎片化的窘境。只需輸入靈感，系統即為您展開長短影音腳本、SEO 標籤、社群圖文與 AI 視覺指令。
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
              <Link 
                href="/workspace"
                className="px-8 py-4 min-h-[56px] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all"
              >
                開始自動生成
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* 2. 解決方案 (The Why) */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">為什麼需要 OmniScript PRO？</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">解決一人公司與行銷團隊最大的痛點：內容碎片化與繁雜的手動搬運。</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6">
                  <LayoutTemplate className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">動態工作流引擎</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  5-Step 短平快矩陣，或是 10-Step 深度展演。自動根據受眾目標切割執行步驟，確保邏輯世界觀 100% 連貫。
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
                  <Database className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">5,000 字自訂基準真相</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  不再瞎子摸象。直接貼上官方新聞稿、長篇逐字稿作為 Step 1，AI 會強制鎖定這些事實展開所有的企劃分支。
                </p>
              </div>
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-6">
                  <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Resume 中斷接續</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  網路不穩？不小心關閉網頁？系統會自動掃描目前畫布進度，從斷點無縫接續生成，絕不浪費您寶貴的 Token 額度。
                </p>
              </div>
            </div>
          </section>

          {/* 3. 互動式受眾展示區 (Audience Hub) */}
          <section className="py-24 px-6 bg-slate-100 dark:bg-[#0a0f1c] border-y border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black mb-4">6 大專業受眾模組切換</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                  不僅僅是 Prompt 的切換，系統會連同 UI 介面、渲染風格與產出邏輯一併切換。點擊下方標籤，查看對應的生成作品示範。
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* 左側 Tabs */}
                <div className="flex-1 flex flex-col gap-3">
                  {audiences.map((aud, idx) => (
                    <button
                      key={aud.id}
                      onClick={() => setActiveTab(idx)}
                      className={`min-h-[64px] text-left px-6 py-4 rounded-2xl border transition-all ${
                        activeTab === idx 
                          ? `bg-white dark:bg-slate-900 border-transparent shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden` 
                          : `bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:hover:bg-slate-800/50`
                      }`}
                    >
                      {/* Active State Background Gradient */}
                      {activeTab === idx && (
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${aud.color}`} />
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`text-xl font-bold mb-1 ${activeTab === idx ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {aud.title}
                          </h3>
                          <p className={`text-sm line-clamp-1 ${activeTab === idx ? 'text-slate-500' : 'text-slate-500 dark:text-slate-500'}`}>
                            {aud.features.join(" • ")}
                          </p>
                        </div>
                        {activeTab === idx && <ArrowRight className={`w-5 h-5 ${aud.textClass}`} />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* 右側展示區 */}
                <div className="flex-[1.5] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${audiences[activeTab].color} opacity-5`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-8">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${audiences[activeTab].bgClass} ${audiences[activeTab].textClass} text-xs font-bold mb-4`}>
                        <Sparkles className="w-4 h-4" />
                        <span>主題展示</span>
                      </div>
                      <h3 className="text-3xl font-black mb-4">{audiences[activeTab].title}</h3>
                      <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        {audiences[activeTab].desc}
                      </p>
                    </div>

                    {/* YouTube LazyLoad Container */}
                    <div className="mt-auto">
                      <LazyYoutube 
                        playlistId={audiences[activeTab].playlistId} 
                        title={`${audiences[activeTab].title} Demo Video`}
                        isShorts={audiences[activeTab].isShorts}
                        colorClass={audiences[activeTab].color}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 4. 系統穩定度模組 (Technical Trust) */}
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="bg-slate-900 dark:bg-black rounded-3xl border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* InfoCard Decor */}
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Server className="w-64 h-64 text-emerald-500" />
              </div>
              
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Technical Trust</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                    企業級的容錯穩定度 <br />不再擔心 API 中斷
                  </h2>
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                    面對 Google 嚴格的流量限制與 2026 金鑰大遷徙，我們的系統在後端築起了最強壯的防禦網，確保您的靈感產出永不停擺。
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">負載均衡 (隨機起手式)</h4>
                      <p className="text-slate-400 leading-relaxed">支援輸入多把金鑰 (以逗號分隔)。系統啟動時會隨機選用陣列中的金鑰，均攤每一把的流量消耗，降低被鎖定的風險。</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">401/403 無效金鑰自動切換</h4>
                      <p className="text-slate-400 leading-relaxed">混用新舊金鑰毫無顧忌。當遭遇舊金鑰淘汰或授權失效，後端會自動捕捉 401 錯誤，在一秒內背景拋棄它並切換至下一把備用金鑰，無縫接軌。</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">突破 429 流量限流機制</h4>
                      <p className="text-slate-400 leading-relaxed">連續生成導致單一金鑰過熱？系統會如同換彈匣般，瞬間切換金鑰並重發請求，輔以指數退避 (Exponential Backoff) 重試策略，確保每一次生成都能成功抵達。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Final CTA */}
          <section className="py-24 px-6 relative overflow-hidden border-t border-slate-200 dark:border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50 dark:to-indigo-950/20 -z-10" />
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-black mb-6">準備好顛覆您的創作流程了嗎？</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
                馬上進入工作區，體驗自動化生成與無縫串接的強大威力。
              </p>
              <Link 
                href="/workspace"
                className="inline-flex min-h-[64px] px-10 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xl items-center justify-center gap-3 hover:scale-105 transition-transform shadow-2xl shadow-slate-900/20 dark:shadow-white/20"
              >
                進入 OmniScript PRO 系統
                <ArrowRight className="w-6 h-6" />
              </Link>
            </div>
          </section>

        </main>

        {/* Footer */}
        <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 relative z-10">
          <p>© 2026 OmniScript PRO. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
