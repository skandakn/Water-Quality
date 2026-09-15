from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Alert
from app.routers.auth import require_analyst
from app.services.telegram_notifier import TelegramApiError, telegram_notifier

router = APIRouter(prefix="/api/telegram", tags=["Telegram Alert Delivery"])


class TelegramStatusResponse(BaseModel):
    configured: bool
    chat_configured: bool
    bot_username: Optional[str] = None
    bot_link: Optional[str] = None


class TelegramBotTestResponse(BaseModel):
    ok: bool
    username: Optional[str] = None
    first_name: Optional[str] = None


class TelegramUpdateChat(BaseModel):
    update_id: Optional[int] = None
    chat_id: str
    chat_type: Optional[str] = None
    title: Optional[str] = None
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    message_preview: Optional[str] = None
    received_at: Optional[str] = None


class TelegramSendResult(BaseModel):
    ok: bool
    message_id: Optional[int] = None
    sent_count: int = 1
    detail: str


def _telegram_error(error: TelegramApiError) -> HTTPException:
    return HTTPException(status_code=400, detail=str(error))


@router.get("/status", response_model=TelegramStatusResponse)
def telegram_status():
    return telegram_notifier.status()


@router.post("/test", response_model=TelegramBotTestResponse)
def test_telegram_bot(user=Depends(require_analyst)):
    try:
        bot = telegram_notifier.get_me()
    except TelegramApiError as exc:
        raise _telegram_error(exc)
    return {"ok": True, "username": bot.get("username"), "first_name": bot.get("first_name")}


@router.get("/updates", response_model=List[TelegramUpdateChat])
def list_recent_telegram_chats(
    limit: int = Query(8, ge=1, le=20),
    user=Depends(require_analyst),
):
    try:
        return telegram_notifier.get_updates(limit=limit)
    except TelegramApiError as exc:
        raise _telegram_error(exc)


@router.post("/send-test", response_model=TelegramSendResult)
def send_test_message(user=Depends(require_analyst)):
    try:
        result = telegram_notifier.send_message(
            "Telegram delivery is connected to Jaal Drushti. Future lake health alerts can be dispatched from the Alerts command page.",
            title="Jaal Drushti Telegram Test",
            message_type="test",
        )
    except TelegramApiError as exc:
        raise _telegram_error(exc)
    return {"ok": True, "message_id": result.get("message_id"), "detail": "Test message sent"}


@router.post("/alerts/{alert_id}/send", response_model=TelegramSendResult)
def send_alert_to_telegram(
    alert_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_analyst),
):
    alert = db.query(Alert).options(joinedload(Alert.lake)).filter(Alert.id == alert_id).first()
    if not alert or not alert.lake:
        raise HTTPException(status_code=404, detail="Alert not found")
    try:
        result = telegram_notifier.send_alert(alert, alert.lake)
    except TelegramApiError as exc:
        raise _telegram_error(exc)
    return {"ok": True, "message_id": result.get("message_id"), "detail": "Alert sent to Telegram"}


@router.post("/alerts/send-active", response_model=TelegramSendResult)
def send_active_alert_digest(
    lake_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(require_analyst),
):
    query = db.query(Alert).options(joinedload(Alert.lake)).filter(Alert.status.ilike("ACTIVE"))
    if lake_id:
        query = query.filter(Alert.lake_id == lake_id)
    alerts = query.order_by(Alert.created_at.desc()).all()
    try:
        result = telegram_notifier.send_active_digest(alerts)
    except TelegramApiError as exc:
        raise _telegram_error(exc)
    return {
        "ok": True,
        "message_id": result.get("message_id"),
        "sent_count": len(alerts),
        "detail": "Active alert digest sent to Telegram",
    }
