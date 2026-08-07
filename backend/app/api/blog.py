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

DEFAULT_POSTS_SEED = [
    {
        "id": "post-seed-1",
        "title": "Güzellik Salonlarında No-Show Oranını %90 Azaltmanın 5 Altın Yolu",
        "slug": "guzellik-salonlarinda-no-show-oranini-azaltmanin-5-yolu",
        "category": "No-Show Koruması",
        "excerpt": "Randevularına gelmeyen müşteriler nedeniyle yaşanan ciro kaybını engellemenin ve salon doluluk oranını zirveye taşımanın en etkili 5 stratejisi.",
        "content": "<h2>No-Show Sorunu Salon Cironuzu Nasıl Etkiler?</h2><p>Güzellik salonları, kuaförler ve spa merkezlerinde en sık karşılaşılan finansal kayıp nedeni gelmeyen müşteriler durumudur. GlowDesk No-Show Engelleyici ile otomatik kapara ve WhatsApp teyidi alabilirsiniz.</p>",
        "cover_image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
        "author_name": "GlowDesk Editör",
        "status": "published"
    },
    {
        "id": "post-seed-2",
        "title": "WhatsApp Otomasyonu ile Müşteri Sadakatini ve Tekrar Randevu Oranını Artırın",
        "slug": "whatsapp-otomasyonu-ile-musteri-sadakatini-artirin",
        "category": "Pazarlama & Müşteri İlişkileri",
        "excerpt": "Tek tıklamayla randevu teyidi alma, seans sonrası değerlendirme toplama ve müşteri sadakatini katlama yöntemleri.",
        "content": "<h2>Müşteri İletişiminde Otomasyonun Gücü</h2><p>WhatsApp API entegrasyonu sunan modern yazılımlar sayesinde salonunuz 7/24 kesintisiz iletişim kurabilir.</p>",
        "cover_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
        "author_name": "GlowDesk Editör",
        "status": "published"
    },
    {
        "id": "post-seed-3",
        "title": "2026 Salon Yönetim Rehberi: Dijitalleşen İşletmeler Neden 3 Kat Daha Hızlı Büyüyor?",
        "slug": "2026-salon-yonetim-rehberi-dijitallestirme",
        "category": "Salon Yönetimi",
        "excerpt": "Defterle randevu tutma devri sona erdi. Bulut tabanlı yazılımlarla personel performansı ve finansal takvim yönetimi.",
        "content": "<h2>Dijitalleşmenin Getirdiği Esneklik</h2><p>2026 yılında müşterilerin %85'i randevularını mesai saatleri dışında online olarak almak istemektedir.</p>",
        "cover_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
        "author_name": "GlowDesk Editör",
        "status": "published"
    },
    {
        "id": "post-seed-4",
        "title": "Akıllı Bekleme Listesi (Waitlist) İle İptal Edilen Randevuları Kazanca Dönüştürün",
        "slug": "akilli-bekleme-listesi-ile-iptal-randevulari-kazanca-donusturun",
        "category": "Teknoloji & Verimlilik",
        "excerpt": "Son dakika iptallerinde boş kalan seansları yedek bekleme listesindeki müşterilere anında eşleştirerek cironuzu koruyun.",
        "content": "<h2>Waitlist Algoritması Nasıl Çalışır?</h2><p>GlowDesk Bekleme Listesi, yoğun saatlerde yer bulamayan müşterileri kaydeder ve iptal gerçekleştiğinde anında bildirim gönderir.</p>",
        "cover_image": "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
        "author_name": "GlowDesk Editör",
        "status": "published"
    }
]

@router.get("", response_model=List[BlogPostResponse])
def list_blog_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).filter(Post.status == "published").order_by(Post.created_at.desc()).all()
    if not posts:
        # Seed initial posts into database
        for item in DEFAULT_POSTS_SEED:
            p = Post(
                id=item["id"],
                title=item["title"],
                slug=item["slug"],
                category=item["category"],
                excerpt=item["excerpt"],
                content=item["content"],
                cover_image=item["cover_image"],
                author_name=item["author_name"],
                status=item["status"]
            )
            db.add(p)
        db.commit()
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
