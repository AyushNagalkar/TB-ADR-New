from functools import wraps
from flask import request, g
from utils.errors import ApiError
from services.supabase_client import supabase_admin

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        email = (request.headers.get("X-User-Email") or "").strip().lower()
        if not email:
            raise ApiError("User email is required", "UNAUTHORIZED", 401)

        result = supabase_admin.table("patients").select("id").eq("email", email).execute()
        if not result.data:
            raise ApiError("User not found", "UNAUTHORIZED", 401)

        g.user_id = result.data[0]["id"]
        g.user_email = email
        return f(*args, **kwargs)
    return decorated
