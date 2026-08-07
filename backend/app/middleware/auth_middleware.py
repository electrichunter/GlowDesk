from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from app.schemas.auth import UserPayload
from app.core.security import decode_access_token

def get_current_user(authorization: Optional[str] = Header(None)) -> UserPayload:
    """
    HTTP Authorization başlığındaki Bearer token'ı doğrulayan FastAPI bağımlılığı.
    Kimlik doğrulaması yoksa veya token geçersizse strict HTTP 401 döndürür.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yetkilendirme başlığı (Bearer token) eksik veya geçersiz.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş kimlik doğrulama token'ı.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub") or payload.get("id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz token yapısı.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return UserPayload(
        user_id=str(user_id),
        email=payload.get("email"),
        tenant_id=payload.get("tenantId") or payload.get("tenant_id"),
        role=payload.get("role", "customer"),
    )

