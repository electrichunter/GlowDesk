import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Numeric, Date, DateTime, ForeignKey
)
from app.db.session import Base

class FinancialEntry(Base):
    """
    Gelir - Gider Kasa Yönetimi SQL Tablosu (financial_entries)
    """
    __tablename__ = "financial_entries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(String(20), nullable=False, default="income") # 'income' (Gelir) or 'expense' (Gider)
    category = Column(String(100), nullable=False, default="Diğer") # Kira, Maaş, Fatura, Malzeme, Müşteri Ödemesi, Danışmanlık vb.
    amount = Column(Numeric(12, 2), nullable=False, default=0.00)
    description = Column(Text, nullable=True)
    payment_method = Column(String(50), nullable=False, default="Nakit") # Nakit, Kredi Kartı, Banka Transferi / EFT
    entry_date = Column(Date, nullable=False, default=date.today)

    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = {
        'mysql_engine': 'InnoDB',
        'mysql_charset': 'utf8mb4',
        'mysql_collate': 'utf8mb4_unicode_ci',
    }

