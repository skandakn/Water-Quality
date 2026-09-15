import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    APP_NAME: str = "Jaal Drushti - AI-Powered Lake Water Intelligence"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = os.getenv("APP_ENV", "development")
    
    # Database: Default to sqlite locally if DATABASE_URL not set or postgres unavailable
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'jaal_drushti.db'}"
    )
    
    # JWT Auth
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jaal-drushti-secret-key-production-ready-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Demo Mode
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    # ML Model Path
    MODEL_DIR: Path = BASE_DIR / "ml" / "models"
    MODEL_FILE: Path = BASE_DIR / "ml" / "models" / "wqi_forecast_model.joblib"

settings = Settings()
