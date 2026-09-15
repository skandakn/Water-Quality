from __future__ import annotations

import json
import mimetypes
import os
import uuid
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from fastapi import UploadFile

from app.config import settings


PRITHVI_CHECKPOINT_NAME = "Prithvi-EO-V2-300M-TL-Sen1Floods11.pt"
PRITHVI_DEMO_IMAGE = "India_900498_S2Hand.tif"

DEMO_RESULT: Dict[str, Any] = {
    "job_id": "demo_prithvi_sen1floods11",
    "water_pixels": 123096,
    "total_pixels": 262144,
    "valid_pixels": 262144,
    "water_percentage": 46.96,
    "water_area_km2": 10.993,
    "area_is_estimated": True,
    "status": "Water Detected",
    "risk_level": "MODERATE",
    "risk_label": "Significant water extent detected.",
    "ai_summary": (
        "Prithvi EO V2 detected water across 46.96% of the Sentinel-2 scene, "
        "representing an estimated 10.993 km2 surface-water footprint. Use this "
        "output for spatial extent monitoring; pair it with sensor telemetry for WQI."
    ),
    "model": "Prithvi EO V2 300M TL - Sen1Floods11",
    "source": "Bundled demo scene from Pruthvi-model/water_model/examples",
    "images": {
        "original_rgb": "/prithvi/demo/original_rgb.png",
        "water_mask": "/prithvi/demo/water_mask.png",
        "overlay": "/prithvi/demo/overlay.png",
    },
}


class PrithviServiceError(RuntimeError):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


def get_prithvi_status() -> Dict[str, Any]:
    local_root = _resolve_local_root()
    local_files = _inspect_local_files(local_root)
    external = _external_health()

    external_ready = bool(external.get("reachable") and external.get("model_loaded", True))
    local_ready = bool(local_files["checkpoint_found"] and local_files["demo_image_found"])
    mode = "external" if external_ready else "local-ready" if local_ready else "demo"

    return {
        "configured": external_ready or local_ready,
        "mode": mode,
        "external_api_configured": bool(settings.PRITHVI_API_BASE_URL),
        "external_api_reachable": external.get("reachable", False),
        "external_api_base_url": _safe_external_url(),
        "external_model_loaded": external.get("model_loaded"),
        "local_model_root": str(local_root) if local_root else "",
        "checkpoint_found": local_files["checkpoint_found"],
        "demo_image_found": local_files["demo_image_found"],
        "supports_live_upload": external_ready,
        "demo_available": True,
        "model_name": "Prithvi EO V2 300M TL - Sen1Floods11",
        "required_input": "Sentinel-2 GeoTIFF (.tif/.tiff) with at least 13 bands",
        "note": (
            "Vercel uses demo/proxy mode. Configure PRITHVI_API_BASE_URL to a running "
            "Prithvi model service for live GeoTIFF inference."
        ),
        "error": external.get("error", ""),
    }


def run_prithvi_demo() -> Dict[str, Any]:
    if settings.PRITHVI_API_BASE_URL:
        try:
            return _normalize_result(_request_json("POST", "/api/demo"))
        except PrithviServiceError:
            # Keep the site useful if a configured model service is temporarily offline.
            pass

    return {**DEMO_RESULT, "mode": "demo"}


async def analyze_prithvi_upload(file: UploadFile) -> Dict[str, Any]:
    filename = file.filename or "satellite_scene.tif"
    if not filename.lower().endswith((".tif", ".tiff")):
        raise PrithviServiceError("Upload a Sentinel-2 GeoTIFF file ending in .tif or .tiff.", 422)

    status = get_prithvi_status()
    if not status["supports_live_upload"]:
        raise PrithviServiceError(
            "Live Prithvi inference is not connected. Start the Pruthvi-model backend "
            "and set PRITHVI_API_BASE_URL, or use the bundled demo scene.",
            503,
        )

    content = await file.read()
    if not content:
        raise PrithviServiceError("The uploaded GeoTIFF is empty.", 422)

    content_type = file.content_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"
    body, boundary = _multipart_body("file", filename, content, content_type)
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body)),
    }
    result = _request_json("POST", "/api/analyze", data=body, headers=headers)
    return _normalize_result(result)


