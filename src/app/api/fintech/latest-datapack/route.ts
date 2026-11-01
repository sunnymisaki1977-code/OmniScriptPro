import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function setCorsHeaders(res: NextResponse) {
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}

export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function GET() {
  try {
    const cwd = process.cwd();
    const files = fs.readdirSync(cwd);
    const dpFiles = files.filter(f => f.startsWith('DataPack_') && f.endsWith('.json')).sort().reverse();

    if (dpFiles.length === 0) {
      return setCorsHeaders(NextResponse.json({ success: false, error: '未找到任何 DataPack 檔案' }, { status: 404 }));
    }

    const latestFileName = dpFiles[0];
    const fullPath = path.join(cwd, latestFileName);
    const content = fs.readFileSync(fullPath, 'utf8');
    const data = JSON.parse(content);

    return setCorsHeaders(
      NextResponse.json({
        success: true,
        fileName: latestFileName,
        data
      })
    );
  } catch (error: any) {
    return setCorsHeaders(
      NextResponse.json({ success: false, error: error.message }, { status: 500 })
    );
  }
}
