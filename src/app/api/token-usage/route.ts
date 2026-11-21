/**
 * /api/token-usage/route.ts
 * 
 * GET  /api/token-usage           → 彙總統計
 * GET  /api/token-usage?raw=true  → 完整歷史 JSONL 記錄
 * GET  /api/token-usage?days=7    → 最近 N 天
 * POST /api/token-usage           → 前端（Canva App）回報 usageMetadata
 */

import { NextResponse } from "next/server";
import { readAllRecords, computeSummary, trackGeminiUsage, exportToCsv, exportToLatex } from "@/utils/tokenTracker";

export const dynamic = "force-dynamic"; // 每次都重新讀取最新資料

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const raw    = url.searchParams.get("raw") === "true";
    const exp    = url.searchParams.get("export")?.toLowerCase();
    const days   = parseInt(url.searchParams.get("days") ?? "0", 10);

    let records = readAllRecords();

    // 依天數篩選
    if (days > 0) {
      const cutoff = new Date(Date.now() - days * 86_400_000).getTime();
      records = records.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
    }

    // 🎓 論文匯出模式：CSV (供 SPSS / R / Pandas 統計分析)
    if (exp === "csv") {
      const csvData = exportToCsv(records);
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="gemini_sme_token_dataset_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // 🎓 論文匯出模式：LaTeX (標準三線表 Booktabs)
    if (exp === "latex" || exp === "tex") {
      const latexData = exportToLatex(records);
      return new NextResponse(latexData, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
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

/**
 * POST /api/token-usage
 * 
 * 前端 Canva App 在直接呼叫 Gemini API 後，把 usageMetadata 回報到此端點，
 * 讓後端可以持久化記錄並合併計算費用。
 * 
 * Body:
 * {
 *   model: string,
 *   endpoint: string,
 *   usage: { promptTokenCount, candidatesTokenCount, totalTokenCount, thoughtsTokenCount? },
 *   durationMs: number,
 *   tags?: string[]
 * }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { model, endpoint, usage, durationMs, tags } = body;

    if (!model || !usage) {
      return NextResponse.json(
        { error: "Missing required fields: model, usage" },
        { status: 400 }
      );
    }

    const record = trackGeminiUsage({
      model,
      endpoint: endpoint ?? "canva-frontend",
      usage,
      durationMs: durationMs ?? 0,
      tags: tags ?? ["canva-app"],
    });

    return NextResponse.json({ ok: true, record });

  } catch (error: any) {
    console.error("[token-usage POST] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
