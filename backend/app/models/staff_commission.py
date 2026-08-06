"""
StaffCommission — Personel hakediş / prim modeli.

Personelin tamamladığı randevulara göre otomatik hesaplanan
prim / komisyon / hakediş tutarları.

Desteklenen hesaplama tipleri:
  - percentage: Randevu tutarının %X'i
  - fixed: Sabit tutar
  - per_attendee: Katılımcı başına (grup dersleri)
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Numeric, Integer,
    DateTime, ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class StaffCommission(Base):
    __tablename__ = "staff_commissions"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    tenant_id = Column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    staff_id = Column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    appointment_id = Column(
        String(36),
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
    )

    # --- Hesaplama ---
    commission_type = Column(
        SAEnum("percentage", "fixed", "per_attendee", name="commission_type_enum"),
        nullable=False, default="percentage",
    )
    rate = Column(Numeric(5, 2), nullable=True)  # Yüzde veya birim tutar
    amount = Column(Numeric(10, 2), nullable=False, default=0.00)
    attendee_count = Column(Integer, nullable=True)

    # --- Dönem ve durum ---
    period = Column(String(20), nullable=True)  # "2024-03" (yıl-ay)
    status = Column(
        SAEnum("pending", "approved", "paid", name="commission_status_enum"),
        nullable=False, default="pending",
    )

    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    tenant = relationship("Tenant", back_populates="staff_commissions")
    staff = relationship("User")
