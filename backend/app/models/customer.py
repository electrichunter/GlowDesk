import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), nullable=False, default="global")
    profile_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    is_blacklisted = Column(Boolean, default=False, nullable=False)
    no_show_count = Column(Integer, default=0, nullable=False)
    appointment_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
