import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Numeric, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    staff_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    service_id = Column(String(36), ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    service_name = Column(String(255), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    appointment_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    status = Column(String(50), nullable=False, default="scheduled") # scheduled, completed, cancelled
    notes = Column(Text, nullable=True)
    total_price = Column(Numeric(10, 2), default=0.00)
    vertical = Column(String(50), nullable=False, default="salon")
    sector_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="appointments")
