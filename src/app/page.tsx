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
  Youtube,
  Code
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

  // 跨界降維打擊：四大核心受眾模組
  const audiences = [
    { 
      id: "fintech",
      title: "FinTech 金融理財", 
      desc: "專為券商與金融機構打造。結合 RSS 總經數據抓取與「彭博全息視覺」，將艱澀市場訊號轉譯為高點擊率影音。", 
      color: "from-blue-600 to-teal-500",
      glowColor: "bg-blue-600",
      bgClass: "bg-blue-100",
      textClass: "text-blue-700",
      features: ["總經數據", "全息量化視覺", "合規去幻覺"],
      playlistId: "PLDDnUDat-MmI",
      previewVideoId: "X2zk7iQPGd8",
      isShorts: false,
      flipData: {
        frontImage: [
          "/FinTech【崩盤警示篇】.png",
          "/FinTech【恐慌警示版】亞股血洗極限視覺.png",
          "/FinTech【資金流向版】AI 引擎過熱解構.png"
        ],
        frontText: "全球總經深度解析！聯準會最新政策與市場流動性推演，帶你用客觀數據看懂未來投資趨勢...",
        frontTags: "#總體經濟 #財經分析 #聯準會",
        backInput: "聯準會最新利率決策與跨資產影響",
        systemTasks: ["✓ 啟動彭博量化矩陣", "✓ 官方數據真實性查核", "✓ 生成全息圖表 AI 視覺指令"]
      }
    },
    { 
      id: "techsaas",
      title: "Tech 資訊服務", 
      desc: "專為軟體服務商與新創團隊設計。運用現代化 UI/UX 視覺語言，深入淺出拆解商業模式與硬核科技技術。", 
      color: "from-indigo-500 to-purple-600",
      glowColor: "bg-indigo-500",
      bgClass: "bg-indigo-100",
      textClass: "text-indigo-700",
      features: ["商業模式", "SaaS產品解析", "科技前瞻"],
      playlistId: "PLS7BJQ4awAeM", 
      previewVideoId: "E-cMoaWOHnM",
      isShorts: false,
      flipData: {
        frontImage: ["/Tech_SaaS_p1.jpg", "/Tech_SaaS_p2.jpg", "/Tech_SaaS_p3.jpg"],
        frontText: "突破人工產製瓶頸！深度拆解 AI 自動化內容矩陣的底層邏輯與 Vibe Coding 實戰應用...",
        frontTags: "#AI自動化 #VibeCoding #SaaS",
        backInput: "AI 內容自動化系統架構與商業應用",
        systemTasks: ["✓ 啟動科技前瞻矩陣", "✓ 結構化系統邏輯", "✓ 配置賽博龐克視覺指令"]
      }
    },
    { 
      id: "edtech",
      title: "EdTech 教育培訓", 
      desc: "專為線上教育平台打造。注入「企業藍金配色」建立信任感，將專業知識系統化拆解為易於吸收的教學模組。", 
      color: "from-sky-400 to-blue-500",
      glowColor: "bg-sky-400",
      bgClass: "bg-sky-100",
      textClass: "text-sky-700",
      features: ["知識萃取", "企業藍金配色", "痛點洞察"],
      playlistId: "PLC-IrJAPGBww",
      previewVideoId: "5_4nrMvE4tg",
      isShorts: false,
      flipData: {
        frontImage: ["/Edu_Training_p1.jpg", "/Edu_Training_p2.jpg", "/Edu_Training_p3.jpg"],
        frontText: "從單點創意到系統化 SOP！三分鐘帶你掌握內容團隊高產能背後的專案管理與營運心法...",
        frontTags: "#專案管理 #營運SOP #知識轉譯",
        backInput: "數位內容團隊的 SOP 制定與產能優化",
        systemTasks: ["✓ 啟動專業信任矩陣", "✓ 知識結構與痛點放大", "✓ 生成沉浸式教學視覺"]
      }
    },
    { 
      id: "genimprint",
      title: "世代銘印 (文史矩陣)", 
      desc: "前台實戰驗證！將文史哲學濃縮為具備強烈 SEO 擴散力的 YouTube Shorts 與跨平台影音，成功驅動自然流量。", 
      color: "from-red-500 to-orange-500",
      glowColor: "bg-red-500",
      bgClass: "bg-red-100",
      textClass: "text-red-700",
      features: ["實戰驗證", "SEO 流量漏斗", "歷史謎因"],
      playlistId: "PLS7BJQ4awAeM",
      previewVideoId: "Anq2dnER4TA",
      isShorts: true,
      flipData: {
        frontImage: ["/Kongming_p1.jpg", "/Kongming_p2.jpg", "/Kongming_p3.jpg"],
        frontText: "「諸葛孔明草船借箭？根本是古代版無本當沖！」用 10 秒迷因梗圖搭配洗腦 BGM，瞬間引爆演算法推播...",
        frontTags: "#歷史迷因 #三國演義 #諸葛孔明",
        backInput: "關於「諸葛孔明」的歷史迷因腳本",
        systemTasks: ["✓ 啟動極速流量矩陣", "✓ 歷史考據與語氣轉換", "✓ 寫入短影音黃金 Hook"]
      }
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen transition-colors duration-700 font-sans">
      <div className="min-h-screen text-[#1E293B] selection:bg-indigo-500/30 overflow-x-hidden relative scroll-smooth transition-colors duration-700 bg-gradient-to-br from-[#F9F7F1] via-[#E8EDF2] to-[#E2E6ED]">
        
        {/* 全域背景環境光 */}
        <div className="fixed top-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#0A2E5C]/[0.08] blur-[120px] md:blur-[180px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/[0.08] blur-[120px] md:blur-[160px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        <div className="fixed top-[30%] left-[20%] w-[40%] h-[40%] bg-[#10B981]/[0.06] blur-[100px] md:blur-[150px] rounded-full pointer-events-none z-0 transition-all duration-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] mix-blend-overlay pointer-events-none z-0" />
        
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/40 bg-white/40 backdrop-blur-xl transition-colors duration-500 shadow-sm">
          <div className="w-full px-4 md:px-8 h-[80px] relative flex items-center justify-between">
            <div className="flex items-center gap-2 shrink-0 relative z-10">
             <img src="/OmniScript%20logo.png" alt="OmniScript" className="h-10 md:h-12 object-contain drop-shadow-sm hover:scale-105 transition-transform" />
            </div>
            <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap w-full text-center pointer-events-none">
              <div className="relative inline-block">
                <span className="text-[20px] xl:text-[24px] tracking-[0.2em] font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] to-[#10B981]" style={{ fontFamily: "'Noto Serif TC', serif" }}>
                  AI 驅動跨界知識轉譯引擎<span className="mx-2 text-[#10B981] font-light">｜</span>Senior IC 架構師
                </span>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative z-10">
          {/* 1. Hero Section */}
          <section className="relative w-full min-h-[40vh] flex flex-col items-center justify-center overflow-hidden pt-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-full flex justify-center items-center pointer-events-none z-0">
              <div className="absolute w-[20rem] h-[20rem] bg-[#10B981]/40 rounded-full blur-[80px] -translate-x-1/3 -translate-y-1/4" />
              <div className="absolute w-[24rem] h-[24rem] bg-[#0A2E5C]/30 rounded-full blur-[100px] translate-x-1/3 translate-y-1/4" />
            </div>

            <div className="relative z-20 px-6 sm:px-14 w-[70%] max-w-5xl mx-auto py-12 flex flex-col items-center justify-center text-center pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/20 to-transparent backdrop-blur-2xl rounded-[3rem] border border-white/40 shadow-[0_20px_80px_rgba(10,46,92,0.08)] -z-10" />
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 text-[#0A2E5C] text-sm font-bold mb-6 shadow-sm backdrop-blur-md">
                <Code className="w-4 h-4 text-[#10B981]" />
                <span>Python x CapCut JSON x RAG</span>
              </div>

              <h1 className="text-4xl md:text-[4.5rem] lg:text-[5rem] font-black leading-[1.1] md:leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] via-[#10B981] to-[#D4AF37] drop-shadow-sm pb-2">
                自動化內容矩陣 <br className="hidden sm:block" />
                與營運系統化 SOP
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-slate-700 max-w-3xl mb-12 mt-6 leading-relaxed animate-fade-in-up delay-200 font-medium">
                結合 10 年 CRM 漏斗轉換經驗與資管所技術實力。以 Python 獨立開發無頭剪輯產線，徹底解決人工產製瓶頸，將單點行銷創意轉化為跨界商業變現力。
              </p>
            </div>

            {/* 跑馬燈區塊 */}
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

          {/* 3. 互動式受眾展示區 */}
          <section className="py-32 px-6 relative">
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] max-w-4xl max-h-4xl rounded-full blur-[120px] md:blur-[180px] opacity-20 pointer-events-none z-0 transition-colors duration-1000 ${audiences[activeTab].glowColor}`} />
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black mb-4 text-[#1E293B] drop-shadow-sm">三大產業降維打擊實績</h2>
                <p className="text-lg text-slate-700 max-w-4xl mx-auto font-medium">
                  系統具備高度擴充性，能將艱澀資訊自動抓取、企劃轉譯，並跨界應用於金融理財、科技服務與教育培訓。
                </p>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
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
                      {activeTab === idx && <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${aud.color}`} />}
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
                    <div className="relative bg-white/60 backdrop-blur-xl border border-white/80 shadow-lg rounded-[2rem] md:rounded-[2.5rem] p-2 md:p-3 overflow-hidden transform transition-transform duration-500 group-hover:scale-[1.02]">
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

          {/* 3.5 Social Proof Section */}
          <section className="py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
              <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 text-[#0A2E5C] text-sm font-bold mb-8 w-max shadow-[0_4px_15px_rgba(10,46,92,0.05)] backdrop-blur-md">
                    <span>🏆</span>
                    <span className="tracking-wide">前台營運實戰案例</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] to-[#10B981]">
                    將百萬字古籍田調，<br />濃縮於彈指之間。
                  </h2>
                  
                  <blockquote className="text-lg md:text-xl text-slate-600 mb-10 pl-6 border-l-4 border-[#10B981] italic leading-relaxed font-medium">
                    「製作這樣一支考據嚴謹的歷史紀錄片，過去需要耗費數週。現在透過 OmniScript PRO，從文獻整理到腳本產出的時間大幅縮短，讓創作者能真正專注於『說好故事』。」
                    <footer className="mt-4 font-bold not-italic">
                      <a href="https://www.youtube.com/@GenImprint" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[#10B981] hover:text-[#0ea5e9] transition-colors">
                        — <Youtube className="w-5 h-5 text-red-500" /> @genimprint 世代銘印
                      </a>
                    </footer>
                  </blockquote>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white/60 border border-white/80 p-6 rounded-2xl backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <div className="text-slate-600 text-sm font-bold mb-2">營運漏斗轉換里程碑</div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-slate-500 line-through decoration-slate-400">0</span>
                        <span className="text-[#10B981] font-black text-2xl">➔ 400+ 訂閱 (4個月)</span>
                      </div>
                    </div>
                    <div className="bg-white/60 border border-white/80 p-6 rounded-2xl backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                      <div className="text-slate-600 text-sm font-bold mb-2">內容深度基準</div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#0A2E5C] font-black text-2xl">5,000+</span>
                        <span className="text-[#1E293B] font-bold text-lg">字真相查核</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8"><ChannelStats /></div>
                </div>
                
                <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
                  <div className="w-full max-w-md relative group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-[#0A2E5C] to-[#10B981] rounded-[2.5rem] blur-2xl opacity-20"></div>
                    <div className="relative bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_rgba(10,46,92,0.1)] p-3 md:p-4 rounded-[2rem]">
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

          {/* 4. 核心武器 (The Why) */}
          <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 relative">
              <h2 className="text-3xl md:text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#0A2E5C] via-[#10B981] to-[#D4AF37] tracking-tight drop-shadow-sm">
                建構企業級效率的<br className="block md:hidden"/>三大技術護城河
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Weapon 1: RAG & Python Scraping */}
              <div className="group p-8 rounded-[2rem] bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.1)] hover:border-[#10B981]/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-emerald-600 flex items-center justify-center mb-8 relative z-10">
                  <Database className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-[#1E293B] relative z-10">RAG 數據抓取與防幻覺</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#10B981]/10 border border-[#10B981]/20 mb-5 relative z-10">
                  <h4 className="text-[11px] font-bold text-[#10B981] tracking-wider">即時 RSS 檢索雷達</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm relative z-10 font-medium">
                  以 Python 建置自動化選題器，零時差抓取財經與產業動態。導入高階雙變數 Prompt 框架嚴格查核真實性，確保知識轉譯具備無可挑剔的專業深度。
                </p>
              </div>

              {/* Weapon 2: Headless Editing */}
              <div className="group p-8 rounded-[2rem] bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] hover:border-[#D4AF37]/40 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-amber-500 flex items-center justify-center mb-8 relative z-10">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-[#1E293B] relative z-10">無頭剪輯 (Headless Editing)</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-5 relative z-10">
                  <h4 className="text-[11px] font-bold text-amber-600 tracking-wider">CapCut JSON 底層寫入</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm relative z-10 font-medium">
                  打破企劃與剪輯的數位藩籬。利用 Faster-Whisper 與 Python 智慧解析時間軸，自動建立影片軌與文字軌並寫入 `draft_content.json`，實現零人工的初剪自動化。
                </p>
              </div>

              {/* Weapon 3: Management SOP */}
              <div className="group p-8 rounded-[2rem] bg-white/60 border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(10,46,92,0.15)] hover:border-[#0A2E5C]/30 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A2E5C] to-blue-800 flex items-center justify-center mb-8 relative z-10">
                  <Sliders className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2 text-[#1E293B] relative z-10">漏斗變現與 SOP 賦能</h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0A2E5C]/5 border border-[#0A2E5C]/20 mb-5 relative z-10">
                  <h4 className="text-[11px] font-bold text-[#0A2E5C] tracking-wider">SDLC 軟體生命週期管理</h4>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm relative z-10 font-medium">
                  結合電商 CRM 實戰底蘊，將行銷創意拆解為可複製的 SOP 模具。從前端 SEO 關鍵字佈局到高轉換率 CTA 設計，以技術賦能團隊，全面提升組織營運產能。
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
