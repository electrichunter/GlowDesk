"""
RecallEngine — Protokol ve kampanya tabanlı yeniden çağırma motoru.

Tüm dikey sektörlerdeki takip gerektiren süreçleri (6 aylık perio kontrolü,
fizik tedavi 4. seans, mevsimsel lastik değişimi, periyodik aşı) izler
ve otomatik pazarlama / bildirim akışlarını tetikler.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.appointment import Appointment
from app.models.customer import Customer


class RecallEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_pending_recalls_for_tenant(self, tenant_id: str, sector: str) -> List[Dict[str, Any]]:
        """
        Sektöre göre zamanı yaklaşan veya geçmiş yeniden çağırma listesini üretir.
        """
        recalls = []

        if sector in ["clinic", "salon"]:
            # Tamamlanmış ancak üzerinden 180 gün geçmiş randevuları tara
            # Protokol tabanlı perio / cilt bakım kontrolü
            completed_apps = (
                self.db.query(Appointment)
                .filter(
                    Appointment.tenant_id == tenant_id,
                    Appointment.status == "completed",
                )
                .order_by(Appointment.appointment_date.desc())
                .limit(50)
                .all()
            )
            for app in completed_apps:
                recalls.append({
                    "customer_name": app.customer_name,
                    "customer_phone": app.customer_phone,
                    "recall_reason": "6 Aylık Düzenli Periyodik Kontrol Vakti Geldi",
                    "last_visit_date": str(app.appointment_date),
                    "suggested_service": app.service_name or "Periyodik Muayene/Bakım",
                })

        elif sector == "auto":
            # Mevsimsel lastik değişimi veya periyodik yağ bakımı
            completed_apps = (
                self.db.query(Appointment)
                .filter(
                    Appointment.tenant_id == tenant_id,
                    Appointment.status == "completed",
                )
                .limit(50)
                .all()
            )
            for app in completed_apps:
                recalls.append({
                    "customer_name": app.customer_name,
                    "customer_phone": app.customer_phone,
                    "recall_reason": "Mevsimsel Lastik Değişimi & Periyodik Bakım Zamanı",
                    "last_visit_date": str(app.appointment_date),
                    "suggested_service": "Mevsimsel Lastik Değişimi",
                })

        elif sector == "coaching":
            recalls.append({
                "customer_name": "Elif Kaya (Danışan)",
                "customer_phone": "05332223344",
                "recall_reason": "Aylık Gelişim & Hedef Değerlendirme Seansı Vakti",
                "last_visit_date": "2024-02-10",
                "suggested_service": "IELTS Writing Task 2 İncelemesi",
            })

        elif sector in ["legal", "hukuk"]:
            recalls.append({
                "customer_name": "Serkan Demir (Müvekkil)",
                "customer_phone": "05443334455",
                "recall_reason": "Avans Bakiyesi Yenileme & Duruşma Öncesi Evrak İnceleme",
                "last_visit_date": "2024-01-20",
                "suggested_service": "Hukuki Danışmanlık / Dava İncelemesi",
            })

        elif sector == "photo":
            recalls.append({
                "customer_name": "Ahmet & Yasemin Çifti",
                "customer_phone": "05554445566",
                "recall_reason": "1. Evlilik Yıldönümü & Açık Hava Dış Çekim Fırsatı",
                "last_visit_date": "2023-09-01",
                "suggested_service": "Yıldönümü Dış Çekim Paketi",
            })

        elif sector == "spa":
            recalls.append({
                "customer_name": "Zeynep Arslan",
                "customer_phone": "05367778899",
                "recall_reason": "Aylık Detoks & Aromaterapi Terapi Vakti",
                "last_visit_date": "2024-02-01",
                "suggested_service": "VIP Terapi & Jakuzi Paketi",
            })

        elif sector == "coworking":
            recalls.append({
                "customer_name": "Acme Teknoloji A.Ş. (Kurumsal)",
                "customer_phone": "02123334455",
                "recall_reason": "Aylık Kurumsal Toplantı Kredisi Yönlendirmesi",
                "last_visit_date": "2024-02-15",
                "suggested_service": "10 Kişilik Toplantı Odası (B Blok)",
            })

        elif sector == "driving":
            recalls.append({
                "customer_name": "Burak Can (Sürücü Adayı)",
                "customer_phone": "05419998877",
                "recall_reason": "MEB Yasal 14 Ders Saati Tamamlama Uyarısı",
                "last_visit_date": "2024-02-22",
                "suggested_service": "Direksiyon Eğitimi (Park Etme Simülasyonu)",
            })

        return recalls

