import { NextResponse } from "next/server";

// ============================================================================
// --- 授權金鑰對應表 (5 個受眾群 + 1 個管理員) ---
// ============================================================================
const ACCESS_CODES: Record<string, string> = {
  'CULTURE2026': 'heritage',   // 民俗信仰・文化傳承
  'BEAUTY2026': 'beauty',     // 美妝保養・悅己美學
  'TRAVEL2026': 'travelpreneur',// 旅遊生活・世界漫遊
  'FOOD2026': 'food',       // 美食料理・風味探索
  'PET2026': 'pet',         // 寵物照護・幸福陪伴
  'FINTECH2026': 'fintech',     // FinTech 財經知識・AI 解析
  'STORY2026': 'story',     // 文化轉譯・銘印說書
  'FAIRYTALES2026': 'fairy tales', // 文化轉譯・銘印童話
  'FAIRY TALES2026': 'fairy tales', // 允許空白防呆
  'MASTER': 'heritage',     // 管理員
  'FLEIX': 'heritage'       // 全主題通用 (非管理員)
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
      const isMaster = code === 'MASTER';
      const theme = ACCESS_CODES[code];
      const allThemes = isMaster || code === 'FLEIX';
      
      return setCorsHeaders(NextResponse.json({
        success: true,
        theme: theme,
        isMaster: isMaster,
        allThemes: allThemes
      }));
    } else {
      return setCorsHeaders(NextResponse.json({ error: "通行碼無效或已過期" }, { status: 401 }));
    }
  } catch (error) {
    return setCorsHeaders(NextResponse.json({ error: "伺服器錯誤" }, { status: 500 }));
  }
}
