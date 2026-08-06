from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.tenant import Tenant
from app.db.seeder import seed_tenant_demo_data

router = APIRouter(prefix="/tenants", tags=["Tenants"])

@router.get("/public")
def list_public_tenants(
    sector: Optional[str] = None,
    city: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Tenant).filter(Tenant.status == "active")
    
    if sector and sector != "all":
        q = q.filter(Tenant.sector == sector)
    if city and city != "all":
        q = q.filter(Tenant.city == city)
    if query:
        q = q.filter(Tenant.name.ilike(f"%{query}%"))

    tenants = q.order_by(Tenant.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "sector": t.sector or "beauty",
            "phone": t.phone,
            "address": t.address,
            "city": t.city or "İstanbul",
            "district": t.district or "Merkez",
            "rating": 4.9,
            "review_count": 12,
            "image": None,
        }
        for t in tenants
    ]

@router.get("/public/by-slug/{slug}")
def get_public_tenant_by_slug(slug: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.slug == slug, Tenant.status == "active").first()
    if not tenant:
        # Fallback search by ID if slug not found
        tenant = db.query(Tenant).filter(Tenant.id == slug, Tenant.status == "active").first()
    if not tenant:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")

    return {
        "id": tenant.id,
        "name": tenant.name,
        "slug": tenant.slug,
        "sector": tenant.sector or "beauty",
        "phone": tenant.phone,
        "address": tenant.address or f"{tenant.district or ''}, {tenant.city or 'İstanbul'}",
        "city": tenant.city or "İstanbul",
        "district": tenant.district or "Merkez",
        "staff_count": tenant.staff_count,
        "workstation_count": tenant.workstation_count,
        "rating": 4.9,
    }

@router.get("")
def list_tenants(db: Session = Depends(get_db)):
    tenants = db.query(Tenant).filter(Tenant.status == "active").order_by(Tenant.created_at.desc()).all()
    return [
        {
            "id": t.id,
            "name": t.name,
            "slug": t.slug,
            "sector": t.sector or "beauty",
            "phone": t.phone,
            "email": t.email,
            "address": t.address,
            "city": t.city or "İstanbul",
            "district": t.district or "Merkez",
            "subscription_tier": t.subscription_tier or "pro",
            "status": t.status or "active",
            "created_at": t.created_at.isoformat() if t.created_at else None,
            "settings": {
                "description": f"{t.name} — Profesyonel randevu hizmeti.",
                "phone": t.phone or "+90 555 123 4567",
                "city": t.city or "İstanbul",
                "district": t.district or "Merkez",
                "neighborhood": "Merkez Mah.",
                "rating": 5.0,
                "review_count": 1
            }
        }
        for t in tenants
    ]

@router.get("/{tenant_id}")
def get_tenant(tenant_id: str, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")
    
    return {
        "id": tenant.id,
        "name": tenant.name,
        "slug": tenant.slug,
        "sector": tenant.sector,
        "phone": tenant.phone,
        "email": tenant.email,
        "address": tenant.address,
        "city": tenant.city or "İstanbul",
        "district": tenant.district or "Merkez",
        "neighborhood": tenant.neighborhood or "",
        "street": tenant.street or "",
        "subscription_tier": tenant.subscription_tier or "pro",
        "status": tenant.status or "active"
    }

@router.put("/{tenant_id}")
def update_tenant(tenant_id: str, payload: dict, db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")

    if "name" in payload and payload["name"]:
        tenant.name = payload["name"]
    if "phone" in payload:
        tenant.phone = payload["phone"]
    if "email" in payload:
        tenant.email = payload["email"]
    if "city" in payload:
        tenant.city = payload["city"]
    if "district" in payload:
        tenant.district = payload["district"]
    if "neighborhood" in payload:
        tenant.neighborhood = payload["neighborhood"]
    if "street" in payload:
        tenant.street = payload["street"]
    if "address" in payload:
        tenant.address = payload["address"]
    if "sector" in payload and payload["sector"]:
        tenant.sector = payload["sector"]
    if "subscription_tier" in payload and payload["subscription_tier"]:
        tenant.subscription_tier = payload["subscription_tier"]

    db.commit()
    db.refresh(tenant)

    return {
        "message": "İşletme ayarları başarıyla güncellendi.",
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "phone": tenant.phone,
            "city": tenant.city,
            "district": tenant.district,
            "neighborhood": tenant.neighborhood,
            "street": tenant.street,
            "address": tenant.address,
        }
    }

@router.post("/{tenant_id}/seed-demo")
def trigger_seed_demo_data(tenant_id: str, sector: Optional[str] = "beauty", db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")

    sec = sector or tenant.sector or "beauty"
    res = seed_tenant_demo_data(db, tenant_id=tenant_id, sector=sec)
    return res
