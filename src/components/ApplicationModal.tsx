'use client';

import React, { useState } from 'react';
import { Gift, X, Loader2, CheckCircle2 } from 'lucide-react';
import { APPLICATION_CONFIG } from '@/utils/applicationConfig';

export default function ApplicationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [platformsOther, setPlatformsOther] = useState('');
  const [link, setLink] = useState('');
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [aiTools, setAiTools] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [goal, setGoal] = useState('');

  const platformOptions = APPLICATION_CONFIG.platformOptions || [];
  const painPointOptions = APPLICATION_CONFIG.painPointOptions || [];
  const aiToolOptions = APPLICATION_CONFIG.aiToolOptions || [];
  const apiKeyOptions = APPLICATION_CONFIG.apiKeyOptions || [];

  const toggleArray = (setter: React.Dispatch<React.SetStateAction<string[]>>, option: string, max: number | null = null) => {
    setter(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      }
      if (max && prev.length >= max) {
        return prev;
      }
      return [...prev, option];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (painPoints.length === 0 || !apiKey) {
      alert("請完整填寫必填欄位 (痛點、API意願)");
      return;
    }
    
    setIsSubmitting(true);
    
    const payload = {
      formType: 'application',
      name,
      email,
      platforms: platforms.includes('其他') ? [...platforms.filter(p => p !== '其他'), `其他: ${platformsOther}`] : platforms,
      link,
      painPoints,
      aiTools,
      apiKey,
      goal
    };

    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://omni-script-pro.vercel.app' 
        : '';
        
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setIsOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form
      setName(''); setEmail(''); setPlatforms([]); setPlatformsOther('');
      setLink(''); setPainPoints([]); setAiTools([]); setApiKey(''); setGoal('');
    } catch (error) {
      console.error(error);
      alert('抱歉，送出申請時發生錯誤，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all group animate-bounce hover:animate-none"
      >
        <Gift className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-[#0f172a] border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 relative text-left">
            
            <div className="p-6 border-b border-slate-800 shrink-0 relative bg-gradient-to-r from-amber-500/10 to-transparent rounded-t-2xl">
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-black text-amber-400 mb-2 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                OmniScript PRO 封閉測試申請｜釋放你的一人團隊算力
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                你好！我是 OmniScript PRO 的開發者。<br/>
                這套系統，是我經營「世代銘印」經驗流程，轉換成自動內容矩陣，現在正尋找第一批渴望突破產能的創作者與行銷人。
              </p>
              <div className="mt-3 inline-block px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                <p className="text-xs font-bold text-amber-300">
                  🎁 封測專屬福利：審核通過者，將獲得專屬 Workspace 登入授權碼，以及 100 點免費雲端運算額度。
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              <form id="application-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* 第一區塊 */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">第一區塊：基本身份與戰場確認</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">您的稱呼 / 品牌名稱：</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">您的聯絡信箱 (Email) <span className="text-red-400">*必填</span></label>
                    <input 
                      type="email" 
                      required
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="將用於寄送封測授權碼"
                      className="w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">您的主力發布平台在哪裡？ (多選)</label>
                    <div className="space-y-2">
                      {platformOptions.map(opt => (
                        <label key={opt} className="flex items-start gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={platforms.includes(opt)}
                            onChange={() => toggleArray(setPlatforms, opt)}
                            className="mt-1 border-slate-700 rounded text-amber-500 focus:ring-amber-500/50 bg-[#070b16]"
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white">{opt}</span>
                        </label>
                      ))}
                      {platforms.includes('其他') && (
                        <input 
                          type="text"
                          value={platformsOther}
                          onChange={e => setPlatformsOther(e.target.value)}
                          placeholder="請註明"
                          className="mt-1 w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-amber-500 focus:outline-none"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">請提供您的頻道 / 社群 / 網站連結： <span className="text-red-400">*必填</span></label>
                    <input 
                      type="url" 
                      required
                      value={link} 
                      onChange={e => setLink(e.target.value)} 
                      className="w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* 第二區塊 */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">第二區塊：痛點與 AI 熟悉度</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">目前在內容產製上，最讓你感到心力交瘁的環節是？ (單選或限選兩項) <span className="text-red-400">*必填</span></label>
                    <div className="space-y-2">
                      {painPointOptions.map(opt => (
                        <label key={opt} className="flex items-start gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={painPoints.includes(opt)}
                            onChange={() => toggleArray(setPainPoints, opt, 2)}
                            className="mt-1 border-slate-700 rounded text-amber-500 focus:ring-amber-500/50 bg-[#070b16]"
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">您日常的工作流中，已經熟悉或經常使用哪些 AI 工具？ (多選)</label>
                    <div className="space-y-2">
                      {aiToolOptions.map(opt => (
                        <label key={opt} className="flex items-start gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={aiTools.includes(opt)}
                            onChange={() => toggleArray(setAiTools, opt)}
                            className="mt-1 border-slate-700 rounded text-amber-500 focus:ring-amber-500/50 bg-[#070b16]"
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 第三區塊 */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 border-b border-slate-800 pb-2">第三區塊：資源對接與承諾</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">【重要】關於 API 金鑰與用量說明： <span className="text-red-400">*必填</span></label>
                    <p className="text-xs text-slate-500 mb-2">封測期間，系統會提供您免費的初始運算額度。若未來額度耗盡，OmniScript PRO 支援「綁定個人 Gemini API Key」以實現無限制生成。您是否了解並願意在未來嘗試此模式？</p>
                    <div className="space-y-2">
                      {apiKeyOptions.map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio"
                            name="apiKey"
                            required
                            checked={apiKey === opt}
                            onChange={() => setApiKey(opt)}
                            className="border-slate-700 text-amber-500 focus:ring-amber-500/50 bg-[#070b16]"
                          />
                          <span className="text-sm text-slate-300 group-hover:text-white">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5">最後，請用一句話告訴我，您最希望 OmniScript PRO 幫您解決什麼問題？</label>
                    <textarea 
                      value={goal}
                      onChange={e => setGoal(e.target.value)}
                      rows={2}
                      className="w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none custom-scrollbar"
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-slate-800 shrink-0 bg-slate-900/50 rounded-b-2xl flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                form="application-form"
                disabled={isSubmitting}
                className="px-6 py-2 rounded-lg text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    送出申請中...
                  </>
                ) : (
                  '送出申請'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <div className="text-sm">
            <span className="font-bold block text-white mb-0.5">申請已送出！⚔️ 歡迎加入自動化創作的行列。</span>
            我們將在 48 小時內進行審核，若入選封測名單，您的專屬授權碼與登入連結將會寄送至您的信箱。請密切留意收件匣！
          </div>
        </div>
      )}
    </>
  );
}
