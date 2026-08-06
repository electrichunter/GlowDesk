"""
WaitlistEntry — Asenkron bekleme listesi modeli.

Dolu bir slot'tan iptal çıktığında sıradaki müşteriye otomatik
bildirim gönderen bekleme listesi altyapısının veri katmanı.

Kullanım senaryoları:
  - Fitness: dolu Reformer dersine waitlist
  - Salon: popüler kuaförün dolu slotuna bekleme
  - Clinic: acil slot ihtiyacı olan hastalar
"""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Integer, Date,
    DateTime, ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    tenant_id = Column(
        String(64),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    customer_id = Column(
        String(36),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    service_id = Column(
        String(36),
        ForeignKey("services.id", ondelete="SET NULL"),
        nullable=True,
    )
    staff_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    preferred_date = Column(Date, nullable=True)
    preferred_time_range = Column(String(50), nullable=True)  # "09:00-12:00"
    priority_order = Column(Integer, nullable=False, default=0)
    notes = Column(Text, nullable=True)

    status = Column(
        SAEnum(
            "waiting", "notified", "confirmed",
            "expired", "cancelled",
            name="waitlist_status_enum",
        ),
        nullable=False, default="waiting",
    )

    notified_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    tenant = relationship("Tenant", back_populates="waitlist_entries")
    customer = relationship("Customer")

    __table_args__ = {
        'mysql_engine': 'InnoDB',
        'mysql_charset': 'utf8mb4',
        'mysql_collate': 'utf8mb4_unicode_ci',
    }

