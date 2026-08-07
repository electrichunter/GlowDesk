import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Numeric, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    price = Column(Numeric(10, 2), nullable=False, default=0.00)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    # --- Sektörel & Gelişmiş Özellikler ---
    required_resources_json = Column(Text, nullable=True)  # e.g. ["doctor_x", "panoramic_xray"]
    sub_tasks_json = Column(Text, nullable=True)          # e.g. [{"name": "yıkama", "duration": 20}]
    buffer_before_minutes = Column(Integer, nullable=False, default=0)
    buffer_after_minutes = Column(Integer, nullable=False, default=0)
    max_capacity = Column(Integer, nullable=False, default=1)  # Group classes / parallel
    prerequisites_json = Column(Text, nullable=True)      # e.g. {"vaccine_required": true}
    deposit_required = Column(Boolean, nullable=False, default=False)
    deposit_amount = Column(Numeric(10, 2), nullable=True, default=0.00)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="services")

