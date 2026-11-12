"""Generates one voice-over clip per scene from script.json (edge-tts), plus durations.json for the edit.

A scene with "chunks" is voiced piece by piece: each chunk is placed so that its "word" is spoken exactly at "clip"
seconds of the scene's screen recording (which starts playing at "clipStart" when the voice starts). The pieces are
mixed into one file, and their start times go to src/chunks.json for the captions.
"""
import asyncio, json, os, shutil, subprocess, sys
import edge_tts

# Spoken respellings only; captions keep the real spelling from script.json.
SAY = {"Jachai": "Jah-chai", "Rumman": "Room-mahn", "Anika": "Ahneeka", "Saleh": "Sah-leh",
       "Mirazul": "Mee-raa-zool", "Sami": "Sah-mee", "Nibir": "Nee-beer"}


def spoken(text):
    for word, say in SAY.items():
        text = text.replace(word, say)
    return text


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True).stdout.strip()
    return float(out)


async def say(text, voice, rate, out):
    """Saves the audio and returns {word: first offset in seconds}."""
    words = {}
    with open(out, "wb") as f:
        async for ch in edge_tts.Communicate(spoken(text), voice, rate=rate, boundary="WordBoundary").stream():
            if ch["type"] == "audio":
                f.write(ch["data"])
            elif ch["type"] == "WordBoundary":
                words.setdefault(ch["text"].strip(".,:!?"), ch["offset"] / 1e7)
    return words


async def chunked(sc, voice, rate, out):
    starts, inputs, filters = [], [], []
    for i, c in enumerate(sc["chunks"]):
        part = f"public/vo/{sc['id']}-{i + 1}.mp3"
        words = await say(c["text"], voice, rate, part)
        at = max(0.0, (c["clip"] - sc["clipStart"]) - words[c["word"]])
        if starts and at < starts[-1][1]:
            print(f"warning: chunk {i + 1} overlaps the previous one by {starts[-1][1] - at:.2f}s")
        starts.append((round(at, 3), round(at + duration(part), 3)))
        inputs += ["-i", part]
        filters.append(f"[{i}]adelay={int(at * 1000)}:all=1[a{i}]")
    mix = "".join(f"[a{i}]" for i in range(len(starts)))
    filters.append(f"{mix}amix=inputs={len(starts)}:normalize=0[out]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", ";".join(filters), "-map", "[out]", out],
                   check=True)
    return [s for s, _ in starts]


VERSIONS = {  # --v2 selects the Citizen First cut; the default is the original v1 files
    "v1": ("script.json", "public/vo", "src/durations.json"),
    "v2": ("script-v2.json", "public/vo-v2", "src/durations-v2.json"),
}


async def main():
    args = sys.argv[1:]
    version = "v2" if "--v2" in args else "v1"
    script, vo_dir, durations_file = VERSIONS[version]
    only = {a for a in args if not a.startswith("--")}
    s = json.load(open(script, encoding="utf-8"))
    os.makedirs(vo_dir, exist_ok=True)
    durations = {}
    chunk_starts = json.load(open("src/chunks.json")) if os.path.exists("src/chunks.json") else {}
    for sc in s["scenes"]:
        out = f"{vo_dir}/{sc['id']}.mp3"
        if not only or sc["id"] in only:
            if "reuse" in sc:  # an approved take from another version, copied byte for byte
                shutil.copyfile(sc["reuse"], out)
            elif "chunks" in sc:
                chunk_starts[sc["id"]] = await chunked(sc, s["voice"], s["rate"], out)
            else:
                await say(sc["text"], s["voice"], s["rate"], out)
        durations[sc["id"]] = round(duration(out), 2)
    json.dump(durations, open(durations_file, "w"), indent=1)
    json.dump(chunk_starts, open("src/chunks.json", "w"), indent=1)
    print(durations, "total", round(sum(durations.values()), 1))
    print("chunk starts:", chunk_starts)


if __name__ == "__main__":
    asyncio.run(main())
