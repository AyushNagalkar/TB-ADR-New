from flask import Flask, jsonify
from flask_cors import CORS
import logging
from config import Config
from utils.errors import ApiError, error_response

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Configure CORS
    CORS(app, origins=Config.CORS_ORIGINS)

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
    )
    logger = logging.getLogger(__name__)

    # Register blueprints
    from blueprints.auth import auth_bp
    from blueprints.onboarding import onboarding_bp
    from blueprints.schedule import schedule_bp
    from blueprints.checkin import checkin_bp
    from blueprints.assessment import assessment_bp
    from blueprints.education import education_bp
    from blueprints.dashboard import dashboard_bp
    from blueprints.emergency import emergency_bp
    from blueprints.profile import profile_bp
    from blueprints.llm import llm_bp
    from blueprints.rag import rag_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(onboarding_bp)
    app.register_blueprint(schedule_bp)
    app.register_blueprint(checkin_bp)
    app.register_blueprint(assessment_bp)
    app.register_blueprint(education_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(emergency_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(llm_bp)
    app.register_blueprint(rag_bp)

    # Preload RAG corpus on startup in background thread
    import threading
    from services.rag_service import preload
    threading.Thread(target=preload, daemon=True).start()

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "success", "message": "Server is healthy"})

    # Error handlers
    @app.errorhandler(ApiError)
    def handle_api_error(error):
        return error_response(error.message, error.code, error.status_code)

    @app.errorhandler(400)
    def bad_request(error):
        return error_response("Bad Request", "BAD_REQUEST", 400)

    @app.errorhandler(404)
    def not_found(error):
        return error_response("Resource not found", "NOT_FOUND", 404)

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.error(f"Internal Server Error: {error}")
        return error_response("Internal server error", "INTERNAL_ERROR", 500)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=(Config.FLASK_ENV == 'development') , use_reloader=False)
