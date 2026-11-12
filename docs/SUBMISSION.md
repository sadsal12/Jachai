# Jachai: AI Builders Congress 2026 submission

Ready-to-paste text for each form field. Items marked **TODO** need a fact or link that only the team can supply or confirm.

- **Domain:** CivicSphere AI
- **Challenge:** Citizen First (unified, multilingual citizen-service assistant)

---

## Project Name
Jachai (যাচাই)

## Elevator Pitch
Jachai is a Bangla-and-English Android app that tells anyone, especially older family members, whether a forwarded message, photo or video looks fake, AI-made or like a known hoax, right from the share menu, in seconds.

## Public Summary
Rumours spread through WhatsApp and Facebook faster than anyone can check them. Older people, who receive the most forwards, are the least able to verify them.

Jachai fixes the moment of sharing. Share a post to Jachai, paste a message, or tap a floating bubble over any app. In seconds you get a full-screen red or green answer, written in plain Bangla and English. It says how sure it is and what to do next.

Behind it:
- OCR reads Bangla and English text.
- A matcher compares claims with a curated library of known hoaxes.
- A vision model flags AI-generated images.

Jachai needs no account and keeps no uploads.

## Problem Statement
False rumours on messaging apps have caused real harm in Bangladesh. In 2019, rumours that the Padma Bridge needed human heads led to mob attacks on innocent people (**TODO: add a news source link before submitting**). Generative AI now makes convincing fake photos, voices and videos cheap and fast.

The people most exposed are parents and grandparents, who are new to smartphones, read best in Bangla and receive the most forwarded content. Existing fact-checks help, but only if someone leaves the chat, finds the right website and reads English or long articles. That rarely happens at the moment that matters: just before someone taps *Forward*.

## Solution Description
Jachai brings verification to where rumours spread.

- **Share menu:** in WhatsApp, Facebook or the gallery, tap *Share → Check with Jachai*. Text, photos, videos and screenshots are all accepted.
- **Check a Text:** a large text box with one-tap Paste and a big **Check** button.
- **Photos and videos:** pick from the gallery.
- **Floating bubble:** for posts that can't be shared, turn on the bubble. While you scroll any app, tap it to check what's on screen.
- **Verdicts made to be understood:**
  - a full-screen red or green result;
  - certainty in words ("Very sure", "Not fully sure") as well as a percentage;
  - a "What to do" line ("Don't forward this");
  - an explanation in Bangla and English;
  - a double vibration on fakes.
  - When the system can't decide, it says so in neutral grey; it doesn't guess.
- **Designed for older users:**
  - large text by default, with Small/Medium/Large settings;
  - 56 dp+ touch targets;
  - high contrast, light and dark mode;
  - Bangla or English interface.
- **Private by design:**
  - no account;
  - uploaded files are deleted after the check;
  - activity stats are counted only on the phone.

**Architecture:** a native Android app (Java) talks to a FastAPI backend in one Docker container.
1. Each check becomes a job with a hard time limit.
2. Text goes to a fuzzy hoax matcher.
3. Images first go through OCR. Text-heavy screenshots are treated as claims; photos go to the AI-image classifier.
4. Videos are sampled into frames with face crops.
5. If a model is slow or fails, a heuristic fallback still returns an honest, cautious answer.

**How Jachai meets Citizen First** ("RAG over policy + secure identity + agents"):

| Challenge asks for | What Jachai does today |
|---|---|
| Unified, multilingual citizen-service assistant | One assistant for every citizen, in Bangla and English, built for older users first (large text, plain verdicts) |
| Retrieval-grounded answers (RAG) | Each claim is matched against a curated library of known hoaxes; the verdict explains which hoax it matched and the fact behind it. No LLM generates the answer. |
| Secure identity, data protection | Privacy by design, with no identity needed: no account, uploads deleted after the check, history kept only on the phone |
| Agents | A multi-step check pipeline (understand → read → retrieve → score → explain) with an honest fallback, plus a floating bubble that runs checks inside any app |
| Service access and satisfaction | Works from the share menu, in the app, or over any app; answers in seconds; says when it isn't sure |

**Business model (Bangladesh launch pricing, to be validated):**
- **Free:** up to 5 checks a day, for everyone.
- **Family:** unlimited checks, ৳149/month or ৳1,200/year, up to 4 phones. The buyer is the adult child, in Bangladesh or abroad; the people protected are parents and grandparents.
- **Guardian:** ৳250/month. Everything in Family, plus planned alerts to the family when a parent receives a fake.
- **Billing:** bKash, Nagad and carrier billing. **Next:** bundles with telecom operators and mobile wallets.
- **Price anchors:**

  | Product | Price |
  |---|---|
  | Toffee VIP | ৳126 / 30 days |
  | Chorki | ~৳499 / year |
  | Hoichoi | ৳599 / year |
  | Kaspersky Internet Security, 3 devices | ~৳1,350–1,400 / year |

  No published survey measures what Bangladeshi families will pay to protect their parents. **TODO:** a willingness-to-pay survey of about 100 target buyers before launch.

**Scalability:** one stateless-API container (`backend/Dockerfile`) that runs on any cloud. The hoax library is plain JSON, designed to be extended by fact-checkers in Bangladesh and abroad.

**Devices:** the Android app runs on Android 7.0 and up, including older budget phones. The iOS version is in development.

## Data & AI Provenance

