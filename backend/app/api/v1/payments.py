from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.payment_service import payment_service, ProcessPaymentRequest, PaymentResult
from app.middleware.rbac import require_roles

router = APIRouter(prefix="/payments", tags=["Payments & Checkout"])


@router.post("/process", response_model=PaymentResult)
def process_payment(payload: ProcessPaymentRequest, db: Session = Depends(get_db)):
    result = payment_service.process_credit_card(payload)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.message
        )
    return result

@router.post("/3d-callback")
def three_d_secure_callback(tx_id: str, status_code: str, signature: str):
    """
    3D Secure Yönlendirme Sonrası Banka/POS Dönüş Uç Noktası
    """
    is_valid = payment_service.verify_3d_secure_callback(tx_id, status_code, signature)
    if not is_valid:
        raise HTTPException(status_code=400, detail="3D Secure doğrulama başarısız. İmza geçersiz.")
    
    return {
        "status": "APPROVED" if status_code == "SUCCESS" else "FAILED",
        "transaction_id": tx_id,
        "message": "3D Secure doğrulama ve tahsilat başarıyla tamamlandı."
    }

@router.post("/webhook")
async def payment_provider_webhook(request: Request, x_signature: str = Header(None)):
    """
    Iyzico / Stripe Asenkron Webhook Bildirim Uç Noktası (Sanity & HMAC Security Verified)
    """
    body = await request.body()
    is_authentic = payment_service.verify_webhook_signature(body, x_signature)
    if not is_authentic:
        raise HTTPException(status_code=401, detail="Geçersiz Webhook imzası.")

    payload = await request.json()
    logger_msg = f"[PaymentWebhook] Event: {payload.get('event')} | TxId: {payload.get('transaction_id')}"
    return {"received": True, "detail": logger_msg}

@router.post("/refund/{transaction_id}")
def refund_payment(
    transaction_id: str,
    amount: float,
    current_user_payload: dict = Depends(require_roles(["admin", "owner"]))
):
    return payment_service.refund_transaction(transaction_id, amount)

