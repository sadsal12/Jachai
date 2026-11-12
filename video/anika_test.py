"""Pronunciation lab: one mp3 per spelling of a name, plus one combined file with spoken option numbers."""
import asyncio, json, subprocess, sys
import edge_tts

s = json.load(open("script.json", encoding="utf-8"))
VOICE, RATE = s["voice"], s["rate"]
OUT = "out/pronunciation/anika"
SPELLINGS = ["Aa-nee-kaa", "Ah-nee-kah", "Aanika", "Ahneeka", "Ah nee kah", "Aah-nee-ka", "Anneeka", "Ani-kaa"]

async def main():
    parts = []
    for i, sp in enumerate(SPELLINGS, 1):
        f = f"{OUT}/option-{i}.mp3"
        await edge_tts.Communicate(f"Option {i}. {sp}. We are team Jachai: Rumman, Saleh, {sp}, Sami.".replace("Jachai", "Jah-chai"),
                                   VOICE, rate=RATE).save(f)
        parts.append(f)
    lst = f"{OUT}/list.txt"
    open(lst, "w").write("".join(f"file '{p.split('/')[-1]}'\n" for p in parts))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy",
                    f"{OUT}/anika-all-options.mp3"], check=True)
    for i, sp in enumerate(SPELLINGS, 1):
        print(f"option {i}: {sp}")

asyncio.run(main())
