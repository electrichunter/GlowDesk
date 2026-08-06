"""
PaymentTransaction — Ödeme işlemleri modeli.

Tüm finansal hareketlerin değişmez kaydı:
  - deposit:   Kapara (randevu alırken)
  - pre_auth:  Kart ön otorizasyonu (tutulur, gelince release, gelmezse capture)
  - full:      Tam ödeme
  - partial:   Kısmi ödeme (aşamalı ödeme — fotoğraf sektörü)
  - refund:    İade
  - capture:   Pre-auth'un gerçek tahsilatı (no-show durumunda)
  - release:   Pre-auth iptali (müşteri geldiğinde)

Idempotency key ile aynı işlemin tekrarlanmasını engeller.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Numeric,
    DateTime, ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(
        String(36), primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    tenant_id = Column(
        String(64),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    customer_id = Column(
        String(36),
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True, index=True,
    )
    appointment_id = Column(
        String(36),
        ForeignKey("appointments.id", ondelete="SET NULL"),
        nullable=True,
    )

    # --- Tutar ---
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="TRY")

    # --- İşlem tipi ---
    payment_type = Column(
        SAEnum(
            "deposit", "pre_auth", "full", "partial",
            "refund", "capture", "release",
            name="payment_type_enum",
        ),
        nullable=False,
    )

    # --- Ödeme geçidi ---
    gateway = Column(
        SAEnum("iyzico", "stripe", "internal", name="payment_gateway_enum"),
        nullable=False, default="iyzico",
    )
    gateway_transaction_id = Column(String(255), nullable=True)
    gateway_response_json = Column(Text, nullable=True)

    # --- Durum ---
    status = Column(
        SAEnum(
            "pending", "completed", "failed",
            "refunded", "cancelled",
            name="payment_status_enum",
        ),
        nullable=False, default="pending",
    )

    # --- Güvenlik ---
    idempotency_key = Column(String(64), unique=True, nullable=True)
    hmac_signature = Column(String(128), nullable=True)

    # --- Açıklama ---
    description = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow,
    )

    # İlişkiler
    tenant = relationship("Tenant", back_populates="payment_transactions")
