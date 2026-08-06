from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.financial_entry import FinancialEntry

router = APIRouter(prefix="/finance", tags=["Finance & Ledger"])

class CreateFinancialEntryRequest(BaseModel):
    tenantId: str
    type: str # 'income' or 'expense'
    category: str # Kira, Maaş, Fatura, Hizmet Geliri, Danışmanlık Ücreti vb.
    amount: float
    description: Optional[str] = None
    paymentMethod: str = "Nakit" # Nakit, Kredi Kartı, Banka Transferi / EFT
    entryDate: Optional[date] = None

@router.get("/entries")
def list_financial_entries(tenant_id: str = "tenant-demo-1", db: Session = Depends(get_db)):
    """
    İşletmeye ait tüm Gelir & Gider hareketlerini ve özet bilançoyu getirir.
    """
    entries = db.query(FinancialEntry).filter(FinancialEntry.tenant_id == tenant_id).order_by(FinancialEntry.entry_date.desc(), FinancialEntry.created_at.desc()).all()
    
    total_income = sum(float(e.amount) for e in entries if e.type == "income")
    total_expense = sum(float(e.amount) for e in entries if e.type == "expense")
    net_balance = total_income - total_expense

    return {
        "summary": {
            "totalIncome": round(total_income, 2),
            "totalExpense": round(total_expense, 2),
            "netBalance": round(net_balance, 2),
            "entryCount": len(entries)
        },
        "entries": entries
    }

@router.post("/entries")
def create_financial_entry(payload: CreateFinancialEntryRequest, db: Session = Depends(get_db)):
    """
    Yeni Gelir veya Gider kaydı ekler.
    """
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Tutar 0'dan büyük olmalıdır.")
    if payload.type not in ["income", "expense"]:
        raise HTTPException(status_code=400, detail="Tür 'income' veya 'expense' olmalıdır.")

    entry = FinancialEntry(
        tenant_id=payload.tenantId,
        type=payload.type,
        category=payload.category,
        amount=payload.amount,
        description=payload.description,
        payment_method=payload.paymentMethod,
        entry_date=payload.entryDate or date.today()
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    return {
        "message": f"Yeni { 'Gelir' if payload.type == 'income' else 'Gider' } kaydı eklendi.",
        "entry": entry
    }

@router.delete("/entries/{entry_id}")
def delete_financial_entry(entry_id: str, tenant_id: str = "tenant-demo-1", db: Session = Depends(get_db)):
    """
    Gelir veya gider kaydını siler.
    """
    entry = db.query(FinancialEntry).filter(FinancialEntry.id == entry_id, FinancialEntry.tenant_id == tenant_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Kasa kaydı bulunamadı.")
    
    db.delete(entry)
    db.commit()

    return {"message": "Kasa kaydı başarıyla silindi."}
