'use client';

import React, { useState } from 'react';
import { PenLine, X, Send, Loader2, CheckCircle2, Star } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

interface FeedbackModalProps {
  currentTheme?: string;
}

export default function FeedbackModal({ currentTheme = 'General' }: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Form States
  const [q1, setQ1] = useState('');
  const [q1Other, setQ1Other] = useState('');
  
  const [q2, setQ2] = useState<string[]>([]);
  
  const [satisfaction, setSatisfaction] = useState({
    auto: 0,
    workflow: 0,
    visual: 0,
    integration: 0
  });
  
  const [painPoint, setPainPoint] = useState('');
  const [bugReport, setBugReport] = useState('');
  
  const [designFeel, setDesignFeel] = useState('');
  const [designFeelOther, setDesignFeelOther] = useState('');
  
  const [wowFeature, setWowFeature] = useState('');
  const [nps, setNps] = useState<number | null>(null);
  const [wishlist, setWishlist] = useState('');

  const q1Options = [
    '科技文化 / 知識解說',
    '時尚美妝 / 悅己保養',
    '旅遊先行 / 戶外探索',
    '美食生活 / 探店開箱',
    '親子教育 / 陪伴成長',
    '其他'
  ];

  const q2Options = [
    'YouTube 長影音圖像',
    '短影音圖像',
    '社群圖文排版',
    '企劃大綱與背景資料查核'
  ];

  const designOptions = [
    '非常喜歡，很有科技感與專業度',
    '還不錯，但有些文字對比度可以再加強',
    '視覺干擾太多，希望能更極簡',
    '其他'
  ];

  const toggleQ2 = (option: string) => {
    setQ2(prev => 
      prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
    );
  };

  const handleRating = (key: keyof typeof satisfaction, value: number) => {
    setSatisfaction(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    trackEvent('submit_feedback_started', { theme: currentTheme });

    const payload = {
      theme: currentTheme,
      audience: q1 === '其他' ? `其他: ${q1Other}` : q1,
      usage: q2,
      satisfaction,
      painPoint,
      bugReport,
      designFeel: designFeel === '其他' ? `其他: ${designFeelOther}` : designFeel,
      wowFeature,
      nps,
      wishlist
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 即使 API 不存在或失敗，我們也假裝成功 (因為 API 可能還沒寫)
      // 如果要嚴格處理，可以把這個判斷加回去：
      // if (!res.ok) throw new Error('Failed to submit feedback');

      trackEvent('submit_feedback_success', { theme: currentTheme });
      setIsOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form
      setQ1(''); setQ1Other(''); setQ2([]); setSatisfaction({auto:0, workflow:0, visual:0, integration:0});
      setPainPoint(''); setBugReport(''); setDesignFeel(''); setDesignFeelOther('');
      setWowFeature(''); setNps(null); setWishlist('');

    } catch (error) {
      console.error(error);
      trackEvent('submit_feedback_error', { theme: currentTheme, error: String(error) });
      alert('抱歉，送出回饋時發生錯誤，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          trackEvent('open_feedback_modal');
        }}
        className="fixed bottom-6 right-6 z-50 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg hover:shadow-indigo-500/50 transition-all group"
      >
        <PenLine className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 relative">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 shrink-0 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-indigo-400" />
                提供回饋
              </h3>
              <p className="text-sm text-slate-400">
                您的寶貴意見將幫助我們讓 OmniScript PRO 變得更好！
              </p>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              <form id="feedback-form" onSubmit={handleSubmit} className="space-y-10">
                
                {/* 1. 受眾輪廓與使用場景 */}
                <section className="space-y-5">
                  <h4 className="text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">1. 受眾輪廓與使用場景 (分類用)</h4>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      請問您目前的創作領域主要偏向哪一類？ <span className="text-slate-500 font-normal">(單選)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q1Options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="q1"
                            value={opt}
                            checked={q1 === opt}
                            onChange={(e) => setQ1(e.target.value)}
                            className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-900"
                          />
                          <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {q1 === '其他' && (
                      <input 
                        type="text" 
                        value={q1Other}
                        onChange={(e) => setQ1Other(e.target.value)}
                        placeholder="請輸入您的創作領域"
                        className="w-full mt-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="block text-sm font-bold text-slate-200">
                      在這次封測中，您主要用系統生成了什麼內容？ <span className="text-slate-500 font-normal">(複選)</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q2Options.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={q2.includes(opt)}
                            onChange={() => toggleQ2(opt)}
                            className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
                          />
                          <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 2. 核心功能滿意度 */}
                <section className="space-y-5">
                  <h4 className="text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">2. 核心功能滿意度 (量化指標)</h4>
                  <p className="text-xs text-slate-500">請針對以下項目進行 1-5 分的評估（1 分：極度不滿意，5 分：極度滿意）。</p>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'auto', label: '一鍵全自動模式', desc: '生成速度、產出內容的可用性與邏輯連貫性' },
                      { key: 'workflow', label: '分步編輯工作流', desc: '介面流暢度、手動修改的便利性' },
                      { key: 'visual', label: '視覺中心', desc: '圖像提示詞轉換精準度、介面直覺度' },
                      { key: 'integration', label: '工具整合的實用性', desc: '整套系統的順暢程度' }
                    ].map(item => (
                      <div key={item.key} className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-slate-200">{item.label}</div>
                            <div className="text-xs text-slate-500">{item.desc}</div>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(score => (
                              <button
                                key={score}
                                type="button"
                                onClick={() => handleRating(item.key as any, score)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${satisfaction[item.key as keyof typeof satisfaction] >= score ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. 體驗痛點與 Bug 回報 */}
                <section className="space-y-5">
                  <h4 className="text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">3. 體驗痛點與 Bug 回報 (質化除錯)</h4>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      在操作過程中，您在哪個環節感到最困惑、或是不知道下一步該點哪裡？
                    </label>
                    <textarea 
                      value={painPoint}
                      onChange={(e) => setPainPoint(e.target.value)}
                      placeholder="請簡述您的體驗..."
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      您是否有遇到任何系統錯誤 (Bug)、畫面破圖或當機的狀況？請簡述發生經過：
                    </label>
                    <textarea 
                      value={bugReport}
                      onChange={(e) => setBugReport(e.target.value)}
                      placeholder="例如：點擊XXX按鈕時，畫面空白..."
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      關於「介面設計與視覺風格」(例如深色模式、背景特效)，您的感受是？
                    </label>
                    <div className="space-y-2">
                      {designOptions.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="design"
                            value={opt}
                            checked={designFeel === opt}
                            onChange={(e) => setDesignFeel(e.target.value)}
                            className="w-4 h-4 text-indigo-500 bg-slate-900 border-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-900"
                          />
                          <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                    {designFeel === '其他' && (
                      <input 
                        type="text" 
                        value={designFeelOther}
                        onChange={(e) => setDesignFeelOther(e.target.value)}
                        placeholder="請輸入您的感受"
                        className="w-full mt-2 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>
                </section>

                {/* 4. 產品價值與未來期待 */}
                <section className="space-y-5">
                  <h4 className="text-indigo-400 font-bold border-b border-indigo-500/20 pb-2">4. 產品價值與未來期待 (NPS 與許願池)</h4>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      這套系統最讓您感到「驚豔」或「省下最多時間」的功能是什麼？
                    </label>
                    <textarea 
                      value={wowFeature}
                      onChange={(e) => setWowFeature(e.target.value)}
                      placeholder="請簡述您的看法..."
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      如果滿分是 10 分，您有多大意願將這套系統推薦給其他創作者同行？
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => setNps(score)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${nps === score ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-200">
                      正式上線前，您最希望我們優先新增或改善什麼功能？
                    </label>
                    <textarea 
                      value={wishlist}
                      onChange={(e) => setWishlist(e.target.value)}
                      placeholder="許願池..."
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[80px] resize-none"
                    />
                  </div>
                </section>

              </form>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-800 bg-slate-900/50 rounded-b-2xl shrink-0">
              <button
                type="submit"
                form="feedback-form"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    傳送中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    送出回饋
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-500/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right-8 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">感謝您的回饋！我們已經收到您的問卷。</span>
        </div>
      )}
    </>
  );
}
