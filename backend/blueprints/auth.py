from flask import Blueprint, request, jsonify
from datetime import date
import hashlib
import hmac
import uuid
from utils.errors import error_response
from utils.validators import SignupRequest, LoginRequest
from services.supabase_client import supabase, supabase_admin

def hash_password(password, salt=None):
    salt = salt or hashlib.sha256(uuid.uuid4().bytes).hexdigest()
    digest = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 200000).hex()
    return salt, digest

def seed_patient_data(patient_id):
    profile = supabase_admin.table('tb_profiles').insert({
        'patient_id': patient_id,
        'treatment_start_date': date.today().isoformat(),
        'treatment_center': 'City TB Hospital',
        'doctor_name': 'Dr. Rajesh Kumar'
    }).execute().data[0]
    drugs = [
        ('Isoniazid', '300mg', 'once'),
        ('Rifampicin', '600mg', 'once'),
        ('Pyrazinamide', '1500mg', 'once'),
        ('Ethambutol', '1200mg', 'once')
    ]
    for name, dosage, frequency in drugs:
        supabase_admin.table('regimen_drugs').insert({
            'tb_profile_id': profile['id'], 'drug_name': name,
            'dosage': dosage, 'frequency': frequency
        }).execute()
        supabase_admin.table('medicine_schedule').insert({
            'patient_id': patient_id, 'drug_name': name, 'dosage': dosage,
            'scheduled_time': '08:00:00', 'course_duration_days': 180,
            'days_remaining': 180
        }).execute()

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        validated_data = SignupRequest(**data)
        
        existing = supabase_admin.table('patients').select('id').eq('email', validated_data.email).execute()
        if existing.data:
            return error_response('Email is already registered', 'EMAIL_EXISTS', 409)
        user_id = str(uuid.uuid4())
        salt, password_hash = hash_password(validated_data.password)
        patient_data = {
                "id": user_id,
                "name": validated_data.name,
                "email": validated_data.email,
                "phone": validated_data.phone,
                "language": validated_data.language,
                "caregiver_contact": validated_data.caregiver_contact
        }
        supabase_admin.table('patients').insert(patient_data).execute()
        supabase_admin.table('local_credentials').insert({
            'patient_id': user_id, 'password_hash': password_hash, 'password_salt': salt
        }).execute()
        seed_patient_data(user_id)
        
        return jsonify({
            "status": "success",
            "user": {**patient_data, "password": None}
        }), 201
    except Exception as e:
        return error_response(str(e), 'SIGNUP_FAILED', 400)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        validated_data = LoginRequest(**data)
        
        patient_res = supabase_admin.table('patients').select('*').eq('email', validated_data.email).execute()
        if not patient_res.data:
            return error_response('Invalid email or password', 'LOGIN_FAILED', 401)
        patient = patient_res.data[0]
        credentials_res = supabase_admin.table('local_credentials').select('*').eq('patient_id', patient['id']).execute()
        if not credentials_res.data:
            return error_response('Invalid email or password', 'LOGIN_FAILED', 401)
        credentials = credentials_res.data[0]
        _, password_hash = hash_password(validated_data.password, credentials['password_salt'])
        if not hmac.compare_digest(password_hash, credentials['password_hash']):
            return error_response('Invalid email or password', 'LOGIN_FAILED', 401)
        return jsonify({
            "status": "success",
            "user": patient
        }), 200
    except Exception as e:
        return error_response(str(e), 'LOGIN_FAILED', 401)

@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        return jsonify({
            "status": "success",
            "message": "Logged out successfully"
        }), 200
    except Exception as e:
        return error_response('LOGOUT_FAILED', str(e), 400)
