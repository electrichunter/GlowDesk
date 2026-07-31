"""
CreditEngine — Kredi/seans muhasebesi ve çift taraflı kayıt defteri motoru.

Tüm dikey sektörlerdeki paket kullanımı, dondurma, süre uzatma, iade
ve late-cancellation burn kurallarını yönetir.
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.repositories.package_repository import PackageRepository
from app.models.package import CustomerPackage, PackageLedger
from app.core.exceptions import GlowDeskException


class InsufficientCreditError(GlowDeskException):
    def __init__(self, current_balance: int, required_units: int):
        super().__init__(
            message=f"Yetersiz kredi/seans bakiyesi: Mevcut {current_balance}, gerekli {required_units}.",
            status_code=400,
        )


class CreditEngine:
    def __init__(self, db: Session):
        self.db = db
        self.repo = PackageRepository(db)

    def consume_credit(
        self,
        customer_package_id: str,
        units: int = 1,
        reference_id: Optional[str] = None,
        description: str = "Seans tüketimi",
    ) -> PackageLedger:
        """Kullanıcının paket kredisinden düşüm yapar (debit)."""
        cp = self.repo.get_customer_package_by_id(customer_package_id)
        if not cp or cp.status != "active":
            raise GlowDeskException(message="Geçerli ve aktif bir paket bulunamadı.", status_code=400)

        if cp.remaining_units < units:
            raise InsufficientCreditError(current_balance=cp.remaining_units, required_units=units)

        new_balance = cp.remaining_units - units
        cp.remaining_units = new_balance

        if new_balance == 0:
            cp.status = "exhausted"

        entry = self.repo.add_ledger_entry({
            "customer_package_id": customer_package_id,
            "transaction_type": "debit",
            "units": units,
            "balance_after": new_balance,
            "description": description,
            "reference_id": reference_id,
        })
        return entry

    def refund_credit(
        self,
        customer_package_id: str,
        units: int = 1,
        reference_id: Optional[str] = None,
        description: str = "İptal iadesi",
    ) -> PackageLedger:
        """İptal durumunda krediyi iade eder (credit adjustment)."""
        cp = self.repo.get_customer_package_by_id(customer_package_id)
        if not cp:
            raise GlowDeskException(message="Paket bulunamadı.", status_code=404)

        new_balance = cp.remaining_units + units
        cp.remaining_units = new_balance

        if cp.status == "exhausted":
            cp.status = "active"

        entry = self.repo.add_ledger_entry({
            "customer_package_id": customer_package_id,
            "transaction_type": "credit",
            "units": units,
            "balance_after": new_balance,
            "description": description,
            "reference_id": reference_id,
        })
        return entry

    def burn_credit(
        self,
        customer_package_id: str,
        units: int = 1,
        reference_id: Optional[str] = None,
        description: str = "Late-cancellation / No-show cezası",
    ) -> PackageLedger:
        """Geç iptal veya gelmeme durumunda krediyi yakar (burn)."""
        cp = self.repo.get_customer_package_by_id(customer_package_id)
        if not cp or cp.remaining_units < units:
            raise GlowDeskException(message="Yakılacak kredi bulunamadı veya bakiye yetersiz.", status_code=400)

        new_balance = cp.remaining_units - units
        cp.remaining_units = new_balance

        if new_balance == 0:
            cp.status = "exhausted"

        entry = self.repo.add_ledger_entry({
            "customer_package_id": customer_package_id,
            "transaction_type": "burn",
            "units": units,
            "balance_after": new_balance,
            "description": description,
            "reference_id": reference_id,
        })
        return entry
