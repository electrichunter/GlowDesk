from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.notification_log import NotificationLog
from app.services.notification_service import NotificationService
from app.worker.tasks import check_and_send_scheduled_reminders

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class SMSRequest(BaseModel):
    phone: str
    message: str

class EmailRequest(BaseModel):
    to_email: EmailStr
    subject: str
    body: str

@router.post("/sms")
def send_sms_notification(payload: SMSRequest):
    success = NotificationService.send_sms(payload.phone, payload.message)
    return {"status": "sent" if success else "failed", "phone": payload.phone}

@router.post("/email")
def send_email_notification(payload: EmailRequest):
    success = NotificationService.send_email(payload.to_email, payload.subject, payload.body)
    return {"status": "sent" if success else "failed", "email": payload.to_email}

@router.get("/logs")
def get_notification_logs(db: Session = Depends(get_db)):
    """
    Tüm SMS, E-posta ve WhatsApp bildirim gönderim loglarını döndürür.
    """
    logs = db.query(NotificationLog).order_by(NotificationLog.created_at.desc()).limit(50).all()
    return logs

@router.post("/trigger-reminders")
def trigger_manual_reminders():
    """
    Celery bildirim tarama görevini manuel olarak tetikler.
    """
    task = check_and_send_scheduled_reminders.delay()
    return {"status": "triggered", "task_id": task.id}
