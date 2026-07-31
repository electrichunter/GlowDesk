"""
PackageRepository — Paket, müşteri paketi ve ledger veri erişim katmanı.
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repository import BaseRepository
from app.models.package import Package, CustomerPackage, PackageLedger


class PackageRepository(BaseRepository[Package]):
    def __init__(self, db: Session):
        super().__init__(Package, db)

    def get_by_tenant(self, tenant_id: str) -> List[Package]:
        return self.db.query(Package).filter(Package.tenant_id == tenant_id, Package.is_active == True).all()

    def get_customer_packages(self, customer_id: str, tenant_id: str) -> List[CustomerPackage]:
        return (
            self.db.query(CustomerPackage)
            .filter(
                CustomerPackage.customer_id == customer_id,
                CustomerPackage.tenant_id == tenant_id,
                CustomerPackage.status == "active",
            )
            .all()
        )

    def get_customer_package_by_id(self, cp_id: str) -> Optional[CustomerPackage]:
        return self.db.query(CustomerPackage).filter(CustomerPackage.id == cp_id).first()

    def create_customer_package(self, data: dict) -> CustomerPackage:
        cp = CustomerPackage(**data)
        self.db.add(cp)
        self.db.commit()
        self.db.refresh(cp)
        return cp

    def add_ledger_entry(self, data: dict) -> PackageLedger:
        entry = PackageLedger(**data)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_ledger_history(self, customer_package_id: str) -> List[PackageLedger]:
        return (
            self.db.query(PackageLedger)
            .filter(PackageLedger.customer_package_id == customer_package_id)
            .order_by(PackageLedger.created_at.desc())
            .all()
        )
