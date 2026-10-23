import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { scenes, theme, lang } = await req.json();

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'Missing or invalid scenes data' }, { status: 400 });
    }

    const themeToFolderMap: Record<string, string> = {
      'fairy tales': '銘印童話',
      'heritage': '銘印傳承',
      'beauty': '利己美學',
      'travelpreneur': '世代漫遊',
      'food': '風味探索',
      'pet': '寵物守護',
      'story': '銘印說書',
      'fintech': '財經知識',
      'proposal': '企劃文案',
      'edtech': '教育科技',
      'competition': '競賽企劃'
    };

    const isJa = lang === 'ja';
    const folderName = themeToFolderMap[theme || ''] || 'Omniscript';

    // 依據選擇語言 (中文 / 日文) 決定寫入剪映字幕軌道的旁白文字
    const scenesJson = JSON.stringify(scenes.map((s: any, idx: number) => ({
      id: idx + 1,
      title: s.title || `Scene ${idx + 1}`,
      voiceover: isJa ? (s.voiceover_ja || s.voiceover || s.poetry || "") : (s.voiceover || s.poetry || ""),
      caption: s.subTitle || s.caption || "",
    })), null, 4);

    const draftPathJa = `C:/Users/sunny/AppData/Local/JianyingPro/User Data/Projects/com.lveditor.draft/${folderName}_日文/draft_content.json`;
    const draftPathDefault = `C:/Users/sunny/AppData/Local/JianyingPro/User Data/Projects/com.lveditor.draft/${folderName}/draft_content.json`;

    const pythonCode = `import json
import os
import uuid
import glob
import shutil
import re

# ==========================================
# 剪映專業版草稿自動注入腳本 (${isJa ? '日文旁白版本' : '中文旁白版本'})
# ==========================================

DRAFT_PATH_JA = "${draftPathJa}"
DRAFT_PATH_DEFAULT = "${draftPathDefault}"
# 若為日文匯出且剪映存在「${folderName}_日文」草稿則優先寫入，否則寫入「${folderName}」
DRAFT_PATH = DRAFT_PATH_JA if ("${isJa}" == "True" and os.path.exists(DRAFT_PATH_JA)) else DRAFT_PATH_DEFAULT

def natural_sort_key(s):
    """將字串切為文字與數字，讓數字以整數大小比較"""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\\d+)', s)]

current_dir = os.path.dirname(os.path.abspath(__file__))
image_files = sorted(
    glob.glob(os.path.join(current_dir, "*.jpg"))
    + glob.glob(os.path.join(current_dir, "*.png"))
)
image_files = sorted(image_files, key=natural_sort_key)

if not image_files:
    print("❌ 在當前資料夾找不到任何 .jpg 或 .png 圖檔！")
    exit()

SCENES_DATA = ${scenesJson}

def generate_ids():
    return str(uuid.uuid4()).upper(), str(uuid.uuid4()).upper()

def inject_to_capcut(draft_path, images, scenes):
    if not os.path.exists(draft_path):
        print(f"❌ 找不到剪映草稿檔案: {draft_path}")
        print("💡 請先在剪映專業版中建立名稱為【${folderName}】${isJa ? ' 或【' + folderName + '_日文】' : ''} 的空白草稿專案！")
        return

    with open(draft_path, "r", encoding="utf-8") as f:
        draft = json.load(f)

    if "materials" not in draft:
        draft["materials"] = {}
    if "videos" not in draft["materials"]:
        draft["materials"]["videos"] = []
    if "texts" not in draft["materials"]:
        draft["materials"]["texts"] = []

    image_track = {"id": str(uuid.uuid4()).upper(), "type": "video", "segments": []}
    text_track = {"id": str(uuid.uuid4()).upper(), "type": "text", "segments": []}

    draft.setdefault("tracks", []).insert(0, image_track)
    draft.setdefault("tracks", []).insert(0, text_track)

    current_start_time = 0
    duration_per_scene = 30 * 1000000

    print("🚀 正在注入${isJa ? '日文' : '中文'}素材圖片與旁白字卡到剪映草稿...")

    for index, (img_path, scene) in enumerate(zip(images, scenes)):
        duration_microsec = duration_per_scene

        # --- 圖片軌道 ---
        img_segment_id, img_material_id = generate_ids()
        photo_material = {
            "id": img_material_id,
            "type": "photo",
            "path": img_path,
            "duration": duration_microsec,
            "width": 1920,
            "height": 1080,
            "photograph_type": 1,
        }
        draft["materials"]["videos"].append(photo_material)

        image_segment = {
            "id": img_segment_id,
            "material_id": img_material_id,
            "source_timerange": {"start": 0, "duration": duration_microsec},
            "target_timerange": {
                "start": current_start_time,
                "duration": duration_microsec,
            },
            "speed": 1.0,
            "render_index": 1000 + index,
            "clip": {
                "alpha": 1.0,
                "scale": {"x": 1.0, "y": 1.0},
                "transform": {"x": 0.0, "y": 0.0},
            },
        }
        image_track["segments"].append(image_segment)

        # --- 文字軌道 (旁白字卡) ---
        voiceover_text = scene.get("voiceover", "")
        if voiceover_text:
            text_segment_id, text_material_id = generate_ids()

            text_material = {
                "id": text_material_id,
                "type": "text",
                "content": voiceover_text,
                "words": [],
                "text_to_audio_ids": [],
            }
            draft["materials"]["texts"].append(text_material)

            text_segment = {
                "id": text_segment_id,
                "material_id": text_material_id,
                "source_timerange": {"start": 0, "duration": duration_microsec},
                "target_timerange": {
                    "start": current_start_time,
                    "duration": duration_microsec,
                },
                "speed": 1.0,
                "render_index": 1500 + index,
                "clip_settings": {"alpha": 1.0, "transform": {"x": 0.0, "y": -0.7}},
            }
            text_track["segments"].append(text_segment)

        current_start_time += duration_microsec

    backup_path = draft_path + ".backup"
    if not os.path.exists(backup_path):
        shutil.copy2(draft_path, backup_path)

    with open(draft_path, "w", encoding="utf-8") as f:
        json.dump(draft, f, ensure_ascii=False, indent=4)

    print("🎉 大功告成！${isJa ? '日文' : '中文'}旁白字卡與圖片已完美寫入剪映草稿！")

if __name__ == "__main__":
    inject_to_capcut(DRAFT_PATH, image_files, SCENES_DATA)
`;

    const downloadFilename = isJa ? 'capcut_generator_ja.py' : 'capcut_generator.py';

    return new NextResponse(pythonCode, {
      status: 200,
      headers: {
        'Content-Type': 'text/x-python',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`
      }
    });

  } catch (error: any) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: error.message || "匯出失敗" }, { status: 500 });
  }
}
