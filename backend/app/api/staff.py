from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.models.appointment import Appointment
from app.models.service import Service
from app.core.security import get_password_hash

router = APIRouter(prefix="/staff", tags=["Staff Management & Performance"])

class CreateStaffRequest(BaseModel):
    tenantId: str
    fullName: str
    email: EmailStr
    phone: str
    password: str
    title: Optional[str] = "Uzman" # e.g. Saç Kesim Uzmanı, Sakal Uzmanı

class StaffResponse(BaseModel):
    id: str
    tenantId: Optional[str]
    fullName: str
    email: str
    phone: Optional[str]
    role: str
    title: Optional[str]
    createdAt: Optional[str]

@router.post("", response_model=StaffResponse)
def create_staff(payload: CreateStaffRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi ile zaten bir hesap var.")

    tenant = db.query(Tenant).filter(Tenant.id == payload.tenantId).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")

    user = User(
        tenant_id=payload.tenantId,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.fullName,
        phone=payload.phone,
        role="staff"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "tenantId": user.tenant_id,
        "fullName": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "title": payload.title or "Uzman",
        "createdAt": user.created_at.isoformat() if user.created_at else None
    }

@router.get("")
def list_staff(tenant_id: str, db: Session = Depends(get_db)):
    staff_members = db.query(User).filter(
        User.tenant_id == tenant_id,
        User.role == "staff"
    ).order_by(User.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "tenantId": s.tenant_id,
            "fullName": s.full_name,
            "email": s.email,
            "phone": s.phone,
            "role": s.role,
            "title": "Uzman Staff",
            "createdAt": s.created_at.isoformat() if s.created_at else None
        }
        for s in staff_members
    ]

@router.delete("/{staff_id}")
def delete_staff(staff_id: str, db: Session = Depends(get_db)):
    staff = db.query(User).filter(User.id == staff_id, User.role == "staff").first()
    if not staff:
        raise HTTPException(status_code=404, detail="Çalışan bulunamadı.")

    db.delete(staff)
    db.commit()
    return {"message": "Çalışan sistemden silindi."}

@router.get("/performance")
def get_staff_performance(tenant_id: str, db: Session = Depends(get_db)):
    # 1. Get all staff for tenant
    staff_members = db.query(User).filter(
        User.tenant_id == tenant_id,
        User.role.in_(["staff", "owner"])
    ).all()

    # 2. Compute performance metrics for each staff
    performance_list = []
    for staff in staff_members:
        # All completed appointments for staff
        appts = db.query(Appointment).filter(
            Appointment.tenant_id == tenant_id,
            Appointment.staff_id == staff.id,
            Appointment.status == "completed"
        ).all()

        total_customers = len(appts)
        total_revenue = sum(float(a.total_price or 0) for a in appts)

        # Service breakdown counts (e.g. Saç Kesimi: 52, Sakal Tıraşı: 34)
        service_counts = {}
        for a in appts:
            if a.service_id:
                srv = db.query(Service).filter(Service.id == a.service_id).first()
                srv_name = srv.name if srv else "Genel Hizmet"
            else:
                srv_name = "Genel Hizmet"
            
            service_counts[srv_name] = service_counts.get(srv_name, 0) + 1

        performance_list.append({
            "staffId": staff.id,
            "fullName": staff.full_name,
            "role": staff.role,
            "email": staff.email,
            "totalCustomersServed": total_customers,
            "totalRevenueGenerated": total_revenue,
            "serviceBreakdown": [
                {"serviceName": name, "count": cnt}
                for name, cnt in service_counts.items()
            ]
        })

    return performance_list
