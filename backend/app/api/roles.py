from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleResponse, RoleCreate
from pydantic import BaseModel

router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])

class AssignRoleRequest(BaseModel):
    user_id: str
    role_id: str

@router.get("", response_model=List[RoleResponse])
def get_all_roles(db: Session = Depends(get_db)):
    """Tüm sistem ve işletme rollerini listeler"""
    roles = db.query(Role).all()
    return roles

@router.get("/{role_id}", response_model=RoleResponse)
def get_role_by_id(role_id: str, db: Session = Depends(get_db)):
    """Role ID ile detay ve izin listesini getirir"""
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rol bulunamadı.")
    return role

@router.put("/assign")
def assign_role_to_user(payload: AssignRoleRequest, db: Session = Depends(get_db)):
    """Kullanıcıya ilişkisel role_id ve role yetkisi atar"""
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı.")

    role = db.query(Role).filter(Role.id == payload.role_id).first()
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Atanacak rol bulunamadı.")

    user.role_id = role.id
    user.role = role.name
    db.commit()
    db.refresh(user)

    return {
        "message": f"Kullanıcıya '{role.display_name}' rolü başarıyla atandı.",
        "user_id": user.id,
        "role_id": user.role_id,
        "role": user.role,
    }
