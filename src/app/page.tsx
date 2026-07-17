
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
  UserCheck,
  Sliders
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
  const baseAspect = isShorts ? 'aspect-[9/16] rounded-[2rem] md:rounded-[2.5rem] border-[4px] md:border-[8px] border-[#0A2E5C]' : 'aspect-video rounded-2xl md:rounded-[2rem]';
  const widthClass = className.includes('w-') ? '' : (isShorts ? 'max-w-[280px] md:max-w-[320px] w-full mx-auto' : 'w-full');

  return (
    <div className={`relative overflow-hidden bg-[#0A2E5C] group shadow-[0_15px_40px_rgba(10,46,92,0.3)] ${baseAspect} ${widthClass} ${className}`}>
      {/* 手機瀏海 (Mockup Notch) */}
      {isShorts && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-5 md:h-6 bg-[#0A2E5C] rounded-b-xl md:rounded-b-2xl z-20 pointer-events-none flex justify-center items-end pb-1">
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
    const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

    // 定義六大受眾模組資料 (加入 glowColor 用於動態背景光暈)
  const audiences = [
    { 
      id: "food",
      title: "美食料理", 
      desc: "溫暖、勾引食慾的漸層橘與焦糖色。專為餐飲品牌行銷、食譜教學與美食探店視覺設計。", 
      color: "from-orange-400 to-yellow-500",
      glowColor: "bg-orange-400", // 動態光暈色
      bgClass: "bg-orange-50 ",
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
      bgClass: "bg-purple-50 ",
      textClass: "text-purple-600 ",
      features: ["深度考究", "賽博龐克視覺"],
      playlistId: "PLS7BJQ4awAeM",
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
      bgClass: "bg-sky-50 ",
      textClass: "text-sky-600 ",
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
      bgClass: "bg-rose-50 ",
      textClass: "text-rose-600 ",
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
      bgClass: "bg-amber-50 ",
      textClass: "text-amber-600 ",
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
      bgClass: "bg-red-50 ",
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
    <div className="min-h-screen transition-colors duration-700 font-sans">
      {/* 統一星雲畫布背景 (Pearlescent Canvas) - 取代純白底色 */}
      <div className="min-h-screen text-[#1E293B] selection:bg-transparent  overflow-x-hidden relative scroll-smooth transition-colors duration-700" 
           style={{ background: 'radial-gradient(circle at top right, #F9F7F1 0%, #E8EDF2 50%, #E2E6ED 100%)' }}>
        
        {/* 全域背景環境光 (Ambient Glow) - 宇宙藍與香檳金的交織 */}
        <div className="fixed top-[-30%] left-[-30%] w-[70%] h-[70%] bg-[#0A2E5C]/10  blur-[150px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10  blur-[120px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        
        {/* Navbar - 玻璃擬物設計 */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-transparent bg-transparent backdrop-blur-xl transition-colors duration-500">
          <div className="w-full px-4 md:px-8 h-[80px] relative flex items-center justify-between">
            <div className="flex items-center gap-2 shrink-0 relative z-10">
             <img src="https://omni-script-pro.vercel.app/OmniScript%20logo.png" alt="OmniScript" className="h-10 md:h-12 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
            </div>

         <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap w-full text-center pointer-events-none">
  <div className="relative inline-block">
    {/* 1. 底層微光暈：為文字墊上一層隱約的星雲光澤 */}
    <div className="absolute inset-0 bg-transparent transition-all duration-700" />
    
    {/* 2. 主文字：套用高質感的漸層金屬色澤 */}
    <span 
      className="text-[24px] xl:text-[28px] tracking-[0.2em] font-medium text-transparent  bg-transparent  bg-clip-text bg-transparent bg-gradient-to-r from-[#0A2E5C] to-[#10B981]     transition-all duration-700" 
      style={{ fontFamily: "'Noto Serif TC', serif" }}
    >
      讓你的影響力，無所不在<span className="mx-2 text-[#10B981]/70  font-light">｜</span>あなたの影響力を、あらゆる場所へ
    </span>
  </div>
</div>
            </div>

            <div className="flex items-center gap-4 shrink-0 relative z-10">
              
            
          </div>
        </nav>

        <main className="relative z-10">
          {/* 1. Hero Section */}
          <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center overflow-hidden pt-20">{/* Hero 核心文案區 - 微玻璃背板 */}
            <div className="relative z-20 px-6 sm:px-12 w-[60%] max-w-4xl mx-auto py-16 flex flex-col items-center justify-center text-center pointer-events-none">
              <div className="absolute inset-0 bg-transparent  backdrop-blur-2xl rounded-[3rem] border border-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)]  -z-10 transition-colors duration-500" />
              
              <div className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2 rounded-full  bg-transparent   border-transparent   text-[#0A2E5C]  text-xs md:text-sm font-bold mb-8 animate-fade-in-up shadow-sm backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span>OmniScript PRO 智能矩陣引擎 v2.0</span>
              </div>
              
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] via-[#10B981] to-[#D4AF37]">
  您的全自動化 <br className="hidden sm:block" />
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] via-[#10B981] to-[#D4AF37]">
    多模態生成引擎
  </span>
</h1>
              
              <p className="text-base sm:text-lg md:text-xl text-[#64748B]  max-w-2xl mb-10 leading-relaxed animate-fade-in-up delay-200 font-medium">
                打破跨平台內容碎片化的窘境。只需輸入靈感即為您展開長短影音腳本、SEO 標籤、社群圖文與 AI 視覺指令。
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
          {/* 隱藏過於生硬的漸層遮罩，讓卡片自然融入星雲背景 */}
            <div className="relative mt-8 w-full flex flex-col justify-center z-10 pointer-events-auto opacity-40 hover:opacity-100 transition-opacity duration-700">
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

            </section>

          
          
          {/* 3.8 核心武器 (The Why - Three Core Weapons) */}
          <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
            {/* 區塊標題 */}
            <div className="text-center mb-16 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-bold mb-4 shadow-sm backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="tracking-widest uppercase">The Core Weapons</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">
                打造一人團隊的<br className="block md:hidden"/>終極內容軍火庫
              </h2>
              <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                跳脫空泛農場文與碎片化工具的泥沼。這是專為需要極致產能與知識深度的創作者，量身打造的三大核心武器。
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Weapon 1: 基準真相 (Trust & Depth - Sky/Indigo) */}
              <div className="group p-8 rounded-[2rem] bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 shadow-xl hover:border-sky-500/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                {/* 動態光暈 */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-sky-400/20 transition-colors duration-500" />
                
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center mb-8 shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Database className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white relative z-10">內容護城河</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 mb-5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <h4 className="text-[11px] font-bold text-sky-400 tracking-wider">5,000 字基準真相鎖定</h4>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm relative z-10 font-medium">
                  拒絕 AI 幻覺。將數千字原始古籍、文獻或考據資料設定為「唯一基準真相 (Ground Truth)」，強制 AI 鎖定事實展開企劃分支，確保所有產出皆具備無可挑剔的知識深度。
                </p>
              </div>

              {/* Weapon 2: 10-Step 矩陣 (Energy & Productivity - Amber/Orange) */}
              <div className="group p-8 rounded-[2rem] bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 shadow-xl hover:border-amber-500/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                {/* 動態光暈 */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-amber-400/20 transition-colors duration-500" />
                
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-8 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white relative z-10">多模態裂變引擎</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 mb-5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <h4 className="text-[11px] font-bold text-amber-400 tracking-wider">10-Step 全域自動化矩陣</h4>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm relative z-10 font-medium">
                  輸入一次靈感，自動展開 10 道工序。無縫轉譯長短影音腳本、SEO 標籤、社群圖文，並精準生成高質感繪圖指令與配樂 Prompt，將單點突破升級為立體打擊。
                </p>
              </div>

              {/* Weapon 3: 模組化與歸檔 (Control & Precision - Purple/Pink) */}
              <div className="group p-8 rounded-[2rem] bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800 shadow-xl hover:border-purple-500/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                {/* 動態光暈 */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-500" />
                
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Sliders className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white relative z-10">絕對掌控權</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 mb-5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <h4 className="text-[11px] font-bold text-purple-400 tracking-wider">模組化勾選與無縫歸檔</h4>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm relative z-10 font-medium">
                  你才是總編輯。自由勾選需要的素材模組以精準控管 API 額度；所有心血不僅支援 Markdown 單步下載，更支援一鍵同步至 Notion 雲端資料庫，讓產出即刻化為數位資產。
                </p>
              </div>
            </div>
          </section>
\n\n          {/* 4. 三大核心武器 (Three Core Weapons) */}
          <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
            <div className="bg-slate-900 dark:bg-black rounded-3xl border border-slate-800 p-8 md:p-12 shadow-2xl relative overflow-hidden">
              {/* InfoCard Decor */}
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap className="w-64 h-64 text-blue-500" />
              </div>
              
              <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Core Weapons</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight">
                    OmniScript PRO <br />真正最具殺傷力的<br />三大核心武器
                  </h2>
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                    這三大武器，完美定義了 OmniScript PRO 的價值：「用深度守護品質、用矩陣放大產能、用模組還原掌控權。」
                  </p>
                </div>
                
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">⚔️ 第一武器：內容護城河 ——「5,000 字基準真相鎖定」</h4>
                      <p className="text-slate-400 leading-relaxed text-sm mb-3"><span className="text-red-400 font-semibold">解決痛點：</span>AI 最致命的弱點就是「幻覺」與「農場文腔調」。對於需要處理龐大古籍、考究歷史人物與民俗信仰的頻道來說，這是一擊斃命的缺點。</p>
                      <p className="text-slate-400 leading-relaxed text-sm"><span className="text-emerald-400 font-semibold">武器威力：</span>系統強制在 Step 1 畫出一道防線。它不讓 AI 憑空捏造，而是將數千字的原始文獻、新聞稿或考據資料當作「唯一的基準真相 (Ground Truth)」。這確保了後續生成的所有腳本，都具備無可挑惕的文化底蘊與知識深度，這是其他套殼 AI 工具絕對做不到的品質保證。</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">⚔️ 第二武器：多模態裂變引擎 ——「10-Step 全域自動化矩陣」</h4>
                      <p className="text-slate-400 leading-relaxed text-sm mb-3"><span className="text-red-400 font-semibold">解決痛點：</span>一人團隊最大的極限就是時間。寫完長影音腳本，還要自己切短影音、想社群貼文、去 Midjourney 詠唱生圖、再去 Suno 試配樂，心力早就被榨乾。</p>
                      <p className="text-slate-400 leading-relaxed text-sm"><span className="text-emerald-400 font-semibold">武器威力：</span>輸入一次靈感，系統自動展開 10 個步驟。它不僅是個「寫稿機」，更是一位全能的虛擬製片。它能將同一套世界觀，無縫轉譯成 YouTube 長影音、Shorts 短片、社群文案，甚至精準吐出 Imagen 4.0 / Midjourney 的高質感繪圖指令與配樂 Prompt。將「單點突破」變成了「立體打擊」。</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg mb-2">⚔️ 第三武器：絕對掌控權 ——「模組化勾選與無縫歸檔」</h4>
                      <p className="text-slate-400 leading-relaxed text-sm mb-3"><span className="text-red-400 font-semibold">解決痛點：</span>創作者非常討厭「黑箱作業」與「資料被綁架」。強制跑完所有流程會浪費 API 額度，無法匯出則會讓人毫無安全感。</p>
                      <p className="text-slate-400 leading-relaxed text-sm"><span className="text-emerald-400 font-semibold">武器威力：</span>系統賦予使用者極致的彈性。你可以讓系統全自動跑完，也可以透過「勾選清單」只挑選需要的步驟（例如只要腳本，不要圖片）。最重要的是，產出的心血支援 Markdown 單步下載、一鍵複製，以及神級的「Notion 雲端同步歸檔」。系統完美配合你的步調，你依然是掌控一切的總編輯。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
\n          {/* 5. Final CTA - 採用香檳星光與宇宙藍交織 */}
          <section className="py-32 px-6 relative overflow-hidden border-t border-white/20 ">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A2E5C]/5  -z-10" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#1E293B] ">準備好顛覆您的創作軌跡了嗎？</h2>
              <p className="text-xl text-[#64748B]  mb-10">
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

        <footer className="py-8 text-center text-sm text-[#64748B]  border-t border-white/20  relative z-10">
          <p>© 2026 OmniScript PRO. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

