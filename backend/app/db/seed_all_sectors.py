"""
Seed All Sectors — Tüm 13 Sektör İçin İşletmeler ve Kullanıcılar Oluşturma Scripti
"""
import uuid
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.tenant import Tenant
from app.models.user import User
from app.core.security import get_password_hash
from app.db.seeder import seed_tenant_demo_data

SECTORS = [
    ("beauty", "Glow & Beauty VIP Salonu", "salon@glowdesk.com"),
    ("barber", "Kral Berber & Erkek Kuaförü", "barber@glowdesk.com"),
    ("clinic", "SmileDent Diş & Sağlık Kliniği", "clinic@glowdesk.com"),
    ("auto", "Apex Oto Bakım & Detailing", "auto@glowdesk.com"),
    ("fitness", "FitStudio Pilates & PT Stüdyosu", "fitness@glowdesk.com"),
    ("vet", "VetCare Akıllı Kliniği & Pet Oteli", "vet@glowdesk.com"),
    ("coaching", "Mizan Psikolojik Danışmanlık & Koçluk", "coaching@glowdesk.com"),
    ("legal", "Pusula Hukuk & Danışmanlık Bürosu", "legal@glowdesk.com"),
    ("photo", "Studio Flash Fotoğraf & Ekipman Kiralama", "photo@glowdesk.com"),
    ("spa", "Zen Spa, Masaj & Wellness Tesisleri", "spa@glowdesk.com"),
    ("coworking", "Plaza Coworking & Toplantı Odaları", "coworking@glowdesk.com"),
    ("driving", "Hedef Sürücü Kursu & Direksiyon Eğitimi", "driving@glowdesk.com"),
    ("restoran", "Lalezar Gourmet Restoran & Masa", "restoran@glowdesk.com"),
]

def seed_all():
    db: Session = SessionLocal()
    try:
        print("🌱 Tüm 13 sektör için demo kullanıcılar ve veriler oluşturuluyor...")
        
        # Müşteri Hesabı
        existing_cust = db.query(User).filter(User.email == "musteri@glowdesk.com").first()
        if not existing_cust:
            cust = User(
                email="musteri@glowdesk.com",
                password_hash=get_password_hash("123456"),
                full_name="Caner Yılmaz (Müşteri)",
                phone="05329998877",
                role="customer"
            )
            db.add(cust)
            print("✓ Müşteri hesabı oluşturuldu: musteri@glowdesk.com / 123456")

        for sector_key, name, email in SECTORS:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                slug = f"{sector_key}-{uuid.uuid4().hex[:6]}"
                tenant = Tenant(
                    name=name,
                    slug=slug,
                    sector=sector_key,
                    phone="05321002030",
                    email=email,
                    city="İstanbul",
                    district="Kadıköy",
                    subscription_tier="pro" if sector_key in ["vet", "clinic", "legal"] else "starter",
                    status="active",
                    is_active=True
                )
                db.add(tenant)
                db.flush()

                owner = User(
                    tenant_id=tenant.id,
                    email=email,
                    password_hash=get_password_hash("123456"),
                    full_name=f"{name} Sahibi",
                    phone="05321002030",
                    role="owner"
                )
                db.add(owner)
                db.commit()

                # Seed Demo Data for this tenant
                seed_tenant_demo_data(db, tenant_id=tenant.id, sector=sector_key)
                print(f"✓ {name} ({sector_key}) oluşturuldu -> {email} / 123456")
            else:
                print(f"• {name} ({email}) zaten mevcut.")

        db.commit()
        print("✅ Tüm sektör seeding tamamlandı!")
    except Exception as e:
        print("❌ Seeding hatası:", e)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_all()
