from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.prithvi_adapter import (
    PrithviServiceError,
    analyze_prithvi_upload,
    get_prithvi_status,
    run_prithvi_demo,
)


router = APIRouter(prefix="/api/prithvi", tags=["Prithvi EO Model"])


@router.get("/status")
def status():
    return get_prithvi_status()


@router.post("/demo")
def demo():
    return run_prithvi_demo()


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    try:
        return await analyze_prithvi_upload(file)
    except PrithviServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
