import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentOrchestratedCreate, AppointmentResponse
from app.worker.tasks import send_appointment_reminder

router = APIRouter(prefix="/appointments", tags=["Appointments"])

VALID_STATUSES = {"scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show", "pending"}

def generate_reference_code() -> str:
    return f"GLOW-{random.randint(100000, 999999)}"

@router.post("/", response_model=AppointmentResponse)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    valid_service_id = None
    if payload.service_id:
        from app.models.service import Service
        svc = db.query(Service).filter(Service.id == payload.service_id).first()
        if not svc:
            raise HTTPException(status_code=404, detail="Seçilen hizmet bulunamadı.")
        valid_service_id = svc.id

    valid_staff_id = None
    if payload.staff_id:
        from app.models.user import User
        stf = db.query(User).filter(User.id == payload.staff_id).first()
        if not stf:
            raise HTTPException(status_code=404, detail="Seçilen personel bulunamadı.")
        valid_staff_id = stf.id

    ref_code = generate_reference_code()

    appointment = Appointment(
        tenant_id=payload.tenant_id,
        service_id=valid_service_id,
        staff_id=valid_staff_id,
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip(),
        appointment_date=payload.appointment_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        reference_code=ref_code,
        notes=payload.notes,
        total_price=max(0.0, payload.total_price or 0.0),
        status="scheduled"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Celery asenkron hatırlatıcı görevini tetikle
    if appointment.customer_phone:
        try:
            send_appointment_reminder.delay(
                appointment_id=appointment.id,
                customer_phone=appointment.customer_phone,
                customer_name=appointment.customer_name,
                date_str=str(appointment.appointment_date)
            )
        except Exception:
            pass  # Fallback if Celery broker unavailable

    return appointment

@router.post("/orchestrated", response_model=AppointmentResponse)
def create_orchestrated_appointment(
    payload: AppointmentOrchestratedCreate,
    db: Session = Depends(get_db)
):
    from app.services.resource_orchestrator import ResourceOrchestrator
    orchestrator = ResourceOrchestrator(db)

    # 1. Atomik kaynak kontrolü ve kilitlenmesi
    if payload.resource_ids:
        orchestrator.check_and_lock_resources(
            tenant_id=payload.tenant_id,
            resource_ids=payload.resource_ids,
            booking_date=payload.appointment_date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            buffer_after_minutes=payload.buffer_after_minutes or 0,
        )

    ref_code = generate_reference_code()

    # 2. Randevunun oluşturulması
    appointment = Appointment(
        tenant_id=payload.tenant_id,
        service_id=payload.service_id,
        staff_id=payload.staff_id,
        customer_name=payload.customer_name.strip(),
        customer_phone=payload.customer_phone.strip(),
        appointment_date=payload.appointment_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        reference_code=ref_code,
        notes=payload.notes,
        total_price=max(0.0, payload.total_price or 0.0),
        status="scheduled"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # 3. Fiziki kaynakların randevuya bağlanması
    if payload.resource_ids:
        orchestrator.bind_resources_to_appointment(
            appointment_id=appointment.id,
            resource_ids=payload.resource_ids,
            booking_date=payload.appointment_date,
            start_time=payload.start_time,
            end_time=payload.end_time,
        )

    # Celery asenkron hatırlatıcı
    if appointment.customer_phone:
        try:
            send_appointment_reminder.delay(
                appointment_id=appointment.id,
                customer_phone=appointment.customer_phone,
                customer_name=appointment.customer_name,
                date_str=str(appointment.appointment_date)
            )
        except Exception:
            pass

    return appointment

@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(tenant_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Appointment)
    if tenant_id:
        query = query.filter(Appointment.tenant_id == tenant_id)
    return query.order_by(Appointment.appointment_date.desc(), Appointment.start_time.desc()).all()

@router.patch("/{appointment_id}/status")
def update_appointment_status(appointment_id: str, status: str, db: Session = Depends(get_db)):
    if status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz randevu durumu. İzin verilen durumlar: {', '.join(VALID_STATUSES)}"
        )

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu bulunamadı.")
    
    appointment.status = status
    db.commit()
    return {"message": "Randevu durumu güncellendi.", "status": status}
