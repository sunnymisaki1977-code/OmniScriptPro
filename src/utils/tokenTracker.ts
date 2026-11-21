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

export interface GeminiUsageRecord {
  type: "gemini_call";
  timestamp: string;             // ISO 8601 +08:00
  requestId: string;             // 唯一請求 ID（uuid-like）
  model: string;                 // 實際使用的模型
  endpoint: string;              // 呼叫來源（如 "generate", "generate-context"）
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  thoughtsTokenCount?: number;   // 若模型有 thinking 模式
  cachedContentTokenCount?: number;
  estimatedCostUsd: number;      // 估算費用（USD）
  durationMs: number;            // 呼叫耗時（毫秒）
  tags?: string[];               // 額外標籤（如主題、stepId）
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

// ─── Gemini 模型定價（USD per 1M tokens，2026 Q4 定價） ─────────────────────
// 參考：https://ai.google.dev/pricing
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "gemini-2.5-pro":        { input: 1.25,  output: 10.0  }, // ≤200k ctx
  "gemini-2.5-flash":      { input: 0.075, output: 0.30  },
  "gemini-2.5-flash-lite": { input: 0.0375,output: 0.15  },
  "gemini-2.0-flash":      { input: 0.075, output: 0.30  },
  "gemini-1.5-pro":        { input: 1.25,  output: 5.00  },
  "gemini-1.5-flash":      { input: 0.075, output: 0.30  },
};

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

  const record: GeminiUsageRecord = {
    type: "gemini_call",
    timestamp: nowTW(),
    requestId: generateId(),
    model: params.model,
    endpoint: params.endpoint,
    promptTokenCount: promptTokens,
    candidatesTokenCount: candidateTokens,
    totalTokenCount: totalTokens,
    thoughtsTokenCount: params.usage?.thoughtsTokenCount,
    cachedContentTokenCount: params.usage?.cachedContentTokenCount,
    estimatedCostUsd: calcCost(params.model, promptTokens, candidateTokens),
    durationMs: params.durationMs,
    tags: params.tags,
  };

  appendRecord(record);
  console.log(`[TokenTracker] 📊 ${params.endpoint} | ${params.model} | ` +
    `prompt=${promptTokens} out=${candidateTokens} total=${totalTokens} | ` +
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
    generatedAt:         nowTW(),
  };
}
