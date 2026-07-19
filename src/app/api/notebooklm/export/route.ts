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

# ==========================================
# 剪映自動化草稿注入腳本 (由 OmniScript PRO 產生)
# ==========================================

# 1. 剪映草稿路徑 (請替換為您的真實草稿路徑)
DRAFT_PATH = r"C:\\\\Users\\\\sunny\\\\AppData\\\\Local\\\\JianyingPro\\\\User Data\\\\Projects\\\\com.lveditor.draft\\\\【您的專案名稱】\\\\draft_content.json"

# 2. 自動抓取當前資料夾下的所有圖片 (jpg, png) 作為素材
current_dir = os.path.dirname(os.path.abspath(__file__))
image_files = sorted(glob.glob(os.path.join(current_dir, "*.jpg")) + glob.glob(os.path.join(current_dir, "*.png")))

if not image_files:
    print("❌ 在當前資料夾找不到任何 .jpg 或 .png 圖片！請將下載的圖片與此腳本放在同一個資料夾。")
    exit()

# 3. 從後端擷取的時間軸與旁白結構
SCENES_DATA = ${scenesJson}

def generate_ids():
    return str(uuid.uuid4()).upper(), str(uuid.uuid4()).upper()

def inject_to_capcut(draft_path, images, scenes):
    if not os.path.exists(draft_path):
        print(f"❌ 找不到剪映草稿檔案：{draft_path}")
        return

    with open(draft_path, 'r', encoding='utf-8') as f:
        draft = json.load(f)

    if "materials" not in draft: draft["materials"] = {}
    if "videos" not in draft["materials"]: draft["materials"]["videos"] = []
    if "texts" not in draft["materials"]: draft["materials"]["texts"] = []
    
    # 建立影片軌道與文字軌道
    image_track = {"id": str(uuid.uuid4()).upper(), "type": "video", "segments": []}
    text_track = {"id": str(uuid.uuid4()).upper(), "type": "text", "segments": []}
    
    draft.setdefault("tracks", []).insert(0, image_track)
    draft.setdefault("tracks", []).insert(0, text_track)

    current_start_time = 0
    duration_per_scene = 30 * 1000000 # 預設每張 30 秒 (微秒)

    print("🚀 開始注入本機圖片與旁白至剪映草稿...")

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
            "photograph_type": 1
        }
        draft["materials"]["videos"].append(photo_material)

        image_segment = {
            "id": img_segment_id,
            "material_id": img_material_id,
            "source_timerange": {"start": 0, "duration": duration_microsec},
            "target_timerange": {"start": current_start_time, "duration": duration_microsec},
            "speed": 1.0,
            "render_index": 1000 + index,
            "clip": {"alpha": 1.0, "scale": {"x": 1.0, "y": 1.0}, "transform": {"x": 0.0, "y": 0.0}}
        }
        image_track["segments"].append(image_segment)

        # --- 處理文字 (旁白/字卡) ---
        caption_text = scene.get("caption", "")
        if caption_text:
            text_segment_id, text_material_id = generate_ids()
            text_material = {
                "id": text_material_id,
                "type": "text",
                "content": f"<font id=\\"\\" dir=\\"\\" color=\\"#FFFFFF\\">{caption_text}</font>",
                "text_alpha": 1.0
            }
            draft["materials"]["texts"].append(text_material)
            
            text_segment = {
                "id": text_segment_id,
                "material_id": text_material_id,
                "source_timerange": {"start": 0, "duration": duration_microsec},
                "target_timerange": {"start": current_start_time, "duration": duration_microsec},
                "speed": 1.0,
                "render_index": 1500 + index
            }
            text_track["segments"].append(text_segment)

        current_start_time += duration_microsec

    # 備份
    backup_path = draft_path + ".backup"
    if not os.path.exists(backup_path):
        shutil.copy2(draft_path, backup_path)
        print(f"✅ 已建立草稿備份：{backup_path}")

    with open(draft_path, 'w', encoding='utf-8') as f:
        json.dump(draft, f, ensure_ascii=False, indent=4)
        
    print(f"🎉 成功！已將 {len(images)} 張本機圖片與對應字卡寫入剪映草稿。")

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
