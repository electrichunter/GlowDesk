from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.customer import Customer
import uuid

router = APIRouter(prefix="/customers", tags=["Customers CRM"])

class CustomerCreate(BaseModel):
    tenantId: Optional[str] = "global"
    fullName: str
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class CustomerResponse(BaseModel):
    id: str
    tenant_id: str
    full_name: str
    phone: Optional[str]
    email: Optional[str]
    notes: Optional[str]
    is_blacklisted: bool
    no_show_count: int
    appointment_count: int

    class Config:
        from_attributes = True

@router.get("", response_model=List[CustomerResponse])
def list_customers(tenant_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Customer)
    if tenant_id and tenant_id != "global":
        query = query.filter(Customer.tenant_id == tenant_id)
    return query.order_by(Customer.created_at.desc()).all()

@router.post("", response_model=CustomerResponse)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    cust = Customer(
        id=f"cust-{uuid.uuid4().hex[:8]}",
        tenant_id=payload.tenantId or "global",
        full_name=payload.fullName,
        phone=payload.phone,
        email=payload.email,
        notes=payload.notes,
        is_blacklisted=False,
        no_show_count=0,
        appointment_count=0
    )
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust

@router.patch("/{customer_id}/toggle-blacklist")
def toggle_blacklist(customer_id: str, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı.")
    cust.is_blacklisted = not cust.is_blacklisted
    db.commit()
    return {"message": "Karaliste durumu güncellendi.", "is_blacklisted": cust.is_blacklisted}

@router.delete("/{customer_id}")
def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Müşteri bulunamadı.")
    db.delete(cust)
    db.commit()
    return {"message": "Müşteri kalıcı olarak silindi."}
