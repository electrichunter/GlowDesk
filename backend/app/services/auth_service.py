import uuid
from sqlalchemy.orm import Session
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import GlowDeskException, NotFoundError, UnauthorizedError, ConflictError

class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.tenant_repo = TenantRepository(db)

    def login(self, email: str, password: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedError("E-posta veya şifre hatalı.")

        if not user.is_active:
            raise GlowDeskException("Kullanıcı hesabı pasif durumda.", status_code=400)

        token = create_access_token(
            subject=user.id,
            role=user.role,
            email=user.email,
            full_name=user.full_name,
            tenant_id=user.tenant_id
        )

        user_payload = {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "role": user.role,
            "tenantId": user.tenant_id,
            "phone": user.phone
        }

        return {"access_token": token, "token_type": "bearer", "user": user_payload}

    def register_business(self, payload) -> dict:
        existing = self.user_repo.get_by_email(payload.email)
        if existing:
            raise ConflictError("Bu e-posta adresi zaten kayıtlı.")

        slug = payload.businessName.lower().replace(" ", "-").replace("ç", "c").replace("ş", "s").replace("ı", "i").replace("ö", "o").replace("ü", "u").replace("ğ", "g")
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

        tenant_data = {
            "name": payload.businessName,
            "slug": slug,
            "sector": payload.sector,
            "phone": payload.phone,
            "email": payload.email,
            "address": payload.address or f"{payload.neighborhood or ''} {payload.street or ''}, {payload.district}/{payload.city}".strip(),
            "city": payload.city or "İstanbul",
            "district": payload.district or "Merkez",
            "neighborhood": payload.neighborhood,
            "street": payload.street,
            "staff_count": payload.staffCount or "1-3",
            "workstation_count": payload.workstationCount or "1-3",
            "subscription_tier": "pro",
            "status": "active",
            "is_active": True
        }
        tenant = self.tenant_repo.create(tenant_data)

        user_data = {
            "tenant_id": tenant.id,
            "email": payload.email,
            "password_hash": get_password_hash(payload.password),
            "full_name": payload.ownerName,
            "phone": payload.phone,
            "role": "owner"
        }
        user = self.user_repo.create(user_data)

        token = create_access_token(
            subject=user.id,
            role=user.role,
            email=user.email,
            full_name=user.full_name,
            tenant_id=tenant.id
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
                "city": tenant.city,
                "district": tenant.district,
            }
        }

    def request_password_reset(self, email: str) -> dict:
        user = self.user_repo.get_by_email(email)
        if not user:
            raise NotFoundError("Kullanıcı")
        # Simüle edilen şifre sıfırlama e-posta token'ı
        reset_token = uuid.uuid4().hex
        return {"message": "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.", "reset_token": reset_token}
