import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.auth import LoginRequest, TokenResponse, RegisterBusinessRequest, RegisterCustomerRequest
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta veya şifre hatalı."
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Kullanıcı hesabı pasif durumda.")

    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first() if user.tenant_id else None
    tenant_sector = tenant.sector if tenant else "legal"

    token = create_access_token(
        subject=user.id,
        role=user.role,
        email=user.email,
        full_name=user.full_name,
        tenant_id=user.tenant_id,
        sector=tenant_sector
    )

    user_payload = {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "role": user.role,
        "tenantId": user.tenant_id,
        "phone": user.phone,
        "sector": tenant_sector,
        "businessName": tenant.name if tenant else None,
    }

    return {"access_token": token, "token_type": "bearer", "user": user_payload}

@router.post("/register/business")
def register_business(payload: RegisterBusinessRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı.")

    # 1. Create Tenant
    slug = payload.businessName.lower().replace(" ", "-").replace("ç", "c").replace("ş", "s").replace("ı", "i").replace("ö", "o").replace("ü", "u").replace("ğ", "g")
    slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    
    tenant = Tenant(
        name=payload.businessName,
        slug=slug,
        sector=payload.sector or "legal",
        phone=payload.phone,
        email=payload.email,
        address=payload.address or (f"{payload.neighborhood or ''} {payload.street or ''}, {payload.district}/{payload.city}".strip()),
        city=payload.city or "İstanbul",
        district=payload.district or "Merkez",
        neighborhood=payload.neighborhood,
        street=payload.street,
        staff_count=payload.staffCount or "1-3",
        workstation_count=payload.workstationCount or "1-3",
        subscription_tier="pro",
        status="active",
        is_active=True
    )
    db.add(tenant)
    db.flush()

    # 2. Create Owner User
    user = User(
        tenant_id=tenant.id,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.ownerName,
        phone=payload.phone,
        role="owner"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        subject=user.id,
        role=user.role,
        email=user.email,
        full_name=user.full_name,
        tenant_id=tenant.id,
        sector=tenant.sector
    )

    return {
        "message": "İşletme kaydı başarıyla oluşturuldu.",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role,
            "tenantId": tenant.id,
            "businessName": tenant.name,
            "sector": tenant.sector,
            "city": tenant.city,
            "district": tenant.district,
            "neighborhood": tenant.neighborhood,
            "street": tenant.street,
            "address": tenant.address,
        }
    }

@router.post("/register/customer")
def register_customer(payload: RegisterCustomerRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı.")

    user = User(
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        full_name=payload.fullName,
        phone=payload.phone,
        role="customer"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(
        subject=user.id,
        role=user.role,
        email=user.email,
        full_name=user.full_name
    )

    return {
        "message": "Müşteri kaydı başarıyla oluşturuldu.",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role
        }
    }

@router.get("/me")
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Yetkilendirme başlığı geçersiz.")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token geçersiz veya süresi dolmuş.")

    user = db.query(User).filter(User.id == payload.get("id")).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı.")

    return {
        "id": user.id,
        "email": user.email,
        "fullName": user.full_name,
        "role": user.role,
        "phone": user.phone,
        "tenantId": user.tenant_id
    }
