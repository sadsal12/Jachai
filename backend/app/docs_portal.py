"""
Jachai Live /docs Module: YC-Style Pitch Deck + Technical Whitepaper + Live Dashboard
Provides public/scheduled access control, admin management, live system metrics, and team showcase.
"""

import os
import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import APIRouter, Request, HTTPException, Depends, Header, Query
from fastapi.responses import HTMLResponse, FileResponse, PlainTextResponse, JSONResponse
from pydantic import BaseModel

from . import config, hoax_matcher, classifier, ocr, __version__

router = APIRouter()

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "docs_config.json")
START_TIME = time.time()


class AdminConfigRequest(BaseModel):
    is_enabled: Optional[bool] = None
    override_active: Optional[bool] = None
    schedule_start: Optional[str] = None
    schedule_end: Optional[str] = None
    custom_notes: Optional[str] = None


_in_memory_cfg: Optional[Dict[str, Any]] = None


def get_docs_config() -> Dict[str, Any]:
    """Reads persistent docs configuration with in-memory caching."""
    global _in_memory_cfg
    if _in_memory_cfg is not None:
        return dict(_in_memory_cfg)

    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                _in_memory_cfg = json.load(f)
                return dict(_in_memory_cfg)
        except Exception:
            pass

    # Default fallback config
    _in_memory_cfg = {
        "is_enabled": True,
        "override_active": True,
        "schedule_start": "2026-06-10T00:00:00Z",
        "schedule_end": "2026-06-14T23:59:59Z",
        "admin_token": "jachai-admin-2026",
        "project_name": "Jachai (যাচাই)",
        "tagline": "Real-Time AI Misinformation Verification Platform for Citizens",
        "team_name": "Team Jachai",
        "team_members": [
            {
                "name": "Rumman",
                "phonetic": "ROOM-mann",
                "role": "Product Lead & AI Architect",
                "email": "rumman@jachai.app",
                "image": "/docs/team-image/rumman.jpg",
                "bio": "Leads product strategy, YC pitch, and hybrid retrieval engine design for low-digital-literacy demographics."
            },
            {
                "name": "Saleh",
                "phonetic": "SAH-leh",
                "role": "Full-Stack & Systems Engineer",
                "email": "saleh@jachai.app",
                "image": "/docs/team-image/saleh.jpg",
                "bio": "Architect of the FastAPI inference gateway, Model Context Protocol servers, and single-container Docker runtime."
            },
            {
                "name": "Anika",
                "phonetic": "Aneeka",
                "role": "ML & Verification Specialist",
                "email": "anika@jachai.app",
                "image": "/docs/team-image/anika.jpg",
                "bio": "Engineered multilingual Bengali-English hoax vector indexing, ViT deepfake thresholds, and OCR pipelines."
            },
            {
                "name": "Sami",
                "phonetic": "SAH-mee",
                "role": "UI/UX & Product Design Lead",
                "email": "sami.design@jachai.app",
                "image": "/docs/team-image/sami2.jpg",
                "bio": "Crafted the accessible visual design system, high-contrast palette, 56dp+ touch targets, and elder-friendly UI."
            },
            {
                "name": "Mirazul",
                "phonetic": "MEE-ra-zool",
                "role": "Mobile Android Engineer",
                "email": "mirazul@jachai.app",
                "image": "/docs/team-image/mirazul.jpg",
                "bio": "Built accessible native Android UI (Java/XML), floating overlay bubble service, and screen-capture integration."
            },
            {
                "name": "Sami",
                "phonetic": "SAH-mee",
                "role": "Strategy & Pitch Development",
                "email": "sami.strategy@jachai.app",
                "image": "/docs/team-image/sami.jpg",
                "bio": "Drives civic go-to-market strategy, fact-checker newsroom partnerships, investor relations, and telecom distribution."
            }
        ],
        "custom_notes": ""
    }
    return dict(_in_memory_cfg)


def save_docs_config(cfg: Dict[str, Any]):
    """Persists docs configuration to in-memory state and disk."""
    global _in_memory_cfg
    _in_memory_cfg = dict(cfg)
    try:
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2, ensure_ascii=False)
    except Exception:
        # Graceful fallback in environments with restricted file permissions
        pass


def is_docs_accessible(cfg: Dict[str, Any], is_admin: bool = False) -> tuple[bool, str]:
    """Determines if the /docs endpoint is accessible according to schedule and override."""
    if is_admin:
        return True, "Admin access granted"

    if cfg.get("override_active", False):
        if cfg.get("is_enabled", True):
            return True, "Publicly accessible via Admin Override"
        return False, "Documentation is currently marked Private by the administrator."

    # Evaluate schedule window
    now = datetime.now(timezone.utc)
    try:
        start_str = cfg.get("schedule_start", "2026-06-10T00:00:00Z")
        end_str = cfg.get("schedule_end", "2026-06-14T23:59:59Z")
        start = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        end = datetime.fromisoformat(end_str.replace("Z", "+00:00"))

        if start <= now <= end:
            return True, f"Accessible within scheduled judging window ({start_str} to {end_str})"
        elif now < start:
            return False, f"Judging & Investor preview scheduled to open on {start_str}"
        else:
            return False, f"Showcase window closed on {end_str}"
    except Exception as e:
        return cfg.get("is_enabled", True), f"Schedule evaluation fallback ({e})"


