import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Numeric, Integer, Date, Time,
    DateTime, ForeignKey, Boolean,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    staff_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    service_id = Column(String(36), ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    service_name = Column(String(255), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    appointment_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String(50), nullable=False, default="scheduled")
    # scheduled, confirmed, in_progress, completed, cancelled, no_show
    notes = Column(Text, nullable=True)
    total_price = Column(Numeric(10, 2), default=0.00)
    vertical = Column(String(50), nullable=False, default="salon")
    sector_data = Column(Text, nullable=True)  # Sektöre özel JSON veri

    # --- Depozito / Kapara ---
    deposit_amount = Column(Numeric(10, 2), nullable=True, default=0.00)
    deposit_status = Column(
        String(20), nullable=True, default="none",
    )  # none, held, captured, released, refunded

    # --- Tekrarlayan Randevu (Recurring) ---
    recurrence_rule = Column(String(255), nullable=True)  # RRULE formatı
    parent_appointment_id = Column(
        String(36),
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
    )  # Tedavi zinciri (diş kliniği faz randevuları)

    # --- Tampon Süreler ---
    buffer_before_minutes = Column(Integer, nullable=False, default=0)
    buffer_after_minutes = Column(Integer, nullable=False, default=0)

    # --- İptal ---
    cancellation_reason = Column(Text, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    cancelled_by = Column(String(36), nullable=True)  # Kullanıcı ID

    # --- Check-in / Check-out ---
    check_in_at = Column(DateTime, nullable=True)
    check_out_at = Column(DateTime, nullable=True)
    is_walk_in = Column(Boolean, nullable=False, default=False)

    # --- Grup / Kontenjan ---
    max_participants = Column(Integer, nullable=True)  # Grup dersleri
    current_participants = Column(Integer, nullable=False, default=1)

    # --- Zaman damgaları ---
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Relationships ---
    tenant = relationship("Tenant", back_populates="appointments")
    resource_bookings = relationship(
        "ResourceBooking", back_populates="appointment",
        cascade="all, delete-orphan",
    )
    parent_appointment = relationship(
        "Appointment", remote_side="Appointment.id",
        foreign_keys=[parent_appointment_id],
    )
