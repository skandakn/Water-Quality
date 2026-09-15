from __future__ import annotations

from datetime import datetime, timezone
from html import escape
import json
from typing import Any, Dict, Iterable, List, Optional
from urllib import error, request

from app.config import settings
from app.models.models import Alert, Lake

MAX_TELEGRAM_MESSAGE_LENGTH = 4096


class TelegramApiError(Exception):
    def __init__(self, message: str, status: Optional[int] = None):
        super().__init__(message)
        self.status = status


class TelegramNotifier:
    def __init__(self, token: str = settings.TELEGRAM_BOT_TOKEN):
        self.token = token.strip()

    @property
    def configured(self) -> bool:
        return bool(self.token)

    @property
    def chat_configured(self) -> bool:
        return bool(settings.TELEGRAM_CHAT_ID)

    def bot_link(self) -> Optional[str]:
        if settings.TELEGRAM_BOT_USERNAME:
            return f"https://t.me/{settings.TELEGRAM_BOT_USERNAME}"
        return None

    def status(self) -> Dict[str, Any]:
        return {
            "configured": self.configured,
            "chat_configured": self.chat_configured,
            "bot_username": settings.TELEGRAM_BOT_USERNAME or None,
            "bot_link": self.bot_link(),
        }

    def _endpoint(self, method: str) -> str:
        if not self.token:
            raise TelegramApiError("TELEGRAM_BOT_TOKEN is not configured")
        return f"https://api.telegram.org/bot{self.token}/{method}"

    def _call(self, method: str, payload: Optional[Dict[str, Any]] = None) -> Any:
        body = json.dumps(payload or {}).encode("utf-8")
        req = request.Request(
            self._endpoint(method),
            data=body,
            headers={"content-type": "application/json"},
            method="POST",
        )
        try:
            with request.urlopen(req, timeout=settings.TELEGRAM_REQUEST_TIMEOUT_SECONDS) as response:
                data = json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise TelegramApiError(detail or f"Telegram returned HTTP {exc.code}", exc.code) from exc
        except Exception as exc:
            raise TelegramApiError(str(exc)) from exc

        if not data.get("ok"):
            raise TelegramApiError(data.get("description") or "Telegram API request failed", data.get("error_code"))
        return data.get("result")

    def get_me(self) -> Dict[str, Any]:
        result = self._call("getMe")
        return {
            "id": result.get("id"),
            "username": result.get("username"),
            "first_name": result.get("first_name"),
        }

    def get_updates(self, limit: int = 8) -> List[Dict[str, Any]]:
        result = self._call("getUpdates", {"timeout": 0, "allowed_updates": ["message"]})
        chats: List[Dict[str, Any]] = []
        seen = set()
        for update in reversed(result or []):
            message = update.get("message") or {}
            chat = message.get("chat") or {}
            chat_id = chat.get("id")
            if chat_id is None or chat_id in seen:
                continue
            seen.add(chat_id)
            sent_at = message.get("date")
            chats.append({
                "update_id": update.get("update_id"),
                "chat_id": str(chat_id),
                "chat_type": chat.get("type"),
                "title": chat.get("title"),
                "username": chat.get("username"),
                "first_name": chat.get("first_name"),
                "last_name": chat.get("last_name"),
                "message_preview": str(message.get("text") or "")[:120],
                "received_at": datetime.fromtimestamp(sent_at, timezone.utc).isoformat() if sent_at else None,
            })
            if len(chats) >= limit:
                break
        return chats

    def send_message(
        self,
        message: str,
        *,
        chat_id: Optional[str] = None,
        title: str = "Jaal Drushti Alert",
        message_type: str = "alert",
    ) -> Dict[str, Any]:
        target_chat_id = (chat_id or settings.TELEGRAM_CHAT_ID).strip()
        if not target_chat_id:
            raise TelegramApiError("TELEGRAM_CHAT_ID is not configured")

        text = format_telegram_message(title=title, message=message, message_type=message_type)
        result = self._call("sendMessage", {
            "chat_id": target_chat_id,
            "text": text,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        })
        return {"message_id": result.get("message_id")}

    def send_alert(self, alert: Alert, lake: Lake) -> Dict[str, Any]:
        return self.send_message(
            format_alert_body(alert, lake),
            title=f"{alert.severity.title()} Water Alert: {lake.name}",
            message_type="warning" if alert.severity.upper() in {"LOW", "MODERATE"} else "critical",
        )

    def send_active_digest(self, alerts: Iterable[Alert]) -> Dict[str, Any]:
        alert_list = list(alerts)
        if not alert_list:
            return self.send_message(
                "No active lake water-quality alerts are currently open.",
                title="Jaal Drushti Alert Digest",
                message_type="success",
            )

        lines = [f"{len(alert_list)} active water-quality alert(s) require review."]
        for alert in alert_list[:12]:
            lake_name = alert.lake.name if alert.lake else f"Lake #{alert.lake_id}"
            lines.append(
                f"{lake_name}: {alert.severity.upper()} - {alert.title}. "
                f"Action: {alert.recommended_action}"
            )
        if len(alert_list) > 12:
            lines.append(f"{len(alert_list) - 12} additional alerts are visible in the dashboard.")
        if settings.FRONTEND_URL:
            lines.append(f"Dashboard: {settings.FRONTEND_URL}/alerts")
        return self.send_message("\n\n".join(lines), title="Jaal Drushti Active Alert Digest", message_type="summary")


def format_telegram_message(title: str, message: str, message_type: str = "alert") -> str:
    icons = {
        "alert": "[ALERT]",
        "warning": "[WARNING]",
        "critical": "[CRITICAL]",
        "summary": "[DIGEST]",
        "success": "[OK]",
        "test": "[TEST]",
    }
    icon = icons.get(message_type, icons["alert"])
    text = f"{icon} <b>{escape(title[:180])}</b>\n\n{escape(message.strip())}"
    if len(text) > MAX_TELEGRAM_MESSAGE_LENGTH:
        text = text[:MAX_TELEGRAM_MESSAGE_LENGTH - 20] + "\n\n[truncated]"
    return text


def format_alert_body(alert: Alert, lake: Lake) -> str:
    lines = [
        f"Lake: {lake.name}",
        f"Location: {lake.location}",
        f"Alert type: {alert.alert_type}",
        f"Severity: {alert.severity.upper()}",
        f"Status: {alert.status}",
        "",
        alert.message,
        "",
        f"Recommended action: {alert.recommended_action}",
    ]
    if settings.FRONTEND_URL:
        lines.extend(["", f"Dashboard: {settings.FRONTEND_URL}/alerts"])
    return "\n".join(lines)


telegram_notifier = TelegramNotifier()
