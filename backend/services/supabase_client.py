from supabase import create_client, Client
from config import Config
import logging

logger = logging.getLogger(__name__)

class SupabaseManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseManager, cls).__new__(cls)
            cls._instance.client: Client = create_client(
                Config.SUPABASE_URL,
                Config.SUPABASE_ANON_KEY
            )
            # Service client (admin) — optional, for admin operations
            if Config.SUPABASE_SERVICE_KEY:
                cls._instance.service_client: Client = create_client(
                    Config.SUPABASE_URL,
                    Config.SUPABASE_SERVICE_KEY
                )
            else:
                logger.warning("SUPABASE_SERVICE_KEY not set — admin operations will use anon client")
                cls._instance.service_client = cls._instance.client
        return cls._instance

manager = SupabaseManager()
# Prototype identity is resolved by Flask middleware from the X-User-Email header.
supabase = manager.service_client
supabase_admin = manager.service_client
