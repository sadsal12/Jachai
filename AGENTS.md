# Jachai - Multi-Agent System Specification (AGENTS.md)

This document defines the agent roles, tools, permissions, context boundaries, and verification gates used in building and operating the Jachai platform.

## Agent System Overview

Jachai employs a coordinated multi-agent and agentic pair-programming architecture across the AI Development Lifecycle (AI-DLC):

```
                     ┌───────────────────────────┐
                     │ Human Architect / Reviewer│
                     └─────────────┬─────────────┘
                                   │ Approves Plans / PRDs
                     ┌─────────────▼─────────────┐
                     │   Orchestrator Agent      │
                     │  (Claude Code / AGY CLI)  │
                     └──────┬──────┬──────┬──────┘
                            │      │      │
          ┌─────────────────┘      │      └─────────────────┐
          │                        │                        │
┌─────────▼─────────┐    ┌─────────▼─────────┐    ┌─────────▼─────────┐
│ Android UI Agent  │    │ Backend / MCP     │    │ Remotion Video    │
│ (Java/XML Native) │    │ Inference Agent   │    │ Automation Agent  │
└───────────────────┘    └───────────────────┘    └───────────────────┘
```

---

## 1. Agent Personas & Responsibilities

### Orchestrator Agent (`orchestrator`)
- **Model / Host:** Claude Code (Claude 3.7 Sonnet / Opus) & Google Antigravity CLI.
- **Role:** High-level planning, requirement sharding, task scheduling, and cross-system verification.
- **Constraints:** Never commits untested code; must create atomic plan artifacts (`PLAN.md`) and seek human approval before multi-file modifications.

### Backend & MCP Engine Agent (`backend-dev`)
- **Stack:** Python 3.12, FastAPI, PyTorch, Hugging Face Transformers, Tesseract OCR, Model Context Protocol (`mcp>=2.0.0`).
- **Role:** Implements inference endpoints, hybrid retrieval matching, OCR preprocessing, and MCP server primitives.
- **Verification Gate:** Must maintain 100% pass rate across unit tests (`backend/tests/`).

### Android Frontend Agent (`android-dev`)
- **Stack:** Java 17, Android SDK 34, Material Components, Retrofit 2, OkHttp.
- **Role:** Implements native accessible UI matching paper sketches (`v2_paper_lofi/`) and `jachai_v2_redesign_spec.md`.
- **Constraints:** High-contrast color palette, accessibility overrides (dynamic font sizing, large touch targets), floating bubble overlay lifecycle.

### Video & Creative Automation Agent (`creative-dev`)
- **Stack:** Remotion 4.x (React, TypeScript), FFmpeg, edge-tts, TailwindCSS.
- **Role:** Generates programmatic 16:9 and 9:16 product launch videos, synchronizing phonetic neural voiceovers, captions, and real device screen recordings.

---

## 2. Shared Context & Memory Bank

All agents adhere to the persistent memory bank and project artifacts:
- `jachai_v2_redesign_spec.md`: Source-of-truth PRD and design contract.
- `docs/AI_USAGE.md`: Living record of AI architecture, token optimization, and protocol usage.
- `v2_paper_lofi/`: Physical hand-drawn low-fidelity reference sketches.
- `backend/data/hoaxes.json`: Grounded bilingual rumor database (45 curated entries).

---

## 3. Review Gates & Quality Assurance

1. **Spec & Sketch Gate:** Features must map to a section in `jachai_v2_redesign_spec.md` or physical sketches.
2. **Deterministic Verification Gate:** AI image detection, OCR, and hoax matching are verified against ground-truth sample sets (`samples/real`, `samples/fake`).
3. **Phonetic Evaluation Gate:** Neural TTS voice generation must follow strict cultural phonetic constraints (e.g. "JAH-chai", "ROOM-mann", "Aneeka").
4. **Zero-Hallucination Gate:** Public-facing verdicts must be retrieved from verified facts or classified with calibrated confidence scores, never hallucinated.
