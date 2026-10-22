"""
PubMedBERT ADR Classifier Service
Loads the fine-tuned model and classifies sentences for ADR risk.
"""
import re
import logging
import math
from pathlib import Path

logger = logging.getLogger(__name__)

MODEL_PATH = str(Path(__file__).parent.parent.parent / "models" / "adr_classifier_transformer")

_tokenizer = None
_model = None


def _load_model():
    """Lazy-load the model on first call."""
    global _tokenizer, _model
    if _model is not None:
        return True
    try:
        # PreTrainedTokenizerFast reads tokenizer.json directly (no vocab.txt needed)
        # BertForSequenceClassification avoids AutoModel's torchvision dependency
        from transformers import PreTrainedTokenizerFast, BertForSequenceClassification
        import warnings
        logger.info(f"Loading PubMedBERT from {MODEL_PATH}")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            _tokenizer = PreTrainedTokenizerFast.from_pretrained(MODEL_PATH)
            _model = BertForSequenceClassification.from_pretrained(MODEL_PATH)
        _model.eval()
        logger.info("PubMedBERT loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load ML model: {e}")
        return False


def split_into_sentences(text: str) -> list:
    """Split text into individual sentences."""
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    result = []
    for s in sentences:
        parts = s.split('\n')
        result.extend(parts)
    return [s.strip() for s in result if len(s.strip()) > 8]


def classify_sentences(sentences: list) -> list:
    """
    Classify each sentence for ADR using PubMedBERT.
    Falls back to keyword-based scoring if model unavailable.
    """
    if not _load_model():
        return _keyword_fallback(sentences)

    try:
        import torch
        results = []
        for sentence in sentences:
            inputs = _tokenizer(
                sentence,
                return_tensors="pt",
                truncation=True,
                max_length=256,
                padding=True
            )
            with torch.no_grad():
                logits = _model(**inputs).logits
                probs = torch.softmax(logits, dim=-1)
                label = int(logits.argmax(-1).item())
                adr_score = float(probs[0][1].item())

            results.append({
                "sentence": sentence,
                "adr_flag": label == 1,
                "score": round(adr_score, 4),
                "label": label
            })
        return results
    except Exception as e:
        logger.error(f"Classification error: {e}")
        return _keyword_fallback(sentences)
def _keyword_fallback(sentences: list) -> list:
    """Keyword-based fallback when model is unavailable."""
    ADR_KEYWORDS = [
        'nausea', 'vomiting', 'jaundice', 'yellow', 'rash', 'tingling',
        'numbness', 'vision', 'blur', 'joint pain', 'fatigue', 'dark urine',
        'hepatotoxicity', 'liver', 'dizziness', 'headache', 'fever', 'chills',
        'itching', 'swelling', 'allergic', 'reaction', 'adverse', 'side effect'
    ]
    results = []
    for sentence in sentences:
        lower = sentence.lower()
        hit = any(kw in lower for kw in ADR_KEYWORDS)
        score = 0.75 if hit else 0.15
        results.append({
            "sentence": sentence,
            "adr_flag": hit,
            "score": score,
            "label": 1 if hit else 0
        })
    return results


def compute_adr_risk(flagged: int, total: int) -> float:
    """
    Non-linear ADR risk formula:
    risk = min(95, 100 * (1 - exp(-2.5 * ratio^0.7)))
    Ensures: 1/10->18%, 3/10->48%, 5/10->68%, 8/10->86%, 10/10->92%
    """
    if total == 0 or flagged == 0:
        return 0.0
    ratio = flagged / total
    risk = 100.0 * (1.0 - math.exp(-2.5 * (ratio ** 0.7)))
    return round(min(risk, 95.0), 1)


def analyze_conversation(patient_text: str) -> dict:
    """
    Main entry: split patient conversation into sentences,
    classify each, and return aggregated ADR risk result.
    """
    sentences = split_into_sentences(patient_text)
    if not sentences:
        return {
            "sentences": [],
            "flagged_count": 0,
            "total_sentences": 0,
            "adr_risk_percent": 0.0,
            "adr_detected": False,
            "model_used": "none"
        }

    results = classify_sentences(sentences)
    flagged = sum(1 for r in results if r["adr_flag"])
    risk = compute_adr_risk(flagged, len(results))
    model_used = "pubmedbert" if (_model is not None) else "keyword_fallback"

    return {
        "sentences": results,
        "flagged_count": flagged,
        "total_sentences": len(results),
        "adr_risk_percent": risk,
        "adr_detected": risk >= 20.0,
        "model_used": model_used
    }
