"""
Generates voiceovers for Gemini's clean, minimalist presentation of Jachai.
Uses en-US-BrianMultilingualNeural with crisp, modern pacing (+8% rate).
Ensures total video length is strictly under the 3-minute hackathon limit.
"""
import asyncio
import json
import os
import subprocess
import sys
import edge_tts

VOICE = "en-US-BrianMultilingualNeural"
RATE = "+8%"

# Spoken respellings for exact phonetic pronunciations:
SAY = {
    "Jachai": "JAH-chai",
    "Rumman": "ROOM-mahn",
    "Anika": "AH-nee-kah",
    "Saleh": "SAH-leh",
    "Mirazul": "MEE-rah-zool",
    "Sami": "SAH-mee",
    "Bangla": "BAHNG-lah",
}

SCENES = [
    {
        "id": "s01-crisis",
        "text": "Every viral rumour begins with an urgent forward: share before anyone has time to think. In family chats across WhatsApp and Facebook, unverified claims travel faster than the truth."
    },
    {
        "id": "s02-stakes",
        "text": "In Bangladesh, this is not just harmless noise. In twenty nineteen, false rumours about Padma Bridge provoked real panic and tragic mob violence. Today, generative AI produces synthetic images, altered voices, and deepfakes in seconds. And the most exposed are our parents and grandparents, who read best in Bangla and rarely have the tools to fact-check what they receive."
    },
    {
        "id": "s03-intro",
        "text": "Traditional fact-checking demands leaving the app, searching websites, and reading long English articles. That never happens when it matters. Meet Jachai: instant, citizen-first verification built directly into Android, designed to stop misinformation at the exact moment of sharing."
    },
    {
        "id": "s04-share-demo",
        "text": "Here is a real forwarded message in WhatsApp. Tap Share, select Jachai, and within seconds, a full-screen answer appears. Known hoax. Very sure. Plain Bangla and English guidance, and an unmistakable double buzz so no one forwards it by mistake."
    },
    {
        "id": "s05-text-check",
        "text": "Inside the app, you can check any text directly. Paste the claim, tap Check, and Jachai matches it against a curated library of verified hoaxes. When it is uncertain, Jachai says so honestly. It never guesses."
    },
    {
        "id": "s06-vision-check",
        "text": "For photos and videos, pick them from your gallery. Jachai extracts on-screen text with dual-language OCR, while an on-device computer vision model inspects visual patterns for generative AI artifacts, with zero cloud API costs."
    },
    {
        "id": "s07-bubble-demo",
        "text": "For feeds where sharing is locked, turn on Jachai's floating bubble. Use your phone as usual. If a post feels suspicious, tap the bubble. Jachai inspects the screen and gives you an instant verdict right where you are."
    },
    {
        "id": "s08-privacy",
        "text": "Crucially, Jachai is private by design. There are no user accounts, no logins, and zero user data is ever stored. Uploads are analyzed in memory and immediately deleted. All inference runs inside a single lightweight container."
    },
    {
        "id": "s09-business",
        "text": "The core verification tool is completely free for every citizen. To keep the project sustainable, an optional family plan at roughly fifty taka a month covers elderly relatives through direct mobile and bKash billing."
    },
    {
        "id": "s10-team-cta",
        "text": "We are team Jachai: Rumman, Saleh, Anika, Sami, Mirazul and Sami. Try it today. And next time, check it, before you forward it."
    }
]

def spoken(text):
    for word, say in SAY.items():
        text = text.replace(word, say)
    return text

def get_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True
    ).stdout.strip()
    return float(out)

async def generate_scene(sc, out_dir):
    out_path = os.path.join(out_dir, f"{sc['id']}.mp3")
    spoken_text = spoken(sc["text"])
    words = []
    
    communicate = edge_tts.Communicate(spoken_text, VOICE, rate=RATE, boundary="WordBoundary")
    with open(out_path, "wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                words.append({
                    "word": chunk["text"].strip(".,:!?\"'"),
                    "start": chunk["offset"] / 1e7,
                    "duration": chunk["duration"] / 1e7
                })
    
    dur = get_duration(out_path)
    return dur, words

async def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_dir = os.path.join(base_dir, "public", "vo")
    os.makedirs(out_dir, exist_ok=True)
    
    manifest = {}
    print(f"Generating voice lines with voice={VOICE}, rate={RATE}...")
    for sc in SCENES:
        dur, words = await generate_scene(sc, out_dir)
        manifest[sc["id"]] = {
            "duration": dur,
            "text": sc["text"],
            "words": words
        }
        print(f"  {sc['id']}: {dur:.2f}s ({len(words)} words)")
    
    manifest_path = os.path.join(base_dir, "src", "vo_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    
    total_vo = sum(m["duration"] for m in manifest.values())
    print(f"Done! Total VO duration: {total_vo:.2f}s (~{total_vo/60:.2f} min). Saved to {manifest_path}")

if __name__ == "__main__":
    asyncio.run(main())
