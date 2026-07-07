import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

export interface HotspotProps {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function Hotspot({ id, title, content, position = 'bottom', className = '' }: HotspotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // Default to true to prevent hydration mismatch, set false in useEffect if not dismissed

  useEffect(() => {
    try {
      const dismissedTours = JSON.parse(localStorage.getItem('omniscript_tour_dismissed') || '[]');
      if (!dismissedTours.includes(id)) {
        setIsDismissed(false);
      }
    } catch (e) {
      setIsDismissed(false);
    }
  }, [id]);

  const handleDismiss = () => {
    try {
      const dismissedTours = JSON.parse(localStorage.getItem('omniscript_tour_dismissed') || '[]');
      if (!dismissedTours.includes(id)) {
        dismissedTours.push(id);
        localStorage.setItem('omniscript_tour_dismissed', JSON.stringify(dismissedTours));
      }
    } catch (e) {
      console.error('Failed to save tour state:', e);
    }
    setIsOpen(false);
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  // Calculate position classes for the tooltip
  let tooltipPositionClasses = '';
  switch (position) {
    case 'top':
      tooltipPositionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-3';
      break;
    case 'bottom':
      tooltipPositionClasses = 'top-full left-1/2 -translate-x-1/2 mt-3';
      break;
    case 'left':
      tooltipPositionClasses = 'right-full top-1/2 -translate-y-1/2 mr-3';
      break;
    case 'right':
      tooltipPositionClasses = 'left-full top-1/2 -translate-y-1/2 ml-3';
      break;
  }

  return (
    <div className={`absolute z-50 ${className}`}>
      {/* Indicator Dot */}
      <div 
        className="relative flex items-center justify-center cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => !isOpen && setIsOpen(true)}
      >
        <div className="absolute w-5 h-5 rounded-full bg-indigo-500/40 animate-ping" />
        <div className="absolute w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
        <div className="w-6 h-6 rounded-full border border-indigo-400/30" />
      </div>

      {/* Tooltip Card */}
      {isOpen && (
        <div className={`absolute w-64 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl z-[100] ${tooltipPositionClasses}`}>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            {title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            {content}
          </p>
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" />
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
