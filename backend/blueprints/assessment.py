from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from services.supabase_client import supabase
from services.adr_scoring import score_checkin

assessment_bp = Blueprint('assessment', __name__, url_prefix='/api/assessment')

@assessment_bp.route('/<assessment_id>', methods=['GET'])
@require_auth
def get_assessment(assessment_id):
    try:
        res = supabase.table('adr_assessments').select('*').eq('id', assessment_id).eq('patient_id', g.user_id).execute()
        if not res.data:
            return error_response('NOT_FOUND', 'Assessment not found', 404)
        return jsonify({
            "status": "success",
            "assessment": res.data[0]
        }), 200
    except Exception as e:
        return error_response('ASSESSMENT_FETCH_FAILED', str(e), 400)

@assessment_bp.route('/', methods=['GET'])
@require_auth
def list_assessments():
    try:
        res = supabase.table('adr_assessments').select('*').eq('patient_id', g.user_id).order('created_at', desc=True).execute()
        return jsonify({
            "status": "success",
            "assessments": res.data
        }), 200
    except Exception as e:
        return error_response('ASSESSMENTS_FETCH_FAILED', str(e), 400)

@assessment_bp.route('/score', methods=['POST'])
@require_auth
def score():
    try:
        data = request.get_json()
        checkin_id = data.get('checkin_id')
        if not checkin_id:
            return error_response('MISSING_PARAM', 'checkin_id is required', 400)
            
        # Stub fetching symptoms, dose history, and regimen
        # In real impl, fetch these from DB using patient_id and checkin_id
        symptoms = data.get('symptoms', [])
        
        assessment_result = score_checkin(symptoms, [], [])
        
        # Save assessment
        assessment_data = {
            "patient_id": g.user_id,
            "checkin_id": checkin_id,
            "confidence_score": assessment_result['confidence_score'],
            "recommended_action": assessment_result['recommended_action'],
            "matched_adrs": assessment_result['matched_adrs'],
            "root_cause_drug": assessment_result['root_cause_drug'],
            "explanation": assessment_result['explanation']
        }
        save_res = supabase.table('adr_assessments').insert(assessment_data).execute()
        
        return jsonify({
            "status": "success",
            "assessment": save_res.data[0]
        }), 201
    except Exception as e:
        return error_response('SCORE_FAILED', str(e), 400)
