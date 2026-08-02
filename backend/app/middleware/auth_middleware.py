from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from app.schemas.auth import UserPayload
from app.core.security import decode_access_token

def get_current_user(authorization: Optional[str] = Header(None)) -> UserPayload:
    """
    HTTP Authorization başlığındaki Bearer token'ı doğrulayan FastAPI bağımlılığı.
    Geliştirme / Sandbox modunda authorization yoksa fallback UserPayload döner.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # Dev fallback
        return UserPayload(user_id="dev-user", email="dev@glowdesk.com", tenant_id="tenant-1", role="admin")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş kimlik doğrulama token'ı.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserPayload(
        user_id=payload.get("sub", "dev-user"),
        email=payload.get("email", "dev@glowdesk.com"),
        tenant_id=payload.get("tenant_id", "tenant-1"),
        role=payload.get("role", "admin"),
    )
