from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.repositories.base_repository import BaseRepository

class CustomerRepository(BaseRepository[Customer]):
    def __init__(self, db: Session):
        super().__init__(Customer, db)

    def get_by_tenant(self, tenant_id: str, skip: int = 0, limit: int = 100) -> List[Customer]:
        return self.db.query(Customer).filter(Customer.tenant_id == tenant_id).offset(skip).limit(limit).all()

    def get_by_phone(self, phone: str, tenant_id: Optional[str] = None) -> Optional[Customer]:
        query = self.db.query(Customer).filter(Customer.phone == phone)
        if tenant_id:
            query = query.filter(Customer.tenant_id == tenant_id)
        return query.first()
