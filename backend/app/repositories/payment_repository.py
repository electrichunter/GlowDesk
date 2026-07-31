"""
PaymentRepository — Ödeme işlemleri veri erişim katmanı.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.payment_transaction import PaymentTransaction


class PaymentRepository(BaseRepository[PaymentTransaction]):
    def __init__(self, db: Session):
        super().__init__(PaymentTransaction, db)

    def get_by_tenant(self, tenant_id: str, limit: int = 100) -> List[PaymentTransaction]:
        return (
            self.db.query(PaymentTransaction)
            .filter(PaymentTransaction.tenant_id == tenant_id)
            .order_by(PaymentTransaction.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_by_idempotency_key(self, idempotency_key: str) -> Optional[PaymentTransaction]:
        return (
            self.db.query(PaymentTransaction)
            .filter(PaymentTransaction.idempotency_key == idempotency_key)
            .first()
        )

    def get_by_appointment(self, appointment_id: str) -> List[PaymentTransaction]:
        return (
            self.db.query(PaymentTransaction)
            .filter(PaymentTransaction.appointment_id == appointment_id)
            .all()
        )
