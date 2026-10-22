from flask import Blueprint, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from services.supabase_client import supabase
from datetime import date, datetime

emergency_bp = Blueprint('emergency', __name__, url_prefix='/api/emergency')

@emergency_bp.route('/', methods=['GET'])
@require_auth
def get_emergency_info():
    try:
        # Fetch profile
        profile_res = supabase.table('tb_profiles').select(
            'doctor_name, doctor_phone, treatment_center, treatment_start_date, regimen_drugs(*)'
        ).eq('patient_id', g.user_id).execute()
        profile_data = profile_res.data[0] if profile_res.data else {}
        
        patient_res = supabase.table('patients').select('name').eq('id', g.user_id).execute()
        patient_name = patient_res.data[0]['name'] if patient_res.data else "Unknown"

        # Latest assessment
        assessment_res = supabase.table('adr_assessments').select('*').eq('patient_id', g.user_id).order('created_at', desc=True).limit(1).execute()
        latest_assessment = assessment_res.data[0] if assessment_res.data else None
        
        recent_symptoms = []
        score = 0
        if latest_assessment:
            recent_symptoms = latest_assessment.get('matched_adrs', [])[:5]
            score = latest_assessment.get('confidence_score', 0)
            
        treatment_start_date = profile_data.get('treatment_start_date')
        regimen = profile_data.get('regimen_drugs', [])
        clinician_summary = {
            "patient_name": patient_name,
            "current_regimen": [
                f"{drug['drug_name']} {drug['dosage']}" for drug in regimen
            ],
            "treatment_day": (
                max(1, (datetime.now().date() - date.fromisoformat(treatment_start_date)).days + 1)
                if treatment_start_date else None
            ),
            "recent_symptoms": recent_symptoms,
            "latest_adr_confidence_score": score,
            "latest_adr_alert": (
                latest_assessment.get('recommended_action')
                if latest_assessment else 'No recent assessment'
            ),
            "last_checkin": (
                latest_assessment.get('created_at')
                if latest_assessment else None
            )
        }

        return jsonify({
            "status": "success",
            "data": {
                "doctor_contact": {
                    "name": profile_data.get('doctor_name'),
                    "address": profile_data.get('treatment_center'),
                    "phone": profile_data.get('doctor_phone')
                },
                "clinician_summary": clinician_summary
            }
        }), 200
    except Exception as e:
        return error_response('EMERGENCY_FETCH_FAILED', str(e), 500)
