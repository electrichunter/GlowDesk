"""
Resource — Fiziki kaynak modeli.

Tüm sektörlerdeki fiziki varlıkları temsil eder:
  - Salon: koltuk, cihaz
  - Klinik: dental ünit, röntgen cihazı, operasyon odası
  - Oto Servis: lift, bay, yıkama pedi
  - Fitness: reformer, mat, kalp atış monitörü
  - Spa: masaj odası, VIP suit, sauna
  - Coworking: toplantı odası, özel ofis
  - Fotoğraf: plato, ışık seti, kamera
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Boolean,
    DateTime, ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    tenant_id = Column(
        String(64),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    # --- Tanımlayıcı alanlar ---
    name = Column(String(255), nullable=False)
    resource_type = Column(
        SAEnum(
            "room", "equipment", "station", "vehicle",
            "seat", "bay", "studio", "kennel", "pet_room", "cage", "other",
            name="resource_type_enum",
        ),
        nullable=False, default="room",
    )
    description = Column(Text, nullable=True)

    # --- Kapasite ve uygunluk ---
    capacity = Column(Integer, nullable=False, default=1)
    is_available = Column(Boolean, nullable=False, default=True)

    # --- Sektöre özel ek veri (JSON) ---
    # Örnekler:
    #   clinic:  {"unit_brand": "Planmeca", "has_xray": true}
    #   auto:    {"lift_type": "2_post", "max_weight_kg": 3500}
    #   spa:     {"has_jacuzzi": true, "temperature_control": true}
    metadata_json = Column(Text, nullable=True)

    # --- Bakım / buffer ---
    buffer_after_minutes = Column(Integer, nullable=False, default=0)

    # --- Zaman damgaları ---
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow,
    )

    # --- İlişkiler ---
    tenant = relationship("Tenant", back_populates="resources")
    bookings = relationship(
        "ResourceBooking", back_populates="resource",
        cascade="all, delete-orphan",
    )

    __table_args__ = {
        'mysql_engine': 'InnoDB',
        'mysql_charset': 'utf8mb4',
        'mysql_collate': 'utf8mb4_unicode_ci',
        
    }

