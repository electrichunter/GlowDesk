"""
NotificationLog — Bildirim geçmişi modeli.

Tüm kanallar üzerinden gönderilen bildirimlerin değişmez kaydı:
  - SMS (Netgsm / İletimerkezi)
  - WhatsApp (Cloud API — etkileşimli butonlu mesaj)
  - Push Notification (Firebase Cloud Messaging)
  - Email (SMTP / SendGrid / AWS SES)

Şablon tabanlı ve zamanlanabilir bildirimler için altyapı sağlar.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, DateTime,
    ForeignKey, Enum as SAEnum,
)
from sqlalchemy.orm import relationship
from app.db.session import Base


class NotificationLog(Base):
    __tablename__ = "notification_logs"

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

    # --- Kanal ---
    channel = Column(
        SAEnum("sms", "whatsapp", "push", "email", name="notification_channel_enum"),
        nullable=False,
    )

    # --- İçerik ---
    template_key = Column(String(100), nullable=True)
    recipient = Column(String(255), nullable=False)  # Telefon, e-posta vb.
    subject = Column(String(500), nullable=True)
    body = Column(Text, nullable=True)
    payload_json = Column(Text, nullable=True)  # Tam API payload

    # --- Durum ---
    status = Column(
        SAEnum(
            "queued", "sent", "delivered",
            "failed", "cancelled",
            name="notification_status_enum",
        ),
        nullable=False, default="queued",
    )
    error_message = Column(Text, nullable=True)

    # --- Zamanlama ---
    scheduled_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    tenant = relationship("Tenant", back_populates="notification_logs")

    __table_args__ = {
        'mysql_engine': 'InnoDB',
        'mysql_charset': 'utf8mb4',
        'mysql_collate': 'utf8mb4_unicode_ci',
    }

