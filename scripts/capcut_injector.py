import json
import os
import sys
import uuid

def inject_to_capcut(json_script_path, draft_json_path):
    print(f"Reading JSON script from: {json_script_path}")
    with open(json_script_path, 'r', encoding='utf-8') as f:
        script_data = json.load(f)

    print(f"Reading CapCut Draft from: {draft_json_path}")
    with open(draft_json_path, 'r', encoding='utf-8') as f:
        draft_data = json.load(f)

    # Make sure materials and texts exist
    if "materials" not in draft_data:
        draft_data["materials"] = {}
    if "texts" not in draft_data["materials"]:
        draft_data["materials"]["texts"] = []

    if "tracks" not in draft_data:
        draft_data["tracks"] = []

    # Find or create a text track
    text_track = None
    for track in draft_data["tracks"]:
        if track.get("type") == "text":
            text_track = track
            break

    if not text_track:
        text_track = {
            "id": str(uuid.uuid4()),
            "type": "text",
            "segments": []
        }
        draft_data["tracks"].append(text_track)

    print("Injecting voiceover texts...")
    
    start_time = 0
    duration = 3000000 # 3 seconds per clip in microseconds (CapCut time unit)
    
    for i, item in enumerate(script_data):
        vo_text = item.get("voiceover", "")
        if not vo_text:
            continue
            
        text_id = str(uuid.uuid4())
        
        # Add to materials.texts
        draft_data["materials"]["texts"].append({
            "id": text_id,
            "type": "text",
            "content": f"<font id=\"\" path=\"\">{vo_text}</font>",
            "text_alpha": 1.0,
            "style": {
                "font_size": 14.0
            }
        })
        
        # Add to track segments
        text_track["segments"].append({
            "id": str(uuid.uuid4()),
            "material_id": text_id,
            "target_timerange": {
                "start": start_time,
                "duration": duration
            },
            "source_timerange": {
                "start": 0,
                "duration": duration
            }
        })
        
        start_time += duration

    # Backup the original draft
    backup_path = draft_json_path + ".backup"
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy2(draft_json_path, backup_path)
        print(f"Original draft backed up to: {backup_path}")

    with open(draft_json_path, 'w', encoding='utf-8') as f:
        json.dump(draft_data, f, ensure_ascii=False, indent=2)

    print("Injection complete! Open CapCut to see the imported text track.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python capcut_injector.py <path_to_capcut_script.json> <path_to_draft_content.json>")
        sys.exit(1)
        
    script_path = sys.argv[1]
    draft_path = sys.argv[2]
    
    inject_to_capcut(script_path, draft_path)
