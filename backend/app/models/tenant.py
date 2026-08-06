import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    sector = Column(String(50), nullable=False, default="salon")  # salon, clinic, auto, fitness, vet, coaching, legal, photo, spa, coworking, driving, restoran
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True, default="İstanbul")
    district = Column(String(100), nullable=True, default="Merkez")
    neighborhood = Column(String(100), nullable=True)
    street = Column(String(255), nullable=True)
    staff_count = Column(String(50), nullable=True, default="1-3")
    workstation_count = Column(String(50), nullable=True, default="1-3")
    subscription_tier = Column(String(50), nullable=False, default="pro")
    status = Column(String(50), nullable=False, default="active")
    is_active = Column(Boolean, default=True)

    # --- Sektörel Ayarlar & Konfigürasyon ---
    settings_json = Column(Text, nullable=True)  # Cancellation policy, deposit rates, notification templates, etc.
    timezone = Column(String(50), nullable=False, default="Europe/Istanbul")
    locale = Column(String(10), nullable=False, default="tr_TR")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    services = relationship("Service", back_populates="tenant", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="tenant", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="tenant", cascade="all, delete-orphan")
    packages = relationship("Package", back_populates="tenant", cascade="all, delete-orphan")
    waitlist_entries = relationship("WaitlistEntry", back_populates="tenant", cascade="all, delete-orphan")
    payment_transactions = relationship("PaymentTransaction", back_populates="tenant", cascade="all, delete-orphan")
    notification_logs = relationship("NotificationLog", back_populates="tenant", cascade="all, delete-orphan")
    staff_commissions = relationship("StaffCommission", back_populates="tenant", cascade="all, delete-orphan")

