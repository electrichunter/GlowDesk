import uuid
import random
from datetime import datetime, timedelta, date, time
from sqlalchemy.orm import Session
from app.models.tenant import Tenant
from app.models.user import User
from app.models.service import Service
from app.models.appointment import Appointment

# Sektöre Özel Hazır Hizmet Paketleri
PRESET_SERVICES = {
    "beauty": [
        {"name": "Saç Kesim & Fön", "duration": 45, "price": 450.0},
        {"name": "Manikür & Pedikür", "duration": 60, "price": 550.0},
        {"name": "Cilt Bakımı & Serum", "duration": 90, "price": 850.0},
        {"name": "Saç Boyama & Ombre", "duration": 120, "price": 1800.0},
        {"name": "Kaş & Kirpik Düzeltme", "duration": 30, "price": 300.0},
    ],
    "restaurant": [
        {"name": "Ana Salon Masası (2-4 Kişi)", "duration": 90, "price": 0.0},
        {"name": "VIP Teras Masası", "duration": 120, "price": 250.0}, # Depozito
        {"name": "Özel Grup Etkinlik Masası", "duration": 180, "price": 500.0},
    ],
    "legal": [
        {"name": "İş Hukuku Danışmanlığı", "duration": 60, "price": 1500.0},
        {"name": "Aile & Boşanma Davası Ön Görüşme", "duration": 60, "price": 2000.0},
        {"name": "Sözleşme İnceleme & Hazırlama", "duration": 90, "price": 3500.0},
        {"name": "Şirket Danışmanlığı (Saatlik)", "duration": 60, "price": 2500.0},
    ]
}

SAMPLE_CUSTOMER_NAMES = [
    ("Ahmet Yılmaz", "05321112233"),
    ("Elif Demir", "05332223344"),
    ("Mehmet Kaya", "05353334455"),
    ("Zeynep Çelik", "05364445566"),
    ("Can Öztürk", "05375556677"),
    ("Ayşe Şahin", "05386667788"),
    ("Murat Arslan", "05397778899"),
    ("Selin Aydın", "05408889900"),
    ("Burak Koç", "05419990011"),
    ("Ece Yıldız", "05420001122"),
]

def seed_tenant_demo_data(db: Session, tenant_id: str, sector: str = "beauty"):
    """
    İşletmeye 50 geçmiş randevu + 10 gelecek randevu + hazır hizmetler & müşteriler yükler.
    "Aha!" anı için canlı ve dolu bir dashboard oluşturur.
    """
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        return {"error": "İşletme bulunamadı."}

    # 1. Hizmetleri Kontrol Et / Oluştur
    db_services = db.query(Service).filter(Service.tenant_id == tenant_id).all()
    if not db_services:
        sector_preset = PRESET_SERVICES.get(sector, PRESET_SERVICES["beauty"])
        for item in sector_preset:
            svc = Service(
                tenant_id=tenant_id,
                name=item["name"],
                duration_minutes=item["duration"],
                price=item["price"],
                is_active=True
            )
            db.add(svc)
        db.commit()
        db_services = db.query(Service).filter(Service.tenant_id == tenant_id).all()

    # 2. Müşteri Profillerini Oluştur
    created_users = []
    for name, phone in SAMPLE_CUSTOMER_NAMES:
        email = f"{name.lower().replace(' ', '.').replace('ç','c').replace('ş','s').replace('ı','i').replace('ö','o').replace('ü','u').replace('ğ','g')}@example.com"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                password_hash="demo_hashed_pw",
                full_name=name,
                phone=phone,
                role="customer"
            )
            db.add(user)
            db.flush()
        created_users.append(user)
    db.commit()

    # 3. 50 Geçmiş Randevu Üret (Son 30 Gün)
    statuses_past = ["completed", "completed", "completed", "cancelled", "no_show"]
    today = date.today()

    for i in range(50):
        days_ago = random.randint(1, 30)
        apt_date = today - timedelta(days=days_ago)
        hour = random.randint(9, 18)
        start_t = time(hour=hour, minute=random.choice([0, 30]))
        end_t = time(hour=hour + 1, minute=start_t.minute)
        
        user = random.choice(created_users)
        svc = random.choice(db_services)
        st = random.choice(statuses_past)

        apt = Appointment(
            tenant_id=tenant_id,
            customer_id=user.id,
            service_id=svc.id,
            service_name=svc.name,
            customer_name=user.full_name,
            customer_phone=user.phone or "05320000000",
            appointment_date=apt_date,
            start_time=start_t,
            end_time=end_t,
            status=st,
            total_price=float(svc.price) if st == "completed" else 0.0,
            vertical=sector,
            notes=f"Otomatik Demo Kaydı #{i+1}"
        )
        db.add(apt)

    # 4. 10 Gelecek Randevu Üret (Önümüzdeki 7 Gün)
    for i in range(10):
        days_ahead = random.randint(1, 7)
        apt_date = today + timedelta(days=days_ahead)
        hour = random.randint(9, 18)
        start_t = time(hour=hour, minute=random.choice([0, 30]))
        end_t = time(hour=hour + 1, minute=start_t.minute)

        user = random.choice(created_users)
        svc = random.choice(db_services)

        apt = Appointment(
            tenant_id=tenant_id,
            customer_id=user.id,
            service_id=svc.id,
            service_name=svc.name,
            customer_name=user.full_name,
            customer_phone=user.phone or "05320000000",
            appointment_date=apt_date,
            start_time=start_t,
            end_time=end_t,
            status="scheduled",
            total_price=float(svc.price),
            vertical=sector,
            notes=f"Gelecek Randevu #{i+1}"
        )
        db.add(apt)

    db.commit()
    return {"message": "Demo verileri başarıyla yüklendi.", "past_appointments": 50, "future_appointments": 10}
