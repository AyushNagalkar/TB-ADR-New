"""
RAG Blueprint — symptom cards and chat endpoints.
"""
from flask import Blueprint, request, jsonify
from middleware.auth import require_auth
from utils.errors import error_response
import requests
import logging

logger = logging.getLogger(__name__)

rag_bp = Blueprint('rag', __name__, url_prefix='/api/rag')

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3.2:3b"

RAG_SYSTEM_PROMPT = """You are a clinical WHO health advisor for TB patients. You answer questions based ONLY on the provided WHO guidelines and medical references given to you as context.

Rules:
- Answer only from the provided context passages
- Quote the source (WHO guideline name) when giving specific recommendations
- Be clear, empathetic, and non-alarming
- If the context does not cover the question, say: "The provided WHO guidelines do not specifically address this. Please consult your doctor."
- Do NOT make up medical advice beyond what is in the context
- Keep answers concise (3-5 sentences max per point)"""


@rag_bp.route('/cards', methods=['POST'])
@require_auth
def symptom_cards():
    """
    Get WHO guideline cards for detected symptoms.
    Expects: { symptoms: string[], ml_risk: number }
    """
    try:
        data = request.get_json() or {}
        symptoms = data.get('symptoms', [])
        if not symptoms:
            return jsonify({"status": "success", "cards": []}), 200

        from services.rag_service import get_symptom_cards
        cards = get_symptom_cards(symptoms)

        return jsonify({"status": "success", "cards": cards}), 200

    except Exception as e:
        logger.error(f"RAG cards error: {e}")
        return error_response('RAG_ERROR', str(e), 500)


@rag_bp.route('/chat', methods=['POST'])
@require_auth
def rag_chat():
    """
    RAG-powered chat. Retrieves WHO context for symptoms + user question,
    then calls Ollama with augmented prompt.
    Expects: { messages: [{role,content}], symptoms: string[], user_query: string }
    """
    try:
        data = request.get_json() or {}
        messages = data.get('messages', [])
        symptoms = data.get('symptoms', [])
        user_query = data.get('user_query', '')

        from services.rag_service import build_rag_context
        context = build_rag_context(symptoms, user_query)

        # Build augmented system prompt
        symptom_str = ", ".join(symptoms) if symptoms else "general TB medication concerns"
        system = RAG_SYSTEM_PROMPT
        if context:
            system += f"""

PATIENT CONTEXT:
Detected symptoms/concerns: {symptom_str}

WHO GUIDELINES & REFERENCES (use these to answer):
{context}"""

        ollama_messages = [{"role": "system", "content": system}] + messages

        payload = {
            "model": OLLAMA_MODEL,
            "messages": ollama_messages,
            "stream": False,
            "options": {"temperature": 0.4, "num_predict": 300}
        }

        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        reply = result.get('message', {}).get('content', '')

        return jsonify({"status": "success", "reply": reply}), 200

    except requests.exceptions.ConnectionError:
        return error_response('OLLAMA_UNAVAILABLE', 'Ollama is not running.', 503)
    except Exception as e:
        logger.error(f"RAG chat error: {e}")
        return error_response('RAG_CHAT_ERROR', str(e), 500)


@rag_bp.route('/preload', methods=['POST'])
def preload_corpus():
    """Trigger corpus preload (call once on startup)."""
    try:
        from services.rag_service import preload
        import threading
        threading.Thread(target=preload, daemon=True).start()
        return jsonify({"status": "success", "message": "Corpus preload started"}), 200
    except Exception as e:
        return error_response('PRELOAD_ERROR', str(e), 500)
