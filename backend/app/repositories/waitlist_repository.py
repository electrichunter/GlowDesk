"""
WaitlistRepository — Bekleme listesi veri erişim katmanı.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.waitlist_entry import WaitlistEntry


class WaitlistRepository(BaseRepository[WaitlistEntry]):
    def __init__(self, db: Session):
        super().__init__(WaitlistEntry, db)

    def get_by_tenant(self, tenant_id: str, status: Optional[str] = None) -> List[WaitlistEntry]:
        query = self.db.query(WaitlistEntry).filter(WaitlistEntry.tenant_id == tenant_id)
        if status:
            query = query.filter(WaitlistEntry.status == status)
        return query.order_by(WaitlistEntry.priority_order.asc(), WaitlistEntry.created_at.asc()).all()

    def get_next_in_line(self, tenant_id: str, service_id: Optional[str] = None) -> Optional[WaitlistEntry]:
        query = self.db.query(WaitlistEntry).filter(
            WaitlistEntry.tenant_id == tenant_id,
            WaitlistEntry.status == "waiting",
        )
        if service_id:
            query = query.filter(WaitlistEntry.service_id == service_id)
        return query.order_by(WaitlistEntry.priority_order.asc(), WaitlistEntry.created_at.asc()).first()
