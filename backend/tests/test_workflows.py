import json
import os
import pytest
import sys

# Ensure repo root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from workflows.langgraph_verification_pipeline import LangGraphVerificationPipeline


def test_n8n_workflow_file_validity():
    """Verify that n8n workflow JSON is syntactically valid and has required nodes."""
    workflow_path = os.path.join(os.path.dirname(__file__), "..", "..", "workflows", "n8n_jachai_factcheck_ingest.json")
    assert os.path.isfile(workflow_path), "n8n workflow file must exist"
    
    with open(workflow_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    assert data["name"] == "Jachai - Automated Fact-Check Ingestion & Monitoring Pipeline"
    assert "nodes" in data and len(data["nodes"]) >= 6
    assert "connections" in data
    
    node_names = [n["name"] for n in data["nodes"]]
    assert any("Schedule" in name or "Trigger" in name for name in node_names)
    assert any("Poll Rumor Scanner" in name or "RSS" in name for name in node_names)
    assert any("AI Claim" in name or "Extractor" in name for name in node_names)
    assert any("Jachai" in name or "Verification" in name for name in node_names)


def test_langgraph_pipeline_hoax_match():
    """Verify that the verification state machine identifies a known hoax."""
    pipeline = LangGraphVerificationPipeline()
    claim = "পদ্মা সেতুতে মানুষের মাথা লাগবে বলে গুজব ছড়ানো হয়েছে"
    result = pipeline.run(claim, input_type="text")
    
    assert result["verdict"] == "FAKE"
    assert result["confidence"] >= 0.58
    assert result["decision_path"] == "known_hoax"
    assert "পুলিশ ও সেতু কর্তৃপক্ষ" in result["explanation_bn"]


def test_langgraph_pipeline_clean_text():
    """Verify that unflagged ordinary statements pass through as authentic/inconclusive."""
    pipeline = LangGraphVerificationPipeline()
    normal_text = "আজকে আবহাওয়া খুব সুন্দর এবং রোদ উঠেছে ঢাকা শহরে"
    result = pipeline.run(normal_text, input_type="text")
    
    assert result["decision_path"] in ("clean", "uncertain")
    assert result["verdict"] in ("AUTHENTIC", "UNCERTAIN")
