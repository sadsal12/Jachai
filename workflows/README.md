# Jachai Workflow Automation & Orchestration

This directory contains automated workflow definitions wired into Jachai's AI verification stack:

## 1. n8n Self-Hosted Workflow (`n8n_jachai_factcheck_ingest.json`)
An automated newsroom and community fact-checking ingestion pipeline designed for self-hosted [n8n](https://n8n.io):

- **Triggers:**
  - **Cron Schedule (Hourly):** Automatically polls Bangladeshi fact-checking portals (e.g., Rumor Scanner Bangladesh RSS feed, Boom Bangladesh, Dismislab).
  - **Community Webhook (`/webhook/jachai-rumor-tip`):** Ingests incoming community-reported rumors and viral forwarded claims directly from WhatsApp and Telegram bots.
- **AI Processing (Claude / LangChain Node):**
  - Extracts core claims, viral aliases in Bengali (বাংলা) and English.
  - Generates structured JSON with debunking facts and risk categorization (`politics`, `communal`, `health`, `financial`).
- **Jachai Integration (MCP / REST API Node):**
  - Queries Jachai's verification engine (`POST /verify/text` or `jachai-verification-mcp` via `jachai_search_hoaxes`).
- **Conditional Routing:**
  - If match confidence $\ge 0.58$ (known hoax): Sends telemetry log and verification summary to Telegram/Slack.
  - If match confidence $< 0.58$ (new unindexed hoax): Formats alert for human fact-checkers and prepares entry for instant addition to `backend/data/hoaxes.json`.

### How to Import into n8n:
1. Open your n8n dashboard (`http://localhost:5678`).
2. Click **Workflows** → **Import from File...**
3. Select `workflows/n8n_jachai_factcheck_ingest.json`.
4. Configure your Telegram Bot token / webhook URL and activate.

---

## 2. LangGraph Verification State Machine (`langgraph_verification_pipeline.py`)
A declarative verification DAG / state graph implementing Jachai's multi-step multimodal verification:

- **State Schema:** `JachaiVerificationState` (tracks modality, OCR text, query normalization, retrieval candidates, visual deepfake scores, decision gates, and bilingual explanations).
- **Graph Nodes:**
  1. `route_input`: Classifies modality (`text`, `image`, `video`).
  2. `extract_ocr`: Normalizes noisy screenshot text and strips UI chrome.
  3. `hybrid_retriever`: Executes dual-track lexical (BM25/RapidFuzz) and semantic dense embeddings over the hoax database.
  4. `visual_classifier`: Evaluates ViT artifact detection for AI-generated images and face crops.
  5. `calibrated_decision_gate`: Applies calibrated thresholds (`HOAX_THRESHOLD=0.58`, `FAKE_THRESHOLD=0.75`).
  6. `verdict_generator`: Generates zero-hallucination bilingual fact-checks in Bengali and English.
