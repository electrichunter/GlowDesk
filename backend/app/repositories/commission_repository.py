"""
CommissionRepository — Personel hakediş/prim veri erişim katmanı.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.staff_commission import StaffCommission


class CommissionRepository(BaseRepository[StaffCommission]):
    def __init__(self, db: Session):
        super().__init__(StaffCommission, db)

    def get_by_tenant(self, tenant_id: str, period: Optional[str] = None) -> List[StaffCommission]:
        query = self.db.query(StaffCommission).filter(StaffCommission.tenant_id == tenant_id)
        if period:
            query = query.filter(StaffCommission.period == period)
        return query.order_by(StaffCommission.created_at.desc()).all()

    def get_by_staff(self, staff_id: str, period: Optional[str] = None) -> List[StaffCommission]:
        query = self.db.query(StaffCommission).filter(StaffCommission.staff_id == staff_id)
        if period:
            query = query.filter(StaffCommission.period == period)
        return query.order_by(StaffCommission.created_at.desc()).all()
