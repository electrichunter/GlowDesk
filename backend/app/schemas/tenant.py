from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class TenantUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = None
    city: Optional[str] = Field(None, max_length=100)
    district: Optional[str] = Field(None, max_length=100)
    neighborhood: Optional[str] = Field(None, max_length=100)
    street: Optional[str] = Field(None, max_length=100)
    address: Optional[str] = None
    sector: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None
    logo_url: Optional[str] = None
    cover_image: Optional[str] = None
