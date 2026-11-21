/**
 * /api/token-usage/route.ts
 * 
 * GET  /api/token-usage           → 彙總統計
 * GET  /api/token-usage?raw=true  → 完整歷史 JSONL 記錄
 * GET  /api/token-usage?days=7    → 最近 N 天
 */

import { NextResponse } from "next/server";
import { readAllRecords, computeSummary } from "@/utils/tokenTracker";

export const dynamic = "force-dynamic"; // 每次都重新讀取最新資料

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw  = url.searchParams.get("raw") === "true";
    const days = parseInt(url.searchParams.get("days") ?? "0", 10);

    let records = readAllRecords();

    // 依天數篩選
    if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86_400_000).getTime();
      records = records.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
    }

    if (raw) {
      return NextResponse.json({ records, count: records.length });
    }

    const summary = computeSummary(records);
    return NextResponse.json(summary);

  } catch (error: any) {
    console.error("[token-usage API] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
