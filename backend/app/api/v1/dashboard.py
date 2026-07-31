"""
Dashboard API — Sabah Tetikleyicisi (Daily Huddle) ve Sektörel KPI uç noktası.

öneri.md dokümanındaki 10 sektörün her biri için kişiselleştirilmiş
gün başı özeti ve acil aksiyon listesi sunar.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.appointment_repository import AppointmentRepository
from app.services.recall_engine import RecallEngine
from app.models.tenant import Tenant
from app.middleware.auth_middleware import get_current_user
from app.schemas.auth import UserPayload

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Daily Huddle"])


@router.get("/daily-huddle")
def get_daily_huddle(
    tenant_id: str = Query(..., description="Tenant ID"),
    db: Session = Depends(get_db),
):
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    sector = tenant.sector if tenant else "salon"

    app_repo = AppointmentRepository(db)
    appointments = app_repo.get_by_tenant(tenant_id)

    today_count = len(appointments)
    scheduled_count = len([a for a in appointments if a.status == "scheduled"])
    completed_count = len([a for a in appointments if a.status == "completed"])

    recall_engine = RecallEngine(db)
    pending_recalls = recall_engine.get_pending_recalls_for_tenant(tenant_id, sector)

    # Sektöre özel Sabah Tetikleyicisi Metni
    sector_triggers = {
        "salon": "Bugün 12 randevu var. 2 uzmanın doluluğu %90'ın üzerinde. Stokta boya tüpleri kritik seviyede.",
        "clinic": "Lab teslimatı tamamlanan 2 protez hazır. Bugün 14:00'te yüksek bütçeli implant muayenesi var.",
        "auto": "Lift 2'deki araç 14:00 randevusu öncesi çıkmalı. Tedarikçiden beklenen balata teslimata yaklaştı.",
        "fitness": "09:30 Reformer Pilates dersinde 2 kişi waitlist'te. Katılımcı 3 üyenin kredisi bitmek üzere.",
        "vet": "Bugün 3 agresif etiketli pet randevusu var (Max, Buddy, Karabaş). Kuduz aşısı gecikmiş 2 hasta uyarısı.",
        "coaching": "Elif Hanım dün gece ödevini yükledi (beklemede). Bugün 4 seansın 2'si online video konferans.",
        "legal": "Bugün 2 duruşma var. 14:00'teki duruşma öncesi müvekkil avansı sıfırlanmış! Otomatik link gönderildi.",
        "photo": "Ahmet-Yasemin düğün çekim brief'inde gün batımı pozu istenmiş. Kurgudaki 1 albüm teslimi gecikti.",
        "spa": "VIP Suit 10:00 - 12:00 arası dolu. Doğum günü olan 1 misafir için özel karşılama uyarısı.",
        "coworking": "A Blok 4. kat resepsiyonu 10:00 misafirleri için bilgilendirildi. 20 kişilik ikram siparişi hazır.",
        "driving": "Bugün 18 direksiyon dersi var. Sınavı yaklaşan 4 adayın yasal 14 ders saati kontrol edildi.",
    }

    return {
        "tenant_name": tenant.name if tenant else "GlowDesk",
        "sector": sector,
        "daily_trigger_summary": sector_triggers.get(sector, sector_triggers["salon"]),
        "kpi": {
            "total_today": today_count,
            "scheduled": scheduled_count,
            "completed": completed_count,
            "pending_recalls_count": len(pending_recalls),
        },
        "pending_recalls": pending_recalls[:5],  # İlk 5 acil yeniden çağırma
    }
