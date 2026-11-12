"""
Jachai Local LLM Runtime Integration (Ollama & llama.cpp)

Enables 100% offline, privacy-first, zero-cost local LLM inference for:
1. Synthesizing bilingual, empathetic explanations for complex fact-checks.
2. Generating claim variants / aliases from raw text.
3. Running local open-weight models (Llama 3.2 3B, Qwen 2.5 3B/7B) via Ollama or llama.cpp.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)

# Default local runtime endpoints
OLLAMA_API_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/generate")
LLAMACPP_API_URL = os.getenv("LLAMACPP_API_URL", "http://localhost:8080/completion")
DEFAULT_MODEL = os.getenv("LOCAL_LLM_MODEL", "llama3.2:3b")


def query_ollama(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.2,
    timeout: float = 8.0,
) -> Optional[str]:
    """
    Sends a generation request to a local Ollama daemon (http://localhost:11434).
    Uses Q4_K_M quantized open-weight models (e.g., Llama-3.2-3B, Qwen2.5-3B).
    """
    payload: Dict[str, Any] = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": 256,
        }
    }
    if system_prompt:
        payload["system"] = system_prompt

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        OLLAMA_API_URL,
        data=data,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                body = json.loads(response.read().decode("utf-8"))
                return body.get("response", "").strip()
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, Exception) as e:
        logger.debug(f"Ollama local runtime not reachable ({e}); falling back to deterministic synthesis.")
        return None


def query_llamacpp(
    prompt: str,
    endpoint: str = LLAMACPP_API_URL,
    temperature: float = 0.2,
    timeout: float = 8.0,
) -> Optional[str]:
    """
    Sends a completion request to a local llama.cpp server instance.
    Runs raw GGUF quants (Q4_K_M, Q5_K_M) with zero Python overhead.
    """
    payload = {
        "prompt": prompt,
        "temperature": temperature,
        "n_predict": 256,
        "stop": ["\n\n", "User:", "Assistant:"]
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=data,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                body = json.loads(response.read().decode("utf-8"))
                return body.get("content", "").strip()
    except Exception as e:
        logger.debug(f"llama.cpp local runtime not reachable ({e}); falling back to deterministic synthesis.")
        return None


def synthesize_local_explanation(
    claim: str,
    fact: str,
    category: str,
    lang: str = "bn",
    prefer_runtime: str = "ollama"
) -> str:
    """
    Synthesizes a clear, culturally contextual explanation using local open-weight LLMs.
    Guarantees zero data leakage and zero cloud API charges.
    """
    system_prompt = (
        "You are Jachai, a trusted, neutral misinformation debunking assistant in Bangladesh. "
        "Explain fact-checks clearly, objectively, and politely. Never scold the user."
    )
    
    if lang == "bn":
        prompt = (
            f"দাবি: {claim}\n"
            f"আসল সত্য: {fact}\n"
            f"বিষয়শ্রেণী: {category}\n\n"
            "এই ভুয়া খবরটি সম্পর্কে পরিবার বা বন্ধুদের বুঝিয়ে বলার জন্য ২ বাক্যে একটি সহজ, "
            "ভদ্র ও স্পষ্ট বার্তা বাংলায় তৈরি করুন:"
        )
    else:
        prompt = (
            f"Claim: {claim}\n"
            f"Verified Fact: {fact}\n"
            f"Category: {category}\n\n"
            "Write a concise, polite, 2-sentence explanation debunking this claim for a family chat group:"
        )

    response = None
    if prefer_runtime == "ollama":
        response = query_ollama(prompt, system_prompt=system_prompt)
    elif prefer_runtime == "llamacpp":
        response = query_llamacpp(f"{system_prompt}\n\n{prompt}")

    if response:
        return response

    # Deterministic offline fallback if daemon is offline
    if lang == "bn":
        return f"যাচাইকৃত তথ্য: {fact} (দাবিটি সম্পূর্ণ ভিত্তিহীন)।"
    return f"Verified Fact: {fact} (The circulated claim is unsubstantiated)."
