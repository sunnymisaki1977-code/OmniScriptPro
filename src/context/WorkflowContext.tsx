"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { WORKFLOW_STEPS } from "@/utils/promptConfigs";

interface WorkflowContextType {
  theme: string;
  setTheme: (theme: string) => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  stepsData: Record<number, string>;
  updateStepData: (stepId: number, data: string) => void;
  resetWorkflow: () => void;
  getStepContext: (stepId: number) => any;
  isStepComplete: (stepId: number) => boolean;
  activeView: "workflow" | "export" | "vision" | "suno" | "social" | "team";
  setActiveView: (view: "workflow" | "export" | "vision" | "suno" | "social" | "team") => void;
  isUnlocked: boolean;
  unlockSystem: (key: string) => boolean;
  currentUser: string | null;
  setCurrentUser: (user: string | null) => void;
  logActivity: (action: string) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0 is theme input
  const [stepsData, setStepsData] = useState<Record<number, string>>({});
  const [activeView, setActiveView] = useState<"workflow" | "export" | "vision" | "suno" | "social" | "team">("workflow");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("gen_imprint_workflow");
    if (saved) {
      const { theme, currentStep, stepsData, isUnlocked, currentUser } = JSON.parse(saved);
      if (theme) setTheme(theme);
      if (currentStep) setCurrentStep(currentStep);
      if (stepsData) setStepsData(stepsData);
      if (isUnlocked) setIsUnlocked(isUnlocked);
      if (currentUser) setCurrentUser(currentUser);
    }
  }, []);

  useEffect(() => {
    if (theme || currentStep > 0 || isUnlocked || currentUser) {
      localStorage.setItem("gen_imprint_workflow", JSON.stringify({ theme, currentStep, stepsData, isUnlocked, currentUser }));
    }
  }, [theme, currentStep, stepsData, isUnlocked, currentUser]);

  const unlockSystem = (key: string) => {
    if (key === "GENIMPRINT2026") {
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const logActivity = async (action: string) => {
    if (!currentUser) return;
    try {
      await fetch("/api/notion/log-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: currentUser, action, theme }),
      });
    } catch (e) {
      console.error("Failed to log activity", e);
    }
  };

  const updateStepData = (stepId: number, data: string) => {
    setStepsData((prev) => ({ ...prev, [stepId]: data }));
  };

  const resetWorkflow = () => {
    setTheme("");
    setCurrentStep(0);
    setStepsData({});
    localStorage.removeItem("gen_imprint_workflow");
  };

  const getStepContext = (stepId: number) => {
    const step = WORKFLOW_STEPS.find((s) => s.id === stepId);
    if (!step) return { theme };

    const context: any = { theme };
    step.dependsOn.forEach((dep) => {
      if (dep.startsWith("step")) {
        const depId = parseInt(dep.replace("step", ""));
        context[dep] = stepsData[depId] || "";
      }
    });
    return context;
  };

  const isStepComplete = (stepId: number) => !!stepsData[stepId];

  return (
      <WorkflowContext.Provider
      value={{
        theme,
        setTheme,
        currentStep,
        setCurrentStep,
        stepsData,
        updateStepData,
        resetWorkflow,
        getStepContext,
        isStepComplete,
        activeView,
        setActiveView,
        isUnlocked,
        unlockSystem,
        currentUser,
        setCurrentUser,
        logActivity,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error("useWorkflow must be used within WorkflowProvider");
  return context;
};
