"""
WaitlistEngine — Asenkron bekleme listesi motoru.

İptal edilen randevularda sıradaki kullanıcıyı bulup
otomatik bildirim tetikler ve onay penceresi açar.
"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.waitlist_repository import WaitlistRepository
from app.models.waitlist_entry import WaitlistEntry
from app.core.exceptions import GlowDeskException


class WaitlistEngine:
    def __init__(self, db: Session):
        self.db = db
        self.repo = WaitlistRepository(db)

    def process_cancelled_slot(
        self,
        tenant_id: str,
        service_id: Optional[str] = None,
        slot_datetime_str: str = "",
        notification_window_minutes: int = 15,
    ) -> Optional[WaitlistEntry]:
        """
        Bir randevu iptal edildiğinde bekleme listesindeki sıradaki kişiyi bulur,
        durumunu 'notified' yapar ve notification window süresi başlatır.
        """
        next_entry = self.repo.get_next_in_line(tenant_id, service_id)
        if not next_entry:
            return None

        now = datetime.utcnow()
        next_entry.status = "notified"
        next_entry.notified_at = now
        next_entry.expires_at = now + timedelta(minutes=notification_window_minutes)

        self.db.commit()
        self.db.refresh(next_entry)

        # Buradan notification service çağrısı yapılır (WhatsApp / SMS / Push)
        return next_entry

    def confirm_waitlist_slot(self, entry_id: str) -> WaitlistEntry:
        """Kullanıcı bildirimi onayladığında sırayı kesinleştirir."""
        entry = self.repo.get_by_id(entry_id)
        if not entry or entry.status != "notified":
            raise GlowDeskException(message="Geçerli veya zamanı geçmemiş bekleme kaydı bulunamadı.", status_code=400)

        if entry.expires_at and datetime.utcnow() > entry.expires_at:
            entry.status = "expired"
            self.db.commit()
            raise GlowDeskException(message="Bekleme sırası onay süresi doldu.", status_code=400)

        entry.status = "confirmed"
        entry.confirmed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(entry)
        return entry
