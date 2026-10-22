import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class Config:
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
    FLASK_SECRET_KEY = os.environ.get("FLASK_SECRET_KEY", "dev-secret-key")
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")
    FLASK_ENV = os.environ.get("FLASK_ENV", "production")

    @classmethod
    def validate(cls):
        required_vars = [
            "SUPABASE_URL",
            "SUPABASE_ANON_KEY",
        ]
        optional_vars = ["SUPABASE_SERVICE_KEY"]
        missing = [v for v in required_vars if not getattr(cls, v)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        missing_optional = [v for v in optional_vars if not getattr(cls, v)]
        if missing_optional:
            logger.warning(f"Optional env vars not set (some features may not work): {', '.join(missing_optional)}")

Config.validate()
