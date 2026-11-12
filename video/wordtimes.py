"""Prints when each word is spoken in one scene's voice clip (edge-tts word boundaries), for syncing footage."""
import asyncio, json, sys
import edge_tts
from tts import spoken

async def main(sid):
    s = json.load(open("script.json", encoding="utf-8"))
    sc = next(x for x in s["scenes"] if x["id"] == sid)
    c = edge_tts.Communicate(spoken(sc["text"]), s["voice"], rate=s["rate"], boundary="WordBoundary")
    async for ch in c.stream():
        if ch["type"] == "WordBoundary":
            print(f'{ch["offset"] / 1e7:6.2f}s  {ch["text"]}')

asyncio.run(main(sys.argv[1]))
