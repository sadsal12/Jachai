"""
Generates voiceover for the 9:16 Instagram Story (Max 60 seconds).
Exact phonetic pronunciations:
- Jachai: JAH-chai
- Rumman: ROOM-mann
- Anika: Aneeka
- Saleh: SAH-leh
- Mirazul: MEE-ra-zool
- Sami: SAH-mee
"""
import asyncio
import json
import os
import subprocess
import edge_tts

VOICE = "en-US-BrianMultilingualNeural"
RATE = "+10%"

SCRIPT = [
    {
        "id": "st01-hook",
        "text": "Someone forwards a shocking rumour to your family WhatsApp group.",
        "spoken": "Someone forwards a shocking rumour to your family WhatsApp group."
    },
    {
        "id": "st02-problem",
        "text": "Before anyone panics or hits forward, how do you know if it's real or an AI fake?",
        "spoken": "Before anyone panics or hits forward, how do you know if it's real or an AI fake?"
    },
    {
        "id": "st03-demo-share",
        "text": "Don't guess. Just tap Share, choose Jachai, and in three seconds, boom. Full-screen answer. Known hoax. Very sure.",
        "spoken": "Don't guess. Just tap Share, choose Jah-chai, and in three seconds, boom. Full-screen answer. Known hoax. Very sure."
    },
    {
        "id": "st04-demo-bubble",
        "text": "Scrolling Facebook or TikTok? Tap the floating bubble to check what's on your screen with zero app switching.",
        "spoken": "Scrolling Facebook or TikTok? Tap the floating bubble to check what's on your screen with zero app switching."
    },
    {
        "id": "st05-team-cta",
        "text": "Built for Bangladesh by team Jachai: Rumman, Saleh, Anika, Sami, Mirazul and Sami. Next time, check it before you forward it.",
        "spoken": "Built for Bangladesh by team Jah-chai: ROOM-mahn, SAH-leh, Aneeka, SAH-mee, MEE-ra-zool and SAH-mee. Next time, check it before you forward it."
    }
]

def get_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True
    ).stdout.strip()
    return float(out)

async def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(base_dir, "public", "story_vo")
    os.makedirs(out_dir, exist_ok=True)
    
    manifest = {}
    total = 0.0
    for s in SCRIPT:
        out_path = os.path.join(out_dir, f"{s['id']}.mp3")
        comm = edge_tts.Communicate(s["spoken"], VOICE, rate=RATE, boundary="WordBoundary")
        words = []
        with open(out_path, "wb") as f:
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    words.append({
                        "word": chunk["text"].strip(".,:!?\"'"),
                        "start": chunk["offset"] / 1e7,
                        "duration": chunk["duration"] / 1e7
                    })
        dur = get_duration(out_path)
        manifest[s["id"]] = {
            "duration": dur,
            "text": s["text"],
            "spoken": s["spoken"],
            "words": words
        }
        total += dur
        print(f"Generated {s['id']}: {dur:.2f}s ({len(words)} words)")
        
    manifest_path = os.path.join(base_dir, "src", "story_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        
    print(f"\nAll story voice lines generated! Total VO: {total:.2f}s (Story will run ~{total + 5:.1f}s, well under 60s max!)")

if __name__ == "__main__":
    asyncio.run(main())
