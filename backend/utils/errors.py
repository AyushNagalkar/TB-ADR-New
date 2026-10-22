from flask import jsonify

class ApiError(Exception):
    def __init__(self, message, code, status_code):
        super().__init__()
        self.message = message
        self.code = code
        self.status_code = status_code

def error_response(message, code, status_code):
    return jsonify({
        "status": "error",
        "code": code,
        "message": message
    }), status_code

def unauthorized(message="Unauthorized"):
    return error_response(message, "UNAUTHORIZED", 401)

def forbidden(message="Forbidden"):
    return error_response(message, "FORBIDDEN", 403)

def not_found(message="Resource not found"):
    return error_response(message, "NOT_FOUND", 404)

def bad_request(message="Bad Request"):
    return error_response(message, "BAD_REQUEST", 400)

def internal_error(message="Internal Server Error"):
    return error_response(message, "INTERNAL_ERROR", 500)
