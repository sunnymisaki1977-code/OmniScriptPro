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
import FlipCard from '@/components/FlipCard';

// --- LazyYoutube Component ---
interface LazyYoutubeProps {
  playlistId: string;
  previewVideoId?: string;
  title: string;
  isShorts?: boolean;
  colorClass?: string;
}

const LazyYoutube = ({ playlistId, previewVideoId, title, isShorts = false, colorClass = "from-slate-700 to-slate-900" }: LazyYoutubeProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const aspectClass = isShorts ? 'aspect-[9/16] max-w-[320px] mx-auto rounded-[2.5rem] border-[8px] border-slate-800 dark:border-slate-900' : 'aspect-video w-full rounded-2xl';

  return (
    <div className={`relative w-full overflow-hidden bg-slate-900 group shadow-2xl ${aspectClass}`}>
      {/* 手機瀏海 (Mockup Notch) */}
      {isShorts && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 dark:bg-slate-900 rounded-b-2xl z-20 pointer-events-none flex justify-center items-end pb-1">
          <div className="w-16 h-1 rounded-full bg-black/50 border border-white/5" />
        </div>
      )}
      {!isLoaded ? (
        <button 
          onClick={() => setIsLoaded(true)}
          className="absolute inset-0 w-full h-full"
          aria-label={`Play video ${title}`}
        >
          {/* 美化版 Playlist 縮圖 */}
          {previewVideoId ? (
            <img 
              src={`https://i.ytimg.com/vi/${previewVideoId}/maxresdefault.jpg`} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            />
          ) : (
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors flex flex-col items-center justify-center">
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
      previewVideoId: "Anq2dnER4TA",
      isShorts: true,
      flipData: {
        frontImage: [
          "/Kongming_p1.jpg",
          "/Kongming_p2.jpg",
          "/Kongming_p3.jpg",
          "/Kongming_p4.jpg",
          "/Kongming_p5.jpg"
        ],
        frontText: "「諸葛孔明草船借箭？根本是古代版無本當沖！」用 10 秒迷因梗圖搭配洗腦 BGM，瞬間引爆演算法推播...",
        frontTags: "#歷史迷因 #三國演義 #諸葛孔明",
        backInput: "幫我寫一篇關於「諸葛孔明」的歷史迷因腳本，用現代投資客的角度來寫。",
        systemTasks: ["✓ 啟動 5-Step 極速矩陣", "✓ 轉換為毒雞湯語氣", "✓ 注入洗腦梗圖指令"]
      }
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
      previewVideoId: "ofIAOaVW_hU",
      isShorts: false,
      flipData: {
        frontImage: [
          "/Kongming_p1.jpg",
          "/Kongming_p2.jpg",
          "/Kongming_p3.jpg",
          "/Kongming_p4.jpg",
          "/Kongming_p5.jpg"
        ],
        frontText: "本集帶您深入解析歷史謎因，揭開諸葛孔明背後的真實故事與傳奇事蹟...",
        frontTags: "#歷史謎因 #諸葛孔明 #三國歷史",
        backInput: "諸葛孔明",
        systemTasks: ["✓ 啟動 10-Step 深度矩陣", "✓ 執行史料交叉比對", "✓ 生成 Imagen 4.0 賽博粉提示詞"]
      }
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
      previewVideoId: "5_4nrMvE4tg",
      isShorts: false,
      flipData: {
        frontImage: [
          "/Managing_Pet_p1.jpg",
          "/Managing_Pet_p2.jpg",
          "/Managing_Pet_p3.jpg",
          "/Managing_Pet_p4.jpg",
          "/Managing_Pet_p5.jpg"
        ],
        frontText: "寵物行為不是在報復！專業獸醫帶你讀懂 3 個關鍵求救訊號，為毛孩打造零壓力的寵物照護空間...",
        frontTags: "#寵物行為 #寵物照護 #新手毛爸媽",
        backInput: "寵物照護",
        systemTasks: ["✓ 啟動 10-Step 信任感矩陣", "✓ 醫學知識結構化", "✓ 生成溫暖治癒系視覺指令"]
      }
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
      previewVideoId: "CQMXYgWGWZo",
      isShorts: false,
      flipData: {
        frontImage: [
          "/Sensory_Medical_Aesthetics _p1.jpg",
          "/Sensory_Medical_Aesthetics _p2.jpg",
          "/Sensory_Medical_Aesthetics _p3.jpg"
        ],
        frontText: "「Parfums De Bastide 與 嘉丹妮爾」深度解析兩大品牌的魅力所在，3 分鐘帶你找到命定保養...",
        frontTags: "#ParfumsDeBastide #嘉丹妮爾 #美妝保養",
        backInput: "Parfums De Bastide 與 嘉丹妮爾",
        systemTasks: ["✓ 啟動 10-Step 質感矩陣", "✓ 情境帶入與痛點放大", "✓ 配置唯美玫瑰金視覺指令"]
      }
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
      previewVideoId: "E1Oc1Eo_LcE",
      isShorts: false,
      flipData: {
        frontImage: [
          "/Golden_Mango_Summer_p1.jpg",
          "/Golden_Mango_Summer_p2.jpg",
          "/Golden_Mango_Summer_p3.jpg",
          "/Golden_Mango_Summer_p4.jpg",
          "/Golden_Mango_Summer_p5.jpg"
        ],
        frontText: "台灣夏日創意芒果季：熱帶果實的飲食文化詩篇！教您如何完美運用當季芒果，打造絕美夏日甜點...",
        frontTags: "#創意芒果季 #台灣水果 #懶人食譜",
        backInput: "台灣夏日創意芒果季：熱帶果實的飲食文化詩篇",
        systemTasks: ["✓ 啟動 10-Step 食慾誘發矩陣", "✓ 步驟簡化與動態運鏡", "✓ 生成焦糖暖色調視覺指令"]
      }
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
      previewVideoId: "X2zk7iQPGd8",
      isShorts: false,
      flipData: {
        frontImage: [
          "/2026_大阪旅遊全攻略 P1.jpg",
          "/2026_大阪旅遊全攻略 P2.jpg",
          "/2026_大阪旅遊全攻略 P3.jpg",
          "/2026_大阪旅遊全攻略 P4.jpg",
          "/2026_大阪旅遊全攻略 P5.jpg"
        ],
        frontText: "2026日本大阪旅遊新趨勢！大揭密這幾個你絕對不能錯過的避世咖啡廳與私房秘境景點...",
        frontTags: "#大阪旅遊 #2026新趨勢 #一人旅行",
        backInput: "2026日本大阪旅遊新趨勢",
        systemTasks: ["✓ 啟動 10-Step 商業轉換矩陣", "✓ 價值提煉與痛點解決", "✓ 生成高質感電影級視覺指令"]
      }
    }
  ];

  if (!mounted) return null;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative scroll-smooth">
        
        {/* 背景裝飾光暈 */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none z-0" />
        
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#070b16]/70 backdrop-blur-xl">
          <div className="w-full px-4 md:px-8 h-[80px] relative flex items-center justify-between">
            {/* Logo 區塊 */}
            <div className="flex items-center gap-2 font-black text-xl tracking-tight shrink-0 relative z-10">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                OmniScript PRO
              </span>
            </div>

            {/* 品牌精神 Slogan (絕對置中) */}
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap w-full text-center pointer-events-none">
              <span className="text-[30px] text-slate-700 dark:text-white tracking-widest drop-shadow-md" style={{ fontFamily: "'Noto Serif TC', serif" }}>
                讓你的影響力，無所不在｜あなたの影響力を、あらゆる場所へ
              </span>
            </div>

            {/* 右側切換主題 */}
            <div className="flex items-center gap-4 shrink-0 relative z-10">
              <button 
                onClick={toggleTheme}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-slate-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
              </button>
            </div>
          </div>
        </nav>

        <main className="relative z-10">
          {/* 1. Hero Section (3-Layer Architecture) */}
          <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
            {/* Layer 2: Midground - Infinite Marquee */}
            <div className="absolute inset-0 pt-20 w-full flex flex-col justify-center z-10 pointer-events-auto">
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-3">
                {[...audiences, ...audiences].map((a, idx) => (
                  <div key={`marquee-${a.id}-${idx}`} className="w-[300px] sm:w-[360px] shrink-0 opacity-80 hover:opacity-100 transition-opacity duration-300">
                    <FlipCard 
                      theme={a.title}
                      frontImage={a.flipData.frontImage}
                      frontText={a.flipData.frontText}
                      frontTags={a.flipData.frontTags}
                      backInput={a.flipData.backInput}
                      systemTasks={a.flipData.systemTasks}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 邊緣漸層遮罩 (覆蓋在 Marquee 上，避免卡片切邊太生硬) */}
            <div className="absolute top-0 left-0 w-16 md:w-48 h-full bg-gradient-to-r from-slate-50 dark:from-[#030712] to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 md:w-48 h-full bg-gradient-to-l from-slate-50 dark:from-[#030712] to-transparent z-10 pointer-events-none" />

            {/* Layer 1: Foreground - Hero Text & CTA */}
            <div className="relative z-20 px-6 sm:px-12 w-[90%] max-w-3xl mx-auto h-[320px] sm:h-[400px] flex flex-col items-center justify-center text-center pointer-events-none">
              {/* 獨立背板：上下高度等同卡片，左右縮窄，使用毛玻璃與深色底 */}
              <div className="absolute inset-0 bg-slate-50/80 dark:bg-[#070b16]/85 backdrop-blur-xl rounded-[2.5rem] sm:rounded-[4rem] border border-slate-200/50 dark:border-slate-800/80 shadow-2xl -z-10" />
              
              <div className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-300 text-xs md:text-sm font-bold mb-6 sm:mb-8 animate-fade-in-up shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span>智能矩陣引擎 v2.0 全面上線</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 sm:mb-6 leading-tight animate-fade-in-up delay-100 drop-shadow-2xl text-slate-900 dark:text-white">
                您的全自動化 <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                  多模態生成引擎
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-xl mb-6 sm:mb-8 leading-relaxed animate-fade-in-up delay-200 font-medium drop-shadow-lg">
                打破跨平台內容碎片化的窘境。只需輸入靈感，系統即為您展開長短影音腳本、SEO 標籤、社群圖文與 AI 視覺指令。
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300 pointer-events-auto">
                <Link 
                  href="/workspace"
                  className="px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] sm:min-h-[56px] rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-105 transition-all"
                >
                  啟用 OmniScript PRO 系統
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
              </div>
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
                        previewVideoId={audiences[activeTab].previewVideoId}
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

          {/* 3.5 實戰背書 (Social Proof) */}
          <section className="py-24 px-6 bg-slate-900 dark:bg-[#030712] border-y border-slate-800">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                {/* 左側：數據與引言 (7欄) */}
                <div className="lg:col-span-7 flex flex-col gap-6 order-1 lg:order-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold w-fit">
                    <span>🏆 Featured Case Study / 官方實戰案例</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                    「將百萬字古籍田調，<br className="hidden md:block"/>濃縮於彈指之間。」
                  </h2>
                  
                  <blockquote className="text-lg md:text-xl text-slate-300 italic border-l-4 border-indigo-500 pl-6 py-2 my-4 bg-slate-800/30 rounded-r-xl">
                    「製作這樣一支考據嚴謹的歷史紀錄片，過去需要耗費數週。現在透過 OmniScript PRO，從文獻整理到腳本產出的時間大幅縮短，讓創作者能真正專注於『說好故事』。」
                    <footer className="text-slate-400 text-sm mt-4 font-semibold not-italic">
                      — @genimprint 世代銘印
                    </footer>
                  </blockquote>

                  <div className="flex flex-col sm:flex-row gap-6 mt-4">
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex-1">
                      <div className="text-slate-400 text-sm font-medium mb-2">腳本產出</div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl text-slate-500 line-through">3 Weeks</span>
                        <span className="text-3xl font-black text-emerald-400">2 Hours</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 flex-1">
                      <div className="text-slate-400 text-sm font-medium mb-2">內容深度</div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-indigo-400">5,000+</span>
                        <span className="text-lg text-slate-300">字基準真相查核</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 右側：展品 Mockup (5欄) */}
                <div className="lg:col-span-5 w-full order-2 lg:order-2">
                  <div className="relative group" style={{ perspective: '1000px' }}>
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-500" />
                    <div className="relative bg-slate-800 border-2 border-slate-700 rounded-[2.5rem] p-4 md:p-6 overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1">
                      <LazyYoutube 
                        playlistId="PLS7BJQ4awAeM" 
                        previewVideoId="Anq2dnER4TA" 
                        title="世代銘印 - 歷史紀錄片" 
                        isShorts={false} 
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
                啟用 OmniScript PRO 系統
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
