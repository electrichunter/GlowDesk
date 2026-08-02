import os
import re
import json
import logging
import urllib.parse
import urllib.request
from typing import Optional, Dict, Any, List

logger = logging.getLogger("glowdesk.notifications")

class NotificationService:
    """
    Çok Kanallı Canlı Bildirim Servisi (WhatsApp Cloud API + NetGSM SMS / Twilio)
    """

    NETGSM_USER = os.getenv("NETGSM_USER", "glowdesk_netgsm_user")
    NETGSM_PASSWORD = os.getenv("NETGSM_PASSWORD", "glowdesk_netgsm_pass")
    NETGSM_HEADER = os.getenv("NETGSM_HEADER", "GLOWDESK")
    WHATSAPP_TOKEN = os.getenv("WHATSAPP_CLOUD_TOKEN", "EAAGK...")
    WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID", "10982312903")

    @staticmethod
    def _clean_phone(phone: str) -> str:
        digits = re.sub(r"\D", "", phone)
        if len(digits) == 10 and digits.startswith("5"):
            return f"90{digits}"
        if len(digits) == 11 and digits.startswith("05"):
            return f"9{digits}"
        return digits

    @classmethod
    def send_whatsapp(
        cls, 
        phone: str, 
        template_name: str, 
        parameters: List[str], 
        language_code: str = "tr"
    ) -> bool:
        """
        Meta WhatsApp Cloud API üzerinden Şablonlu Bildirim Gönderimi
        """
        clean_number = cls._clean_phone(phone)
        url = f"https://graph.facebook.com/v18.0/{cls.WHATSAPP_PHONE_ID}/messages"
        
        payload = {
            "messaging_product": "whatsapp",
            "to": clean_number,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language_code},
                "components": [
                    {
                        "type": "body",
                        "parameters": [{"type": "text", "text": p} for p in parameters]
                    }
                ]
            }
        }
        
        headers = {
            "Authorization": f"Bearer {cls.WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }

        try:
            logger.info(f"[WhatsApp API] Outbound to {clean_number} | Template: {template_name}")
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=5) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                logger.info(f"[WhatsApp API] Success: {result.get('messages', [{}])[0].get('id')}")
                return True
        except Exception as e:
            logger.warning(f"[WhatsApp API] Fallback to SMS. Reason: {e}")
            # Fallback to NetGSM SMS
            fallback_msg = f"GlowDesk Bildirim: {parameters[0]} - {parameters[1] if len(parameters) > 1 else ''}"
            return cls.send_netgsm_sms(phone, fallback_msg)

    @classmethod
    def send_netgsm_sms(cls, phone: str, message: str) -> bool:
        """
        NetGSM SMS HTTP Gateway Entegrasyonu (TR Operatör Standartları)
        """
        clean_number = cls._clean_phone(phone)
        url = "https://api.netgsm.com.tr/sms/send/get"
        
        params = {
            "usercode": cls.NETGSM_USER,
            "password": cls.NETGSM_PASSWORD,
            "gsmno": clean_number,
            "message": message,
            "msgheader": cls.NETGSM_HEADER,
            "filter": "0"
        }

        query_string = urllib.parse.urlencode(params)
        full_url = f"{url}?{query_string}"

        try:
            logger.info(f"[NetGSM SMS] Sending to {clean_number}: {message[:40]}...")
            req = urllib.request.Request(full_url, method="GET")
            with urllib.request.urlopen(req, timeout=5) as resp:
                res_code = resp.read().decode("utf-8").strip()
                if res_code.startswith("00") or res_code.startswith("01") or res_code.startswith("02"):
                    logger.info(f"[NetGSM SMS] Success JobID: {res_code}")
                    return True
                else:
                    logger.error(f"[NetGSM SMS] Error response code: {res_code}")
                    return False
        except Exception as e:
            logger.error(f"[NetGSM SMS] Request failed: {e}")
            return False

    @classmethod
    def send_sms(cls, phone: str, message: str) -> bool:
        return cls.send_netgsm_sms(phone, message)

    @classmethod
    def send_email(cls, to_email: str, subject: str, body: str) -> bool:
        logger.info(f"[Email Service] Sending to {to_email} | Subject: {subject}")
        return True

notification_service = NotificationService()
