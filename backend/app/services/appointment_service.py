from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.appointment_repository import AppointmentRepository
from app.worker.tasks import send_appointment_reminder
from app.core.exceptions import NotFoundError

class AppointmentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AppointmentRepository(db)

    def create_appointment(self, payload) -> dict:
        data = {
            "tenant_id": payload.tenant_id,
            "service_id": payload.service_id,
            "staff_id": payload.staff_id,
            "customer_name": payload.customer_name,
            "customer_phone": payload.customer_phone,
            "appointment_date": payload.appointment_date,
            "start_time": payload.start_time,
            "end_time": payload.end_time,
            "notes": payload.notes,
            "total_price": payload.total_price or 0.0,
            "status": "scheduled"
        }
        appointment = self.repo.create(data)

        # Celery asenkron görevi tetikle
        send_appointment_reminder.delay(
            appointment_id=appointment.id,
            customer_phone=appointment.customer_phone,
            customer_name=appointment.customer_name,
            date_str=str(appointment.appointment_date)
        )

        return appointment

    def list_appointments(self, tenant_id: Optional[str] = None) -> List:
        if tenant_id:
            return self.repo.get_by_tenant(tenant_id)
        return self.repo.get_all()

    def update_status(self, appointment_id: str, status: str):
        appointment = self.repo.update_status(appointment_id, status)
        if not appointment:
            raise NotFoundError("Randevu")
        return {"message": "Randevu durumu güncellendi.", "status": status}
