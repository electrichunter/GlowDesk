"""
ResourceBooking — Randevu ↔ Kaynak atomik bağlantısı.

Bir randevunun birden fazla fiziki kaynağı (oda + cihaz + personel)
aynı anda kilitlediği durumları yönetir.

Örnekler:
  - Diş kliniği: hekim + dental ünit + asistan
  - Spa: masör + VIP oda
  - Oto servis: lift + usta
  - Fotoğraf: plato + ışık seti + fotoğrafçı
  - Coworking: toplantı odası + projektör + ikram
"""
import uuid
from datetime import datetime, time, date
from sqlalchemy import (
    Column, String, Time, Date, DateTime, ForeignKey,
    Enum as SAEnum, UniqueConstraint,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class ResourceBooking(Base):
    __tablename__ = "resource_bookings"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    appointment_id = Column(
        String(36),
        ForeignKey("appointments.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    resource_id = Column(
        String(36),
        ForeignKey("resources.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    # --- Zaman aralığı ---
    booking_date = Column(Date, nullable=False, default=date.today, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)

    # --- Durum ---
    status = Column(
        SAEnum(
            "reserved", "in_use", "completed", "cancelled",
            name="resource_booking_status_enum",
        ),
        nullable=False, default="reserved",
    )

    created_at = Column(DateTime, default=datetime.utcnow)

    # --- İlişkiler ---
    appointment = relationship("Appointment", back_populates="resource_bookings")
    resource = relationship("Resource", back_populates="bookings")

    # --- Kısıtlamalar ---
    __table_args__ = (
        UniqueConstraint(
            "resource_id", "booking_date", "start_time", "end_time",
            name="uq_resource_date_time_slot",
        ),

        {
            'mysql_engine': 'InnoDB',
            'mysql_charset': 'utf8mb4',
            'mysql_collate': 'utf8mb4_unicode_ci',
        },
    )
