import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Numeric, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    duration_minutes = Column(Integer, nullable=False, default=30)
    price = Column(Numeric(10, 2), nullable=False, default=0.00)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="services")
