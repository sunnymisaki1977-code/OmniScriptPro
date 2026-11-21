/**
 * tokenTracker.ts
 * 
 * 追蹤每次 Gemini API 呼叫的真實 usageMetadata，
 * 以及從 Notion 快取取得資料時省下的 token 費用。
 * 
 * 持久化策略：追加寫入 logs/token-usage.jsonl（逐行 JSON，永不消失）
 */

import * as fs from "fs";
import * as path from "path";

// ─── 型別定義 ───────────────────────────────────────────────────────────────

export type ModelFunctionalRole = 
  | "general_content"     // 通用內容產製主力 (gemini-3-flash-preview)
  | "deep_reasoning"      // 深度邏輯推理與即時查核 (gemini-3-flash-thinking)
  | "fallback"            // 容錯降級保證服務 SLA (gemini-2.5-flash)
  | "visual_standard"     // 標準視覺影像生成 (gemini-2.5-flash-image-preview)
  | "visual_hd"           // 高階 4K 旗艦影像生成 (gemini-3.1-flash-image-preview)
  | "audio_tts"           // 多模態語音旁白合成 (gemini-2.5-flash-preview-tts)
  | "other";

export interface GeminiUsageRecord {
  type: "gemini_call";
  timestamp: string;             // ISO 8601 +08:00
  requestId: string;             // 唯一請求 ID（uuid-like）
  model: string;                 // 實際使用的模型
  functionalRole: ModelFunctionalRole; // 學術論文核心：以「模型功能/模態角色」分類
  endpoint: string;              // 呼叫來源（如 "generate", "canva-os"）
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  thoughtsTokenCount?: number;   // 若模型有 thinking 模式
  cachedContentTokenCount?: number;
  outputChars?: number;          // 產出文字字元長度 (供計算 Token 實質文字轉換率)
  estimatedCostUsd: number;      // 估算費用（USD）
  durationMs: number;            // 呼叫耗時（毫秒）
  tags?: string[];               // 額外標籤
}

export interface NotionCacheRecord {
  type: "notion_cache_hit";
  timestamp: string;
  requestId: string;
  endpoint: string;              // 如 "get-prompts", "competition-notion"
  pageId?: string;
  savedPromptTokens: number;     // 估算省下的 prompt tokens
  savedCompletionTokens: number; // 估算省下的 completion tokens
  savedTotalTokens: number;
  estimatedSavingsUsd: number;   // 估算省下的費用（USD）
  tags?: string[];
}

export type TokenRecord = GeminiUsageRecord | NotionCacheRecord;

// ─── 論文核心：系統六大功能模型定價（USD per 1M tokens / 每張圖） ─────────
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gemini-3-flash-preview":       { input: 0.075,  output: 0.30  }, // 通用產製
  "gemini-3-flash-thinking":      { input: 1.25,   output: 10.0  }, // 深度推理
  "gemini-2.5-flash":             { input: 0.075,  output: 0.30  }, // 容錯降級
  "gemini-2.5-flash-image-preview": { input: 0.03, output: 0.03  }, // 標準影像 (約每張 $0.03)
  "gemini-3.1-flash-image-preview": { input: 0.06, output: 0.06  }, // 4K 旗艦影像 (約每張 $0.06)
  "gemini-2.5-flash-preview-tts": { input: 0.075,  output: 0.30  }, // 語音合成
  "gemini-2.5-pro":               { input: 1.25,   output: 10.0  },
  "gemini-2.5-flash-lite":        { input: 0.0375, output: 0.15  },
};

export function inferFunctionalRole(model: string, endpoint?: string): ModelFunctionalRole {
  if (model.includes("thinking")) return "deep_reasoning";
  if (model.includes("image-preview") || endpoint?.includes("image")) {
    return model.includes("3.1") ? "visual_hd" : "visual_standard";
  }
  if (model.includes("tts") || endpoint?.includes("tts")) return "audio_tts";
  if (model === "gemini-2.5-flash") return "fallback";
  if (model.includes("3-flash") || model.includes("preview")) return "general_content";
  return "other";
}

function getModelPrice(model: string): { input: number; output: number } {
  // 嘗試精確匹配，否則前綴匹配
  if (MODEL_PRICING[model]) return MODEL_PRICING[model];
  for (const key of Object.keys(MODEL_PRICING)) {
    if (model.startsWith(key) || key.startsWith(model)) {
      return MODEL_PRICING[key];
    }
  }
  return { input: 0.075, output: 0.30 }; // 預設 Flash 定價
}

function calcCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = getModelPrice(model);
  return (promptTokens / 1_000_000) * pricing.input 
       + (completionTokens / 1_000_000) * pricing.output;
}

// ─── 路徑設定 ───────────────────────────────────────────────────────────────

function getLogPath(): string {
  // 在 Next.js App Router 裡，process.cwd() = 專案根目錄
  return path.join(process.cwd(), "logs", "token-usage.jsonl");
}

// ─── 簡易 UUID ──────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── 台灣時間 ISO 字串 ───────────────────────────────────────────────────────

function nowTW(): string {
  const d = new Date();
  // 手動轉 +08:00
  const offset = 8 * 60;
  const local = new Date(d.getTime() + offset * 60000);
  return local.toISOString().replace("Z", "+08:00");
}

// ─── 寫入一筆紀錄 ────────────────────────────────────────────────────────────

function appendRecord(record: TokenRecord): void {
  try {
    const logPath = getLogPath();
    // 確保目錄存在
    const dir = path.dirname(logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(logPath, JSON.stringify(record) + "\n", "utf-8");
  } catch (err) {
    // 追蹤失敗不應影響主流程
    console.error("[TokenTracker] 寫入失敗:", err);
  }
}

// ─── 公開 API ────────────────────────────────────────────────────────────────

/**
 * 記錄一次 Gemini API 真實呼叫的 usageMetadata。
 * 
 * 使用方式：
 * ```ts
 * const startMs = Date.now();
 * const result = await model.generateContent(prompt);
 * const response = await result.response;
 * trackGeminiUsage({
 *   model: modelName,
 *   endpoint: "generate",
 *   usage: response.usageMetadata,
 *   durationMs: Date.now() - startMs,
 *   tags: [stepId, audienceTheme],
 * });
 * ```
 */
export function trackGeminiUsage(params: {
  model: string;
  endpoint: string;
  functionalRole?: ModelFunctionalRole;
  outputChars?: number;
  usage: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
    thoughtsTokenCount?: number;
    cachedContentTokenCount?: number;
  } | null | undefined;
  durationMs: number;
  tags?: string[];
}): GeminiUsageRecord {
  const promptTokens    = params.usage?.promptTokenCount     ?? 0;
  const candidateTokens = params.usage?.candidatesTokenCount ?? 0;
  const totalTokens     = params.usage?.totalTokenCount      ?? (promptTokens + candidateTokens);
  const role            = params.functionalRole ?? inferFunctionalRole(params.model, params.endpoint);

  const record: GeminiUsageRecord = {
    type: "gemini_call",
    timestamp: nowTW(),
    requestId: generateId(),
    model: params.model,
    functionalRole: role,
    endpoint: params.endpoint,
    promptTokenCount: promptTokens,
    candidatesTokenCount: candidateTokens,
    totalTokenCount: totalTokens,
    thoughtsTokenCount: params.usage?.thoughtsTokenCount,
    cachedContentTokenCount: params.usage?.cachedContentTokenCount,
    outputChars: params.outputChars,
    estimatedCostUsd: calcCost(params.model, promptTokens, candidateTokens),
    durationMs: params.durationMs,
    tags: params.tags,
  };

  appendRecord(record);
  console.log(`[TokenTracker] 📊 [${role}] ${params.endpoint} | ${params.model} | ` +
    `in=${promptTokens} out=${candidateTokens} total=${totalTokens} | ` +
    `cost=$${record.estimatedCostUsd.toFixed(6)} | ${params.durationMs}ms`);

  return record;
}

/**
 * 記錄一次 Notion 快取命中，省下的 token 費用。
 * 
 * savedPromptTokens：估算若改用 Gemini 生成同份內容需要的 prompt tokens
 * savedCompletionTokens：估算省下的 completion tokens
 * comparativeModel：用哪個模型估算省下費用（預設 gemini-2.5-flash）
 * 
 * 使用方式：
 * ```ts
 * trackNotionCacheHit({
 *   endpoint: "get-prompts",
 *   pageId: pageId,
 *   savedPromptTokens: 2000,
 *   savedCompletionTokens: 1500,
 *   tags: ["competition-notion"],
 * });
 * ```
 */
