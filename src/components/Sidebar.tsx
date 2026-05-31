"use client";

import React, { useState, useEffect } from "react";
import { useWorkflow } from "@/context/WorkflowContext";
import { WORKFLOW_STEPS } from "@/utils/promptConfigs";
import { CheckCircle2, Circle, ChevronRight, Youtube, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "./ui";
import { AlmanacCard } from "./AlmanacCard";

export const Sidebar = () => {
  const { currentStep, setCurrentStep, isStepComplete, stepsData } = useWorkflow();
  const [ytStats, setYtStats] = useState({ subscribers: "---", videos: "---", views: "---" });
  const [isWorkflowExpanded, setIsWorkflowExpanded] = useState(false);

  // Fetch YouTube Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/youtube");
        const data = await res.json();
        if (!data.error) {
          setYtStats({
            subscribers: data.subscribers,
            videos: data.videos,
            views: data.views
          });
        }
      } catch (err) {
        console.error("Failed to fetch YT stats", err);
      }
    };
    fetchStats();
  }, []);

  const completedStepsCount = Object.keys(stepsData).filter(key => stepsData[parseInt(key)]).length;

  return (
    <div className="w-64 border-r border-stone-200 h-full bg-white/50 backdrop-blur-md flex flex-col p-4 overflow-y-auto custom-scrollbar">
      <div className="mb-6 shrink-0">
        <div className="flex flex-col gap-1.5 w-fit">
          <img src="/logo_sidebar.png" alt="Gen Imprinting" className="w-[180px] object-contain object-left" />
          <p className="text-[15px] text-stone-400 uppercase tracking-[0.18em] font-bold whitespace-nowrap">Workflow System</p>
        </div>
      </div>

      <div className="mb-6 shrink-0">
        <AlmanacCard />
      </div>

      <nav className="flex-1 space-y-1.5 flex flex-col">
        {/* Step 0: Initial */}
        <button
          onClick={() => setCurrentStep(0)}
          className={cn(
            "w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-all shrink-0",
            currentStep === 0 
              ? "bg-stone-900 text-white shadow-lg shadow-stone-900/20" 
              : "hover:bg-stone-100 text-stone-600"
          )}
        >
          <Circle size={14} fill={currentStep === 0 ? "currentColor" : "none"} className={currentStep === 0 ? "text-gold" : "text-stone-300"} />
          <span className="text-sm font-bold">開始新主題</span>
        </button>

        <div className="h-px bg-stone-100 my-4 shrink-0" />

        <button 
          onClick={() => setIsWorkflowExpanded(!isWorkflowExpanded)}
          className="w-full flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2 py-2 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
        >
          <span>主工作流步驟</span>
          {isWorkflowExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Steps 1-9 */}
        {isWorkflowExpanded && (
          <div className="space-y-1.5 mt-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {WORKFLOW_STEPS.map((step) => {
              const isCompleted = isStepComplete(step.id);
              const isActive = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => isActive || isCompleted ? setCurrentStep(step.id) : null}
                  disabled={!isCompleted && !isActive && currentStep < step.id}
                  className={cn(
                    "w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-all duration-200 group relative shrink-0",
                    isActive
                      ? "bg-white text-stone-900 shadow-sm ring-1 ring-stone-200"
                      : isCompleted
                      ? "text-stone-700 hover:bg-stone-50"
                      : "text-stone-300 cursor-not-allowed"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-cinnabar rounded-r-full" />}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 size={16} className="text-stone-900" />
                    ) : (
                      <Circle size={16} className={isActive ? "text-cinnabar" : "text-stone-200"} />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={cn("text-[9px] font-bold uppercase tracking-tighter", isActive ? "text-cinnabar" : "text-stone-400")}>
                      Step {step.id}
                    </span>
                    <span className="text-xs font-bold truncate w-24">{step.title}</span>
                  </div>
                  {isActive && <ChevronRight size={12} className="ml-auto text-stone-300" />}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Progress Bar */}
      <div className="mt-8 pt-6 border-t border-stone-100">
        <div className="px-1">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-bold text-stone-400 uppercase">工作進度</span>
            <span className="text-[9px] font-bold text-stone-900">{Math.round((completedStepsCount / 9) * 100)}%</span>
          </div>
          <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-stone-900 transition-all duration-700 ease-out"
              style={{ width: `${(completedStepsCount / 9) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
