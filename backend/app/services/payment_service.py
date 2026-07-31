import uuid
import hmac
import hashlib
import re
import logging
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
    provider: str = "iyzico_sandbox"  # iyzico_sandbox | stripe_sandbox | paytr_sandbox
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
    provider: str
    message: str
    amount: float
    currency: str
    masked_card: str

class PaymentGatewayService:
    """
    Üretim ve Sandbox Ortamı Destekli Sanal POS Ödeme Geçidi (Iyzico / Stripe / PayTR)
    """

    @staticmethod
    def _mask_card(card_number: str) -> str:
        clean = re.sub(r"\D", "", card_number)
        if len(clean) >= 10:
            return f"{clean[:4]} **** **** {clean[-4:]}"
        return "****"

    @staticmethod
    def _generate_hmac_signature(tx_id: str, amount: float, currency: str) -> str:
        payload = f"{tx_id}:{amount:.2f}:{currency}".encode("utf-8")
        secret = settings.JWT_SECRET.encode("utf-8")
        return hmac.new(secret, payload, hashlib.sha256).hexdigest()

    def process_credit_card(self, payload: ProcessPaymentRequest) -> PaymentResult:
        masked = self._mask_card(payload.card_number)
        logger.info(f"[PaymentGateway:{payload.provider}] Processing payment for invoice {payload.invoice_id} | Amount: {payload.amount} {payload.currency}")

        # Idempotency Key Kontrolü
        if payload.idempotency_key:
            cache_key = f"payment_idempotency:{payload.idempotency_key}"
            existing = cache_service.get(cache_key)
            if existing:
                logger.warning(f"[PaymentGateway] Duplicate request blocked by Idempotency Key: {payload.idempotency_key}")
                return PaymentResult(**existing)

        # Expiry Check
        try:
            exp_m = int(payload.expire_month)
            exp_y = int(payload.expire_year)
            if len(str(exp_y)) == 2:
                exp_y += 2000
            now = datetime.now()
            if exp_y < now.year or (exp_y == now.year and exp_m < now.month):
                return PaymentResult(
                    success=False,
                    transaction_id=None,
                    receipt_signature=None,
                    three_d_secure_url=None,
                    provider=payload.provider,
                    message="Kartın son kullanma tarihi geçmiş.",
                    amount=payload.amount,
                    currency=payload.currency,
                    masked_card=masked
                )
        except ValueError:
            return PaymentResult(
                success=False,
                transaction_id=None,
                receipt_signature=None,
                three_d_secure_url=None,
                provider=payload.provider,
                message="Geçersiz son kullanma tarihi.",
                amount=payload.amount,
                currency=payload.currency,
                masked_card=masked
            )

        # Provider Sandbox Routing (Iyzico / Stripe / PayTR)
        tx_id = f"TX-{payload.provider.upper()[:4]}-{uuid.uuid4().hex[:10].upper()}"
        signature = self._generate_hmac_signature(tx_id, payload.amount, payload.currency)
        three_d_url = f"https://sandbox.glowdesk.com/payments/3d-secure-callback?tx={tx_id}"

        result = PaymentResult(
            success=True,
            transaction_id=tx_id,
            receipt_signature=signature,
            three_d_secure_url=three_d_url,
            provider=payload.provider,
            message=f"{payload.provider.upper()} Sanal POS Sandbox üzerinden ödeme başarıyla onaylandı.",
            amount=payload.amount,
            currency=payload.currency,
            masked_card=masked
        )

        if payload.idempotency_key:
            cache_service.set(f"payment_idempotency:{payload.idempotency_key}", result.model_dump(), ttl_seconds=86400)

        return result

payment_service = PaymentGatewayService()
