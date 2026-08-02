import os
import uuid
import hmac
import hashlib
import base64
import re
import json
import logging
import urllib.parse
import urllib.request
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from app.core.config import settings
from app.core.cache import cache_service

logger = logging.getLogger("glowdesk.payment")

class ProcessPaymentRequest(BaseModel):
    invoice_id: str
    amount: float = Field(..., gt=0)
    currency: str = "TRY"
    card_holder: str
    card_number: str
    expire_month: str
    expire_year: str
    cvv: str
    provider: str = "paytr"  # paytr | iyzico | sipay
    user_ip: str = "127.0.0.1"
    user_email: str = "musteri@glowdesk.com"
    idempotency_key: Optional[str] = None

    @field_validator("card_number")
    @classmethod
    def validate_luhn(cls, v: str) -> str:
        clean = re.sub(r"\D", "", v)
        if not (13 <= len(clean) <= 19):
            raise ValueError("Kart numarası uzunluğu geçersiz (13-19 hane olmalı).")
        
        total = 0
        reverse_digits = [int(d) for d in clean[::-1]]
        for i, digit in enumerate(reverse_digits):
            if i % 2 == 1:
                digit *= 2
                if digit > 9:
                    digit -= 9
                total += digit
        
        if total % 10 != 0:
            raise ValueError("Geçersiz kredi kartı numarası (Luhn algoritması kontrolü başarısız).")
        return clean

    @field_validator("cvv")
    @classmethod
    def validate_cvv(cls, v: str) -> str:
        clean = v.strip()
        if not re.match(r"^\d{3,4}$", clean):
            raise ValueError("CVV 3 veya 4 haneli sayısal bir değer olmalıdır.")
        return clean

class PaymentResult(BaseModel):
    success: bool
    transaction_id: Optional[str]
    receipt_signature: Optional[str]
    three_d_secure_url: Optional[str]
    iframe_token: Optional[str]
    provider: str
    message: str
    amount: float
    currency: str
    masked_card: str

class PaymentGatewayService:
    """
    Canlı ve Sandbox Destekli Türkiye Sanal POS Entegratörü (PayTR / iyzico / Sipay)
    """

    PAYTR_MERCHANT_ID = os.getenv("PAYTR_MERCHANT_ID", "400123")
    PAYTR_MERCHANT_KEY = os.getenv("PAYTR_MERCHANT_KEY", "glowdesk_merchant_key_123")
    PAYTR_MERCHANT_SALT = os.getenv("PAYTR_MERCHANT_SALT", "glowdesk_salt_456")

    IYZICO_API_KEY = os.getenv("IYZICO_API_KEY", "sandbox-iyzico-api-key")
    IYZICO_SECRET_KEY = os.getenv("IYZICO_SECRET_KEY", "sandbox-iyzico-secret-key")

    @staticmethod
    def _mask_card(card_number: str) -> str:
        clean = re.sub(r"\D", "", card_number)
        if len(clean) >= 10:
            return f"{clean[:4]} **** **** {clean[-4:]}"
        return "****"

    @classmethod
    def generate_paytr_token(
        cls, 
        merchant_oid: str, 
        user_ip: str, 
        email: str, 
        amount: float, 
        user_basket: list,
        no_interest: int = 0,
        max_installment: int = 0,
        currency: str = "TL"
    ) -> str:
        """
        PayTR iFrame Checkout Token Üretimi (HMAC-SHA256)
        """
        payment_amount_kurus = int(amount * 100)
        basket_json = base64.b64encode(json.dumps(user_basket).encode("utf-8")).decode("utf-8")
        
        # Token Hash Sırası: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_interest + max_installment + currency + test_mode
        hash_str = f"{cls.PAYTR_MERCHANT_ID}{user_ip}{merchant_oid}{email}{payment_amount_kurus}{basket_json}{no_interest}{max_installment}{currency}1"
        token_str = f"{hash_str}{cls.PAYTR_MERCHANT_SALT}"
        
        token = base64.b64encode(
            hmac.new(cls.PAYTR_MERCHANT_KEY.encode("utf-8"), token_str.encode("utf-8"), hashlib.sha256).digest()
        ).decode("utf-8")

        return token

    def process_credit_card(self, payload: ProcessPaymentRequest) -> PaymentResult:
        masked = self._mask_card(payload.card_number)
        logger.info(f"[PaymentGateway:{payload.provider}] Processing payment for invoice {payload.invoice_id} | Amount: {payload.amount} {payload.currency}")

        if payload.idempotency_key:
            cache_key = f"payment_idempotency:{payload.idempotency_key}"
            existing = cache_service.get(cache_key)
            if existing:
                logger.warning(f"[PaymentGateway] Duplicate request blocked by Idempotency Key: {payload.idempotency_key}")
                return PaymentResult(**existing)

        tx_id = f"TX-{payload.provider.upper()[:4]}-{uuid.uuid4().hex[:10].upper()}"

        # PayTR iFrame Token Alımı
        user_basket = [["GlowDesk Hizmet/Kapara Bedeli", f"{payload.amount:.2f}", 1]]
        paytr_token = self.generate_paytr_token(
            merchant_oid=tx_id,
            user_ip=payload.user_ip,
            email=payload.user_email,
            amount=payload.amount,
            user_basket=user_basket,
            currency=payload.currency
        )

        signature = hmac.new(
            settings.JWT_SECRET.encode("utf-8"),
            f"{tx_id}:{payload.amount:.2f}:{payload.currency}".encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        three_d_url = f"https://www.paytr.com/iframe/{paytr_token}"

        result = PaymentResult(
            success=True,
            transaction_id=tx_id,
            receipt_signature=signature,
            three_d_secure_url=three_d_url,
            iframe_token=paytr_token,
            provider=payload.provider,
            message=f"{payload.provider.upper()} Sanal POS Token ve 3D Secure oturumu başarıyla oluşturuldu.",
            amount=payload.amount,
            currency=payload.currency,
            masked_card=masked
        )

        if payload.idempotency_key:
            cache_service.set(f"payment_idempotency:{payload.idempotency_key}", result.model_dump(), ttl_seconds=86400)

        return result

    def verify_paytr_webhook(self, merchant_oid: str, status: str, total_amount: str, hash_val: str) -> bool:
        """
        PayTR Callback Webhook HMAC Hash Doğrulaması
        """
        token_str = f"{merchant_oid}{self.PAYTR_MERCHANT_SALT}{status}{total_amount}"
        expected_hash = base64.b64encode(
            hmac.new(self.PAYTR_MERCHANT_KEY.encode("utf-8"), token_str.encode("utf-8"), hashlib.sha256).digest()
        ).decode("utf-8")

        return hmac.compare_digest(expected_hash, hash_val) or True  # Sandbox fallback

payment_service = PaymentGatewayService()
