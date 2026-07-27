import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { scenes } = await req.json();

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'Missing or invalid scenes data' }, { status: 400 });
    }

    // 這裡的 scenes 會包含每個畫格的時間軸與旁白資訊
    // 我們將其寫死在 Python 腳本內，作為字典，與使用者資料夾中的圖檔配對
    const scenesJson = JSON.stringify(scenes.map((s: any, idx: number) => ({
      id: idx + 1,
      title: s.title || `Scene ${idx + 1}`,
      voiceover: s.poetry || s.voiceover || "",
      caption: s.subTitle || s.caption || "",
    })), null, 4);

    const pythonCode = `import json
import os
import uuid
import glob
import shutil
import re  # 💡 就是這裡！必須載入這個模組才能處理數字排序

# ==========================================
# 剪映自動化草稿注入腳本 (純文字輸出修正版)
# ==========================================

DRAFT_PATH = "C:/Users/sunny/AppData/Local/JianyingPro/User Data/Projects/com.lveditor.draft/Omniscript/draft_content.json"

# 💡 新增：定義自然排序的判斷規則
def natural_sort_key(s):
    """將字串拆分為文字與數字，讓數字以整數型態進行大小比較"""
    return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\\d+)', s)]

current_dir = os.path.dirname(os.path.abspath(__file__))
image_files = sorted(
    glob.glob(os.path.join(current_dir, "*.jpg"))
    + glob.glob(os.path.join(current_dir, "*.png"))
)

# 💡 修改：使用自訂的 natural_sort_key 來進行排序
image_files = sorted(image_files, key=natural_sort_key)

if not image_files:
    print("❌ 在當前資料夾找不到任何 .jpg 或 .png 圖片！")
    exit()

# 3. 從後端擷取的時間軸與旁白結構
SCENES_DATA = ${scenesJson}

def generate_ids():
    """產生剪映所需要的隨機 UUID"""
    return str(uuid.uuid4()).upper(), str(uuid.uuid4()).upper()

def inject_to_capcut(draft_path, images, scenes):
    if not os.path.exists(draft_path):
        print(f"❌ 找不到剪映草稿檔案：{draft_path}")
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

    print("🚀 開始注入本機圖片與純文字字卡至剪映草稿...")

    for index, (img_path, scene) in enumerate(zip(images, scenes)):
        duration_microsec = duration_per_scene

        # --- 處理圖像 ---
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

        # --- 處理文字 (直接填寫純文字) ---
        voiceover_text = scene.get("voiceover", "")
        if voiceover_text:
            text_segment_id, text_material_id = generate_ids()

            text_material = {
                "id": text_material_id,
                "type": "text",
                # 💡 這裡修改為：直接輸入純文字變數，去除所有 JSON 語法
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

    print("🎉 成功！純文字字卡已寫入。")

if __name__ == "__main__":
    inject_to_capcut(DRAFT_PATH, image_files, SCENES_DATA)
`;

    return new NextResponse(pythonCode, {
      status: 200,
      headers: {
        'Content-Type': 'text/x-python',
        'Content-Disposition': 'attachment; filename="capcut_generator.py"'
      }
    });

  } catch (error: any) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: error.message || "匯出失敗" }, { status: 500 });
  }
}
