"""Writes out/jachai-launch.en.srt for YouTube from script.json + src/durations.json.

Scene leads/tails/minimums mirror src/timeline.ts; sentence timings are spread by length inside each voice clip.
"""
import json
import math
import re
import sys

FPS = 30
# Scene leads/tails/minimums come from the same specs-*.json files the video uses.
V2 = "--v2" in sys.argv
SCRIPT, DURATIONS, SPECS, OUT = (
    ("script-v2.json", "src/durations-v2.json", "src/specs-v2.json", "out/jachai-launch-v2.en.srt") if V2 else
    ("script.json", "src/durations.json", "src/specs-v1.json", "out/jachai-launch.en.srt"))
OUT = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--out=")), OUT)
SPEC = {x["id"]: (x["lead"], x["tail"], x.get("min", 0)) for x in json.load(open(SPECS))}


def ts(sec):
    ms = int(round(sec * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


scenes = {s["id"]: s for s in json.load(open(SCRIPT, encoding="utf-8"))["scenes"]}
script = {k: v["text"] for k, v in scenes.items()}
chunk_starts = json.load(open("src/chunks.json"))
durations = json.load(open(DURATIONS))
cues, at = [], 0
for sid, (lead, tail, minimum) in SPEC.items():
    vo = durations[sid]
    start = (at + lead) / FPS
    if sid in chunk_starts:  # each piece starts where tts.py placed it and runs until the next piece
        bounds = chunk_starts[sid] + [vo]
        pieces = [(c["text"], a, b) for c, a, b in zip(scenes[sid]["chunks"], bounds, bounds[1:])]
    else:
        pieces = [(script[sid], 0.0, vo)]
    for text, a, b in pieces:
        sentences = [x for x in re.split(r"(?<=[.?!:])\s+", text) if x]
        total = sum(len(x) for x in sentences)
        t = start + a
        for x in sentences:
            d = (b - a) * len(x) / total
            cues.append((t, t + d, x))
            t += d
    at += max(minimum, lead + math.ceil(vo * FPS) + tail)

with open(OUT, "w", encoding="utf-8") as f:
    for i, (a, b, text) in enumerate(cues, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{text}\n\n")
print(len(cues), "cues, video length", round(at / FPS, 1), "s")
