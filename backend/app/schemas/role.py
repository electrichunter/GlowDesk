from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class RoleBase(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    permissions: Optional[List[str]] = None

class RoleCreate(RoleBase):
    id: Optional[str] = None

class RoleResponse(RoleBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
