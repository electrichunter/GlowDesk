from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.core.cache import cache_service

router = APIRouter(prefix="/health", tags=["Healthcheck"])

@router.get("")
def health_check(db: Session = Depends(get_db)):
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "unhealthy"

    redis_status = "healthy" if cache_service.client else "unhealthy"

    return {
        "status": "ok" if db_status == "healthy" else "degraded",
        "service": "GlowDesk FastAPI Core",
        "components": {
            "database": db_status,
            "redis": redis_status,
        }
    }