export function trackNotionCacheHit(params: {
  endpoint: string;
  pageId?: string;
  savedPromptTokens: number;
  savedCompletionTokens: number;
  comparativeModel?: string;
  tags?: string[];
}): NotionCacheRecord {
  const model = params.comparativeModel ?? "gemini-2.5-flash";
  const savings = calcCost(model, params.savedPromptTokens, params.savedCompletionTokens);

  const record: NotionCacheRecord = {
    type: "notion_cache_hit",
    timestamp: nowTW(),
    requestId: generateId(),
    endpoint: params.endpoint,
    pageId: params.pageId,
    savedPromptTokens: params.savedPromptTokens,
    savedCompletionTokens: params.savedCompletionTokens,
    savedTotalTokens: params.savedPromptTokens + params.savedCompletionTokens,
    estimatedSavingsUsd: savings,
    tags: params.tags,
  };

  appendRecord(record);
  console.log(`[TokenTracker] 💾 Notion 快取 ${params.endpoint} | ` +
    `省 ${record.savedTotalTokens} tokens | 節省 $${savings.toFixed(6)}`);

  return record;
}

/**
 * 讀取所有歷史記錄（供 /api/token-usage 使用）
 */
export function readAllRecords(): TokenRecord[] {
  try {
    const logPath = getLogPath();
    if (!fs.existsSync(logPath)) return [];
    const lines = fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean);
    return lines.map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

/**
 * 計算彙總統計
 */
export function computeSummary(records: TokenRecord[]) {
  const geminiRecords = records.filter((r): r is GeminiUsageRecord => r.type === "gemini_call");
  const notionRecords = records.filter((r): r is NotionCacheRecord => r.type === "notion_cache_hit");

  const totalPromptTokens     = geminiRecords.reduce((s, r) => s + r.promptTokenCount, 0);
  const totalCandidateTokens  = geminiRecords.reduce((s, r) => s + r.candidatesTokenCount, 0);
  const totalTokens            = geminiRecords.reduce((s, r) => s + r.totalTokenCount, 0);
  const totalCostUsd           = geminiRecords.reduce((s, r) => s + r.estimatedCostUsd, 0);
  const totalSavedTokens       = notionRecords.reduce((s, r) => s + r.savedTotalTokens, 0);
  const totalSavingsUsd        = notionRecords.reduce((s, r) => s + r.estimatedSavingsUsd, 0);

  // 依模型分組
  const byModel: Record<string, { calls: number; tokens: number; costUsd: number }> = {};
  for (const r of geminiRecords) {
    if (!byModel[r.model]) byModel[r.model] = { calls: 0, tokens: 0, costUsd: 0 };
    byModel[r.model].calls++;
    byModel[r.model].tokens += r.totalTokenCount;
    byModel[r.model].costUsd += r.estimatedCostUsd;
  }

  // 依 endpoint 分組
  const byEndpoint: Record<string, { calls: number; tokens: number; costUsd: number }> = {};
  for (const r of geminiRecords) {
    if (!byEndpoint[r.endpoint]) byEndpoint[r.endpoint] = { calls: 0, tokens: 0, costUsd: 0 };
    byEndpoint[r.endpoint].calls++;
    byEndpoint[r.endpoint].tokens += r.totalTokenCount;
    byEndpoint[r.endpoint].costUsd += r.estimatedCostUsd;
  }

  // 依「模型功能角色 (Functional Role)」分組 (學術論文核心架構)
  const byFunctionalRole: Record<string, { calls: number; tokens: number; costUsd: number; avgLatencyMs: number }> = {};
  for (const r of geminiRecords) {
    const roleKey = r.functionalRole || inferFunctionalRole(r.model, r.endpoint);
    if (!byFunctionalRole[roleKey]) {
      byFunctionalRole[roleKey] = { calls: 0, tokens: 0, costUsd: 0, avgLatencyMs: 0 };
    }
    const cur = byFunctionalRole[roleKey];
    cur.avgLatencyMs = (cur.avgLatencyMs * cur.calls + r.durationMs) / (cur.calls + 1);
    cur.calls++;
    cur.tokens += r.totalTokenCount;
    cur.costUsd += r.estimatedCostUsd;
  }

  return {
    geminiCalls:         geminiRecords.length,
    notionCacheHits:     notionRecords.length,
    totalPromptTokens,
    totalCandidateTokens,
    totalTokens,
    totalCostUsd,
    totalSavedTokens,
    totalSavingsUsd,
    netCostUsd:          totalCostUsd - totalSavingsUsd,
    byModel,
    byEndpoint,
    byFunctionalRole,
    generatedAt:         nowTW(),
  };
}

/**
 * 🎓 學術研究專用：匯出乾淨 CSV 資料集 (可直接匯入 SPSS / R / Pandas)
 */
export function exportToCsv(records: TokenRecord[]): string {
  const headers = [
    "timestamp",
    "record_type",
    "request_id",
    "model",
    "functional_role",
    "endpoint",
    "prompt_tokens",
    "candidate_tokens",
    "total_tokens",
    "thoughts_tokens",
    "output_chars",
    "duration_ms",
    "cost_usd",
    "savings_usd",
    "tags"
  ];

  const rows = records.map((r) => {
    if (r.type === "gemini_call") {
      return [
        r.timestamp,
        r.type,
        r.requestId,
        `"${r.model}"`,
        r.functionalRole,
        `"${r.endpoint}"`,
        r.promptTokenCount,
        r.candidatesTokenCount,
        r.totalTokenCount,
        r.thoughtsTokenCount ?? 0,
        r.outputChars ?? 0,
        r.durationMs,
        r.estimatedCostUsd.toFixed(6),
        "0.000000",
        `"${(r.tags || []).join(";")}"`
      ].join(",");
    } else {
      return [
        r.timestamp,
        r.type,
        r.requestId,
        "notion_cache",
        "cache_avoidance",
        `"${r.endpoint}"`,
        r.savedPromptTokens,
        r.savedCompletionTokens,
        r.savedTotalTokens,
        0,
        0,
        0,
        "0.000000",
        r.estimatedSavingsUsd.toFixed(6),
        `"${(r.tags || []).join(";")}"`
      ].join(",");
    }
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * 🎓 學術論文專用：一鍵生成 LaTeX 標準三線表 (Booktabs)
 */
export function exportToLatex(records: TokenRecord[]): string {
  const summary = computeSummary(records);

  const roleNameMap: Record<string, string> = {
    general_content:  "General Content Production (gemini-3-flash-preview)",
    deep_reasoning:   "Deep Reasoning & Fact-Checking (gemini-3-flash-thinking)",
    fallback:         "Fault-Tolerant Fallback (gemini-2.5-flash)",
    visual_standard:  "Standard Visual Generation (gemini-2.5-flash-image-preview)",
    visual_hd:        "High-Fidelity Visual (gemini-3.1-flash-image-preview)",
    audio_tts:        "Speech Synthesis TTS (gemini-2.5-flash-preview-tts)",
    other:            "Other Experimental Models"
  };

  let tableRows = "";
  for (const [role, data] of Object.entries(summary.byFunctionalRole)) {
    const displayName = roleNameMap[role] || role;
    tableRows += `  ${displayName} & ${data.calls} & ${data.tokens.toLocaleString()} & ${data.avgLatencyMs.toFixed(0)}~ms & \\$${data.costUsd.toFixed(4)} \\\\\n`;
  }

  return `% 論文第四章「模型功能階層調度之成本效益實證分析」標準三線表
\\begin{table}[htbp]
  \\centering
  \\caption{Gemini 多模態功能架構在中小企業內容產製之呼叫次數、Token 消耗與成本對照表}
  \\label{tab:gemini_model_roles_cost}
  \\begin{tabular}{lrrrr}
    \\toprule
    \\textbf{模型功能角色 (Functional Role)} & \\textbf{呼叫次數 (Calls)} & \\textbf{總 Token 數} & \\textbf{平均延遲} & \\textbf{累積成本 (USD)} \\\\
    \\midrule
${tableRows}    \\midrule
    \\textbf{Notion 快取省下效益 (Cache Avoidance)} & ${summary.notionCacheHits} 筆快取 & ${summary.totalSavedTokens.toLocaleString()} tk & --- & -\\$${summary.totalSavingsUsd.toFixed(4)} \\\\
    \\midrule
    \\textbf{總計實質淨成本 (Net Operational Cost)} & ${summary.geminiCalls} 呼叫 & ${summary.totalTokens.toLocaleString()} tk & --- & \\$${summary.netCostUsd.toFixed(4)} \\\\
    \\bottomrule
  \\end{tabular}
\\end{table}
`;
}
