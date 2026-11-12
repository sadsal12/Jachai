"""Pause lab for the team line: one mp3 per punctuation style, plus a combined file with spoken option numbers."""
import asyncio, json, subprocess
import edge_tts
from tts import spoken

s = json.load(open("script.json", encoding="utf-8"))
OUT = "out/pronunciation/pauses"
TAIL = " Try it today. And next time, check it, before you forward it."
OPTIONS = [
    "We are team Jachai: Rumman, Saleh, Anika, Sami, Mirazul and Sami.",          # current (reference)
    "We are team Jachai. Rumman. Saleh. Anika. Sami. Mirazul. And Sami.",
    "We are team Jachai: Rumman... Saleh... Anika... Sami... Mirazul... and Sami.",
    "We are team Jachai: Rumman; Saleh; Anika; Sami; Mirazul; and Sami.",
    "We are team Jachai: Rumman, ... Saleh, ... Anika, ... Sami, ... Mirazul, ... and Sami.",
]

async def main():
    files = []
    for i, line in enumerate(OPTIONS, 1):
        f = f"{OUT}/option-{i}.mp3"
        for attempt in range(3):  # the TTS service occasionally returns no audio; retry
            try:
                await edge_tts.Communicate(spoken(f"Option {i}. {line}{TAIL}"), s["voice"], rate=s["rate"]).save(f)
                break
            except edge_tts.exceptions.NoAudioReceived:
                print(f"option {i}: no audio (attempt {attempt + 1})")
        files.append(f.split("/")[-1])
    open(f"{OUT}/list.txt", "w").write("".join(f"file '{x}'\n" for x in files))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{OUT}/list.txt", "-c", "copy",
                    f"{OUT}/team-pauses-all-options.mp3"], check=True)

asyncio.run(main())
