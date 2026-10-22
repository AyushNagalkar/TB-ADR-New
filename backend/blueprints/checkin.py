from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from utils.validators import CheckinMessageAppend
from services.supabase_client import supabase
from services.adr_scoring import score_checkin

checkin_bp = Blueprint('checkin', __name__, url_prefix='/api/checkin')

@checkin_bp.route('/', methods=['POST'])
@require_auth
def create_checkin():
    try:
        data = {
            "patient_id": g.user_id,
            "status": "in_progress",
            "conversation_log": []
        }
        res = supabase.table('checkins').insert(data).execute()
        return jsonify({
            "status": "success",
            "id": res.data[0]['id']
        }), 201
    except Exception as e:
        return error_response('CHECKIN_CREATE_FAILED', str(e), 400)

@checkin_bp.route('/<checkin_id>/message', methods=['POST'])
@require_auth
def append_message(checkin_id):
    try:
        data = request.get_json()
        validated = CheckinMessageAppend(**data)
        
        checkin_res = supabase.table('checkins').select('conversation_log').eq('id', checkin_id).eq('patient_id', g.user_id).execute()
        if not checkin_res.data:
            return error_response('NOT_FOUND', 'Checkin not found', 404)
            
        current_log = checkin_res.data[0].get('conversation_log', [])
        current_log.append(validated.model_dump())
        
        update_res = supabase.table('checkins').update({"conversation_log": current_log}).eq('id', checkin_id).execute()
        
        return jsonify({
            "status": "success",
            "checkin": update_res.data[0]
        }), 200
    except Exception as e:
        return error_response('MESSAGE_APPEND_FAILED', str(e), 400)

@checkin_bp.route('/<checkin_id>', methods=['GET'])
@require_auth
def get_checkin(checkin_id):
    try:
        res = supabase.table('checkins').select('*').eq('id', checkin_id).eq('patient_id', g.user_id).execute()
        if not res.data:
            return error_response('NOT_FOUND', 'Checkin not found', 404)
            
        return jsonify({
            "status": "success",
            "checkin": res.data[0]
        }), 200
    except Exception as e:
        return error_response('CHECKIN_FETCH_FAILED', str(e), 400)

@checkin_bp.route('/<checkin_id>/submit', methods=['POST'])
@require_auth
def submit_checkin(checkin_id):
    try:
        # Mark completed
        update_res = supabase.table('checkins').update({"status": "completed"}).eq('id', checkin_id).eq('patient_id', g.user_id).execute()
        if not update_res.data:
            return error_response('NOT_FOUND', 'Checkin not found', 404)
            
        data = request.get_json() or {}
        symptoms = data.get('symptoms', []) # Stub: get symptoms from request payload for now
        
        # Trigger ADR scoring (stub with dummy history/regimen)
        assessment_res = score_checkin(symptoms, [], [])
        
        return jsonify({
            "status": "success",
            "checkin": update_res.data[0],
            "assessment": assessment_res
        }), 200
    except Exception as e:
        return error_response('CHECKIN_SUBMIT_FAILED', str(e), 400)
