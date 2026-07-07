'use client';

import React, { useState } from 'react';
import { PenLine, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/utils/analytics';

interface FeedbackModalProps {
  currentTheme?: string;
}

export default function FeedbackModal({ currentTheme = 'General' }: FeedbackModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    trackEvent('submit_feedback_started', { type, theme: currentTheme });

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message, theme: currentTheme, email }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      trackEvent('submit_feedback_success', { type, theme: currentTheme });
      setIsOpen(false);
      setMessage('');
      setEmail('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      trackEvent('submit_feedback_error', { type, theme: currentTheme, error: String(error) });
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-slate-700/50 p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-indigo-400" />
              提供回饋
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              您的寶貴意見將幫助我們讓 OmniScript PRO 變得更好！
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  回饋類型
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Suggestion">功能建議 (Suggestion)</option>
                  <option value="Bug">錯誤回報 (Bug)</option>
                  <option value="Question">使用問題 (Question)</option>
                  <option value="Other">其他 (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  回饋內容 <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="請詳細描述您的想法或遇到的問題..."
                  className="w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  聯絡信箱 (選填)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="若希望我們回覆您，請留下信箱"
                  className="w-full bg-[#070b16] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
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
            </form>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-24 right-6 z-50 bg-emerald-500/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-right-8 fade-in duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">感謝您的回饋！我們已經收到您的訊息。</span>
        </div>
      )}
    </>
  );
}
