import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Numeric, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.db.session import Base

class LegalMatter(Base):
    """
    Hukuk Büroları için Dava ve Danışmanlık Dosyaları SQL Tablosu (legal_matters)
    """
    __tablename__ = "legal_matters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    client_name = Column(String(255), nullable=False)
    client_phone = Column(String(50), nullable=True)
    client_email = Column(String(255), nullable=True)
    
    case_number = Column(String(100), nullable=True)  # ör. 2026/452 Esas
    court_name = Column(String(255), nullable=True)   # ör. İstanbul 14. İş Mahkemesi
    matter_type = Column(String(100), nullable=False, default="İş Hukuku") # İş, Boşanma, Ceza, Ticaret, Gayrimenkul
    status = Column(String(50), nullable=False, default="open") # open, hearing_scheduled, closed, execution
    
    retainer_amount = Column(Numeric(12, 2), default=0.00) # Avans / Vekalet Ücreti
    billed_hours = Column(Numeric(8, 2), default=0.00)     # Faturalandırılan Saat
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hearings = relationship("CourtHearing", back_populates="matter", cascade="all, delete-orphan")
