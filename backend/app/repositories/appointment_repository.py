from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.repositories.base_repository import BaseRepository

class AppointmentRepository(BaseRepository[Appointment]):
    def __init__(self, db: Session):
        super().__init__(Appointment, db)

    def get_by_tenant(self, tenant_id: str, skip: int = 0, limit: int = 100) -> List[Appointment]:
        return self.db.query(Appointment).filter(Appointment.tenant_id == tenant_id).offset(skip).limit(limit).all()

    def update_status(self, appointment_id: str, status: str) -> Optional[Appointment]:
        appointment = self.get_by_id(appointment_id)
        if appointment:
            appointment.status = status
            self.db.commit()
            self.db.refresh(appointment)
        return appointment
