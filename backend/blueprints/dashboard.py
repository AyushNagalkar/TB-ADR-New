from flask import Blueprint, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from services.supabase_client import supabase
from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/', methods=['GET'])
@require_auth
def get_dashboard():
    try:
        # Stub implementations for dashboard data
        # Today's schedule
        now = datetime.now().astimezone()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        tomorrow_start = today_start + timedelta(days=1)
        schedule_res = supabase.table('medicine_schedule').select('*').eq('patient_id', g.user_id).execute()
        
        # Latest assessment
        assessment_res = supabase.table('adr_assessments').select('*').eq('patient_id', g.user_id).order('created_at', desc=True).limit(1).execute()
        latest_assessment = assessment_res.data[0] if assessment_res.data else None
        
        risk_status = 'normal'
        if latest_assessment:
            action = latest_assessment.get('recommended_action')
            if action == 'contact_doctor':
                risk_status = 'elevated'
            elif action == 'seek_care_now':
                risk_status = 'critical'
                
        # Checkin done today
        checkin_res = (
            supabase.table('checkins')
            .select('id')
            .eq('patient_id', g.user_id)
            .eq('status', 'completed')
            .gte('created_at', today_start.isoformat())
            .lt('created_at', tomorrow_start.isoformat())
            .execute()
        )
        checkin_done_today = len(checkin_res.data) > 0
        
        # Recent symptoms (stub from recent assessments)
        recent_symptoms = []
        if latest_assessment:
            recent_symptoms = latest_assessment.get('matched_adrs', [])[:5]

        return jsonify({
            "status": "success",
            "data": {
                "today_schedule": schedule_res.data,
                "risk_status": risk_status,
                "recent_symptoms": recent_symptoms,
                "checkin_done_today": checkin_done_today,
                "latest_assessment": latest_assessment
            }
        }), 200
    except Exception as e:
        return error_response(str(e), 'DASHBOARD_FETCH_FAILED', 500)
