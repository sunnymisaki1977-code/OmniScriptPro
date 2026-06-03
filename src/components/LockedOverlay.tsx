import React, { useState } from "react";
import { useWorkflow } from "@/context/WorkflowContext";
import { Lock, Unlock, KeyRound, Sparkles, BookOpen } from "lucide-react";
import { Button } from "./ui";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface LockedOverlayProps {
  title: string;
  subtitle: string;
}

export const LockedOverlay: React.FC<LockedOverlayProps> = ({ title, subtitle }) => {
  const { isUnlocked, unlockSystem } = useWorkflow();
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);

  if (isUnlocked) return null;

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (unlockSystem(password)) {
      toast.success("解鎖成功！歡迎進入世代銘印。");
    } else {
      setIsError(true);
      toast.error("金鑰錯誤，請重新輸入");
      setTimeout(() => setIsError(false), 800); // Reset shake animation
    }
  };

  return (
    <AnimatePresence>
      {!isUnlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-md"
        >
          {/* subtle gradient over the blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-stone-50/10 to-stone-200/40 pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className={`relative z-10 w-full max-w-md p-10 bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-[2rem] shadow-2xl shadow-stone-900/10 text-center ${isError ? 'animate-shake' : ''}`}
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 flex items-center justify-center border border-amber-500/30">
                <BookOpen className="text-amber-600" size={32} />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold tracking-widest text-stone-900 mb-2 font-calligraphy">
              {title}
            </h2>
            <p className="text-sm text-stone-500 font-medium mb-8 leading-relaxed">
              {subtitle}
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (isError) setIsError(false);
                  }}
                  placeholder="請輸入系統解鎖金鑰"
                  className="w-full text-center px-4 py-4 rounded-xl border border-stone-200 bg-white/50 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-stone-300 font-mono tracking-widest"
                />
                <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors" size={18} />
              </div>

              <Button
                type="submit"
                className="w-full py-4 text-base rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Unlock size={18} />
                驗證金鑰並解鎖
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-stone-200/50">
              <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-bold tracking-widest uppercase">
                <Sparkles size={12} />
                Generational Imprint System
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
