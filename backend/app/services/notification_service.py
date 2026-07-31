import logging
from typing import Optional

logger = logging.getLogger("glowdesk.notifications")

class NotificationService:
    @staticmethod
    def send_sms(phone: str, message: str) -> bool:
        logger.info(f"[SMS Gateway] Sending to {phone}: {message}")
        # SMS provider API entegrasyonu (NetGSM, Twilio vb.)
        return True

    @staticmethod
    def send_email(to_email: str, subject: str, body: str) -> bool:
        logger.info(f"[Email Service] Sending to {to_email} | Subject: {subject}")
        # SMTP / SendGrid / SES entegrasyonu
        return True
