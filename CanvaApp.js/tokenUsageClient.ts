/**
 * tokenUsageClient.ts
 * 
 * 前端（Canva App）專用的 token 使用追蹤工具。
 * 
 * 功能：
 * 1. reportTokenUsage()   → 同時寫入 localStorage（即時顯示）+ POST 後端（持久化）
 * 2. getLocalSummary()    → 讀取本 session 的 localStorage 統計
 * 3. clearLocalSummary()  → 清除 localStorage 統計
 */

// ─── 定價（USD per 1M tokens） ───────────────────────────────────────────────
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gemini-2.5-pro":           { input: 1.25,   output: 10.0  },
  "gemini-2.5-flash":         { input: 0.075,  output: 0.30  },
  "gemini-2.5-flash-lite":    { input: 0.0375, output: 0.15  },
  "gemini-3-flash-preview":   { input: 0.075,  output: 0.30  },
  "gemini-3-flash-thinking":  { input: 1.25,   output: 10.0  },
  "gemini-3.1-flash-preview": { input: 0.075,  output: 0.30  },
  "gemini-2.0-flash":         { input: 0.075,  output: 0.30  },
  "gemini-2.5-flash-preview-tts": { input: 0.075, output: 0.30 },
};

function getPrice(model: string) {
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];
  for (const key of Object.keys(MODEL_PRICING)) {
    if (model.startsWith(key) || key.startsWith(model.split("-preview")[0])) {
      return MODEL_PRICING[key];
    }
  }
  return { input: 0.075, output: 0.30 };
}

function calcCost(model: string, promptTokens: number, completionTokens: number): number {
  const p = getPrice(model);
  return (promptTokens / 1_000_000) * p.input + (completionTokens / 1_000_000) * p.output;
}

// ─── localStorage key ────────────────────────────────────────────────────────
const LS_KEY = "omniscript_token_usage";

export interface LocalUsageSession {
  totalCalls:     number;
  totalPromptTokens:    number;
  totalOutputTokens:   number;
  totalTokens:    number;
  totalCostUsd:   number;
  lastModel:      string;
  lastUpdated:    string;
  history: Array<{
    ts:        string;
    model:     string;
    endpoint:  string;
    prompt:    number;
    output:    number;
    total:     number;
    costUsd:   number;
    durationMs: number;
  }>;
}

export function getLocalSummary(): LocalUsageSession {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalCalls: 0,
    totalPromptTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    totalCostUsd: 0,
    lastModel: "",
    lastUpdated: "",
    history: [],
  };
}

export function clearLocalSummary(): void {
  localStorage.removeItem(LS_KEY);
}

/**
 * 追蹤一次 Gemini API 呼叫（前端直接呼叫的情況）
 * 
 * @param model       - 使用的模型名稱
 * @param endpoint    - 功能標記（如 "canva-os", "canva-tts"）
 * @param usage       - Gemini API 回傳的 usageMetadata
 * @param durationMs  - 呼叫耗時（毫秒）
 * @param tags        - 額外標籤
 * @param apiBaseUrl  - 後端 API 基礎 URL（用於回報）
 */
export async function reportTokenUsage(params: {
  model: string;
  endpoint: string;
  usage: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    thoughtsTokenCount?: number;
  } | null | undefined;
  durationMs: number;
  tags?: string[];
  apiBaseUrl?: string;
}): Promise<void> {
  const promptTokens    = params.usage?.promptTokenCount     ?? 0;
  const outputTokens    = params.usage?.candidatesTokenCount ?? 0;
  const totalTokens     = params.usage?.totalTokenCount      ?? (promptTokens + outputTokens);
  const costUsd         = calcCost(params.model, promptTokens, outputTokens);
  const now             = new Date().toISOString();

  // ── 1. 更新 localStorage ──────────────────────────────────────────────────
  try {
    const session = getLocalSummary();
    session.totalCalls++;
    session.totalPromptTokens  += promptTokens;
    session.totalOutputTokens  += outputTokens;
    session.totalTokens        += totalTokens;
    session.totalCostUsd       += costUsd;
    session.lastModel           = params.model;
    session.lastUpdated         = now;

    // 只保留最近 50 筆
    session.history.unshift({
      ts:        now,
      model:     params.model,
      endpoint:  params.endpoint,
      prompt:    promptTokens,
      output:    outputTokens,
      total:     totalTokens,
      costUsd,
      durationMs: params.durationMs,
    });
    if (session.history.length > 50) session.history = session.history.slice(0, 50);

    localStorage.setItem(LS_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("[TokenUsage] localStorage 寫入失敗:", e);
  }

  // ── 2. 後端持久化（fire-and-forget，不阻塞主流程） ──────────────────────
  try {
    const base = params.apiBaseUrl ?? "https://omni-script-pro.vercel.app";
    // 本地開發時不帶完整 URL
    const url = (typeof window !== "undefined" &&
      (window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")))
      ? "/api/token-usage"
      : `${base}/api/token-usage`;

    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:     params.model,
        endpoint:  params.endpoint,
        usage:     params.usage,
        durationMs: params.durationMs,
        tags:      params.tags ?? ["canva-app"],
      }),
    }).catch(() => {}); // 靜默失敗，不影響主流程
  } catch {}
}
