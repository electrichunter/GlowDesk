"""
Resources API — Fiziki kaynak yönetimi ve çakışma kontrolü uç noktaları.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.resource_repository import ResourceRepository
from app.schemas.auth import UserPayload
from app.middleware.auth_middleware import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/resources", tags=["Resources"])


class ResourceCreate(BaseModel):
    name: str
    resource_type: str = "room"  # room, equipment, station, vehicle, seat, bay, studio, other
    description: Optional[str] = None
    capacity: int = 1
    buffer_after_minutes: int = 0
    metadata_json: Optional[str] = None


@router.get("/")
def list_resources(
    tenant_id: str = Query(..., description="Tenant ID"),
    resource_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    repo = ResourceRepository(db)
    return repo.get_by_tenant(tenant_id, resource_type)


@router.post("/")
def create_resource(
    payload: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: UserPayload = Depends(get_current_user),
):
    repo = ResourceRepository(db)
    data = payload.dict()
    data["tenant_id"] = current_user.tenant_id or "global"
    return repo.create(data)


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: str,
    db: Session = Depends(get_db),
    current_user: UserPayload = Depends(get_current_user),
):
    repo = ResourceRepository(db)
    success = repo.delete(resource_id)
    if not success:
        raise HTTPException(status_code=404, detail="Kaynak bulunamadı.")
    return {"message": "Kaynak başarıyla silindi."}
