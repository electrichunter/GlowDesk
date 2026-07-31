from typing import List
from fastapi import Depends, Header
from app.core.security import decode_access_token
from app.core.exceptions import UnauthorizedError, ForbiddenError

def require_roles(allowed_roles: List[str]):
    def role_checker(authorization: str = Header(None)):
        if not authorization or not authorization.startswith("Bearer "):
            raise UnauthorizedError("Yetkilendirme başlığı eksik veya geçersiz.")

        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if not payload:
            raise UnauthorizedError("Token geçersiz veya süresi dolmuş.")

        user_role = payload.get("role")
        if user_role not in allowed_roles:
            raise ForbiddenError(f"Bu eylem için yetkiniz yok. Gerekli rol: {allowed_roles}")

        return payload
    return role_checker
