from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.tenant import Tenant
from app.repositories.base_repository import BaseRepository

class TenantRepository(BaseRepository[Tenant]):
    def __init__(self, db: Session):
        super().__init__(Tenant, db)

    def get_active_tenants(self) -> List[Tenant]:
        return self.db.query(Tenant).filter(Tenant.status == "active").order_by(Tenant.created_at.desc()).all()

    def get_by_slug(self, slug: str) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.slug == slug).first()
