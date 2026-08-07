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

    import json
    settings = {}
    if tenant.settings_json:
        try:
            settings = json.loads(tenant.settings_json)
        except Exception:
            pass

    return {
        "id": tenant.id,
        "name": tenant.name,
        "slug": tenant.slug,
        "sector": tenant.sector or "beauty",
        "phone": tenant.phone,
        "email": tenant.email,
        "address": tenant.address or f"{tenant.district or ''}, {tenant.city or 'İstanbul'}",
        "city": tenant.city or "İstanbul",
        "district": tenant.district or "Merkez",
        "staff_count": tenant.staff_count,
        "workstation_count": tenant.workstation_count,
        "rating": settings.get("rating", 4.9),
        "review_count": settings.get("review_count", 28),
        "description": settings.get("description") or f"{tenant.name} — Kaliteli ve hijyenik koşullarda profesyonel randevu hizmeti sunmaktadır.",
        "logo_url": settings.get("logo_url") or "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80",
        "cover_image": settings.get("cover_image") or "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80",
        "gallery_images": settings.get("gallery_images") or [
            "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
        ],
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

from app.schemas.tenant import TenantUpdate
from app.middleware.auth_middleware import get_current_user
from app.schemas.auth import UserPayload

@router.put("/{tenant_id}")
def update_tenant(
    tenant_id: str,
    payload: TenantUpdate,
    db: Session = Depends(get_db),
    current_user: UserPayload = Depends(get_current_user)
):
    if current_user.role not in ["admin", "owner"] or (current_user.role == "owner" and current_user.tenant_id != tenant_id):
        raise HTTPException(status_code=403, detail="Bu işletmeyi güncelleme yetkiniz yok.")

    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="İşletme bulunamadı.")

    data = payload.model_dump(exclude_unset=True)

    for field in ["name", "phone", "email", "city", "district", "neighborhood", "street", "address", "sector"]:
        if field in data and data[field] is not None:
            setattr(tenant, field, data[field])

    import json
    settings = {}
    if tenant.settings_json:
        try:
            settings = json.loads(tenant.settings_json)
        except Exception:
            pass

    for key in ["description", "logo_url", "cover_image"]:
        if key in data and data[key] is not None:
            settings[key] = data[key]

    tenant.settings_json = json.dumps(settings)

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
