"""
NotificationRepository — Bildirim geçmişi veri erişim katmanı.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.notification_log import NotificationLog


class NotificationRepository(BaseRepository[NotificationLog]):
    def __init__(self, db: Session):
        super().__init__(NotificationLog, db)

    def get_by_tenant(self, tenant_id: str, channel: Optional[str] = None) -> List[NotificationLog]:
        query = self.db.query(NotificationLog).filter(NotificationLog.tenant_id == tenant_id)
        if channel:
            query = query.filter(NotificationLog.channel == channel)
        return query.order_by(NotificationLog.created_at.desc()).all()

    def get_pending_queue(self, limit: int = 50) -> List[NotificationLog]:
        return (
            self.db.query(NotificationLog)
            .filter(NotificationLog.status == "queued")
            .order_by(NotificationLog.scheduled_at.asc())
            .limit(limit)
            .all()
        )
