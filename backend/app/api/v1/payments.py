from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.payment_service import payment_service, ProcessPaymentRequest, PaymentResult
from app.repositories.base_repository import BaseRepository
from app.models.invoice import Invoice if hasattr(app.models, "invoice") else None

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

@router.post("/refund/{transaction_id}")
def refund_payment(transaction_id: str, amount: float):
    return payment_service.refund_transaction(transaction_id, amount)
