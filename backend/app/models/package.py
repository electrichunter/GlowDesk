"""
Package, CustomerPackage, PackageLedger — Kredi / Seans / Paket sistemi.

Tüm sektörlerde ortak olan kredi/seans tabanlı paket yönetimini sağlar:
  - Fitness: 8'li Reformer Pilates paketi
  - Salon: 5'li bakım paketi
  - Coaching: 20 saatlik IELTS hazırlık
  - Vet: 5'li grooming paketi
  - Coworking: 100 saatlik toplantı odası kredisi

Çift taraflı kayıt defteri (double-entry ledger) ile mali denetim uyumlu.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Numeric, Boolean,
    DateTime, Date, ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class Package(Base):
    """Satılabilir paket şablonu — tenant tarafından tanımlanır."""
    __tablename__ = "packages"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    tenant_id = Column(
        String(64),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    name = Column(String(255), nullable=False)
    package_type = Column(
        SAEnum("session", "credit", "subscription", name="package_type_enum"),
        nullable=False, default="session",
    )
    total_units = Column(Integer, nullable=False, default=1)
    price = Column(Numeric(10, 2), nullable=False, default=0.00)
    validity_days = Column(Integer, nullable=False, default=90)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    tenant = relationship("Tenant", back_populates="packages")
    customer_packages = relationship(
        "CustomerPackage", back_populates="package",
        cascade="all, delete-orphan",
    )


class CustomerPackage(Base):
    """Müşterinin satın aldığı bireysel paket kaydı."""
    __tablename__ = "customer_packages"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    customer_id = Column(
        String(36),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    package_id = Column(
        String(36),
        ForeignKey("packages.id", ondelete="SET NULL"),
        nullable=True,
    )
    tenant_id = Column(
        String(64),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )

    remaining_units = Column(Integer, nullable=False, default=0)
    expires_at = Column(Date, nullable=True)
    status = Column(
        SAEnum("active", "frozen", "expired", "exhausted", name="customer_package_status_enum"),
        nullable=False, default="active",
    )
    frozen_at = Column(DateTime, nullable=True)
    purchased_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    package = relationship("Package", back_populates="customer_packages")
    ledger_entries = relationship(
        "PackageLedger", back_populates="customer_package",
        cascade="all, delete-orphan",
    )


class PackageLedger(Base):
    """
    Çift taraflı kayıt defteri.

    Her işlem bir satır:
      - credit:     Paket satın alımı (+ birim)
      - debit:      Ders/seans tüketimi (- birim)
      - adjustment: Dondurma, süre uzatma, iptal iadesi
      - burn:       Late-cancel veya no-show cezası
    """
    __tablename__ = "package_ledgers"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    customer_package_id = Column(
        String(36),
        ForeignKey("customer_packages.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    transaction_type = Column(
        SAEnum("credit", "debit", "adjustment", "burn", name="ledger_tx_type_enum"),
        nullable=False,
    )
    units = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    description = Column(String(500), nullable=True)
    reference_id = Column(String(36), nullable=True)  # appointment_id vb.
    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    customer_package = relationship("CustomerPackage", back_populates="ledger_entries")
