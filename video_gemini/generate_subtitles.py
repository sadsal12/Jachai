"""
Generates video/out/jachai-launch_gemini.en.srt matching Gemini's timeline and speech manifest.
"""
import json
import math
import re
import os

FPS = 30

# Scene configs (lead, tail, minFrames) mirroring timeline.ts
SCENE_CONFIGS = [
  {"id": "s01-crisis", "lead": 12, "tail": 20},
  {"id": "s02-stakes", "lead": 12, "tail": 20},
  {"id": "s03-intro", "lead": 12, "tail": 20},
  {"id": "s04-share-demo", "lead": 12, "tail": 25},
  {"id": "s05-text-check", "lead": 12, "tail": 20},
  {"id": "s06-vision-check", "lead": 12, "tail": 20},
  {"id": "s07-bubble-demo", "lead": 12, "tail": 20},
  {"id": "s08-privacy", "lead": 12, "tail": 20},
  {"id": "s09-business", "lead": 12, "tail": 20},
  {"id": "s10-team-cta", "lead": 15, "tail": 130},
]

def format_timestamp(seconds):
    ms = int(round(seconds * 1000))
    hours = ms // 3600000
    minutes = (ms // 60000) % 60
    secs = (ms // 1000) % 60
    millis = ms % 1000
    return f"{hours:02}:{minutes:02}:{secs:02},{millis:03}"

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    manifest_path = os.path.join(base_dir, "src", "vo_manifest.json")
    manifest = json.load(open(manifest_path, encoding="utf-8"))
    
    cues = []
    current_frame = 0
    
    for cfg in SCENE_CONFIGS:
        sc_id = cfg["id"]
        sc_info = manifest[sc_id]
        vo_duration = sc_info["duration"]
        vo_frames = math.ceil(vo_duration * FPS)
        
        duration_frames = cfg["lead"] + vo_frames + cfg["tail"]
        scene_voice_start_sec = (current_frame + cfg["lead"]) / FPS
        
        # Split text into sentences
        sentences = [s.strip() for s in re.split(r"(?<=[.?!:])\s+", sc_info["text"]) if s.strip()]
        total_chars = sum(len(s) for s in sentences)
        
        t = scene_voice_start_sec
        for s in sentences:
            span = vo_duration * (len(s) / total_chars)
            cues.append((t, t + span, s))
            t += span
            
        current_frame += duration_frames
        
    out_path = os.path.abspath(os.path.join(base_dir, "..", "video", "out", "jachai-launch_gemini.en.srt"))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        for idx, (start_sec, end_sec, text) in enumerate(cues, 1):
            f.write(f"{idx}\n{format_timestamp(start_sec)} --> {format_timestamp(end_sec)}\n{text}\n\n")
            
    print(f"Generated {len(cues)} subtitle cues -> {out_path}")
    print(f"Total video duration: {current_frame / FPS:.2f}s ({current_frame} frames)")

if __name__ == "__main__":
    main()
