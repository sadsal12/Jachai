import os
import json
import pytest
from starlette.requests import Request

from app.docs_portal import (
    get_docs_config,
    save_docs_config,
    is_docs_accessible,
    get_live_metrics,
    get_docs_page,
    get_status,
    update_admin_config,
    get_team_image,
    get_raw_markdown,
    AdminConfigRequest,
)


def _mock_request(path: str = "/docs", headers: dict = None, cookies: dict = None) -> Request:
    """Creates a mock Starlette request object."""
    raw_headers = []
    if headers:
        for k, v in headers.items():
            raw_headers.append((k.lower().encode("latin-1"), v.encode("latin-1")))
    if cookies:
        cookie_str = "; ".join(f"{k}={v}" for k, v in cookies.items())
        raw_headers.append((b"cookie", cookie_str.encode("latin-1")))

    scope = {
        "type": "http",
        "method": "GET",
        "path": path,
        "headers": raw_headers,
    }
    return Request(scope)


def test_docs_page_renders_html():
    """Verify that get_docs_page generates complete YC pitch deck and technical whitepaper."""
    req = _mock_request()
    res = get_docs_page(req, token=None)
    assert res.status_code == 200
    html = res.body.decode("utf-8")
    assert "Jachai" in html
    assert "System Architecture" in html
    assert "Team Jachai" in html
    assert "Rumman" in html
    assert "Saleh" in html
    assert "Anika" in html
    assert "Mirazul" in html
    assert "UI/UX & Product Design Lead" in html
    assert "Strategy & Pitch Development" in html
    assert "mermaid" in html


def test_docs_status_telemetry():
    """Verify /api/docs/status endpoint telemetry."""
    req = _mock_request("/api/docs/status")
    res = get_status(req, admin_token=None)
    assert res["accessible"] is True
    assert "live_metrics" in res
    assert res["live_metrics"]["total_hoaxes_indexed"] >= 40
    assert "engines" in res["live_metrics"]


def test_team_image_retrieval():
    """Verify that team photos can be retrieved safely."""
    res_rumman = get_team_image("rumman.jpg")
    assert res_rumman.status_code == 200
    assert len(res_rumman.body) > 1000

    res_sami = get_team_image("sami.jpg")
    assert res_sami.status_code == 200

    res_sami2 = get_team_image("sami2.jpg")
    assert res_sami2.status_code == 200


def test_access_control_and_admin_unlock():
    """Verify visibility toggle and admin overrides."""
    cfg = get_docs_config()
    orig_override = cfg.get("override_active", True)
    orig_enabled = cfg.get("is_enabled", True)

    try:
        # Simulate disabled documentation
        cfg["override_active"] = True
        cfg["is_enabled"] = False
        save_docs_config(cfg)

        req_public = _mock_request()
        res_public = get_docs_page(req_public, token=None)
        html_public = res_public.body.decode("utf-8")
        assert "Restricted Access Window" in html_public

        # Simulate admin unlock
        res_admin = get_docs_page(req_public, token=cfg.get("admin_token"))
        html_admin = res_admin.body.decode("utf-8")
        assert "Admin Mode Active" in html_admin
    finally:
        cfg["override_active"] = orig_override
        cfg["is_enabled"] = orig_enabled
        save_docs_config(cfg)


def test_admin_config_update():
    """Verify admin config update API."""
    cfg = get_docs_config()
    req = _mock_request()

    # Unauthorized
    with pytest.raises(Exception):
        update_admin_config(
            AdminConfigRequest(is_enabled=False),
            req,
            admin_token="wrong_token"
        )

    # Authorized
    res = update_admin_config(
        AdminConfigRequest(custom_notes="unit test note"),
        req,
        admin_token=cfg.get("admin_token")
    )
    assert res["status"] == "ok"


def test_raw_markdown_export():
    """Verify raw markdown whitepaper export."""
    res = get_raw_markdown()
    assert res.status_code == 200
    assert len(res.body) > 100
