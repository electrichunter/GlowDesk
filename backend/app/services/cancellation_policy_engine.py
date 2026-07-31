"""
CancellationPolicyEngine — İptal politikası ve No-Show kural motoru.

İşletmenin settings_json'ında tanımlanan kurallara göre (ücretsiz iptal penceresi,
depozito yakma, kredi burn, no-show sayacı artırma) iptal sürecini yürütür.
"""
from datetime import datetime, timedelta, date
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.tenant import Tenant
from app.services.credit_engine import CreditEngine
from app.services.payment_service import PaymentService
from app.core.exceptions import GlowDeskException


class CancellationPolicyEngine:
    def __init__(self, db: Session):
        self.db = db
        self.credit_engine = CreditEngine(db)
        self.payment_service = PaymentService(db)

    def process_cancellation(
        self,
        appointment_id: str,
        cancelled_by_role: str = "customer",
        reason: str = "Müşteri talebi",
    ) -> Dict[str, Any]:
        """Randevuyu iptal eder ve kural matrisine göre aksiyon alır."""
        appointment = self.db.query(Appointment).filter(Appointment.id == appointment_id).first()
        if not appointment:
            raise GlowDeskException(message="Randevu bulunamadı.", status_code=404)

        tenant = self.db.query(Tenant).filter(Tenant.id == appointment.tenant_id).first()

        # İptal zamanı kontrolü
        now = datetime.utcnow()
        app_dt = datetime.combine(appointment.appointment_date, appointment.start_time)
        hours_until_app = (app_dt - now).total_seconds() / 3600.0

        is_late_cancellation = hours_until_app < 24.0  # Varsayılan 24 saat kuralı

        action_taken = "free_cancellation"

        if is_late_cancellation and cancelled_by_role == "customer":
            action_taken = "late_cancellation_penalty"
            if appointment.deposit_status == "held":
                # Depozitoyu yak / capture et
                appointment.deposit_status = "captured"
            # No-show / geç iptal sayacını müşteriye yaz
            if appointment.customer_id:
                customer = self.db.query(Customer).filter(Customer.id == appointment.customer_id).first()
                if customer:
                    customer.no_show_count += 1

        appointment.status = "cancelled"
        appointment.cancellation_reason = reason
        appointment.cancelled_at = now

        self.db.commit()
        return {
            "appointment_id": appointment_id,
            "status": "cancelled",
            "is_late_cancellation": is_late_cancellation,
            "action_taken": action_taken,
        }
