import os
from pathlib import Path
from typing import List
import json

BASE_DIR = Path(__file__).resolve().parent.parent.parent

def _default_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    if os.getenv("VERCEL"):
        return f"sqlite:///{Path('/tmp') / 'jaal_drushti.db'}"

    return f"sqlite:///{BASE_DIR / 'jaal_drushti.db'}"

def _parse_cors_origins() -> List[str]:
    raw_origins = os.getenv("CORS_ORIGINS")
    if raw_origins:
        try:
            parsed = json.loads(raw_origins)
            if isinstance(parsed, list):
                return [str(origin) for origin in parsed]
        except json.JSONDecodeError:
            return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    vercel_url = os.getenv("VERCEL_URL")
    if vercel_url:
        origins.append(f"https://{vercel_url}")

    production_url = os.getenv("FRONTEND_URL")
    if production_url:
        origins.append(production_url)

    origins.append("*")
    return origins

class Settings:
    APP_NAME: str = "Jaal Drushti - AI-Powered Lake Water Intelligence"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "production" if os.getenv("VERCEL") else "development")
    
    # Database: use DATABASE_URL when provided; otherwise SQLite locally or /tmp on Vercel.
    DATABASE_URL: str = _default_database_url()
    
    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jaal-drushti-secret-key-production-ready-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = _parse_cors_origins()
    
    # Demo Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"

    # Telegram alert delivery
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "").rstrip("/")
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
    TELEGRAM_CHAT_ID: str = os.getenv("TELEGRAM_CHAT_ID", "").strip()
    TELEGRAM_BOT_USERNAME: str = os.getenv("TELEGRAM_BOT_USERNAME", "").strip().lstrip("@")
    TELEGRAM_REQUEST_TIMEOUT_SECONDS: float = float(os.getenv("TELEGRAM_REQUEST_TIMEOUT_SECONDS", "10"))

    # Prithvi EO water extent model
    # The real model/checkpoint is too large for Vercel serverless functions. For live
    # inference in production, point this app at a separately hosted Prithvi model API.
    PRITHVI_API_BASE_URL: str = os.getenv("PRITHVI_API_BASE_URL", "").strip().rstrip("/")
    PRITHVI_MODEL_ROOT: str = os.getenv("PRITHVI_MODEL_ROOT", "").strip()
    PRITHVI_REQUEST_TIMEOUT_SECONDS: float = float(os.getenv("PRITHVI_REQUEST_TIMEOUT_SECONDS", "300"))
    
    # ML Model Path
    MODEL_DIR: Path = BASE_DIR / "ml" / "models"
    MODEL_FILE: Path = BASE_DIR / "ml" / "models" / "wqi_forecast_model.joblib"

settings = Settings()