| Component | Source | Licence / status |
|---|---|---|
| AI-image classifier | Hugging Face `Ateeqq/ai-vs-human-image-detector`, run locally on CPU (no external API calls) | **TODO: confirm licence on the model page** |
| OCR | Tesseract OCR with `ben` + `eng` language data | Apache 2.0 |
| Hoax library | 45 bilingual entries in `backend/data/hoaxes.json`, compiled by the team from publicly reported rumours | Team-created. **TODO: verify each `fact_en`/`fact_bn` against Rumor Scanner / Dismislab / AFP Fact Check and add source links** |
| Calibration samples | A handful of public real and AI-generated images in `samples/`, used only to choose the model and threshold | Public web images; not redistributed in the app |
| Heuristic fallback | Hand-written image statistics (`backend/app/heuristics.py`); no training data | Team code |

**Foundation models called:** none at runtime. The backend makes no calls to hosted LLM APIs; all inference runs inside the container.

**Personal data:**
- No accounts, names or phone numbers are collected.
- Uploaded media are written to a temporary file, analysed, and deleted about 30 seconds after the job finishes.
- Job results live only in server memory and expire after 15 minutes.
- On the phone, the last five checks and the counters are stored in app-private storage, never sent anywhere.
- The bubble captures the screen only when the user taps it, after Android's screen-capture consent.

## Tooling & IDE
- **Claude Code** (Anthropic Claude Opus) for pair-programming the Android redesign, the backend, the design kit and this video.
- **Android Studio** (bundled JBR) with Gradle and the Android Emulator.
- **Python 3.12, FastAPI, Uvicorn, PyTorch/Transformers, OpenCV, Tesseract**, run in **Docker Desktop**.
- **Railway** for hosting (Render blueprint included in `render.yaml`) and a **Cloudflare quick tunnel** for testing.
- **Video:** Remotion (React) for motion graphics, `edge-tts` (Microsoft neural voice, AI-generated) for the voice-over, FFmpeg for audio and video processing, and Android's screen recorder and scrcpy for screen capture. The floating-bubble shot was recorded with a demo build that checks a fixed rehearsed post; this is labelled on screen.
- **Design:** the logo-design skill for Claude Code (SVG icon kit in `design/`).

## Memory / context files disclosure
- No `CLAUDE.md` or project memory files are committed to this repository.
- The assistant worked from the repository itself, `jachai_v2_redesign_spec.md`, and the sketches in `v2_paper_lofi/`.
- **TODO:** if your Claude Code setup has user-level memory, mention it here.

## MCP usage disclosure
- **Claude in Chrome** (browser extension MCP) was used to read this event's public rules and FAQ while planning the video.
- No MCP servers are used by the product at runtime.

## Prompt Library
Key prompts from the build, lightly edited:
1. "Redesign the frontend of this app only, without touching the backend, so it's polished and usable for older people and still appealing to younger people. Follow `jachai_v2_redesign_spec.md` and the sketches in `v2_paper_lofi`."
2. "Floating bottom nav with four tabs (Text, Media, Bubble, Profile). Inactive tabs show only icons; the active tab expands into an accent pill with icon and name."
3. "Show a light in Settings that tells you whether the backend is connected."
4. "Bubble steps: turn it on → use your phone normally → when a post feels suspicious, tap the bubble."
5. "Build an app UI asset kit (app icon, promo banner, header background) with shared CSS colour variables; explore three themes first."
6. "Make a big-company-style product demo video for the AI Builders Congress submission: problem → solution → live demo → team → call to action."

## Demo / Live Links
- **GitHub repository:** https://github.com/sadsal12/Jachai (**TODO: make public**)
- **Android APK:** **TODO: attach `app-release.apk` to a GitHub Release and paste the download link**
- **Live API health check:** **TODO: redeploy the backend (the Railway URL `jachai-api-production.up.railway.app` currently returns "Application not found") and paste `<url>/health`**
- **YouTube demo:** **TODO: paste the unlisted or public link after upload**

## YouTube upload text
- **Title:** Jachai: Check it before you forward it | AI Builders Congress 2026
- **Visibility:** Unlisted (or Public). Not Private.
- **Video file:** `video/out/jachai-launch-v2.mp4` (Citizen First cut, under 3:00).
- **Captions:** upload `video/out/jachai-launch-v2.en.srt`.
- **Description:**

> Jachai (যাচাই, "verify") is a Bangla-and-English Android app that checks forwarded messages, photos and videos for known hoaxes and AI-generated content, right from the share menu or a floating bubble.
>
> Built for the International AI Builders Congress 2026, CivicSphere AI, Citizen First challenge.
>
> Chapters:
> 0:00 The forward
> 0:12 The problem
> 0:30 Meet Jachai
> 0:38 Live demo: WhatsApp share
> 0:57 Check a Text
> 1:10 Photos and videos
> 1:22 Floating bubble
> 1:35 Made for everyone
> 1:46 How it works
> 2:05 Built for Citizen First
> 2:21 Business model
> 2:42 Team Jachai
>
> Code: https://github.com/sadsal12/Jachai

---

## Team Jachai (6 Members)
- **Rumman** (ROOM-mann) — Product Lead & AI Architect (`rumman@jachai.app`)
- **Saleh** (SAH-leh) — Full-Stack & Systems Engineer (`saleh@jachai.app`)
- **Anika** (Aneeka) — ML & Verification Specialist (`anika@jachai.app`)
- **Sami** (SAH-mee) — UI/UX & Product Design Lead (`sami.design@jachai.app`, `sami2.jpg`)
- **Mirazul** (MEE-ra-zool) — Mobile Android Engineer (`mirazul@jachai.app`)
- **Sami** (SAH-mee) — Strategy & Pitch Development (`sami.strategy@jachai.app`, `sami.jpg`)
