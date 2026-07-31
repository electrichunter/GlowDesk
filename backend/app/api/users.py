from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.tenant import Tenant

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        b_name = None
        if u.tenant_id:
            t = db.query(Tenant).filter(Tenant.id == u.tenant_id).first()
            if t:
                b_name = t.name
        
        result.append({
            "id": u.id,
            "fullName": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role,
            "tenantId": u.tenant_id,
            "businessName": b_name,
            "status": "active" if u.is_active else "banned",
            "createdAt": u.created_at.isoformat() if u.created_at else None
        })
    return result

@router.post("")
def create_user(payload: dict, db: Session = Depends(get_db)):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="E-posta adresi zorunludur.")

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı.")

    from app.core.security import get_password_hash
    pwd = payload.get("password", "GlowDesk123!")
    user = User(
        email=email,
        password_hash=get_password_hash(pwd),
        full_name=payload.get("fullName", "Yeni Kullanıcı"),
        phone=payload.get("phone"),
        role=payload.get("role", "customer"),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "status": "active",
        "createdAt": user.created_at.isoformat() if user.created_at else None
    }

@router.put("/{user_id}")
def update_user(user_id: str, payload: dict, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    if "fullName" in payload and payload["fullName"]:
        user.full_name = payload["fullName"]
    if "email" in payload and payload["email"]:
        user.email = payload["email"]
    if "phone" in payload:
        user.phone = payload["phone"]
    if "role" in payload and payload["role"]:
        user.role = payload["role"]
    if "status" in payload:
        user.is_active = (payload["status"] == "active")

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "fullName": user.full_name,
        "email": user.email,
        "phone": user.phone,
        "role": user.role,
        "status": "active" if user.is_active else "banned"
    }

@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")
    
    # Don't delete super admin
    if user.email == "admin@glowdesk.com":
        raise HTTPException(status_code=400, detail="Super Admin hesabı silinemez.")

    db.delete(user)
    db.commit()
    return {"message": "Kullanıcı veritabanından kalıcı olarak silindi."}
