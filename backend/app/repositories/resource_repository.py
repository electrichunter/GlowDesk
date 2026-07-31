"""
ResourceRepository — Fiziki kaynak veri erişim katmanı.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.resource import Resource
from app.models.resource_booking import ResourceBooking


class ResourceRepository(BaseRepository[Resource]):
    def __init__(self, db: Session):
        super().__init__(Resource, db)

    def get_by_tenant(self, tenant_id: str, resource_type: Optional[str] = None) -> List[Resource]:
        query = self.db.query(Resource).filter(Resource.tenant_id == tenant_id)
        if resource_type:
            query = query.filter(Resource.resource_type == resource_type)
        return query.all()

    def get_available_resources(self, tenant_id: str, resource_type: str) -> List[Resource]:
        return (
            self.db.query(Resource)
            .filter(
                Resource.tenant_id == tenant_id,
                Resource.resource_type == resource_type,
                Resource.is_available == True,
            )
            .all()
        )

    def get_bookings_in_slot(self, resource_id: str, start_time, end_time) -> List[ResourceBooking]:
        return (
            self.db.query(ResourceBooking)
            .filter(
                ResourceBooking.resource_id == resource_id,
                ResourceBooking.status == "reserved",
                ResourceBooking.start_time < end_time,
                ResourceBooking.end_time > start_time,
            )
            .all()
        )
