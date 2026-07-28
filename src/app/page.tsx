"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Database,
  Play,
  Sliders,
  Youtube
} from 'lucide-react';
import FlipCard from '@/components/FlipCard';
import { ChannelStats } from '@/components/ui/ChannelStats';

// --- LazyYoutube Component ---
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
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-100"
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

  // 定義六大受眾模組資料 (加深文字色彩提升在淺色背景的對比)
  const audiences = [
    { 
      id: "fintech",
      title: "FinTech 財經", 
      desc: "專業客觀、科技感的深藍與金色高光。專為全球總經、金融市場與量化分析打造的高含金量腳本。", 
      color: "from-blue-600 to-teal-500",
      glowColor: "bg-blue-600",
      bgClass: "bg-blue-100",
      textClass: "text-blue-700",
      features: ["總經分析", "彭博全息視覺"],
      playlistId: "PLDDnUDat-MmI",
      previewVideoId: "X2zk7iQPGd8",
      isShorts: false,
      flipData: {
        frontImage: [
          "/FinTech【崩盤警示篇】.png",
          "/FinTech【恐慌警示版】亞股血洗極限視覺.png",
          "/FinTech【恐懼與大師】極致數據衝突感.png",
          "/FinTech【技術救命訊號】精準抄底視角.png",
          "/FinTech【政策殺招篇】.png",
          "/FinTech【結構重組版】專業權威拆解.png",
          "/FinTech【背離與貪婪】數據對抗美學.png",
          "/FinTech【資金流向版】AI 引擎過熱解構.png",
          "/FinTech【逆勢奇蹟篇】.png"
        ],
        frontText: "全球總經深度解析！聯準會最新政策與市場流動性推演，帶你用客觀數據看懂未來投資趨勢...",
        frontTags: "#總體經濟 #財經分析 #聯準會",
        backInput: "聯準會最新利率決策與跨資產影響",
        systemTasks: ["✓ 啟動彭博量化矩陣", "✓ 官方數據真實性查核", "✓ 生成全息圖表 AI 視覺指令"]
      
      }
    },
    { 
      id: "heritage",
      title: "民俗信仰", 
      desc: "冷冽科技感、高對比度的深邃紫與霓虹粉，結合宗教解密與歷史知識的長篇深度解說。", 
      color: "from-purple-500 to-pink-500",
      glowColor: "bg-purple-500",
      bgClass: "bg-purple-100",
      textClass: "text-purple-700",
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
      bgClass: "bg-sky-100",
      textClass: "text-sky-700",
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
      bgClass: "bg-rose-100",
      textClass: "text-rose-700",
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
      bgClass: "bg-amber-100",
      textClass: "text-amber-700",
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
      bgClass: "bg-red-100",
      textClass: "text-red-600",
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
    },
    { 
      id: "food",
      title: "美食料理", 
      desc: "溫暖、勾引食慾的漸層橘與焦糖色。專為餐飲品牌行銷、食譜教學與美食探店視覺設計。", 
      color: "from-orange-400 to-yellow-500",
      glowColor: "bg-orange-400", 
      bgClass: "bg-orange-100",
      textClass: "text-orange-600",
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
    }
  ];


  if (!mounted) return null;

  return (
    <div className="min-h-screen transition-colors duration-700 font-sans">
      {/* 統一星雲畫布背景 - 替換為工作區同款的冷薄荷灰綠色 (#F9F7F1) */}
      <div className="min-h-screen text-[#1E293B] selection:bg-indigo-500/30 overflow-x-hidden relative scroll-smooth transition-colors duration-700 bg-gradient-to-br from-[#F9F7F1] via-[#E8EDF2] to-[#E2E6ED]">
        
        {/* 全域背景環境光 (Ambient Glow) - 將不透明度稍作微調 */}
        <div className="fixed top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#0A2E5C]/[0.08] blur-[120px] md:blur-[180px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/[0.08] blur-[120px] md:blur-[160px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        <div className="fixed top-[30%] left-[20%] w-[40%] h-[40%] bg-[#10B981]/[0.06] blur-[100px] md:blur-[150px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        
        {/* 雜訊質感層 */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay pointer-events-none z-0" />
        
        {/* Navbar - 玻璃擬物設計 */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/40 bg-white/40 backdrop-blur-xl transition-colors duration-500 shadow-sm">
          <div className="w-full px-4 md:px-8 h-[80px] relative flex items-center justify-between">
            <div className="flex items-center gap-2 shrink-0 relative z-10">
             <img src="https://omni-script-pro.vercel.app/OmniScript%20logo.png" alt="OmniScript" className="h-10 md:h-12 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
            </div>

            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap w-full text-center pointer-events-none">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-transparent transition-all duration-700" />
                <span 
                  className="text-[24px] xl:text-[28px] tracking-[0.2em] font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] to-[#10B981] transition-all duration-700" 
                  style={{ fontFamily: "'Noto Serif TC', serif" }}
                >
                  讓你的影響力，無所不在<span className="mx-2 text-[#10B981] font-light">｜</span>あなたの影響力を、あらゆる場所へ
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 relative z-10">
              {/* Navbar Right Actions */}
            </div>
          </div>
        </nav>

        <main className="relative z-10">
          {/* 1. Hero Section */}
          <section className="relative w-full min-h-[40vh] flex flex-col items-center justify-center overflow-hidden pt-20">
            
            {/* 增強版光暈：大幅提高彩度與不透明度，確保能穿透前方的玻璃 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full flex justify-center items-center pointer-events-none z-0">
              <div className="absolute w-[20rem] h-[20rem] bg-[#10B981]/40 rounded-full blur-[80px] -translate-x-1/3 -translate-y-1/4" />
              <div className="absolute w-[24rem] h-[24rem] bg-[#0A2E5C]/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/4" />
              <div className="absolute w-[18rem] h-[18rem] bg-[#D4AF37]/30 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
            </div>

            <div className="relative z-20 px-6 sm:px-14 w-[60%] max-w-4xl mx-auto py-12 flex flex-col items-center justify-center text-center pointer-events-none">
              
              {/* 高透極致薄玻璃：將白色不透明度降至極低，依賴 backdrop-blur 產生質感 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-transparent backdrop-blur-2xl rounded-[3rem] border border-white/40 shadow-[0_20px_80px_rgba(10,46,92,0.08)] -z-10" />
              
              {/* 主標題 */}
              <h1 className="text-4xl md:text-[4.5rem] lg:text-[5rem] font-black leading-[1.1] md:leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] via-[#10B981] to-[#D4AF37] drop-shadow-sm pb-2">
                您的全自動化 <br className="hidden sm:block" />
                多模態生成引擎
              </h1>
              
              {/* 副標題描述 */}
              <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-2xl mb-12 mt-6 leading-relaxed animate-fade-in-up delay-200 font-medium">
                只需輸入靈感，即為您展開影音腳本、SEO 標籤、社群圖文與 AI 視覺指令。
              </p>
              
              {/* CTA 按鈕 */}
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300 pointer-events-auto">
                <Link 
                  href="/workspace"
                  className="group px-8 py-4 md:px-10 md:py-5 rounded-full bg-gradient-to-r from-[#10B981] to-[#0A2E5C] hover:from-[#0ea5e9] hover:to-[#0A2E5C] text-white font-bold text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(10,46,92,0.25)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(16,185,129,0.35)] border border-white/20 transition-all duration-300"
                >
                  進入自由軌道工作區
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* 跑馬燈區塊 (Marquee) */}
            <div className="relative mt-16 w-full flex flex-col justify-center z-10 pointer-events-auto opacity-80 hover:opacity-100 transition-opacity duration-700">
              <div className="absolute top-0 left-0 w-16 md:w-48 h-full bg-gradient-to-r from-[#E3ECE9] to-transparent z-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-16 md:w-48 h-full bg-gradient-to-l from-[#E3ECE9] to-transparent z-20 pointer-events-none" />
              
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-6 px-3">
                {[...audiences, ...audiences].map((a, idx) => (
                  <div key={`marquee-${a.id}-${idx}`} className="w-[360px] sm:w-[280px] shrink-0 transition-transform duration-300 hover:scale-[1.02]">
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

          {/* 3. 互動式受眾展示區 (Audience Hub) */}
          <section className="py-32 px-6 relative">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-4xl max-h-4xl rounded-full blur-[120px] md:blur-[180px] opacity-20 pointer-events-none z-0 transition-colors duration-1000 ${audiences[activeTab].glowColor}`} />

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black mb-4 text-[#1E293B] drop-shadow-sm">主題模組切換</h2>
                <p className="text-lg text-slate-700 max-w-4xl mx-auto font-medium">
                  總會你的風格，系統會連同 UI 介面、渲染風格與產出邏輯一併切換。點擊下方標籤，查看對應的生成作品示範。
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                {/* 修正了這邊誤植的 #0A2E5C 文字 */}
                <div className="flex-1 flex flex-col gap-3">
                  {audiences.map((aud, idx) => (
                    <button
                      key={aud.id}
                      onClick={() => setActiveTab(idx)}
                      className={`min-h-[64px] text-left px-6 py-5 rounded-[1.5rem] transition-all duration-300 group ${
                        activeTab === idx 
                          ? `bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative overflow-hidden transform scale-[1.02]` 
                          : `bg-transparent backdrop-blur-sm border border-transparent hover:bg-white/30`
                      }`}
                    >
                      {activeTab === idx && (
                        <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${aud.color}`} />
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className={`text-xl font-bold mb-1 transition-colors ${activeTab === idx ? 'text-[#0A2E5C]' : 'text-slate-600 group-hover:text-[#0A2E5C]'}`}>
                            {aud.title}
                          </h3>
                          <p className={`text-sm line-clamp-1 transition-colors ${activeTab === idx ? 'text-slate-600' : 'text-slate-500'}`}>
                            {aud.features.join(" • ")}
                          </p>
                        </div>
                        {activeTab === idx && <ArrowRight className={`w-5 h-5 ${aud.textClass} animate-pulse`} />}
                      </div>

                      {activeTab === idx && (
                        <div className="mt-4 pt-4 border-t border-slate-300/50 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${aud.bgClass} ${aud.textClass} text-xs font-bold mb-3 border border-current/20`}>
                            <Sparkles className="w-4 h-4" />
                            <span>專屬風格光譜</span>
                          </div>
                          <p className="text-sm md:text-base text-slate-700 leading-relaxed font-medium">
                            {aud.desc}
                          </p>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex-[1.5] flex items-center justify-center relative">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${audiences[activeTab].color} opacity-10 rounded-[3rem] -z-10 transition-colors duration-700`} />
                  
                  <div className={`relative group w-full ${audiences[activeTab].isShorts ? 'max-w-[280px] md:max-w-[320px]' : 'max-w-2xl'} mx-auto transition-all duration-500`} style={{ perspective: '1000px' }}>
                    <div className={`absolute -inset-2 bg-gradient-to-tr ${audiences[activeTab].color} rounded-[2.5rem] md:rounded-[3rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-500`} />
                    <div className="relative bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-3 overflow-hidden transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1">
                      <LazyYoutube 
                        playlistId={audiences[activeTab].playlistId} 
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

          {/* 3.5 Social Proof Section (@genimprint 實戰案例) */}
          <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-12 items-center">
                
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 text-[#0A2E5C] text-sm font-bold mb-8 w-max shadow-[0_4px_15px_rgba(10,46,92,0.05)] backdrop-blur-md">
                    <span>🏆</span>
                    <span className="tracking-wide">Featured Case Study / 官方實戰案例</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] to-[#10B981]">
                    將百萬字古籍田調，<br />濃縮於彈指之間。
                  </h2>
                  
                  <blockquote className="text-lg md:text-xl text-slate-600 mb-10 pl-6 border-l-4 border-[#10B981] italic leading-relaxed font-medium">
                    「製作這樣一支考據嚴謹的歷史紀錄片，過去需要耗費數週。現在透過 OmniScript PRO，從文獻整理到腳本產出的時間大幅縮短，讓創作者能真正專注於『說好故事』。」
                    <footer className="mt-4 font-bold not-italic">
                      <a href="https://www.youtube.com/@GenImprint" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#10B981] hover:text-[#0ea5e9] transition-colors">
                        — 
                        <Youtube className="w-5 h-5 text-red-500" />
                        @genimprint 世代銘印
                      </a>
                    </footer>
                  </blockquote>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white/60 border border-white/80 p-6 rounded-2xl backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] transition-shadow duration-300">
                      <div className="text-slate-600 text-sm font-bold mb-2">腳本產出時間</div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-slate-500 line-through decoration-slate-400">3 Weeks</span>
                        <span className="text-[#10B981] font-black text-2xl">➔ 2 Hours</span>
                      </div>
                    </div>
                    
                    <div className="bg-white/60 border border-white/80 p-6 rounded-2xl backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(10,46,92,0.1)] transition-shadow duration-300">
                      <div className="text-slate-600 text-sm font-bold mb-2">內容深度基準</div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#0A2E5C] font-black text-2xl">5,000+</span>
                        <span className="text-[#1E293B] font-bold text-lg">字真相查核</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <ChannelStats />
                  </div>
                </div>
                
                <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                  <div className="w-full max-w-md relative group" style={{ perspective: '1000px' }}>
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#0A2E5C] to-[#10B981] rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-700"></div>
                    <div className="relative bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(10,46,92,0.1)] p-3 md:p-4 rounded-[2rem] transform transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1">
                      <div className="flex gap-1.5 mb-3 px-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <LazyYoutube 
                        playlistId="PL0WZUXr5VzkcDbUbMjUIUeom8T4ksmhxK" 
                        title="@genimprint 實戰紀錄片"
                        isShorts={true}
                        colorClass="from-slate-200 to-slate-400"
                        className="w-full mx-auto"
                      />
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </section>       

          {/* 4. 核心武器 (The Why - Three Core Weapons) */}
          <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 text-[#0A2E5C] text-xs font-bold mb-4 shadow-[0_4px_15px_rgba(10,46,92,0.05)] backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span className="tracking-widest uppercase">The Core Weapons</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] via-[#10B981] to-[#D4AF37] tracking-tight drop-shadow-sm">
                打造一人團隊的<br className="block md:hidden"/>終極內容軍火庫
              </h2>
              <p className="text-base md:text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed font-medium">
                跳脫空泛農場文與碎片化工具的泥沼。這是專為需要極致產能與知識深度的創作者，量身打造的三大核心武器。
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Weapon 1: 基準真相 */}
              <div className="group p-8 rounded-[2rem] bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] hover:border-[#10B981]/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#10B981]/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#10B981]/20 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-emerald-600 flex items-center justify-center mb-8 shadow-lg shadow-[#10B981]/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-[#1E293B] relative z-10">內容護城河</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/20 mb-5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <h4 className="text-[11px] font-bold text-[#10B981] tracking-wider">5,000 字基準真相鎖定</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm relative z-10 font-medium">
                  拒絕 AI 幻覺。將數千字原始古籍、文獻或考據資料設定為「唯一基準真相 (Ground Truth)」，強制 AI 鎖定事實展開企劃分支，確保所有產出皆具備無可挑剔的知識深度。
                </p>
              </div>

              {/* Weapon 2: 10-Step 矩陣 */}
              <div className="group p-8 rounded-[2rem] bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#D4AF37]/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#D4AF37]/20 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-500 flex items-center justify-center mb-8 shadow-lg shadow-[#D4AF37]/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-[#1E293B] relative z-10">多模態裂變引擎</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <h4 className="text-[11px] font-bold text-amber-600 tracking-wider">10-Step 全域自動化矩陣</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm relative z-10 font-medium">
                  輸入一次靈感，自動展開 10 道工序。無縫轉譯長短影音腳本、SEO 標籤、社群圖文，並精準生成高質感繪圖指令與配樂 Prompt，將單點突破升級為立體打擊。
                </p>
              </div>

              {/* Weapon 3: 模組化與歸檔 */}
              <div className="group p-8 rounded-[2rem] bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(10,46,92,0.15)] hover:border-[#0A2E5C]/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0A2E5C]/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-[#0A2E5C]/20 transition-colors duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A2E5C] to-blue-800 flex items-center justify-center mb-8 shadow-lg shadow-[#0A2E5C]/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <Sliders className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-[#1E293B] relative z-10">絕對掌控權</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0A2E5C]/5 border border-[#0A2E5C]/20 mb-5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A2E5C] animate-pulse" />
                  <h4 className="text-[11px] font-bold text-[#0A2E5C] tracking-wider">模組化勾選與無縫歸檔</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm relative z-10 font-medium">
                  你才是總編輯。自由勾選需要的素材模組以精準控管 API 額度；所有心血不僅支援 Markdown 單步下載，更支援一鍵同步至 Notion 雲端資料庫，讓產出即刻化為數位資產。
                </p>
              </div>
            </div>
          </section>

          {/* 5. Final CTA */}
          <section className="py-32 px-6 relative overflow-hidden   ">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A2E5C]/5 -z-10" />
            <div className="max-w-4xl mx-auto text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#1E293B]">準備好顛覆您的創作軌跡了嗎？</h2>
              <p className="text-xl text-slate-700 mb-10 font-medium">
                馬上進入工作區，體驗自動化生成與無縫串接的強大威力。
              </p>
              <Link 
                href="/workspace"
                className="inline-flex min-h-[64px] px-10 py-4 rounded-full bg-[#0A2E5C] text-white font-black text-xl items-center justify-center gap-3 hover:-translate-y-1 transition-all duration-300 shadow-[0_10px_30px_rgba(10,46,92,0.3)] hover:shadow-[0_15px_40px_rgba(10,46,92,0.5)] border border-[#0A2E5C]/50"
              >
                啟動引擎
                <ArrowRight className="w-8 h-8 text-[#D4AF37]" />
              </Link>
            </div>
          </section>

        </main>

        <footer className="py-8 text-center text-sm text-slate-600 relative z-10 font-medium">
          <p>© 2026 OmniScript PRO. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
