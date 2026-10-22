from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from services.supabase_client import supabase

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('/', methods=['GET'])
@require_auth
def get_profile():
    try:
        res = supabase.table('patients').select('*').eq('id', g.user_id).execute()
        if not res.data:
            return error_response('NOT_FOUND', 'Patient not found', 404)
        return jsonify({
            "status": "success",
            "patient": res.data[0]
        }), 200
    except Exception as e:
        return error_response('PROFILE_FETCH_FAILED', str(e), 400)

@profile_bp.route('/', methods=['PUT'])
@require_auth
def update_profile():
    try:
        data = request.get_json()
        res = supabase.table('patients').update(data).eq('id', g.user_id).execute()
        
        return jsonify({
            "status": "success",
            "patient": res.data[0] if res.data else None
        }), 200
    except Exception as e:
        return error_response('PROFILE_UPDATE_FAILED', str(e), 400)

@profile_bp.route('/', methods=['DELETE'])
@require_auth
def delete_profile():
    try:
        # TODO: Implement soft delete
        return jsonify({
            "status": "success",
            "message": "Profile deleted (stub)"
        }), 200
    except Exception as e:
        return error_response('PROFILE_DELETE_FAILED', str(e), 400)
