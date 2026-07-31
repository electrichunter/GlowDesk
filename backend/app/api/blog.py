from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.post import Post
import uuid

router = APIRouter(prefix="/blog", tags=["Blog Engine"])

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    category: Optional[str] = "Genel"
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    author_name: Optional[str] = "GlowDesk Editör"
    status: Optional[str] = "published"

class BlogPostResponse(BaseModel):
    id: str
    title: str
    slug: str
    category: str
    excerpt: Optional[str]
    content: str
    cover_image: Optional[str]
    author_name: str
    status: str
    created_at: Optional[str]

@router.get("", response_model=List[BlogPostResponse])
def list_blog_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.status == "published").order_by(Post.created_at.desc()).all()
    return [
        BlogPostResponse(
            id=p.id,
            title=p.title,
            slug=p.slug,
            category=p.category,
            excerpt=p.excerpt,
            content=p.content,
            cover_image=p.cover_image,
            author_name=p.author_name,
            status=p.status,
            created_at=p.created_at.isoformat() if p.created_at else None
        )
        for p in posts
    ]

@router.get("/{slug}", response_model=BlogPostResponse)
def get_blog_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı.")
    return BlogPostResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        category=post.category,
        excerpt=post.excerpt,
        content=post.content,
        cover_image=post.cover_image,
        author_name=post.author_name,
        status=post.status,
        created_at=post.created_at.isoformat() if post.created_at else None
    )

@router.post("", response_model=BlogPostResponse)
def create_blog_post(payload: BlogPostCreate, db: Session = Depends(get_db)):
    existing = db.query(Post).filter(Post.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu slug ile zaten bir blog yazısı var.")

    post = Post(
        id=f"post-{uuid.uuid4().hex[:8]}",
        title=payload.title,
        slug=payload.slug,
        category=payload.category or "Genel",
        excerpt=payload.excerpt,
        content=payload.content,
        cover_image=payload.cover_image,
        author_name=payload.author_name or "GlowDesk Editör",
        status=payload.status or "published"
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return BlogPostResponse(
        id=post.id,
        title=post.title,
        slug=post.slug,
        category=post.category,
        excerpt=post.excerpt,
        content=post.content,
        cover_image=post.cover_image,
        author_name=post.author_name,
        status=post.status,
        created_at=post.created_at.isoformat() if post.created_at else None
    )

@router.delete("/{post_id}")
def delete_blog_post(post_id: str, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog yazısı bulunamadı.")
    db.delete(post)
    db.commit()
    return {"message": "Blog yazısı silindi."}
