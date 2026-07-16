
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
  Share2,
  BookOpen,
  Wand2,
  UserCheck
} from 'lucide-react';
import FlipCard from '@/components/FlipCard';
import { ChannelStats } from '@/components/ui/ChannelStats';

// --- LazyYoutube Component (維持原本的優秀設計) ---
interface LazyYoutubeProps {
  playlistId: string;
  previewVideoId?: string;
  title: string;
  isShorts?: boolean;
  colorClass?: string;
  className?: string;
}

const LazyYoutube = ({ playlistId, previewVideoId, title, isShorts = false, colorClass = "from-slate-700 to-slate-900", className = "" }: LazyYoutubeProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const baseAspect = isShorts ? 'aspect-[9/16] rounded-[2rem] md:rounded-[2.5rem] border-[4px] md:border-[8px] border-slate-800 dark:border-slate-900' : 'aspect-video rounded-2xl md:rounded-[2rem]';
  const widthClass = className.includes('w-') ? '' : (isShorts ? 'max-w-[280px] md:max-w-[320px] w-full mx-auto' : 'w-full');

  return (
    <div className={`relative overflow-hidden bg-slate-900 group shadow-2xl ${baseAspect} ${widthClass} ${className}`}>
      {/* 手機瀏海 (Mockup Notch) */}
      {isShorts && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-5 md:h-6 bg-slate-800 dark:bg-slate-900 rounded-b-xl md:rounded-b-2xl z-20 pointer-events-none flex justify-center items-end pb-1">
          <div className="w-12 md:w-16 h-1 rounded-full bg-black/50 border border-white/5" />
        </div>
      )}
      {!isLoaded ? (
        <button 
          onClick={() => setIsLoaded(true)}
          className="absolute inset-0 w-full h-full"
          aria-label={`Play video ${title}`}
        >
          {previewVideoId ? (
            <img 
              src={`https://i.ytimg.com/vi/${previewVideoId}/maxresdefault.jpg`} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-100" // 加入微微縮放效果
            />
          ) : (
            <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex flex-col items-center justify-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300 mb-3 md:mb-4 border border-white/30">
              <Play className="w-6 h-6 md:w-8 md:h-8 text-white ml-1 fill-white" />
            </div>
            <span className="text-white font-bold text-xs md:text-sm tracking-widest uppercase opacity-80 group-hover:opacity-100 transition-opacity">Click to Play</span>
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
  const [isDarkMode, setIsDarkMode] = useState(false); // 預設改為明亮模式，體驗星雲白
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 定義六大受眾模組資料 (加入 glowColor 用於動態背景光暈)
  const audiences = [
    { 
      id: "food",
      title: "美食料理", 
      desc: "溫暖、勾引食慾的漸層橘與焦糖色。專為餐飲品牌行銷、食譜教學與美食探店視覺設計。", 
      color: "from-orange-400 to-yellow-500",
      glowColor: "bg-orange-400", // 動態光暈色
      bgClass: "bg-orange-50 dark:bg-orange-500/10",
      textClass: "text-orange-500",
      features: ["勾引食慾視覺", "強烈 CTA"],
      playlistId: "PLF3eQyAQueV4",
      previewVideoId: "E1Oc1Eo_LcE",
      isShorts: false,
      flipData: {
        frontImage: ["/Golden_Mango_Summer_p1.jpg", "/Golden_Mango_Summer_p2.jpg", "/Golden_Mango_Summer_p3.jpg", "/Golden_Mango_Summer_p4.jpg", "/Golden_Mango_Summer_p5.jpg"],
        frontText: "台灣夏日創意芒果季：熱帶果實的飲食文化詩篇！教您如何完美運用當季芒果，打造絕美夏日甜點...",
        frontTags: "#創意芒果季 #台灣水果 #懶人食譜",
        backInput: "台灣夏日創意芒果季：熱帶果實的飲食文化詩篇",
        systemTasks: ["✓ 啟動食慾誘發矩陣", "✓ 步驟簡化與動態運鏡", "✓ 生成焦糖暖色調視覺指令"]
      }
    },
    { 
      id: "heritage",
      title: "民俗信仰", 
      desc: "冷冽科技感、高對比度的深邃紫與霓虹粉，結合宗教解密與歷史知識的長篇深度解說。", 
      color: "from-purple-500 to-pink-500",
      glowColor: "bg-purple-500",
      bgClass: "bg-purple-50 dark:bg-purple-500/10",
      textClass: "text-purple-600 dark:text-purple-400",
      features: ["深度考究", "賽博龐克視覺"],
      playlistId: "PL0WZUXr5VzkfAeqC9BCtya9yRVCfyimyC",
      previewVideoId: "ofIAOaVW_hU",
      isShorts: false,
      flipData: {
        frontImage: ["/Kongming_p1.jpg", "/Kongming_p2.jpg", "/Kongming_p3.jpg", "/Kongming_p4.jpg", "/Kongming_p5.jpg"],
        frontText: "本集帶您深入解析歷史謎因，揭開諸葛孔明背後的真實故事與傳奇事蹟...",
        frontTags: "#歷史謎因 #諸葛孔明 #三國歷史",
        backInput: "諸葛孔明",
        systemTasks: ["✓ 啟動深度矩陣", "✓ 執行史料交叉比對", "✓ 生成 Imagen 4.0 賽博粉提示詞"]
      }
    },
    { 
      id: "pet",
      title: "寵物照護", 
      desc: "傳遞信任與安定的天空藍。專為寵物醫療知識、動物行為分析打造的知性長篇影片。", 
      color: "from-sky-400 to-indigo-500",
      glowColor: "bg-sky-400",
      bgClass: "bg-sky-50 dark:bg-sky-500/10",
      textClass: "text-sky-600 dark:text-sky-400",
      features: ["知性信任感", "專業感排版"],
      playlistId: "PLC-IrJAPGBww",
      previewVideoId: "5_4nrMvE4tg",
      isShorts: false,
      flipData: {
        frontImage: ["/Managing_Pet_p1.jpg", "/Managing_Pet_p2.jpg", "/Managing_Pet_p3.jpg", "/Managing_Pet_p4.jpg", "/Managing_Pet_p5.jpg"],
        frontText: "寵物行為不是在報復！專業獸醫帶你讀懂 3 個關鍵求救訊號，為毛孩打造零壓力的寵物照護空間...",
        frontTags: "#寵物行為 #寵物照護 #新手毛爸媽",
        backInput: "寵物照護",
        systemTasks: ["✓ 啟動信任感矩陣", "✓ 醫學知識結構化", "✓ 生成溫暖治癒系視覺指令"]
      }
    },
    { 
      id: "beauty",
      title: "美妝保養", 
      desc: "高質感、溫柔優雅的奢華玫瑰金。專為美妝開箱、高感性生活分享所設計的精緻腳本。", 
      color: "from-rose-400 to-amber-400",
      glowColor: "bg-rose-400",
      bgClass: "bg-rose-50 dark:bg-rose-500/10",
      textClass: "text-rose-600 dark:text-rose-400",
      features: ["高質感腳本", "暖光濾鏡"],
      playlistId: "PLA1T_pcDfevM",
      previewVideoId: "CQMXYgWGWZo",
      isShorts: false,
      flipData: {
        frontImage: ["/Sensory_Medical_Aesthetics _p1.jpg", "/Sensory_Medical_Aesthetics _p2.jpg", "/Sensory_Medical_Aesthetics _p3.jpg"],
        frontText: "「Parfums De Bastide 與 嘉丹妮爾」深度解析兩大品牌的魅力所在，3 分鐘帶你找到命定保養...",
        frontTags: "#ParfumsDeBastide #嘉丹妮爾 #美妝保養",
        backInput: "Parfums De Bastide 與 嘉丹妮爾",
        systemTasks: ["✓ 啟動質感矩陣", "✓ 情境帶入與痛點放大", "✓ 配置唯美玫瑰金視覺指令"]
      }
    },
    { 
      id: "travelpreneur",
      title: "旅遊生活", 
      desc: "極速執行力、黃金極簡微光。專為單兵作業的自媒體 VLOG、產品發布與高商業價值轉換設計。", 
      color: "from-amber-400 to-yellow-500",
      glowColor: "bg-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-500/10",
      textClass: "text-amber-600 dark:text-amber-500",
      features: [ "極速執行", "商業轉換"],
      playlistId: "PLCaj4rNP2njM",
      previewVideoId: "X2zk7iQPGd8",
      isShorts: false,
      flipData: {
        frontImage: ["/2026_大阪旅遊全攻略 P1.jpg", "/2026_大阪旅遊全攻略 P2.jpg", "/2026_大阪旅遊全攻略 P3.jpg", "/2026_大阪旅遊全攻略 P4.jpg", "/2026_大阪旅遊全攻略 P5.jpg"],
        frontText: "2026日本大阪旅遊新趨勢！大揭密這幾個你絕對不能錯過的避世咖啡廳與私房秘境景點...",
        frontTags: "#大阪旅遊 #2026新趨勢 #一人旅行",
        backInput: "2026日本大阪旅遊新趨勢",
        systemTasks: ["✓ 啟動商業轉換矩陣", "✓ 價值提煉與痛點解決", "✓ 生成高質感電影級視覺指令"]
      }
    },
    { 
      id: "historyMeme",
      title: "歷史迷因", 
      desc: "用現代迷因與幽默視角，吐槽歷史人物的極限操作。專為 TikTok / Shorts 流量收割設計。", 
      color: "from-red-400 to-orange-500",
      glowColor: "bg-red-500",
      bgClass: "bg-red-50 dark:bg-red-500/10",
      textClass: "text-red-500",
      features: ["流量收割", "毒雞湯語錄"],
      playlistId: "PLS7BJQ4awAeM",
      previewVideoId: "Anq2dnER4TA",
      isShorts: true,
      flipData: {
        frontImage: ["/Kongming_p1.jpg", "/Kongming_p2.jpg", "/Kongming_p3.jpg", "/Kongming_p4.jpg", "/Kongming_p5.jpg"],
        frontText: "「諸葛孔明草船借箭？根本是古代版無本當沖！」用 10 秒迷因梗圖搭配洗腦 BGM，瞬間引爆演算法推播...",
        frontTags: "#歷史迷因 #三國演義 #諸葛孔明",
        backInput: "幫我寫一篇關於「諸葛孔明」的歷史迷因腳本，用現代投資客的角度來寫。",
        systemTasks: ["✓ 啟動極速矩陣", "✓ 轉換為毒雞湯語氣", "✓ 注入洗腦梗圖指令"]
      }
    }
  ];

  if (!mounted) return null;

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen transition-colors duration-700 font-sans`}>
      {/* 統一星雲畫布背景 (Pearlescent Canvas) - 取代純白底色 */}
      <div className="min-h-screen text-[#1E293B] selection:bg-[#10B981]/30 overflow-x-hidden relative scroll-smooth transition-colors duration-700" 
           style={!isDarkMode ? { background: 'radial-gradient(circle at top right, #F9F7F1 0%, #E8EDF2 50%, #E2E6ED 100%)' } : { background: 'radial-gradient(circle at top right, #1E293B 0%, #0F172A 50%, #020617 100%)' }}>
        
        {/* 全域背景環境光 (Ambient Glow) - 宇宙藍與香檳金的交織 */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0A2E5C]/10 dark:bg-[#0A2E5C]/30 blur-[150px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 dark:bg-[#D4AF37]/20 blur-[120px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        
        {/* Navbar - 玻璃擬物設計 */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-[#020617]/50 backdrop-blur-xl transition-colors duration-500">
          <div className="w-full px-4 md:px-8 h-[80px] relative flex items-center justify-between">
            <div className="flex items-center gap-2 shrink-0 relative z-10">
             <img src="https://omni-script-pro.vercel.app/OmniScript%20logo.png" alt="OmniScript" className="h-10 md:h-12 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
            </div>

         <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap w-full text-center pointer-events-none">
  <div className="relative inline-block">
    {/* 1. 底層微光暈：為文字墊上一層隱約的星雲光澤 */}
    <div className="absolute inset-0 blur-lg bg-gradient-to-r from-[#0A2E5C]/10 via-[#10B981]/10 to-[#D4AF37]/10 dark:from-sky-400/20 dark:via-white/10 dark:to-amber-100/20 -z-10 transition-all duration-700" />
    
    {/* 2. 主文字：套用高質感的漸層金屬色澤 */}
    <span 
      className="text-[24px] xl:text-[28px] tracking-[0.2em] font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] via-[#1E293B] to-[#0A2E5C] dark:from-white dark:via-slate-200 dark:to-slate-400 drop-shadow-sm transition-all duration-700" 
      style={{ fontFamily: "'Noto Serif TC', serif" }}
    >
      讓你的影響力，無所不在<span className="mx-2 text-[#10B981]/70 dark:text-sky-300/60 font-light">｜</span>あなたの影響力を、あらゆる場所へ
    </span>
  </div>
</div>
            </div>

            <div className="flex items-center gap-4 shrink-0 relative z-10">
              <button 
                onClick={toggleTheme}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-white/50 dark:hover:bg-white/10 transition-colors backdrop-blur-sm border border-transparent hover:border-white/20"
                aria-label="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-100" /> : <Moon className="w-5 h-5 text-[#0A2E5C]" />}
              </button>
            </div>
          </div>
        </nav>

        <main className="relative z-10">
          {/* 1. Hero Section */}
          <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pt-20">
            {/* 隱藏過於生硬的漸層遮罩，讓卡片自然融入星雲背景 */}
            <div className="absolute inset-0 pt-20 w-full flex flex-col justify-center z-10 pointer-events-auto opacity-40 hover:opacity-100 transition-opacity duration-700">
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-3">
                {[...audiences, ...audiences].map((a, idx) => (
                  <div key={`marquee-${a.id}-${idx}`} className="w-[280px] sm:w-[360px] shrink-0 transition-transform duration-300 hover:scale-[1.02]">
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

            {/* Hero 核心文案區 - 微玻璃背板 */}
            <div className="relative z-20 px-6 sm:px-12 w-[90%] max-w-4xl mx-auto py-16 flex flex-col items-center justify-center text-center pointer-events-none">
              <div className="absolute inset-0 bg-white/40 dark:bg-[#0F172A]/60 backdrop-blur-2xl rounded-[3rem] border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] -z-10 transition-colors duration-500" />
              
              <div className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/10 text-[#0A2E5C] dark:text-sky-300 text-xs md:text-sm font-bold mb-8 animate-fade-in-up shadow-sm backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span>OmniScript PRO 智能矩陣引擎 v2.0</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-tight animate-fade-in-up delay-100 text-[#1E293B] dark:text-white drop-shadow-sm">
                您的全自動化 <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] to-[#10B981] dark:from-sky-400 dark:to-emerald-400">
                  多模態生成引擎
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-[#64748B] dark:text-slate-300 max-w-2xl mb-10 leading-relaxed animate-fade-in-up delay-200 font-medium">
                打破跨平台內容碎片化的窘境。只需輸入靈感，系統即為您展開長短影音腳本、SEO 標籤、社群圖文與 AI 視覺指令。
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300 pointer-events-auto">
                <Link 
                  href="/workspace"
                  // 按鈕使用品牌主色漸層 (超新星綠 -> 宇宙藍)
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#10B981] to-[#0A2E5C] hover:from-[#0ea5e9] hover:to-[#0A2E5C] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(10,46,92,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(16,185,129,0.4)] transition-all duration-300"
                >
                  進入自由軌道工作區
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>

          {/* 3. 互動式受眾展示區 (Audience Hub) - 動態環境光 */}
          <section className="py-32 px-6 relative">
            {/* 隨受眾切換的動態光暈 (The Magic Ambient Glow) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-4xl max-h-4xl rounded-full blur-[120px] md:blur-[180px] opacity-20 dark:opacity-30 pointer-events-none z-0 transition-colors duration-1000 ${audiences[activeTab].glowColor}`} />

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black mb-4 text-[#1E293B] dark:text-white drop-shadow-sm">6 大專業受眾模組切換</h2>
                <p className="text-lg text-[#64748B] dark:text-slate-400 max-w-3xl mx-auto">
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
                      // 移除生硬邊框，改用微玻璃與極淡線條
                      className={`min-h-[64px] text-left px-6 py-5 rounded-[1.5rem] transition-all duration-300 group ${
                        activeTab === idx 
                          ? `bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden transform scale-[1.02]` 
                          : `bg-white/30 dark:bg-white/5 backdrop-blur-sm border border-transparent hover:bg-white/50 dark:hover:bg-white/10`
                      }`}
                    >
                      {activeTab === idx && (
                        <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${aud.color}`} />
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`text-xl font-bold mb-1 transition-colors ${activeTab === idx ? 'text-[#0A2E5C] dark:text-white' : 'text-[#64748B] group-hover:text-[#1E293B] dark:text-slate-400 dark:group-hover:text-slate-200'}`}>
                            {aud.title}
                          </h3>
                          <p className={`text-sm line-clamp-1 transition-colors ${activeTab === idx ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'}`}>
                            {aud.features.join(" • ")}
                          </p>
                        </div>
                        {activeTab === idx && <ArrowRight className={`w-5 h-5 ${aud.textClass} animate-pulse`} />}
                      </div>

                      {activeTab === idx && (
                        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${aud.bgClass} ${aud.textClass} text-xs font-bold mb-3 border border-current/10`}>
                            <Sparkles className="w-4 h-4" />
                            <span>專屬風格光譜</span>
                          </div>
                          <p className="text-sm md:text-base text-[#64748B] dark:text-slate-400 leading-relaxed">
                            {aud.desc}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* 右側展示區 */}
                <div className="flex-[1.5] flex items-center justify-center relative">
                  {/* 受眾專屬裝飾背景 */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${audiences[activeTab].color} opacity-5 dark:opacity-10 rounded-[3rem] -z-10 transition-colors duration-700`} />
                  
                  <div className={`relative group w-full ${audiences[activeTab].isShorts ? 'max-w-[280px] md:max-w-[320px]' : 'max-w-2xl'} mx-auto transition-all duration-500`} style={{ perspective: '1000px' }}>
                    {/* 發光輪廓 */}
                    <div className={`absolute -inset-2 bg-gradient-to-tr ${audiences[activeTab].color} rounded-[2.5rem] md:rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-500`} />
                    <div className="relative bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/40 dark:border-slate-700 rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-3 overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1">
                      <LazyYoutube 
                        playlistId={audiences[activeTab].playlistId} 
                        previewVideoId={audiences[activeTab].previewVideoId}
                        title={`${audiences[activeTab].title} Demo Video`}
                        isShorts={audiences[activeTab].isShorts}
                        colorClass={audiences[activeTab].color}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ... (其餘的 section 4 系統穩定度模組, 4.5 願景與使命 保持不變，可套用類似的玻璃擬物風格) ... */}

          {/* 5. Final CTA - 採用香檳星光與宇宙藍交織 */}
          <section className="py-32 px-6 relative overflow-hidden border-t border-white/20 dark:border-slate-800/50">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A2E5C]/5 dark:to-[#0A2E5C]/20 -z-10" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#1E293B] dark:text-white">準備好顛覆您的創作軌跡了嗎？</h2>
              <p className="text-xl text-[#64748B] dark:text-slate-400 mb-10">
                馬上進入工作區，體驗自動化生成與無縫串接的強大威力。
              </p>
              <Link 
                href="/workspace"
                className="inline-flex min-h-[64px] px-10 py-4 rounded-full bg-[#0A2E5C] text-white font-black text-xl items-center justify-center gap-3 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(10,46,92,0.3)] hover:shadow-[0_15px_40px_rgba(10,46,92,0.5)] border border-[#0A2E5C]/50"
              >
                啟動引擎
                <ArrowRight className="w-6 h-6 text-[#D4AF37]" /> {/* 香檳金點綴 */}
              </Link>
            </div>
          </section>

        </main>

        <footer className="py-8 text-center text-sm text-[#64748B] dark:text-slate-500 border-t border-white/20 dark:border-slate-800/50 relative z-10">
          <p>© 2026 OmniScript PRO. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

