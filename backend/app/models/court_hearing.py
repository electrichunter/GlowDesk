import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Date, Time, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class CourtHearing(Base):
    """
    Hukuk Büroları için Duruşma Takvimi SQL Tablosu (court_hearings)
    """
    __tablename__ = "court_hearings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    matter_id = Column(String(36), ForeignKey("legal_matters.id", ondelete="CASCADE"), nullable=True)

    hearing_date = Column(Date, nullable=False)
    hearing_time = Column(Time, nullable=False)
    court_room = Column(String(100), nullable=True)   # ör. Duruşma Salonu 3
    lawyer_name = Column(String(255), nullable=True)   # Sorumlu Avukat
    status = Column(String(50), default="scheduled")   # scheduled, completed, postponed
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    matter = relationship("LegalMatter", back_populates="hearings")

    __table_args__ = {
        'mysql_engine': 'InnoDB',
        'mysql_charset': 'utf8mb4',
        'mysql_collate': 'utf8mb4_unicode_ci',
    }

