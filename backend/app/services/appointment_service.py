from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.appointment_repository import AppointmentRepository
from app.services.resource_orchestrator import ResourceOrchestrator
from app.services.cancellation_policy_engine import CancellationPolicyEngine
from app.worker.tasks import send_appointment_reminder
from app.core.exceptions import NotFoundError

class AppointmentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AppointmentRepository(db)
        self.orchestrator = ResourceOrchestrator(db)
        self.cancellation_engine = CancellationPolicyEngine(db)

    def create_appointment(self, payload) -> dict:
        resource_ids = getattr(payload, "resource_ids", []) or []

        # 1. Fiziki kaynak kilit kontrolü
        if resource_ids:
            self.orchestrator.check_and_lock_resources(
                tenant_id=payload.tenant_id,
                resource_ids=resource_ids,
                start_time=payload.start_time,
                end_time=payload.end_time,
            )

        # 2. Randevu kaydı
        data = {
            "tenant_id": payload.tenant_id,
            "service_id": getattr(payload, "service_id", None),
            "staff_id": getattr(payload, "staff_id", None),
            "customer_name": payload.customer_name,
            "customer_phone": payload.customer_phone,
            "appointment_date": payload.appointment_date,
            "start_time": payload.start_time,
            "end_time": payload.end_time,
            "notes": getattr(payload, "notes", None),
            "total_price": getattr(payload, "total_price", 0.0) or 0.0,
            "deposit_amount": getattr(payload, "deposit_amount", 0.0) or 0.0,
            "deposit_status": "held" if getattr(payload, "deposit_amount", 0.0) else "none",
            "vertical": getattr(payload, "vertical", "salon"),
            "sector_data": getattr(payload, "sector_data", None),
            "status": "scheduled",
        }
        appointment = self.repo.create(data)

        # 3. Kaynakların randevuya bağlanması
        if resource_ids:
            self.orchestrator.bind_resources_to_appointment(
                appointment_id=appointment.id,
                resource_ids=resource_ids,
                start_time=payload.start_time,
                end_time=payload.end_time,
            )

        # 4. Celery asenkron görevi tetikle
        try:
            send_appointment_reminder.delay(
                appointment_id=appointment.id,
                customer_phone=appointment.customer_phone,
                customer_name=appointment.customer_name,
                date_str=str(appointment.appointment_date)
            )
        except Exception:
            pass  # Redis/Celery dev modunda tolera edilir

        return appointment

    def list_appointments(self, tenant_id: Optional[str] = None) -> List:
        if tenant_id:
            return self.repo.get_by_tenant(tenant_id)
        return self.repo.get_all()

    def update_status(self, appointment_id: str, status: str):
        if status == "cancelled":
            return self.cancellation_engine.process_cancellation(appointment_id)

        appointment = self.repo.update_status(appointment_id, status)
        if not appointment:
            raise NotFoundError("Randevu")
        return {"message": "Randevu durumu güncellendi.", "status": status}

