"""Tests for the Jachai Model Context Protocol (MCP) server."""
import asyncio
import json
import pytest
from app.mcp_server import (
    server,
    jachai_verify_claim,
    jachai_search_hoaxes,
    jachai_get_hoax,
    jachai_stats,
    get_hoax_database,
    get_thresholds,
)


def test_mcp_server_inventory():
    """Verify that all tools, resources, and prompts are registered."""
    async def _check():
        tools = await server.list_tools()
        tool_names = {t.name for t in tools}
        assert "jachai_verify_claim" in tool_names
        assert "jachai_search_hoaxes" in tool_names
        assert "jachai_get_hoax" in tool_names
        assert "jachai_stats" in tool_names

        resources = await server.list_resources()
        resource_uris = {str(r.uri) for r in resources}
        assert "jachai://hoaxes/database" in resource_uris
        assert "jachai://config/thresholds" in resource_uris

        prompts = await server.list_prompts()
        prompt_names = {p.name for p in prompts}
        assert "fact_check_claim" in prompt_names
        assert "bilingual_family_explainer" in prompt_names

    asyncio.run(_check())


def test_mcp_verify_claim_tool():
    """Verify known hoax detection through MCP tool."""
    res_str = jachai_verify_claim("পদ্মা সেতুতে মানুষের মাথা লাগবে")
    data = json.loads(res_str)
    assert data["verdict"] == "red"
    assert data["label"] == "KNOWN_HOAX"
    assert data["confidence"] >= 0.75

    # Safe text
    res_safe = jachai_verify_claim("আজকে আবহাওয়া খুব সুন্দর")
    data_safe = json.loads(res_safe)
    assert data_safe["verdict"] == "green"
    assert data_safe["label"] == "NO_KNOWN_MATCH"


def test_mcp_search_and_get():
    """Test searching hoaxes and getting details."""
    search_res = json.loads(jachai_search_hoaxes("Padma Bridge", limit=3))
    assert search_res["count"] > 0
    first_id = search_res["results"][0]["id"]

    detail = json.loads(jachai_get_hoax(first_id))
    assert detail["id"] == first_id
    assert "claim_en" in detail
    assert "fact_en" in detail


def test_mcp_resources():
    """Test reading MCP resources."""
    db_str = get_hoax_database()
    db = json.loads(db_str)
    assert isinstance(db, list)
    assert len(db) == 45

    thresh = json.loads(get_thresholds())
    assert "hoax_threshold" in thresh
    assert thresh["hoax_threshold"] == 0.58
