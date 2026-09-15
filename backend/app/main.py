import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BACKEND_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BACKEND_DIR.parent

for path in (ROOT_DIR, BACKEND_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.models import Lake
from app.routers import (
    auth, lakes, dashboard, water_quality, 
    wqi, trends, predictions, satellite, alerts, reports, telegram, prithvi
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables exist
    print(f"[{settings.APP_NAME}] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if database is brand new
    db = SessionLocal()
    try:
        lake_count = db.query(Lake).count()
        if lake_count == 0:
            print(f"[{settings.APP_NAME}] Fresh database detected. Executing auto-seed...")
            try:
                from database.seed.seed_data import seed_database
                seed_database()
            except Exception as e:
                print(f"[{settings.APP_NAME}] Notice: Auto-seed script encountered: {e}")
        else:
            print(f"[{settings.APP_NAME}] Database connected with {lake_count} registered lakes.")
    except Exception as e:
        print(f"[{settings.APP_NAME}] DB check note: {e}")
    finally:
        db.close()
        
    yield
    print(f"[{settings.APP_NAME}] Shutting down.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Centralized AI-Powered Lake Water Quality Index Monitor & Trend Analyzer (PS 4.2)",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API Routers
app.include_router(auth.router)
app.include_router(lakes.router)
app.include_router(dashboard.router)
app.include_router(water_quality.router)
app.include_router(wqi.router)
app.include_router(trends.router)
app.include_router(predictions.router)
app.include_router(satellite.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(telegram.router)
app.include_router(prithvi.router)

@app.get("/")
def root_endpoint():
    return {
        "platform": settings.APP_NAME,
        "tagline": "See. Analyze. Predict. Protect.",
        "status": "online",
        "docs_url": "/docs",
        "version": settings.APP_VERSION
    }

@app.get("/api")
def api_root_endpoint():
    return root_endpoint()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "engine": "WAWQI_v1.0",
        "ml_service": "RF_TS_v1.0",
        "prithvi_service": "proxy_configured" if settings.PRITHVI_API_BASE_URL else "demo_ready",
        "mode": "DEMO / HACKATHON" if settings.DEMO_MODE else "PRODUCTION"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

