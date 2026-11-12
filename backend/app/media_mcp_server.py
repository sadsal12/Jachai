"""Jachai Media Inspector Model Context Protocol (MCP) Server.

Exposes Jachai's multimodal vision detection pipeline, Tesseract OCR extraction,
and video face-sampling forensics as standard MCP tools, resources, and prompt templates.

Usable by any MCP-compliant client: Claude Desktop, Cursor, Claude Code,
Antigravity IDE, or automated content moderation agents.

Usage:
    # Stdio transport (default for desktop/CLI agents):
    python backend/app/media_mcp_server.py

    # SSE transport:
    python backend/app/media_mcp_server.py --transport sse --port 8002
"""
import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from mcp.server.mcpserver import MCPServer
from app import classifier, config, media_pipeline, ocr, text_check

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stderr,
)
log = logging.getLogger("jachai_media_mcp")

server = MCPServer(
    name="jachai-media-inspector-mcp",
    version="1.0.0",
    instructions=(
        "Jachai Media Inspector provides multimodal AI-generation detection and "
        "bilingual (Bangla + English) OCR extraction for images, videos, and screenshot claims."
    ),
)


# ==============================================================================
# MCP Tools
# ==============================================================================

@server.tool(
    name="jachai_detect_ai_image",
    description=(
        "Analyze an image file path for signs of generative AI manipulation, synthetic generation, "
        "or deepfake artifacts. Returns fake probability, engine used ('model' or 'heuristic'), "
        "and extracted text if screenshot contains claims."
    ),
)
def jachai_detect_ai_image(image_path: str) -> str:
    """Analyze image file for AI generation / manipulation."""
    path = Path(image_path)
    if not path.exists():
        return json.dumps({"error": f"Image file not found: {image_path}"}, ensure_ascii=False)

    try:
        img = media_pipeline.load_image(str(path))
        # Check OCR first
        raw_text = ocr.extract_text(img)
        cleaned = text_check.clean_ocr_text(raw_text)
        is_screenshot = text_check.is_text_heavy(cleaned)

        if is_screenshot:
            claim_verdict = text_check.check_claim(cleaned, extracted=True)
            return json.dumps({
                "type": "screenshot_claim",
                "extracted_text": cleaned,
                "claim_verification": claim_verdict,
            }, indent=2, ensure_ascii=False)

        # Photo scoring
        probs, engine = media_pipeline._score([img])
        fake_prob = float(probs[0])
        is_fake = fake_prob >= config.FAKE_THRESHOLD

        return json.dumps({
            "type": "photo",
            "fake_probability": round(fake_prob, 3),
            "verdict": "red" if is_fake else "green",
            "label": "AI_GENERATED" if is_fake else "LIKELY_AUTHENTIC",
            "engine": engine,
            "threshold": config.FAKE_THRESHOLD,
        }, indent=2, ensure_ascii=False)
    except Exception as exc:
        log.exception("Error processing image in MCP")
        return json.dumps({"error": str(exc)}, ensure_ascii=False)


@server.tool(
    name="jachai_ocr_extract",
    description="Extract Bangla and English text from an image using Tesseract 5 LSTM OCR.",
)
def jachai_ocr_extract(image_path: str) -> str:
    """Run bilingual OCR on an image and return cleaned text."""
    path = Path(image_path)
    if not path.exists():
        return json.dumps({"error": f"File not found: {image_path}"}, ensure_ascii=False)

    try:
        img = media_pipeline.load_image(str(path))
        raw = ocr.extract_text(img)
        cleaned = text_check.clean_ocr_text(raw)
        return json.dumps({
            "raw_text": raw,
            "cleaned_text": cleaned,
            "is_text_heavy": text_check.is_text_heavy(cleaned),
        }, indent=2, ensure_ascii=False)
    except Exception as exc:
        return json.dumps({"error": str(exc)}, ensure_ascii=False)


@server.tool(
    name="jachai_media_health",
    description="Inspect multimodal vision model status, hardware acceleration, and Tesseract availability.",
)
def jachai_media_health() -> str:
    """Return health metrics for the media analysis subsystem."""
    has_model = classifier.is_loaded()
    return json.dumps({
        "ml_enabled": config.ENABLE_ML,
        "model_id": config.MODEL_ID,
        "model_loaded": has_model,
        "fake_threshold": config.FAKE_THRESHOLD,
        "video_frames_sampled": config.VIDEO_FRAMES,
        "ocr_languages": config.OCR_LANGS,
        "face_cascade_available": media_pipeline._face_cascade is not None,
    }, indent=2)


# ==============================================================================
# MCP Resources & Prompts
# ==============================================================================

@server.resource(
    uri="jachai://media/supported-formats",
    name="Supported Media Formats",
    description="List of supported image and video extensions and MIME types.",
    mime_type="application/json",
)
def supported_formats() -> str:
    return json.dumps({
        "image_extensions": sorted(list(media_pipeline.IMAGE_EXTS)),
        "video_extensions": sorted(list(media_pipeline.VIDEO_EXTS)),
        "max_upload_mb": config.MAX_UPLOAD_MB,
    }, indent=2)


@server.prompt(
    name="forensic_image_analysis",
    description="Template guiding an AI model to evaluate an image for deepfake or synthetic hallmarks.",
)
def forensic_prompt(image_path: str) -> str:
    return (
        f"Please analyze the image located at '{image_path}':\n"
        f"1. Call `jachai_detect_ai_image` to check the automated fake probability score.\n"
        f"2. Call `jachai_ocr_extract` if text or captions appear on the image.\n"
        f"3. Examine typical synthetic artifacts (skin smoothing, iris symmetry, background inconsistencies).\n"
        f"4. Provide a grounded summary with clear next steps."
    )


# ==============================================================================
# Entrypoint
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(description="Jachai Media Inspector MCP Server")
    parser.add_argument("--transport", choices=["stdio", "sse"], default="stdio")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8002)
    args = parser.parse_args()

    if args.transport == "stdio":
        asyncio.run(server.run_stdio_async())
    elif args.transport == "sse":
        asyncio.run(server.run_sse_async(host=args.host, port=args.port))


if __name__ == "__main__":
    main()
