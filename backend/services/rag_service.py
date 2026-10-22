"""
RAG Service — PDF extraction, chunking, keyword retrieval, and Ollama-based generation.
No vector DB needed: uses TF-IDF style keyword matching for retrieval (offline-safe).
"""
import re
import math
import logging
import json
from pathlib import Path
from collections import defaultdict

logger = logging.getLogger(__name__)

PDF_DIR = Path("H:/ADR TB/Dataset/knowledge_sources")
CACHE_FILE = Path(__file__).parent / "_rag_cache.json"

# --------------------------------------------------------------------------- #
# 1. PDF extraction                                                            #
# --------------------------------------------------------------------------- #

def _extract_pdf_text(pdf_path: Path) -> str:
    """Extract raw text from a PDF using pdfplumber (best quality)."""
    try:
        import pdfplumber
        pages = []
        with pdfplumber.open(str(pdf_path)) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages.append(text.strip())
        return "\n\n".join(pages)
    except Exception as e:
        logger.warning(f"pdfplumber failed for {pdf_path.name}: {e}, trying pypdf")
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(pdf_path))
            return "\n\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception as e2:
            logger.error(f"pypdf also failed: {e2}")
            return ""


def _chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> list:
    """Split text into overlapping chunks by word count."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return [c for c in chunks if len(c.strip()) > 80]


# --------------------------------------------------------------------------- #
# 2. Cache: build once, reuse                                                  #
# --------------------------------------------------------------------------- #

_corpus: list = []          # [{text, source, chunk_id}]
_idf: dict = {}             # word -> idf weight


def _tokenize(text: str) -> list:
    return re.findall(r"[a-z]{3,}", text.lower())


def _build_corpus():
    global _corpus, _idf

    # Try loading from cache
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            _corpus = data["corpus"]
            _idf = data["idf"]
            logger.info(f"RAG cache loaded: {len(_corpus)} chunks")
            return
        except Exception:
            pass

    logger.info("Building RAG corpus from PDFs...")
    pdfs = list(PDF_DIR.glob("*.pdf"))
    raw_corpus = []

    for pdf in pdfs:
        text = _extract_pdf_text(pdf)
        chunks = _chunk_text(text)
        for i, chunk in enumerate(chunks):
            raw_corpus.append({"text": chunk, "source": pdf.name, "chunk_id": i})

    _corpus = raw_corpus

    # Build IDF
    df: dict = defaultdict(int)
    N = len(_corpus)
    for doc in _corpus:
        tokens = set(_tokenize(doc["text"]))
        for t in tokens:
            df[t] += 1

    _idf = {word: math.log((N + 1) / (count + 1)) for word, count in df.items()}

    # Save cache
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump({"corpus": _corpus, "idf": _idf}, f)
        logger.info(f"RAG corpus cached: {len(_corpus)} chunks from {len(pdfs)} PDFs")
    except Exception as e:
        logger.warning(f"Could not cache corpus: {e}")


def _ensure_corpus():
    if not _corpus:
        _build_corpus()


# --------------------------------------------------------------------------- #
# 3. Retrieval (TF-IDF keyword scoring)                                       #
# --------------------------------------------------------------------------- #

def _score(query_tokens: list, doc_text: str) -> float:
    doc_tokens = _tokenize(doc_text)
    doc_freq = defaultdict(int)
    for t in doc_tokens:
        doc_freq[t] += 1
    N_doc = len(doc_tokens) or 1
    score = 0.0
    for qt in query_tokens:
        tf = doc_freq.get(qt, 0) / N_doc
        idf = _idf.get(qt, 0)
        score += tf * idf
    return score


def retrieve(query: str, top_k: int = 5) -> list:
    """Return top_k most relevant chunks for the query."""
    _ensure_corpus()
    tokens = _tokenize(query)
    if not tokens:
        return []

    scored = [(doc, _score(tokens, doc["text"])) for doc in _corpus]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [doc for doc, score in scored[:top_k] if score > 0]


# --------------------------------------------------------------------------- #
# 4. ADR-symptom to query mapping                                             #
# --------------------------------------------------------------------------- #

SYMPTOM_QUERIES = {
    "Nausea":             "nausea vomiting gastrointestinal adverse reaction TB drugs",
    "Vomiting":           "vomiting gastrointestinal reaction isoniazid rifampicin",
    "Jaundice":           "jaundice hepatotoxicity liver toxicity TB treatment",
    "Fatigue":            "fatigue weakness adverse drug reaction tuberculosis",
    "Tingling/Numbness":  "peripheral neuropathy tingling numbness isoniazid pyridoxine",
    "Vision Change":      "vision ocular toxicity ethambutol optic neuritis",
    "Skin Rash":          "skin rash cutaneous adverse drug reaction TB",
    "Joint Pain":         "arthralgia joint pain pyrazinamide uric acid",
    "Dark Urine":         "dark urine hepatotoxicity bilirubin liver",
    "Headache":           "headache adverse effect TB medication",
    "Dizziness":          "dizziness vertigo adverse drug reaction",
    "Sleep Disruption":   "sleep insomnia adverse effect isoniazid",
    "Loss of Appetite":   "anorexia loss of appetite hepatotoxicity TB drugs",
    "Fever":              "drug fever hypersensitivity adverse reaction rifampicin",
    "Chills":             "chills fever hypersensitivity TB medication",
    "Itching":            "pruritus itching cutaneous reaction TB drugs",
    "Pain":               "pain adverse drug reaction tuberculosis treatment",
}

SOURCE_LABELS = {
    "WHO_2025_TB_Module4_Guidelines.pdf":            "WHO 2025 TB Treatment Guidelines",
    "WHO_2025_TB_Module4_Operational_Handbook.pdf":  "WHO 2025 TB Operational Handbook",
    "WHO_2012_TB_Pharmacovigilance_Handbook.pdf":    "WHO TB Pharmacovigilance Handbook",
    "NTEP_ADR_Ready_Reckoner.pdf":                   "NTEP ADR Ready Reckoner",
}


def get_symptom_cards(symptoms: list) -> list:
    """
    For each detected symptom, retrieve the top WHO excerpts.
    Returns list of cards: {symptom, query, chunks: [{text, source_label}]}
    """
    _ensure_corpus()
    cards = []
    seen_symptoms = set()

    for symptom in symptoms:
        if symptom in seen_symptoms:
            continue
        seen_symptoms.add(symptom)

        query = SYMPTOM_QUERIES.get(symptom, f"{symptom} adverse drug reaction TB treatment WHO")
        chunks = retrieve(query, top_k=3)

        cards.append({
            "symptom": symptom,
            "query": query,
            "chunks": [
                {
                    "text": c["text"][:500],  # truncate for card display
                    "source": SOURCE_LABELS.get(c["source"], c["source"]),
                    "source_file": c["source"],
                }
                for c in chunks
            ]
        })

    return cards


def build_rag_context(symptoms: list, user_query: str = "") -> str:
    """
    Build a full RAG context string to inject into the LLM prompt.
    Retrieves relevant passages for detected symptoms + the user's question.
    """
    _ensure_corpus()
    all_chunks = []
    seen_texts = set()

    # Retrieve for each symptom
    for symptom in symptoms:
        query = SYMPTOM_QUERIES.get(symptom, symptom)
        chunks = retrieve(query, top_k=2)
        for c in chunks:
            key = c["text"][:100]
            if key not in seen_texts:
                seen_texts.add(key)
                all_chunks.append(c)

    # Also retrieve for the user's current question
    if user_query.strip():
        chunks = retrieve(user_query, top_k=3)
        for c in chunks:
            key = c["text"][:100]
            if key not in seen_texts:
                seen_texts.add(key)
                all_chunks.append(c)

    if not all_chunks:
        return ""

    parts = []
    for c in all_chunks[:8]:  # cap at 8 passages to stay within LLM context
        label = SOURCE_LABELS.get(c["source"], c["source"])
        parts.append(f"[{label}]\n{c['text'][:400]}")

    return "\n\n---\n\n".join(parts)


def preload():
    """Call this at startup to warm up the corpus (runs in background)."""
    _build_corpus()
