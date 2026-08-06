from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.service import Service
import uuid

router = APIRouter(prefix="/services", tags=["Services Catalog"])

class ServiceCreate(BaseModel):
    tenantId: str
    name: str
    category: Optional[str] = "Genel"
    durationMinutes: int = 30
    price: float = 0.0
    description: Optional[str] = None

class ServiceResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    category: Optional[str]
    duration_minutes: int
    price: float
    description: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/public/{tenant_id}", response_model=List[ServiceResponse])
def list_public_services_by_tenant(tenant_id: str, db: Session = Depends(get_db)):
    return db.query(Service).filter(Service.tenant_id == tenant_id, Service.is_active == True).all()

@router.get("", response_model=List[ServiceResponse])
def list_services(tenant_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Service).filter(Service.is_active == True)
    if tenant_id:
        query = query.filter(Service.tenant_id == tenant_id)
    return query.all()

@router.post("", response_model=ServiceResponse)
def create_service(payload: ServiceCreate, db: Session = Depends(get_db)):
    svc = Service(
        id=f"svc-{uuid.uuid4().hex[:8]}",
        tenant_id=payload.tenantId,
        name=payload.name,
        category=payload.category or "Genel",
        duration_minutes=payload.durationMinutes,
        price=payload.price,
        description=payload.description,
        is_active=True
    )
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return svc

@router.delete("/{service_id}")
def delete_service(service_id: str, db: Session = Depends(get_db)):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Hizmet bulunamadı.")
    svc.is_active = False
    db.commit()
    return {"message": "Hizmet silindi."}
