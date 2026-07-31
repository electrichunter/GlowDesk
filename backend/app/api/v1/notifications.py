from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from app.services.notification_service import NotificationService

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
