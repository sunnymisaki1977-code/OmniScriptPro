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
  'MASTER': 'heritage',     // 管理員
  'FLEIX': 'heritage'       // 全主題管理者 (新增)
};

// ============================================================================
// --- CORS 處理函數 ---
// ============================================================================
function setCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const passcode = body.passcode;

    if (!passcode) {
      return setCorsHeaders(NextResponse.json({ error: "請輸入通行碼" }, { status: 400 }));
    }

    const code = passcode.trim().toUpperCase();
    
    if (ACCESS_CODES[code]) {
      const isMaster = code === 'MASTER' || code === 'FLEIX';
      const theme = ACCESS_CODES[code];
      
      return setCorsHeaders(NextResponse.json({
        success: true,
        theme: theme,
        isMaster: isMaster
      }));
    } else {
      return setCorsHeaders(NextResponse.json({ error: "通行碼無效或已過期" }, { status: 401 }));
    }
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ error: "伺服器錯誤" }, { status: 500 }));
  }
}
