from typing import List, Optional
from datetime import datetime, date, time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.legal_matter import LegalMatter
from app.models.court_hearing import CourtHearing

router = APIRouter(prefix="/legal", tags=["Legal Matters & Courts"])

class CreateMatterRequest(BaseModel):
    tenantId: str
    clientName: str
    clientPhone: Optional[str] = None
    clientEmail: Optional[str] = None
    caseNumber: Optional[str] = None
    courtName: Optional[str] = None
    matterType: str = "İş Hukuku"
    retainerAmount: float = 0.0
    notes: Optional[str] = None

class CreateHearingRequest(BaseModel):
    tenantId: str
    matterId: Optional[str] = None
    hearingDate: date
    hearingTime: time
    courtRoom: Optional[str] = "Duruşma Salonu 1"
    lawyerName: Optional[str] = "Sorumlu Avukat"
    notes: Optional[str] = None

@router.get("/matters")
def list_legal_matters(tenant_id: str = "tenant-demo-1", db: Session = Depends(get_db)):
    """
    Hukuk bürosuna ait tüm dava ve danışmanlık dosyalarını döndürür.
    """
    matters = db.query(LegalMatter).filter(LegalMatter.tenant_id == tenant_id).order_by(LegalMatter.created_at.desc()).all()
    return matters

@router.post("/matters")
def create_legal_matter(payload: CreateMatterRequest, db: Session = Depends(get_db)):
    """
    Yeni dava veya danışmanlık dosyası açar.
    """
    matter = LegalMatter(
        tenant_id=payload.tenantId,
        client_name=payload.clientName,
        client_phone=payload.clientPhone,
        client_email=payload.clientEmail,
        case_number=payload.caseNumber,
        court_name=payload.courtName,
        matter_type=payload.matterType,
        retainer_amount=payload.retainerAmount,
        notes=payload.notes,
        status="open"
    )
    db.add(matter)
    db.commit()
    db.refresh(matter)
    return {"message": "Dava dosyası açıldı.", "matter": matter}

@router.get("/hearings")
def list_court_hearings(tenant_id: str = "tenant-demo-1", db: Session = Depends(get_db)):
    """
    Hukuk bürosuna ait duruşma takvimini döndürür.
    """
    hearings = db.query(CourtHearing).filter(CourtHearing.tenant_id == tenant_id).order_by(CourtHearing.hearing_date.asc()).all()
    return hearings

@router.post("/hearings")
def create_court_hearing(payload: CreateHearingRequest, db: Session = Depends(get_db)):
    """
    Yeni duruşma randevusu ekler.
    """
    hearing = CourtHearing(
        tenant_id=payload.tenantId,
        matter_id=payload.matterId,
        hearing_date=payload.hearingDate,
        hearing_time=payload.hearingTime,
        court_room=payload.courtRoom,
        lawyer_name=payload.lawyerName,
        notes=payload.notes,
        status="scheduled"
    )
    db.add(hearing)
    db.commit()
    db.refresh(hearing)
    return {"message": "Duruşma kaydedildi.", "hearing": hearing}
