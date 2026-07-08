"use client";

import { useEffect, useState } from 'react';
import { getChannelStats } from '@/app/actions/youtube';
import { Users, Eye, Video } from 'lucide-react';

// A simple count-up hook for animation
function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0) return;
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    animationFrameId = window.requestAnimationFrame(step);
    
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
}

const formatNumber = (num: number) => {
  if (num === 0) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export function ChannelStats() {
  const [stats, setStats] = useState<{ subscriberCount: string; viewCount: string; videoCount: string } | null>(null);

  useEffect(() => {
    async function loadStats() {
      const data = await getChannelStats();
      if (data) {
        setStats(data);
      }
    }
    loadStats();
  }, []);

  const subs = stats ? parseInt(stats.subscriberCount) : 0;
  const views = stats ? parseInt(stats.viewCount) : 0;
  const videos = stats ? parseInt(stats.videoCount) : 0;

  const animatedSubs = useCountUp(subs);
  const animatedViews = useCountUp(views);
  const animatedVideos = useCountUp(videos);

  // Fallback to static numbers or loading state if data is missing, but rendering structure keeps layout stable
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
      {/* Subscribers */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-700/50 flex flex-col items-center justify-center text-center shadow-lg hover:bg-slate-800/60 transition-colors group">
        <Users className="w-6 h-6 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          {stats ? formatNumber(animatedSubs) : "-"}
        </div>
        <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">訂閱人數</div>
      </div>
      
      {/* Total Views */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-700/50 flex flex-col items-center justify-center text-center shadow-lg hover:bg-slate-800/60 transition-colors group">
        <Eye className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          {stats ? formatNumber(animatedViews) : "-"}
        </div>
        <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">總觀看次數</div>
      </div>
      
      {/* Total Videos */}
      <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-slate-700/50 flex flex-col items-center justify-center text-center shadow-lg hover:bg-slate-800/60 transition-colors group">
        <Video className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
        <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          {stats ? animatedVideos : "-"}
        </div>
        <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">影片總數</div>
      </div>
    </div>
  );
}
