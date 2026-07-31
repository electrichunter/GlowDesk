import uuid
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

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

class PaymentResult(BaseModel):
    success: bool
    transaction_id: Optional[str]
    message: str
    amount: float
    currency: str

class PaymentGatewayService:
    """
    Güvenli Ödeme Geçidi Servisi (Payment Gateway Integration)
    Stripe / İyzico / PayTR gibi sağlayıcılar için soyutlanmış ödeme katmanı.
    """

    @staticmethod
    def process_credit_card(payload: ProcessPaymentRequest) -> PaymentResult:
        logger.info(f"[PaymentGateway] Processing payment of {payload.amount} {payload.currency} for invoice {payload.invoice_id}")

        # Kart numarası basit kontrolü
        clean_card = payload.card_number.replace(" ", "").replace("-", "")
        if len(clean_card) < 15 or not clean_card.isdigit():
            return PaymentResult(
                success=False,
                transaction_id=None,
                message="Geçersiz kart numarası.",
                amount=payload.amount,
                currency=payload.currency
            )

        # Başarılı simüle edilen işlem (Production ortamında Iyzico/Stripe API çağrısı)
        tx_id = f"TX-{uuid.uuid4().hex[:12].upper()}"
        logger.info(f"[PaymentGateway] Payment SUCCESS: Transaction ID {tx_id}")

        return PaymentResult(
            success=True,
            transaction_id=tx_id,
            message="Ödeme işlemi başarıyla tamamlandı.",
            amount=payload.amount,
            currency=payload.currency
        )

    @staticmethod
    def refund_transaction(transaction_id: str, amount: float) -> dict:
        logger.info(f"[PaymentGateway] Refunding transaction {transaction_id} amount: {amount}")
        return {
            "success": True,
            "refund_id": f"RF-{uuid.uuid4().hex[:8].upper()}",
            "amount": amount,
            "message": "İade işlemi onaylandı."
        }

payment_service = PaymentGatewayService()
