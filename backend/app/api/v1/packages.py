"""
Packages API — Paket şablonları, müşteri paketleri ve bakiye düşüm uç noktaları.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.package_repository import PackageRepository
from app.services.credit_engine import CreditEngine
from app.schemas.auth import UserPayload
from app.middleware.auth_middleware import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/packages", tags=["Packages & Credit Ledger"])


class PackageCreate(BaseModel):
    name: str
    package_type: str = "session"  # session, credit, subscription
    total_units: int = 10
    price: float = 0.0
    validity_days: int = 90
    description: Optional[str] = None


class ConsumeCreditRequest(BaseModel):
    customer_package_id: str
    units: int = 1
    reference_id: Optional[str] = None
    description: str = "Seans tüketimi"


@router.get("/")
def list_packages(
    tenant_id: str = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db),
):
    repo = PackageRepository(db)
    return repo.get_by_tenant(tenant_id)


@router.post("/")
def create_package(
    payload: PackageCreate,
    db: Session = Depends(get_db),
    current_user: UserPayload = Depends(get_current_user),
):
    repo = PackageRepository(db)
    data = payload.dict()
    data["tenant_id"] = current_user.tenant_id or "global"
    return repo.create(data)


@router.get("/customer/{customer_id}")
def get_customer_packages(
    customer_id: str,
    tenant_id: str = Query(...),
    db: Session = Depends(get_db),
):
    repo = PackageRepository(db)
    return repo.get_customer_packages(customer_id, tenant_id)


@router.post("/consume")
def consume_credit(
    payload: ConsumeCreditRequest,
    db: Session = Depends(get_db),
):
    engine = CreditEngine(db)
    ledger_entry = engine.consume_credit(
        customer_package_id=payload.customer_package_id,
        units=payload.units,
        reference_id=payload.reference_id,
        description=payload.description,
    )
    return {"message": "Kredi/seans düşümü başarılı.", "ledger_entry_id": ledger_entry.id, "balance_after": ledger_entry.balance_after}
