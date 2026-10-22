"""
LLM Chat + ML Analysis Blueprint
Handles Ollama proxy and PubMedBERT sentence analysis.
"""
from flask import Blueprint, request, jsonify, Response, stream_with_context
from middleware.auth import require_auth
from utils.errors import error_response
import requests
import json
import logging

logger = logging.getLogger(__name__)

llm_bp = Blueprint('llm', __name__, url_prefix='/api/llm')

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama3.2:3b"

SYSTEM_PROMPT = """You are MedBot, a warm and empathetic clinical AI assistant helping TB patients on HRZE therapy (Isoniazid, Rifampicin, Pyrazinamide, Ethambutol) with their daily health check-in.

Your role:
- Conduct a structured daily health interview, asking ONE question at a time
- Extract medically relevant information about: medicine adherence, nausea, appetite, fatigue, tingling or numbness, skin rash or changes, vision changes, jaundice signs (yellowing of skin/eyes), urine color, joint pain, sleep quality, fever, abdominal pain
- Be warm, simple, and non-alarming in tone
- Do NOT give medical advice or diagnoses
- After 6-8 patient exchanges, write a brief clinical summary of what the patient reported. In the summary, phrase each symptom as a formal clinical sentence (e.g. "Patient reported nausea following Isoniazid administration."). Then on a new line write exactly: CHECKIN_COMPLETE

Rules:
- Always ask exactly ONE question per response
- Keep responses under 3 sentences
- Use simple non-technical language
- If patient seems distressed, acknowledge their feelings first before asking the next question
- Mention medications by their full name occasionally to verify correct identification
- In the final summary, convert patient language to formal clinical sentences suitable for medical analysis"""


@llm_bp.route('/chat', methods=['POST'])
@require_auth
def chat():
    """
    Proxy chat messages to Ollama with system prompt and patient context.
    Expects: { messages: [{role, content}], patient_name: str, treatment_day: int }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('BAD_REQUEST', 'Request body required', 400)

        messages = data.get('messages', [])
        patient_name = data.get('patient_name', 'Patient')
        treatment_day = data.get('treatment_day', 1)

        # Build system prompt with patient context
        system = SYSTEM_PROMPT + f"\n\nPatient context: Name is {patient_name}, currently on Day {treatment_day} of TB treatment."

        # Build messages array for Ollama
        ollama_messages = [{"role": "system", "content": system}] + messages

        payload = {
            "model": OLLAMA_MODEL,
            "messages": ollama_messages,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
                "num_predict": 200
            }
        }

        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()

        reply = result.get('message', {}).get('content', '')
        is_complete = 'CHECKIN_COMPLETE' in reply

        # Clean up the CHECKIN_COMPLETE marker from display text
        clean_reply = reply.replace('CHECKIN_COMPLETE', '').strip()

        return jsonify({
            "status": "success",
            "reply": clean_reply,
            "is_complete": is_complete,
            "raw_reply": reply
        }), 200

    except requests.exceptions.ConnectionError:
        return error_response('OLLAMA_UNAVAILABLE', 'Ollama is not running. Please start Ollama.', 503)
    except requests.exceptions.Timeout:
        return error_response('OLLAMA_TIMEOUT', 'LLM took too long to respond. Please try again.', 504)
    except Exception as e:
        logger.error(f"LLM chat error: {e}")
        return error_response('LLM_ERROR', str(e), 500)


@llm_bp.route('/analyze', methods=['POST'])
@require_auth
def analyze():
    """
    Analyze patient conversation text with PubMedBERT.
    Expects: { conversation_text: str }
    Returns: { sentences, flagged_count, total_sentences, adr_risk_percent, adr_detected }
    """
    try:
        data = request.get_json()
        if not data:
            return error_response('BAD_REQUEST', 'Request body required', 400)

        conversation_text = data.get('conversation_text', '').strip()
        if not conversation_text:
            return error_response('BAD_REQUEST', 'conversation_text is required', 400)

        from services.ml_classifier import analyze_conversation
        result = analyze_conversation(conversation_text)

        return jsonify({
            "status": "success",
            **result
        }), 200

    except Exception as e:
        logger.error(f"ML analysis error: {e}")
        return error_response('ANALYSIS_ERROR', str(e), 500)
