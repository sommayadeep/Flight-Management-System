from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    app_name: str = "Flight Management System"
    api_version: str = "v1"
    app_debug: bool = False

    # Database
    database_url: str = "postgresql://user:password@localhost:5432/flight_management"
    auto_create_tables: bool = True
    
    # JWT
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:3003"]

    # Email (for notifications - optional)
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    sender_email: str = "your-email@gmail.com"
    sender_password: str = ""

    # Google OAuth (optional)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    google_callback_url: Optional[str] = None
    frontend_url: str = "http://localhost:3003"

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
        "case_sensitive": False
    }

@lru_cache()
def get_settings():
    return Settings()
