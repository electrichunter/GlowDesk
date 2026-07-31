"""
Commissions API — Personel hakediş/prim takip uç noktaları.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.commission_repository import CommissionRepository
from app.middleware.auth_middleware import get_current_user
from app.schemas.auth import UserPayload

router = APIRouter(prefix="/commissions", tags=["Staff Commissions"])


@router.get("/")
def list_commissions(
    tenant_id: str = Query(..., description="Tenant ID"),
    period: Optional[str] = Query(None, description="Yıl-Ay örn: 2024-03"),
    db: Session = Depends(get_db),
    current_user: UserPayload = Depends(get_current_user),
):
    repo = CommissionRepository(db)
    return repo.get_by_tenant(tenant_id, period)


@router.get("/staff/{staff_id}")
def get_staff_commissions(
    staff_id: str,
    period: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    repo = CommissionRepository(db)
    return repo.get_by_staff(staff_id, period)
