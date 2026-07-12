import { NextResponse } from "next/server";

// ============================================================================
// --- 授權金鑰對應表 (5 個受眾群 + 1 個管理員) ---
// ============================================================================
const ACCESS_CODES: Record<string, string> = {
  'TECH2026': 'heritage',   // 民俗信仰・文化傳承
  'GLAM2026': 'beauty',     // 美妝保養・悅己美學
  'INDIE2026': 'travelpreneur',// 旅遊生活・世界漫遊
  'RUBY2026': 'food',       // 美食料理・風味探索
  'PET2026': 'pet',         // 寵物照護・幸福陪伴
  'SKY2026': 'pet',         // 相容舊碼
  'MASTER': 'heritage'      // 管理員
};

export async function GET() {
  return NextResponse.json({
    success: true,
    accessCodes: ACCESS_CODES
  });
}
