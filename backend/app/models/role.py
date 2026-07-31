import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime
from app.db.session import Base

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), unique=True, nullable=False, index=True) # admin, owner, editor, staff, customer
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    permissions = Column(JSON, nullable=True) # List of permission keys: ["manage_tenants", "manage_appointments"]
    created_at = Column(DateTime, default=datetime.utcnow)
