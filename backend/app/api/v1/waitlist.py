from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])

class WaitlistRequest(BaseModel):
    email: EmailStr
    full_name: str
    business_name: str
    phone: str

@router.post("", status_code=status.HTTP_201_CREATED)
def join_waitlist(payload: WaitlistRequest, db: Session = Depends(get_db)):
    # Bekleme listesi talebi kaydedilir ( DB veya e-posta bildirimi )
    return {
        "message": "Erken erişim bekleme listesine kaydınız alındı.",
        "email": payload.email,
        "status": "pending_approval"
    }
