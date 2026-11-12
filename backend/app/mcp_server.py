"""Jachai Model Context Protocol (MCP) Server.

Exposes Jachai's bilingual misinformation verification engine, hoax database,
and detection pipelines as standard MCP tools, resources, and prompt templates.

Usable by any MCP-compliant client: Claude Desktop, Cursor, Claude Code,
Antigravity IDE, or custom agent orchestrators.

Usage:
    # Stdio transport (default for Claude Desktop / CLI agents):
    python backend/app/mcp_server.py

    # With arguments:
    python backend/app/mcp_server.py --transport stdio
    python backend/app/mcp_server.py --transport sse --port 8001
"""
import argparse
import asyncio
import json
import logging
import sys
from pathlib import Path
from typing import Optional

# Ensure project root / backend is in sys.path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from mcp.server.mcpserver import MCPServer
from app import config, explain, hoax_matcher, text_check

# Set up logging to stderr (stdout is reserved for JSON-RPC in stdio transport)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stderr,
)
log = logging.getLogger("jachai_mcp")

# Initialize MCP Server instance
server = MCPServer(
    name="jachai-verification-mcp",
    version="1.0.0",
    instructions=(
        "Jachai is an instant citizen-first misinformation verification service for Bangladesh. "
        "Use these tools to verify claims, search known hoaxes in Bangla and English, "
        "and retrieve verified factual debunkings."
    ),
)


# ==============================================================================
# MCP Tools
# ==============================================================================

@server.tool(
    name="jachai_verify_claim",
    description=(
        "Verify a suspicious forwarded message, rumor, or social media claim against "
        "Jachai's curated bilingual (Bangla/English) hoax database. "
        "Returns verdict ('red'/'green'), confidence score (0.0-1.0), matched claim, "
        "and factual explanation."
    ),
)
def jachai_verify_claim(text: str) -> str:
    """Check a text claim for known hoaxes and return formatted JSON."""
    if not text or not text.strip():
        return json.dumps({"error": "Empty text query provided"}, ensure_ascii=False)
    
    result = text_check.check_claim(text.strip())
    return json.dumps(result, indent=2, ensure_ascii=False)


@server.tool(
    name="jachai_search_hoaxes",
    description=(
        "Search the curated hoaxes database using keyword matching, fuzzy search, "
        "or category filtering. Returns top matching hoax records."
    ),
)
def jachai_search_hoaxes(query: str, limit: int = 5) -> str:
    """Search hoax database for matching claims and aliases."""
    entries = hoax_matcher.entries()
    q_norm = query.lower().strip()
    
    matches = []
    for e in entries:
        score = 0.0
        # Check title / claims
        if q_norm in e.get("claim_en", "").lower() or q_norm in e.get("claim_bn", "").lower():
            score = 1.0
        else:
            for alias in e.get("aliases", []):
                if q_norm in alias.lower():
                    score = 0.9
                    break
        if score > 0:
            matches.append({"entry": e, "score": score})
            
    # If no verbatim match, run best_match
    if not matches and q_norm:
        m = hoax_matcher.best_match(query)
        if m:
            matches.append({"entry": m.entry, "score": m.score})
            
    matches.sort(key=lambda x: x["score"], reverse=True)
    results = [m["entry"] for m in matches[:limit]]
    return json.dumps({"count": len(results), "results": results}, indent=2, ensure_ascii=False)


@server.tool(
    name="jachai_get_hoax",
    description="Retrieve full details, facts, category, and aliases for a specific hoax ID.",
)
def jachai_get_hoax(hoax_id: str) -> str:
    """Fetch a single hoax entry by its unique identifier."""
    entry = hoax_matcher.entry_by_id(hoax_id)
    if not entry:
        return json.dumps({"error": f"Hoax with ID '{hoax_id}' not found."}, ensure_ascii=False)
    return json.dumps(entry, indent=2, ensure_ascii=False)


@server.tool(
    name="jachai_stats",
    description="Get real-time database stats, total claims indexed, and verification engine status.",
)
def jachai_stats() -> str:
    """Return Jachai system and database statistics."""
    status = hoax_matcher.status()
    status["hoax_threshold"] = config.HOAX_THRESHOLD
    status["fake_threshold"] = config.FAKE_THRESHOLD
    return json.dumps(status, indent=2, ensure_ascii=False)


# ==============================================================================
# MCP Resources
# ==============================================================================

@server.resource(
    uri="jachai://hoaxes/database",
    name="Jachai Hoax Knowledge Base",
    description="Complete curated database of 45 high-risk verified Bangla/English hoaxes and facts.",
    mime_type="application/json",
)
def get_hoax_database() -> str:
    """Provide the raw curated hoax database as a readable resource."""
    data = hoax_matcher.entries()
    return json.dumps(data, indent=2, ensure_ascii=False)


@server.resource(
    uri="jachai://config/thresholds",
    name="Jachai Model Calibration Thresholds",
    description="Empirically calibrated decision boundaries for hoaxes and AI synthetic media.",
    mime_type="application/json",
)
def get_thresholds() -> str:
    """Provide active calibration thresholds."""
    return json.dumps({
        "hoax_threshold": config.HOAX_THRESHOLD,
        "fake_threshold": config.FAKE_THRESHOLD,
        "mock_mode": config.MOCK_MODE,
        "embeddings_enabled": config.ENABLE_EMBEDDINGS,
    }, indent=2)


# ==============================================================================
# MCP Prompts
# ==============================================================================

@server.prompt(
    name="fact_check_claim",
    description="Template for evaluating a suspicious claim using Jachai tools.",
)
def fact_check_prompt(claim: str) -> str:
    return (
        f"The user has received the following forwarded message or claim:\n\n"
        f"\"{claim}\"\n\n"
        f"Please perform the following steps:\n"
        f"1. Call `jachai_verify_claim` with the claim text.\n"
        f"2. If a match is found (verdict: red), present the matched rumor and verified fact in both English and Bangla.\n"
        f"3. If no match is found, explain that no verified match exists in the database and advise caution before forwarding."
    )


@server.prompt(
    name="bilingual_family_explainer",
    description="Generate a compassionate, culturally accessible explanation for elderly family members.",
)
def bilingual_family_prompt(claim: str, fact: str) -> str:
    return (
        f"Write a gentle, respectful explanation in natural colloquial Bangla (and brief English) "
        f"suitable for sharing in a family WhatsApp group.\n\n"
        f"Rumor: \"{claim}\"\n"
        f"Fact: \"{fact}\"\n\n"
        f"Keep the tone respectful, avoid technical jargon, and clearly explain why the rumor is false."
    )


# ==============================================================================
# Server Entrypoint
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(description="Jachai MCP Verification Server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse", "streamable-http"],
        default="stdio",
        help="MCP transport protocol (default: stdio)",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host for SSE/HTTP transport")
    parser.add_argument("--port", type=int, default=8001, help="Port for SSE/HTTP transport")
    args = parser.parse_args()

    log.info("Starting Jachai MCP server with transport: %s", args.transport)

    if args.transport == "stdio":
        asyncio.run(server.run_stdio_async())
    elif args.transport == "sse":
        asyncio.run(server.run_sse_async(host=args.host, port=args.port))
    elif args.transport == "streamable-http":
        asyncio.run(server.run_streamable_http_async(host=args.host, port=args.port))


if __name__ == "__main__":
    main()
