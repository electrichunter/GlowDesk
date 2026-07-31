import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.db.session import Base

class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    cover_image = Column(Text, nullable=True)
    author_name = Column(String(100), default="GlowDesk Editör", nullable=False)
    author_role = Column(String(50), default="editor", nullable=False)
    category = Column(String(100), default="Genel", nullable=False)
    status = Column(String(50), default="published", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
