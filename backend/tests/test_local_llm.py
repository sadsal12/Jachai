import os
import pytest
from app.local_llm import synthesize_local_explanation, query_ollama, query_llamacpp


def test_modelfile_exists():
    """Verify that the Ollama Modelfile is present and correctly configured."""
    modelfile_path = os.path.join(os.path.dirname(__file__), "..", "Modelfile")
    assert os.path.isfile(modelfile_path)
    with open(modelfile_path, "r", encoding="utf-8") as f:
        content = f.read()
    assert "FROM llama3.2:3b" in content
    assert "You are Jachai" in content


def test_deterministic_fallback_when_daemon_offline():
    """Verify that when local Ollama/llama.cpp daemons are offline, synthesis falls back gracefully."""
    claim = "পদ্মা সেতুতে মানুষের মাথা লাগবে"
    fact = "পুলিশ ও সেতু কর্তৃপক্ষ একে ভিত্তিহীন গুজব বলেছে।"
    
    # Should not raise exception even if http://localhost:11434 is unreachable
    resp_bn = synthesize_local_explanation(claim, fact, "rumour", lang="bn", prefer_runtime="ollama")
    assert "যাচাইকৃত তথ্য" in resp_bn
    assert "ভিত্তিহীন" in resp_bn

    resp_en = synthesize_local_explanation(claim, fact, "rumour", lang="en", prefer_runtime="llamacpp")
    assert "Verified Fact" in resp_en