def _resolve_local_root() -> Optional[Path]:
    candidates = []
    if settings.PRITHVI_MODEL_ROOT:
        candidates.append(Path(settings.PRITHVI_MODEL_ROOT))

    windows_default = Path("C:/Users/skand/Documents/Pruthvi-model")
    if os.name == "nt" or windows_default.exists():
        candidates.append(windows_default)

    for candidate in candidates:
        try:
            if candidate.exists():
                return candidate
        except OSError:
            continue
    return Path(settings.PRITHVI_MODEL_ROOT) if settings.PRITHVI_MODEL_ROOT else None


def _inspect_local_files(root: Optional[Path]) -> Dict[str, bool]:
    if not root:
        return {"checkpoint_found": False, "demo_image_found": False}

    checkpoint = root / "water_model" / PRITHVI_CHECKPOINT_NAME
    demo_image = root / "water_model" / "examples" / PRITHVI_DEMO_IMAGE
    return {
        "checkpoint_found": checkpoint.exists(),
        "demo_image_found": demo_image.exists(),
    }


def _safe_external_url() -> str:
    if not settings.PRITHVI_API_BASE_URL:
        return ""

    parsed = urlparse(settings.PRITHVI_API_BASE_URL)
    if not parsed.scheme or not parsed.netloc:
        return settings.PRITHVI_API_BASE_URL
    return f"{parsed.scheme}://{parsed.netloc}"


def _external_health() -> Dict[str, Any]:
    if not settings.PRITHVI_API_BASE_URL:
        return {"reachable": False}

    try:
        payload = _request_json("GET", "/api/health", timeout=8)
        return {
            "reachable": True,
            "model_loaded": payload.get("model_loaded", payload.get("status") in {"ok", "healthy"}),
        }
    except PrithviServiceError as exc:
        return {"reachable": False, "error": str(exc)}


def _request_json(
    method: str,
    path: str,
    data: Optional[bytes] = None,
    headers: Optional[Dict[str, str]] = None,
    timeout: Optional[float] = None,
) -> Dict[str, Any]:
    if not settings.PRITHVI_API_BASE_URL:
        raise PrithviServiceError("PRITHVI_API_BASE_URL is not configured.", 503)

    url = urljoin(f"{settings.PRITHVI_API_BASE_URL}/", path.lstrip("/"))
    request = Request(url, method=method, data=data, headers=headers or {})
    try:
        with urlopen(request, timeout=timeout or settings.PRITHVI_REQUEST_TIMEOUT_SECONDS) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else {}
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise PrithviServiceError(_extract_error(detail) or f"Prithvi service returned HTTP {exc.code}", exc.code)
    except (URLError, TimeoutError, OSError) as exc:
        raise PrithviServiceError(f"Prithvi service is unreachable: {exc}", 503)
    except json.JSONDecodeError as exc:
        raise PrithviServiceError(f"Prithvi service returned invalid JSON: {exc}", 502)


def _multipart_body(field_name: str, filename: str, content: bytes, content_type: str) -> Tuple[bytes, str]:
    boundary = f"----jaal-drushti-prithvi-{uuid.uuid4().hex}"
    header = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="{field_name}"; filename="{filename}"\r\n'
        f"Content-Type: {content_type}\r\n\r\n"
    ).encode("utf-8")
    footer = f"\r\n--{boundary}--\r\n".encode("utf-8")
    return header + content + footer, boundary


def _extract_error(raw: str) -> str:
    try:
        payload = json.loads(raw)
        detail = payload.get("detail")
        return detail if isinstance(detail, str) else raw
    except json.JSONDecodeError:
        return raw


def _normalize_result(result: Dict[str, Any]) -> Dict[str, Any]:
    normalized = {**result}
    normalized.setdefault("model", "Prithvi EO V2 300M TL - Sen1Floods11")
    normalized.setdefault("mode", "external" if settings.PRITHVI_API_BASE_URL else "demo")

    images = normalized.get("images")
    if isinstance(images, dict) and settings.PRITHVI_API_BASE_URL:
        normalized["images"] = {
            key: _absolute_external_url(value) if isinstance(value, str) else value
            for key, value in images.items()
        }

    return normalized


def _absolute_external_url(value: str) -> str:
    if value.startswith(("http://", "https://", "/prithvi/")):
        return value
    return urljoin(f"{settings.PRITHVI_API_BASE_URL}/", value.lstrip("/"))
