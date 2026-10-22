from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from utils.validators import DoseLogCreate
from services.supabase_client import supabase

schedule_bp = Blueprint('schedule', __name__, url_prefix='/api/schedule')

@schedule_bp.route('/', methods=['GET'])
@require_auth
def get_schedule():
    try:
        res = supabase.table('medicine_schedule').select('*').eq('patient_id', g.user_id).execute()
        return jsonify({
            "status": "success",
            "schedule": res.data
        }), 200
    except Exception as e:
        return error_response('SCHEDULE_FETCH_FAILED', str(e), 400)

@schedule_bp.route('/dose', methods=['POST'])
@require_auth
def log_dose():
    try:
        data = request.get_json()
        validated = DoseLogCreate(**data)
        
        log_data = validated.model_dump()
        log_data['patient_id'] = g.user_id
        
        res = supabase.table('dose_logs').insert(log_data).execute()
        
        return jsonify({
            "status": "success",
            "dose_log": res.data[0]
        }), 201
    except Exception as e:
        return error_response('DOSE_LOG_FAILED', str(e), 400)

@schedule_bp.route('/adherence', methods=['GET'])
@require_auth
def get_adherence():
    try:
        logs_res = supabase.table('dose_logs').select('*').eq('patient_id', g.user_id).order('log_time').execute()
        logs = logs_res.data
        
        total_doses = len(logs)
        taken = sum(1 for log in logs if log['status'] == 'taken')
        missed = sum(1 for log in logs if log['status'] == 'missed')
        
        current_streak = 0
        longest_streak = 0
        
        for log in logs:
            if log['status'] == 'taken':
                current_streak += 1
                longest_streak = max(longest_streak, current_streak)
            else:
                current_streak = 0
                
        return jsonify({
            "status": "success",
            "adherence": {
                "total_doses": total_doses,
                "takenCount": taken,
                "missedCount": missed,
                "current_streak": current_streak,
                "longest_streak": longest_streak
            }
        }), 200
    except Exception as e:
        return error_response('ADHERENCE_FETCH_FAILED', str(e), 400)
