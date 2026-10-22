from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from utils.validators import TbProfileCreate
from services.supabase_client import supabase
from datetime import datetime, timedelta

onboarding_bp = Blueprint('onboarding', __name__, url_prefix='/api/onboarding')

@onboarding_bp.route('/profile', methods=['POST'])
@require_auth
def create_profile():
    try:
        data = request.get_json()
        validated_data = TbProfileCreate(**data)
        
        # Insert tb_profile
        profile_data = validated_data.model_dump(mode='json', exclude={'regimen'})
        profile_data['patient_id'] = g.user_id
        
        existing_profile = supabase.table('tb_profiles').select('id').eq('patient_id', g.user_id).execute()
        if existing_profile.data:
            profile_res = supabase.table('tb_profiles').update(profile_data).eq('patient_id', g.user_id).execute()
            profile_id = existing_profile.data[0]['id']
            # Signup seeds demo regimen data; replace it with the user's submitted regimen.
            supabase.table('regimen_drugs').delete().eq('tb_profile_id', profile_id).execute()
            supabase.table('medicine_schedule').delete().eq('patient_id', g.user_id).execute()
        else:
            profile_res = supabase.table('tb_profiles').insert(profile_data).execute()
            profile_id = profile_res.data[0]['id']
        
        # Insert regimen drugs and generate medicine schedule
        drugs = validated_data.regimen
        for drug in drugs:
            drug_data = drug.model_dump()
            drug_data['tb_profile_id'] = profile_id
            supabase.table('regimen_drugs').insert(drug_data).execute()
            
            # Simple schedule generation (stub)
            # e.g., once daily for 30 days
            start_date = datetime.now()
            for i in range(30):
                schedule_date = start_date + timedelta(days=i)
                schedule_data = {
                    'patient_id': g.user_id,
                    'drug_name': drug.drug_name,
                    'scheduled_time': schedule_date.time().replace(second=0, microsecond=0).isoformat(),
                    'course_duration_days': 30,
                    'days_remaining': max(0, 30 - i),
                    'dosage': drug.dosage
                }
                supabase.table('medicine_schedule').insert(schedule_data).execute()
        
        return jsonify({
            "status": "success",
            "profile": profile_res.data[0]
        }), 201
    except Exception as e:
        return error_response(str(e), 'PROFILE_CREATE_FAILED', 400)

@onboarding_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    try:
        profile_res = supabase.table('tb_profiles').select('*, regimen_drugs(*)').eq('patient_id', g.user_id).execute()
        if not profile_res.data:
            return error_response('NOT_FOUND', 'Profile not found', 404)
            
        return jsonify({
            "status": "success",
            "profile": profile_res.data[0]
        }), 200
    except Exception as e:
        return error_response('PROFILE_FETCH_FAILED', str(e), 400)

@onboarding_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    try:
        data = request.get_json()
        res = supabase.table('tb_profiles').update(data).eq('patient_id', g.user_id).execute()
        
        return jsonify({
            "status": "success",
            "profile": res.data[0] if res.data else None
        }), 200
    except Exception as e:
        return error_response('PROFILE_UPDATE_FAILED', str(e), 400)

@onboarding_bp.route('/report', methods=['POST'])
@require_auth
def upload_report():
    try:
        if 'file' not in request.files:
            return error_response('NO_FILE', 'No file part in the request', 400)
            
        file = request.files['file']
        if file.filename == '':
            return error_response('NO_FILE', 'No selected file', 400)
            
        filename = f"{g.user_id}_{datetime.now().timestamp()}_{file.filename}"
        
        # Upload to Supabase Storage
        file_bytes = file.read()
        supabase.storage.from_('reports').upload(filename, file_bytes)
        
        # Get public URL
        report_url = supabase.storage.from_('reports').get_public_url(filename)
        
        # Save to tb_profile
        supabase.table('tb_profiles').update({'report_url': report_url}).eq('patient_id', g.user_id).execute()
        
        return jsonify({
            "status": "success",
            "report_url": report_url
        }), 200
    except Exception as e:
        return error_response('REPORT_UPLOAD_FAILED', str(e), 500)