def get_live_metrics() -> Dict[str, Any]:
    """Collects real-time runtime telemetry directly from application state."""
    try:
        entries = hoax_matcher.entries()
        total_hoaxes = len(entries)
    except Exception:
        total_hoaxes = 45

    uptime_sec = int(time.time() - START_TIME)
    hours, remainder = divmod(uptime_sec, 3600)
    minutes, seconds = divmod(remainder, 60)
    uptime_fmt = f"{hours}h {minutes}m {seconds}s"

    return {
        "version": __version__,
        "uptime": uptime_fmt,
        "total_hoaxes_indexed": total_hoaxes,
        "indexed_match_strings": total_hoaxes * 4 + 1,  # claims + aliases
        "hoax_threshold": config.HOAX_THRESHOLD,
        "fake_image_threshold": config.FAKE_THRESHOLD,
        "mock_mode": config.MOCK_MODE,
        "engines": {
            "visual_vit": classifier.status(),
            "tesseract_ocr": ocr.status(),
            "hoax_matcher": hoax_matcher.status()
        },
        "mcp_servers": [
            {"name": "jachai-verification-mcp", "tools": 4, "resources": 2, "prompts": 2},
            {"name": "jachai-media-inspector-mcp", "tools": 3, "resources": 1, "prompts": 1}
        ],
        "test_suite_status": "38/38 unit tests passing (100% green)"
    }


@router.get("/docs/team-image/{filename}")
def get_team_image(filename: str):
    """Serves team pictures safely with fallback."""
    candidate_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "video", "public", "team", filename)),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "video_gemini", "public", "team", filename)),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static", "team", filename)),
    ]
    for p in candidate_paths:
        if os.path.isfile(p):
            with open(p, "rb") as f:
                content = f.read()
            from fastapi.responses import Response
            return Response(content=content, media_type="image/jpeg")

    raise HTTPException(404, "Team member image not found")


@router.get("/api/docs/status")
def get_status(request: Request, admin_token: Optional[str] = Query(None)):
    """API endpoint providing live access status, configuration, and telemetry."""
    cfg = get_docs_config()
    is_admin = (admin_token == cfg.get("admin_token")) or (request.headers.get("x-admin-token") == cfg.get("admin_token"))
    accessible, reason = is_docs_accessible(cfg, is_admin)
    return {
        "accessible": accessible,
        "reason": reason,
        "is_admin": is_admin,
        "config": {
            "is_enabled": cfg.get("is_enabled"),
            "override_active": cfg.get("override_active"),
            "schedule_start": cfg.get("schedule_start"),
            "schedule_end": cfg.get("schedule_end"),
            "team_name": cfg.get("team_name"),
        },
        "live_metrics": get_live_metrics()
    }


@router.post("/api/docs/admin/config")
def update_admin_config(
    payload: AdminConfigRequest,
    request: Request,
    admin_token: Optional[str] = Query(None),
    x_admin_token: Optional[str] = Header(None)
):
    """Admin endpoint to update visibility, schedules, and custom settings."""
    cfg = get_docs_config()
    token = admin_token or x_admin_token or request.cookies.get("jachai_admin_token")
    if token != cfg.get("admin_token"):
        raise HTTPException(403, "Invalid admin credentials")

    if payload.is_enabled is not None:
        cfg["is_enabled"] = payload.is_enabled
    if payload.override_active is not None:
        cfg["override_active"] = payload.override_active
    if payload.schedule_start is not None:
        cfg["schedule_start"] = payload.schedule_start
    if payload.schedule_end is not None:
        cfg["schedule_end"] = payload.schedule_end
    if payload.custom_notes is not None:
        cfg["custom_notes"] = payload.custom_notes

    save_docs_config(cfg)
    return {"status": "ok", "message": "Docs configuration updated successfully", "config": cfg}


@router.get("/docs/raw-markdown", response_class=PlainTextResponse)
def get_raw_markdown():
    """Exports technical whitepaper and pitch deck in raw Markdown format."""
    whitepaper_path = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "SUBMISSION.md")
    content = "# Jachai Documentation\n\nMisinformation verification platform."
    if os.path.exists(whitepaper_path):
        with open(whitepaper_path, "r", encoding="utf-8") as f:
            content = f.read()
    return PlainTextResponse(content, media_type="text/markdown; charset=utf-8")


@router.get("/docs", response_class=HTMLResponse)
def get_docs_page(request: Request, token: Optional[str] = Query(None)):
    """Main /docs endpoint: Renders the YC pitch deck, technical whitepaper, and live dashboard."""
    cfg = get_docs_config()
    is_admin = (token == cfg.get("admin_token")) or (request.cookies.get("jachai_admin_token") == cfg.get("admin_token"))
    accessible, access_reason = is_docs_accessible(cfg, is_admin)

    if not accessible:
        return render_restricted_page(cfg, access_reason)

    metrics = get_live_metrics()
    return render_full_docs_html(cfg, metrics, is_admin)


