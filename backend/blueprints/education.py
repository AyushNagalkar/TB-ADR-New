from flask import Blueprint, request, jsonify, g
from middleware.auth import require_auth
from utils.errors import error_response
from services.supabase_client import supabase

education_bp = Blueprint('education', __name__, url_prefix='/api/education')

@education_bp.route('/', methods=['GET'])
@require_auth
def list_education():
    try:
        drug = request.args.get('drug')
        adr = request.args.get('adr')
        
        query = supabase.table('education_content').select('*')
        
        if drug:
            query = query.ilike('drug_name', f'%{drug}%')
        if adr:
            query = query.eq('adr_name', adr)
            
        res = query.execute()
        return jsonify({
            "status": "success",
            "education_content": res.data
        }), 200
    except Exception as e:
        return error_response('EDUCATION_FETCH_FAILED', str(e), 400)

@education_bp.route('/<content_id>', methods=['GET'])
@require_auth
def get_education(content_id):
    try:
        res = supabase.table('education_content').select('*').eq('id', content_id).execute()
        if not res.data:
            return error_response('NOT_FOUND', 'Content not found', 404)
            
        return jsonify({
            "status": "success",
            "content": res.data[0]
        }), 200
    except Exception as e:
        return error_response('EDUCATION_FETCH_FAILED', str(e), 400)
