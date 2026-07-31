"""
ResourceOrchestrator — Çok kaynaklı atomik rezervasyon ve çakışma önleme motoru.

Tüm dikey sektörlerdeki fiziki kaynak (oda, koltuk, cihaz, lift, bay, plato, ünit)
uygunluğunu atomik transaction ve `SELECT ... FOR UPDATE` kilitleri ile denetler.
"""
from datetime import time, datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.resource_repository import ResourceRepository
from app.models.resource_booking import ResourceBooking
from app.core.exceptions import GlowDeskException


class ResourceConflictError(GlowDeskException):
    def __init__(self, resource_name: str, requested_slot: str):
        super().__init__(
            message=f"Kaynak çakışması: '{resource_name}' seçilen '{requested_slot}' zaman diliminde dolu.",
            status_code=409,
        )


class ResourceOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ResourceRepository(db)

    def check_and_lock_resources(
        self,
        tenant_id: str,
        resource_ids: List[str],
        start_time: time,
        end_time: time,
        buffer_after_minutes: int = 0,
    ) -> List[str]:
        """
        Verilen kaynak listesini ve zaman aralığını atomik kilit ile kontrol eder.
        Çakışma varsa ResourceConflictError fırlatır.
        """
        effective_end_time = end_time
        if buffer_after_minutes > 0:
            dummy_dt = datetime.combine(datetime.today(), end_time) + timedelta(minutes=buffer_after_minutes)
            effective_end_time = dummy_dt.time()

        locked_resource_ids = []
        for r_id in resource_ids:
            resource = self.repo.get_by_id(r_id)
            if not resource or resource.tenant_id != tenant_id or not resource.is_available:
                raise GlowDeskException(message=f"Kaynak '{r_id}' aktif veya kullanılabilir değil.", status_code=400)

            # Çakışan rezervasyon kontrolü
            conflicts = self.repo.get_bookings_in_slot(
                resource_id=r_id,
                start_time=start_time,
                end_time=effective_end_time,
            )
            if conflicts:
                slot_str = f"{start_time.strftime('%H:%M')} - {effective_end_time.strftime('%H:%M')}"
                raise ResourceConflictError(resource_name=resource.name, requested_slot=slot_str)

            locked_resource_ids.append(r_id)

        return locked_resource_ids

    def bind_resources_to_appointment(
        self,
        appointment_id: str,
        resource_ids: List[str],
        start_time: time,
        end_time: time,
    ) -> List[ResourceBooking]:
        """Randevuyu fiziki kaynaklara bağlar."""
        bookings = []
        for r_id in resource_ids:
            booking = ResourceBooking(
                appointment_id=appointment_id,
                resource_id=r_id,
                start_time=start_time,
                end_time=end_time,
                status="reserved",
            )
            self.db.add(booking)
            bookings.append(booking)

        self.db.commit()
        return bookings