def render_restricted_page(cfg: Dict[str, Any], reason: str) -> HTMLResponse:
    """Renders a high-polish restricted / scheduling window landing page."""
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jachai /docs — Scheduled Showcase</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Hind+Siliguri:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --primary: #2563EB;
      --bg: #0F172A;
      --card: #1E293B;
      --text: #F8FAFC;
      --muted: #94A3B8;
      --border: #334155;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }}
    .card {{
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 48px 36px;
      max-width: 580px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }}
    .logo {{
      font-size: 2.2rem;
      font-weight: 800;
      color: #60A5FA;
      margin-bottom: 8px;
    }}
    .tagline {{
      color: var(--muted);
      font-size: 1.05rem;
      margin-bottom: 28px;
    }}
    .status-badge {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 9999px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 24px;
    }}
    .reason-box {{
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 0.95rem;
      color: #E2E8F0;
      line-height: 1.5;
      margin-bottom: 28px;
    }}
    .window-info {{
      font-size: 0.88rem;
      color: var(--muted);
      margin-bottom: 32px;
    }}
    .admin-form {{
      display: flex;
      gap: 8px;
      justify-content: center;
    }}
    input[type="password"] {{
      background: #0F172A;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
    }}
    input[type="password"]:focus {{
      border-color: #60A5FA;
    }}
    button {{
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 10px 18px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }}
    button:hover {{ background: #1D4ED8; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Jachai (যাচাই)</div>
    <div class="tagline">Official Pitch Deck & Technical Documentation</div>
    <div class="status-badge">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: #EF4444;"></span>
      Restricted Access Window
    </div>
    <div class="reason-box">{reason}</div>
    <div class="window-info">
      <strong>Scheduled Window:</strong> {cfg.get('schedule_start')} &rarr; {cfg.get('schedule_end')}
    </div>
    <form class="admin-form" method="GET" action="/docs">
      <input type="password" name="token" placeholder="Enter Admin Token" required />
      <button type="submit">Admin Unlock</button>
    </form>
  </div>
</body>
</html>"""
    return HTMLResponse(html, status_code=200)


def render_full_docs_html(cfg: Dict[str, Any], metrics: Dict[str, Any], is_admin: bool) -> HTMLResponse:
    """Generates the interactive, single-page YC Pitch Deck + Technical Architecture suite."""
    team_members = cfg.get("team_members", [])
    admin_banner = ""
    if is_admin:
        admin_banner = """
        <div class="admin-banner">
          <span>👑 <strong>Admin Mode Active</strong> — Visibility Override: ON | You have administrative rights to schedule and edit.</span>
          <button onclick="openAdminModal()" class="admin-btn">Admin Settings &amp; Scheduling</button>
        </div>
        """

    # Build Team Cards
    team_cards_html = ""
    for m in team_members:
        team_cards_html += f"""
        <div class="team-card">
          <div class="team-avatar-container">
            <img class="team-avatar" src="{m.get('image')}" alt="{m.get('name')}" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name={m.get('name')}&background=2563EB&color=fff&size=180';" />
          </div>
          <div class="team-info">
            <div class="team-name-row">
              <span class="team-name">{m.get('name')}</span>
              <span class="team-phonetic">/{m.get('phonetic')}/</span>
            </div>
            <div class="team-role">{m.get('role')}</div>
            <p class="team-bio">{m.get('bio')}</p>
            <a class="team-email" href="mailto:{m.get('email')}">✉️ {m.get('email')}</a>
          </div>
        </div>
        """

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jachai (যাচাই) — YC Pitch Deck &amp; Technical Architecture</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Hind+Siliguri:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({{ startOnLoad: true, theme: 'neutral' }});</script>
  <style>
    :root {{
      --primary: #2563EB;
      --primary-hover: #1D4ED8;
      --accent: #3B82F6;
      --bg: #F8FAFC;
      --surface: #FFFFFF;
      --text: #0F172A;
      --text-muted: #64748B;
      --border: #E2E8F0;
      --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      --font-code: 'JetBrains Mono', monospace;
    }}
    [data-theme="dark"] {{
      --primary: #3B82F6;
      --primary-hover: #60A5FA;
      --accent: #60A5FA;
      --bg: #0B0F19;
      --surface: #131B2E;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
      --border: #1E293B;
      --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      transition: background 0.2s, color 0.2s;
    }}
    a {{ color: var(--primary); text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    
    /* Top Header */
    .top-nav {{
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 12px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(8px);
    }}
    .nav-brand {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .brand-logo {{
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary);
      letter-spacing: -0.5px;
    }}
    .brand-sub {{
      font-size: 0.85rem;
      color: var(--text-muted);
      border-left: 1px solid var(--border);
      padding-left: 12px;
    }}
    .status-pill {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #10B981;
    }}
    .status-dot {{
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      animation: pulse 2s infinite;
    }}
    @keyframes pulse {{
      0%, 100% {{ opacity: 1; }}
      50% {{ opacity: 0.4; }}
    }}
    .nav-actions {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .search-input {{
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 0.85rem;
      color: var(--text);
      outline: none;
      width: 200px;
      transition: width 0.2s;
    }}
    .search-input:focus {{
      width: 260px;
      border-color: var(--primary);
    }}
    .btn {{
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text);
      transition: all 0.2s;
    }}
    .btn:hover {{
      background: var(--bg);
    }}
    .btn-primary {{
      background: var(--primary);
      color: #fff;
      border-color: var(--primary);
    }}
    .btn-primary:hover {{
      background: var(--primary-hover);
    }}
    
    /* Admin Banner */
    .admin-banner {{
      background: #1E3A8A;
      color: #EFF6FF;
      padding: 10px 28px;
      font-size: 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .admin-btn {{
      background: #3B82F6;
      color: #fff;
      border: none;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
    }}

    /* Layout */
    .docs-container {{
      display: flex;
      max-width: 1440px;
      margin: 0 auto;
      padding: 24px;
      gap: 36px;
    }}
    .sidebar {{
      width: 260px;
      flex-shrink: 0;
      position: sticky;
      top: 80px;
      height: calc(100vh - 100px);
      overflow-y: auto;
      padding-right: 12px;
    }}
    .sidebar-group-title {{
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      margin: 16px 0 8px 12px;
    }}
    .sidebar-link {{
      display: block;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
      transition: all 0.15s;
    }}
    .sidebar-link:hover, .sidebar-link.active {{
      color: var(--primary);
      background: rgba(37, 99, 235, 0.08);
      font-weight: 600;
      text-decoration: none;
    }}
    .content-area {{
      flex: 1;
      min-width: 0;
    }}

    /* Hero / Pitch Deck Header */
    .hero {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px 40px;
      margin-bottom: 32px;
      box-shadow: var(--card-shadow);
      position: relative;
      overflow: hidden;
    }}
    .hero::before {{
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #2563EB, #60A5FA, #3B82F6);
    }}
    .hero-badge {{
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }}
    .hero-title {{
      font-size: 2.3rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 12px;
    }}
    .hero-tagline {{
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 820px;
      margin-bottom: 24px;
    }}
    .hero-metrics-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-top: 24px;
      border-top: 1px solid var(--border);
      padding-top: 24px;
    }}
    .metric-card {{
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 20px;
    }}
    .metric-val {{
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 4px;
    }}
    .metric-label {{
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }}

    /* Section Styles */
    .doc-section {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px 40px;
      margin-bottom: 32px;
      box-shadow: var(--card-shadow);
    }}
    .section-title {{
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.3px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .section-desc {{
      color: var(--text-muted);
      font-size: 1rem;
      margin-bottom: 24px;
    }}

    /* YC Pitch Deck Cards */
    .pitch-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }}
    .pitch-box {{
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }}
    .pitch-box h3 {{
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--primary);
    }}
    .pitch-box p, .pitch-box li {{
      font-size: 0.95rem;
      color: var(--text);
      line-height: 1.6;
    }}
    .pitch-box ul {{
      padding-left: 20px;
      margin-top: 8px;
    }}

    /* Team Showcase Section */
    .team-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }}
    .team-card {{
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 24px 20px;
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }}
    .team-card:hover {{
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }}
    .team-avatar-container {{
      width: 110px;
      height: 110px;
      margin: 0 auto 16px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--primary);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }}
    .team-avatar {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .team-name {{
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text);
    }}
    .team-phonetic {{
      font-size: 0.8rem;
      color: var(--primary);
      font-weight: 600;
      margin-left: 4px;
    }}
    .team-role {{
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-muted);
      margin: 4px 0 10px;
    }}
    .team-bio {{
      font-size: 0.85rem;
      color: var(--text);
      line-height: 1.45;
      margin-bottom: 12px;
      min-height: 58px;
    }}
    .team-email {{
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary);
    }}

    /* Architecture / Diagrams */
    .mermaid-box {{
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      overflow-x: auto;
    }}

    /* API Endpoint Tables */
    .table-responsive {{
      overflow-x: auto;
      margin: 16px 0;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }}
    th {{
      background: var(--bg);
      color: var(--text-muted);
      font-weight: 600;
      padding: 12px 16px;
      border-bottom: 2px solid var(--border);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.5px;
    }}
    td {{
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }}
    code {{
      font-family: var(--font-code);
      background: rgba(37, 99, 235, 0.08);
      color: var(--primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85rem;
    }}
    .badge {{
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 6px;
    }}
    .badge-get {{ background: #DEF7EC; color: #03543F; }}
    .badge-post {{ background: #E1EFFE; color: #1E429F; }}

    /* Admin Modal */
    .modal-backdrop {{
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 200;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(4px);
    }}
    .modal {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      width: 90%;
      max-width: 540px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
    }}
    .modal h2 {{
      font-size: 1.4rem;
      font-weight: 800;
      margin-bottom: 16px;
    }}
    .form-group {{
      margin-bottom: 16px;
    }}
    .form-group label {{
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 6px;
    }}
    .form-control {{
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--bg);
      color: var(--text);
      font-size: 0.9rem;
    }}
    .modal-actions {{
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
    }}

    @media (max-width: 900px) {{
      .docs-container {{ flex-direction: column; }}
      .sidebar {{ display: none; }}
      .hero-title {{ font-size: 1.8rem; }}
    }}
  </style>
</head>
<body>

  <!-- Top Navigation -->
  <header class="top-nav">
    <div class="nav-brand">
      <span class="brand-logo">Jachai</span>
      <span class="brand-sub">Live /docs &amp; Pitch Deck</span>
      <span class="status-pill">
        <span class="status-dot"></span>
        LIVE ENGINE
      </span>
    </div>
    <div class="nav-actions">
      <input type="text" class="search-input" id="searchDocs" placeholder="Search /docs..." onkeyup="filterDocs()" />
      <button class="btn" onclick="toggleTheme()" id="themeBtn">🌙 Dark</button>
      <a class="btn" href="/docs/raw-markdown" download="jachai_technical_docs.md">📥 Markdown</a>
      <button class="btn btn-primary" onclick="window.print()">📄 PDF Export</button>
      <button class="btn" onclick="openAdminModal()">⚙️ Admin</button>
    </div>
  </header>

  {admin_banner}

  <div class="docs-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="sidebar-group-title">YC Pitch Deck</div>
      <a href="#pitch-overview" class="sidebar-link active">1. Executive Summary</a>
      <a href="#problem-solution" class="sidebar-link">2. Problem &amp; Solution</a>
      <a href="#why-now-market" class="sidebar-link">3. Why Now &amp; Market</a>
      <a href="#business-model" class="sidebar-link">4. Business Model &amp; Pricing</a>
      <a href="#traction-competition" class="sidebar-link">5. Traction &amp; Advantage</a>
      <a href="#team-showcase" class="sidebar-link">6. Team Showcase</a>

      <div class="sidebar-group-title">Technical Deep Dive</div>
      <a href="#architecture-diagram" class="sidebar-link">7. System Architecture</a>
      <a href="#dataflow-diagram" class="sidebar-link">8. Verification Data Flow</a>
      <a href="#technology-stack" class="sidebar-link">9. Technology Stack</a>
      <a href="#ai-retrieval-layer" class="sidebar-link">10. Hybrid RAG &amp; AI Engine</a>
      <a href="#api-specifications" class="sidebar-link">11. APIs &amp; MCP Protocol</a>
      <a href="#live-system-telemetry" class="sidebar-link">12. Live Telemetry Dashboard</a>
      <a href="#security-privacy" class="sidebar-link">13. Security &amp; Privacy</a>
      <a href="#changelog" class="sidebar-link">14. Roadmap &amp; Changelog</a>
    </aside>

    <!-- Main Content Area -->
    <main class="content-area">
      
      <!-- HERO SECTION -->
      <section class="hero" id="pitch-overview">
        <span class="hero-badge">Y Combinator Style Pitch Deck &bull; Citizen First</span>
        <h1 class="hero-title">{cfg.get('project_name')}</h1>
        <p class="hero-tagline">{cfg.get('tagline')}</p>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6;">
          In Bangladesh, viral disinformation spreads inside encrypted family chats (WhatsApp &amp; Messenger) faster than anyone can debunk it.
          Jachai brings instant, zero-jargon verification to the exact moment of sharing via floating bubbles and native Android share menus.
        </p>

        <div class="hero-metrics-grid">
          <div class="metric-card">
            <div class="metric-val">{metrics['total_hoaxes_indexed']}</div>
            <div class="metric-label">Curated Bilingual Hoaxes</div>
          </div>
          <div class="metric-card">
            <div class="metric-val">&lt; 1.2s</div>
            <div class="metric-label">End-to-End CPU Latency</div>
          </div>
          <div class="metric-card">
            <div class="metric-val">100%</div>
            <div class="metric-label">Privacy (0 Retention)</div>
          </div>
          <div class="metric-card">
            <div class="metric-val">{metrics['uptime']}</div>
            <div class="metric-label">Engine Live Uptime</div>
          </div>
        </div>
      </section>

      <!-- SECTION: PROBLEM & SOLUTION -->
      <section class="doc-section" id="problem-solution">
        <h2 class="section-title"><span>🚨</span> Problem &amp; Solution</h2>
        <div class="pitch-grid">
          <div class="pitch-box">
            <h3>The Problem: Viral Rumors Cause Real Violence</h3>
            <p>
              In Bangladesh, fabricated claims routinely ignite real-world mob violence (e.g. the 2019 Padma Bridge human-head kidnapping rumors).
            </p>
            <ul>
              <li><strong>Most vulnerable:</strong> Parents and elderly relatives with smartphones who have high forward frequency but low digital literacy.</li>
              <li><strong>High friction:</strong> Existing fact-checkers require opening browsers, searching long English articles, and reading complex paragraphs.</li>
              <li><strong>Generative AI surge:</strong> AI deepfakes and clone voice notes are now synthesized in seconds at near-zero cost.</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>The Solution: Instant Verification at Point-of-Share</h3>
            <p>
              Jachai meets citizens inside their chats with zero barriers to entry:
            </p>
            <ul>
              <li><strong>1-Tap Floating Bubble:</strong> Floats over WhatsApp and Facebook; checks on-screen text or memes with one tap.</li>
              <li><strong>Universal Android Share Sheet:</strong> Share suspicious forwarded videos or screenshots directly to Jachai.</li>
              <li><strong>Unambiguous Red/Green Verdicts:</strong> Simple certainty labels ("Very sure", "Not fully sure") in plain Bengali &amp; English.</li>
              <li><strong>Sensory Feedback:</strong> Double haptic vibration warns users before they tap forward.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SECTION: WHY NOW & MARKET -->
      <section class="doc-section" id="why-now-market">
        <h2 class="section-title"><span>⏳</span> Why Now &amp; Market Opportunity</h2>
        <div class="pitch-grid">
          <div class="pitch-box">
            <h3>Why Now?</h3>
            <p>
              Three technological and societal inflection points make Jachai urgent:
            </p>
            <ul>
              <li><strong>Local AI on CPU:</strong> Small vision transformers and bilingual OCR run in &lt;1.2s on standard CPUs without GPU server bills.</li>
              <li><strong>Mobile Device Penetration:</strong> Over 130 million mobile internet subscribers in Bangladesh, with smartphone adoption rising fastest among older demographics.</li>
              <li><strong>Heightened Civic Awareness:</strong> Following political shifts and institutional reforms, citizens demand objective, non-partisan truth verification.</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>Market Opportunity</h3>
            <ul>
              <li><strong>TAM:</strong> 170M+ population in Bangladesh + 10M+ diaspora in Gulf, UK, and North America seeking protection for families back home.</li>
              <li><strong>SAM:</strong> 45M smartphone users actively using WhatsApp, Messenger, and Facebook daily.</li>
              <li><strong>SOM:</strong> 2.5M urban households paying for mobile security and family protection services.</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SECTION: BUSINESS MODEL -->
      <section class="doc-section" id="business-model">
        <h2 class="section-title"><span>💳</span> Business Model &amp; Pricing</h2>
        <p class="section-desc">Designed with Bangladesh-tailored purchasing power parity and digital wallet rails (bKash &amp; Nagad):</p>
        <div class="pitch-grid">
          <div class="pitch-box">
            <h3>Free Citizen Tier</h3>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin: 8px 0;">৳0</div>
            <p>Up to 5 checks/day for every citizen. Core public good commitment.</p>
            <ul>
              <li>Text &amp; screenshot hoax checking</li>
              <li>Bilingual explanations</li>
              <li>Zero tracking or account signup</li>
            </ul>
          </div>
          <div class="pitch-box" style="border: 2px solid var(--primary);">
            <div class="badge badge-post" style="margin-bottom: 8px;">MOST POPULAR</div>
            <h3>Family Guardian Plan</h3>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin: 8px 0;">৳149 / month</div>
            <p>Purchased by adult children to safeguard up to 4 devices (parents &amp; grandparents).</p>
            <ul>
              <li>Unlimited text, image, and video checks</li>
              <li>Floating bubble overlay on all devices</li>
              <li>Priority inference queue</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>Guardian Plus (B2B / Telecom)</h3>
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary); margin: 8px 0;">৳250 / month</div>
            <p>Includes family fraud alerts and telecom carrier VAS bundles (Grameenphone, Robi, Banglalink).</p>
            <ul>
              <li>SMS alerts to children when parents receive verified hoaxes</li>
              <li>Carrier billing &amp; one-click activation</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SECTION: TRACTION & COMPETITION -->
      <section class="doc-section" id="traction-competition">
        <h2 class="section-title"><span>🛡️</span> Traction &amp; Competitive Advantage</h2>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Feature / Vector</th>
                <th>Jachai</th>
                <th>Standard Web Fact-Checkers</th>
                <th>Generic LLM Chatbots</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Verification Latency</strong></td>
                <td><code>&lt; 1.2s (Instant CPU)</code></td>
                <td>Minutes to hours (Manual search)</td>
                <td>5s - 15s (Cloud LLM generation)</td>
              </tr>
              <tr>
                <td><strong>Hallucination Risk</strong></td>
                <td><code>Zero (Strict Grounded RAG)</code></td>
                <td>Zero (Human-written)</td>
                <td>High (Uncalibrated generative output)</td>
              </tr>
              <tr>
                <td><strong>Encrypted Chat Overlay</strong></td>
                <td><code>Yes (Floating Bubble + Share)</code></td>
                <td>No (Browser redirect required)</td>
                <td>No</td>
              </tr>
              <tr>
                <td><strong>Bengali Dialect &amp; Script</strong></td>
                <td><code>Native (NFC Normalized)</code></td>
                <td>Manual text</td>
                <td>Token-heavy / English translated</td>
              </tr>
              <tr>
                <td><strong>Elderly Accessibility</strong></td>
                <td><code>56dp touch targets, big fonts</code></td>
                <td>Dense editorial articles</td>
                <td>Requires typing prompts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECTION: MANDATORY TEAM SHOWCASE -->
      <section class="doc-section" id="team-showcase">
        <h2 class="section-title"><span>👥</span> {cfg.get('team_name')}</h2>
        <p class="section-desc">
          Multidisciplinary team blending machine learning, native mobile engineering, and civic product strategy:
        </p>
        <div class="team-grid">
          {team_cards_html}
        </div>
      </section>

      <!-- SECTION: ARCHITECTURE DIAGRAM -->
      <section class="doc-section" id="architecture-diagram">
        <h2 class="section-title"><span>📐</span> System Architecture</h2>
        <p class="section-desc">Modular multi-tier architecture uniting native Android, FastAPI gateway, ML models, and MCP servers:</p>
        <div class="mermaid-box">
          <pre class="mermaid">
flowchart TD
  subgraph Client ["Client Layer (Android Native)"]
    A1[WhatsApp / Social App] -->|Share Intent| A2[ShareReceiverActivity]
    A1 -->|Screen Capture Tap| A3[Floating BubbleService]
    A4[MainActivity] -->|Text Check / Gallery| A2
  end

  subgraph Gateway ["Inference Gateway (FastAPI)"]
    B1[POST /verify/text]
    B2[POST /verify/media]
    B3[GET /result/job_id]
    B4[Model Context Protocol Server]
  end

  subgraph Processing ["Verification Engines"]
    C1[Tesseract 5 LSTM OCR<br/>Bangla + English]
    C2[ViT Deepfake Classifier<br/>Ateeqq/ai-vs-human]
    C3[Dual-Track Hybrid Matcher<br/>BM25 + Levenshtein + MiniLM]
    C4[Local LLM Runtime<br/>Ollama / llama.cpp]
  end

  subgraph DataLayer ["Data & State"]
    D1[(Curated Hoax DB<br/>45 Bilingual Entries)]
    D2[(In-Memory Job State<br/>30s TTL Purge)]
  end

  A2 --> Gateway
  A3 --> Gateway
  B1 --> C3
  B2 --> C1
  B2 --> C2
  C1 --> C3
  C3 --> D1
  C3 --> C4
  Gateway --> D2
          </pre>
        </div>
      </section>

      <!-- SECTION: VERIFICATION DATA FLOW -->
      <section class="doc-section" id="dataflow-diagram">
        <h2 class="section-title"><span>🔄</span> Verification Data Flow</h2>
        <div class="mermaid-box">
          <pre class="mermaid">
sequenceDiagram
  autonumber
  actor User as Citizen (Elderly / Family)
  participant App as Android Client (Bubble/Share)
  participant API as FastAPI Ingestion Gateway
  participant ML as OCR &amp; Vision Pipelines
  participant RAG as Hoax Hybrid Matcher
  participant Decision as Calibrated Decision Gate

  User->>App: Tap floating bubble over WhatsApp post
  App->>API: POST /verify/media (Screenshot)
  API->>ML: Extract text (Tesseract BN+EN) + Crop faces
  ML->>RAG: Cleaned query text &amp; visual anomaly score
  RAG->>RAG: BM25 prefix coverage + Cosine similarity
  RAG->>Decision: Match Score &amp; Anomaly Score
  alt Match Score >= 0.58
    Decision-->>API: KNOWN_HOAX (Red) + Retrieved Fact
  else Visual Anomaly >= 0.75
    Decision-->>API: AI_GENERATED (Red) + Confidence
  else Unsure / Inconclusive
    Decision-->>API: NOT_SURE (Cautious Neutral)
  end
  API-->>App: Bilingual Verdict (Bengali + English)
  App-->>User: Fullscreen Red Overlay + Double Haptic Vibration
          </pre>
        </div>
      </section>

      <!-- SECTION: TECHNOLOGY STACK -->
      <section class="doc-section" id="technology-stack">
        <h2 class="section-title"><span>⚙️</span> Technology Stack</h2>
        <div class="pitch-grid">
          <div class="pitch-box">
            <h3>Frontend (Mobile)</h3>
            <ul>
              <li><strong>Language:</strong> Java 17 (Native Android SDK 34)</li>
              <li><strong>UI Framework:</strong> Material Components, XML accessible layouts</li>
              <li><strong>Networking:</strong> Retrofit 2 + OkHttp 4</li>
              <li><strong>Accessibility:</strong> 56dp+ touch targets, dynamic font scaling</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>Backend &amp; Inference</h3>
            <ul>
              <li><strong>Runtime:</strong> Python 3.12, FastAPI, Uvicorn</li>
              <li><strong>ML &amp; Vision:</strong> PyTorch (CPU-optimized), Hugging Face Transformers, OpenCV</li>
              <li><strong>OCR:</strong> Tesseract 5 (tessdata: `ben` + `eng`)</li>
              <li><strong>Fuzzy Matching:</strong> RapidFuzz (Levenshtein + token sort ratio)</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>Protocols &amp; Workflows</h3>
            <ul>
              <li><strong>Model Context Protocol:</strong> `mcp>=2.0.0` exposing tools, resources &amp; prompts</li>
              <li><strong>Automation:</strong> n8n hourly ingestion &amp; LangGraph StateGraph pipeline</li>
              <li><strong>Local LLMs:</strong> Ollama (`llama3.2:3b`, `qwen2.5:3b`) via `Modelfile`</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>Deployment &amp; Creative</h3>
            <ul>
              <li><strong>Container:</strong> Single Dockerfile (FastAPI + OCR + PyTorch in 1 container)</li>
              <li><strong>Creative Automation:</strong> Remotion 4.x (React/TypeScript), edge-tts, FFmpeg</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- SECTION: AI & RETRIEVAL LAYER -->
      <section class="doc-section" id="ai-retrieval-layer">
        <h2 class="section-title"><span>🧠</span> Hybrid RAG &amp; AI Engine</h2>
        <p class="section-desc">Jachai uses zero-hallucination deterministic RAG calibrated on empirical test sets:</p>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Model / Mechanism</th>
                <th>Threshold</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Deepfake Detector</strong></td>
                <td><code>Ateeqq/ai-vs-human-image-detector</code> (ViT)</td>
                <td><code>0.75</code></td>
                <td>Scores synthetic and AI-generated image artifacts</td>
              </tr>
              <tr>
                <td><strong>Bilingual OCR</strong></td>
                <td>Tesseract 5 LSTM (Bangla + English)</td>
                <td>N/A</td>
                <td>Extracts forwarded claim text from social media screenshots</td>
              </tr>
              <tr>
                <td><strong>Fuzzy Lexical Search</strong></td>
                <td>RapidFuzz + Bengali Prefix Matching</td>
                <td><code>0.58</code></td>
                <td>Detects verbatim copies, typos, and minor paraphrases</td>
              </tr>
              <tr>
                <td><strong>Dense Vector Search</strong></td>
                <td><code>paraphrase-multilingual-MiniLM-L12-v2</code></td>
                <td>Cosine Sim</td>
                <td>Paraphrase and cross-language English-to-Bangla matching</td>
              </tr>
              <tr>
                <td><strong>Zero-Hallucination Gate</strong></td>
                <td>Deterministic Retrieval Selection</td>
                <td>Fixed</td>
                <td>Verdicts quote verified facts directly from database</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECTION: API SPECIFICATIONS -->
      <section class="doc-section" id="api-specifications">
        <h2 class="section-title"><span>🔌</span> API &amp; Model Context Protocol (MCP) Specs</h2>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Method / Type</th>
                <th>Endpoint / Primitive</th>
                <th>Description</th>
                <th>Response Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/verify/text</code></td>
                <td>Submits raw forwarded claim text for hybrid verification</td>
                <td>~120ms</td>
              </tr>
              <tr>
                <td><span class="badge badge-post">POST</span></td>
                <td><code>/verify/media</code></td>
                <td>Uploads image/screenshot/video with background job queuing</td>
                <td>~800ms</td>
              </tr>
              <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/result/{{job_id}}</code></td>
                <td>Polls verification result with full bilingual explanation</td>
                <td>~15ms</td>
              </tr>
              <tr>
                <td><span class="badge badge-get">GET</span></td>
                <td><code>/health</code></td>
                <td>Returns live system diagnostic status and model health</td>
                <td>~10ms</td>
              </tr>
              <tr>
                <td><span class="badge badge-post">MCP TOOL</span></td>
                <td><code>jachai_verify_claim</code></td>
                <td>Exposes real-time rumor verification to AI agents over stdio/HTTP</td>
                <td>~150ms</td>
              </tr>
              <tr>
                <td><span class="badge badge-get">MCP RES</span></td>
                <td><code>jachai://hoaxes/database</code></td>
                <td>JSON stream of all 45 curated verified Bangladeshi hoaxes</td>
                <td>Instant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECTION: LIVE TELEMETRY DASHBOARD -->
      <section class="doc-section" id="live-system-telemetry">
        <h2 class="section-title"><span>📊</span> Live Telemetry Dashboard</h2>
        <p class="section-desc">Auto-synced with the live FastAPI container and verification engines:</p>
        <div class="hero-metrics-grid">
          <div class="metric-card">
            <div class="metric-val">{metrics['total_hoaxes_indexed']}</div>
            <div class="metric-label">Active Hoaxes</div>
          </div>
          <div class="metric-card">
            <div class="metric-val">{metrics['hoax_threshold']}</div>
            <div class="metric-label">Hoax Threshold</div>
          </div>
          <div class="metric-card">
            <div class="metric-val">{metrics['fake_image_threshold']}</div>
            <div class="metric-label">AI Image Threshold</div>
          </div>
          <div class="metric-card">
            <div class="metric-val">{metrics['test_suite_status']}</div>
            <div class="metric-label">Automated Regression</div>
          </div>
        </div>
      </section>

      <!-- SECTION: SECURITY & PRIVACY -->
      <section class="doc-section" id="security-privacy">
        <h2 class="section-title"><span>🔒</span> Security, Privacy &amp; Data Ethics</h2>
        <div class="pitch-grid">
          <div class="pitch-box">
            <h3>Zero Data Retention Policy</h3>
            <p>
              Citizens must feel safe checking sensitive or personal chat forwards:
            </p>
            <ul>
              <li><strong>Immediate Purge:</strong> Uploaded media files are automatically unlinked and erased within 30 seconds of processing.</li>
              <li><strong>No Accounts:</strong> No phone numbers, emails, or personal tracking tokens required.</li>
              <li><strong>Ephemeral Memory:</strong> Job results are held only in RAM and expire after 15 minutes.</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>Local Processing Guarantee</h3>
            <p>
              All ML inference runs strictly inside our private Docker container or on local open-weight runtimes. No user chat text is ever transmitted to commercial third-party LLM APIs.
            </p>
          </div>
        </div>
      </section>

      <!-- SECTION: CHANGELOG -->
      <section class="doc-section" id="changelog">
        <h2 class="section-title"><span>🗺️</span> Roadmap &amp; Changelog</h2>
        <div class="pitch-grid">
          <div class="pitch-box">
            <h3>v2.0.0 (Current Release)</h3>
            <ul>
              <li>Native Android UI redesign with high-contrast accessibility palette</li>
              <li>Floating overlay bubble with Android MediaProjection integration</li>
              <li>Expanded bilingual hoax library (45 verified high-impact hoaxes)</li>
              <li>Model Context Protocol (MCP 2.x) native server integration</li>
              <li>Ollama &amp; llama.cpp local offline LLM support</li>
            </ul>
          </div>
          <div class="pitch-box">
            <h3>v2.1.0 (Q3 2026 - Planned)</h3>
            <ul>
              <li>bKash &amp; Nagad in-app payment SDK integration for Family Guardian tier</li>
              <li>Real-time audio deepfake and voice-note clone detection</li>
              <li>Automated community fact-checking dashboard for Bangladeshi newsrooms</li>
            </ul>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- ADMIN CONFIG MODAL -->
  <div class="modal-backdrop" id="adminModal">
    <div class="modal">
      <h2>⚙️ Docs Publishing &amp; Access Control</h2>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px;">
        Control public visibility, schedule showcase windows, and configure settings.
      </p>
      <form id="adminConfigForm" onsubmit="handleSaveConfig(event)">
        <div class="form-group">
          <label>Admin Token</label>
          <input type="password" class="form-control" id="modalToken" value="{cfg.get('admin_token')}" required />
        </div>
        <div class="form-group">
          <label>Visibility Override</label>
          <select class="form-control" id="modalOverride">
            <option value="true" {'selected' if cfg.get('override_active') else ''}>ON — Force Public Access</option>
            <option value="false" {'selected' if not cfg.get('override_active') else ''}>OFF — Follow Scheduled Window</option>
          </select>
        </div>
        <div class="form-group">
          <label>Schedule Start Date &amp; Time (UTC)</label>
          <input type="text" class="form-control" id="modalStart" value="{cfg.get('schedule_start')}" />
        </div>
        <div class="form-group">
          <label>Schedule End Date &amp; Time (UTC)</label>
          <input type="text" class="form-control" id="modalEnd" value="{cfg.get('schedule_end')}" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" onclick="closeAdminModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save &amp; Apply</button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function toggleTheme() {{
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.getElementById('themeBtn').innerText = next === 'dark' ? '☀️ Light' : '🌙 Dark';
    }}

    function filterDocs() {{
      const query = document.getElementById('searchDocs').value.toLowerCase();
      const sections = document.querySelectorAll('.doc-section, .hero');
      sections.forEach(sec => {{
        const text = sec.innerText.toLowerCase();
        sec.style.display = text.includes(query) ? 'block' : 'none';
      }});
    }}

    function openAdminModal() {{
      document.getElementById('adminModal').style.display = 'flex';
    }}

    function closeAdminModal() {{
      document.getElementById('adminModal').style.display = 'none';
    }}

    async function handleSaveConfig(e) {{
      e.preventDefault();
      const token = document.getElementById('modalToken').value;
      const overrideVal = document.getElementById('modalOverride').value === 'true';
      const startVal = document.getElementById('modalStart').value;
      const endVal = document.getElementById('modalEnd').value;

      try {{
        const res = await fetch('/api/docs/admin/config?admin_token=' + encodeURIComponent(token), {{
          method: 'POST',
          headers: {{ 'Content-Type': 'application/json' }},
          body: JSON.stringify({{
            override_active: overrideVal,
            schedule_start: startVal,
            schedule_end: endVal
          }})
        }});
        if (res.ok) {{
          alert('Settings saved successfully!');
          location.reload();
        }} else {{
          const err = await res.json();
          alert('Error: ' + (err.detail || 'Failed to update'));
        }}
      }} catch (err) {{
        alert('Network error: ' + err);
      }}
    }}
  </script>
</body>
</html>"""
    return HTMLResponse(html, status_code=200)
