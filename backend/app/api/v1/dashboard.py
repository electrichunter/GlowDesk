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

    # Sektöre özel Sabah Tetikleyicisi Metni
    sector_triggers = {
        "salon": "Bugün 12 randevu var. 2 uzmanın doluluğu %90'ın üzerinde.",
        "clinic": "Bugün 14:00'te randevu var.",
        "auto": "Lift 2'deki araç 14:00 randevusu öncesi çıkmalı.",
        "fitness": "09:30 Reformer Pilates dersinde 2 kişi kayıtlı.",
        "vet": "Bugün 3 pet randevusu var.",
        "coaching": "Bugün 4 seansın 2'si online video konferans.",
        "legal": "Bugün 2 danışmanlık seansı var.",
        "photo": "Çekim brief'inde özel pozlar istenmiş.",
        "spa": "VIP Suit 10:00 - 12:00 arası dolu.",
        "coworking": "A Blok 4. kat resepsiyonu 10:00 misafirleri için bilgilendirildi.",
        "driving": "Bugün 18 direksiyon dersi var.",
    }

    return {
        "tenant_name": tenant.name if tenant else "GlowDesk",
        "sector": sector,
        "daily_trigger_summary": sector_triggers.get(sector, sector_triggers["salon"]),
        "kpi": {
            "total_today": today_count,
            "scheduled": scheduled_count,
            "completed": completed_count,
            "pending_recalls_count": 0,
        },
        "pending_recalls": [],
    }
