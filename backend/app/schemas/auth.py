from typing import Optional
from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserPayload(BaseModel):
    user_id: str = "user-123"
    email: Optional[str] = "admin@glowdesk.com"
    tenant_id: Optional[str] = "tenant-1"
    role: Optional[str] = "admin"

class RegisterBusinessRequest(BaseModel):
    businessName: str
    ownerName: str
    email: EmailStr
    phone: str
    password: str
    sector: str = "beauty"
    city: Optional[str] = "İstanbul"
    district: Optional[str] = "Merkez"
    neighborhood: Optional[str] = None
    street: Optional[str] = None
    address: Optional[str] = None
    staffCount: Optional[str] = "1-3"
    workstationCount: Optional[str] = "1-3"
    lat: Optional[str] = None
    lng: Optional[str] = None

class RegisterCustomerRequest(BaseModel):
    fullName: str
    email: EmailStr
    phone: str
    password: str
