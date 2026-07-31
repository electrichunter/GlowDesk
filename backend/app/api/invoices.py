from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tenant import Tenant
import uuid

router = APIRouter(prefix="/invoices", tags=["Invoicing"])

class InvoiceItem(BaseModel):
    serviceName: str
    price: float
    quantity: int = 1

class CreateInvoiceRequest(BaseModel):
    tenantId: str
    customerName: str
    customerPhone: Optional[str] = None
    staffName: Optional[str] = None
    items: List[InvoiceItem]
    paymentMethod: str = "Nakit" # Nakit, Kredi Kartı, Havale / EFT
    taxRate: float = 20.0 # %20 KDV
    discountAmount: float = 0.0

@router.post("")
def create_invoice(payload: CreateInvoiceRequest, db: Session = Depends(get_db)):
    subtotal = sum(item.price * item.quantity for item in payload.items)
    discounted = max(0.0, subtotal - payload.discountAmount)
    tax_amount = (discounted * payload.taxRate) / 100.0
    grand_total = discounted + tax_amount

    inv_num = f"INV-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

    invoice_data = {
        "invoiceNumber": inv_num,
        "tenantId": payload.tenantId,
        "customerName": payload.customerName,
        "customerPhone": payload.customerPhone,
        "staffName": payload.staffName or "Genel Personel",
        "items": [item.model_dump() for item in payload.items],
        "subtotal": round(subtotal, 2),
        "discountAmount": round(payload.discountAmount, 2),
        "taxRate": payload.taxRate,
        "taxAmount": round(tax_amount, 2),
        "grandTotal": round(grand_total, 2),
        "paymentMethod": payload.paymentMethod,
        "status": "PAID",
        "issuedAt": datetime.utcnow().isoformat()
    }

    return {
        "message": "Fatura başarıyla oluşturuldu.",
        "invoice": invoice_data
    }
