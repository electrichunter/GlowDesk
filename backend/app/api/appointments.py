from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.appointment import Appointment
from app.schemas.appointment import AppointmentCreate, AppointmentOrchestratedCreate, AppointmentResponse
from app.worker.tasks import send_appointment_reminder

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.post("/", response_model=AppointmentResponse)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    appointment = Appointment(
        tenant_id=payload.tenant_id,
        service_id=payload.service_id,
        staff_id=payload.staff_id,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        appointment_date=payload.appointment_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        notes=payload.notes,
        total_price=payload.total_price or 0.0,
        status="scheduled"
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # Celery asenkron hatırlatıcı görevini tetikle
    send_appointment_reminder.delay(
        appointment_id=appointment.id,
        customer_phone=appointment.customer_phone,
        customer_name=appointment.customer_name,
        date_str=str(appointment.appointment_date)
    )

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
            start_time=payload.start_time,
            end_time=payload.end_time,
            buffer_after_minutes=payload.buffer_after_minutes or 0,
        )

    # 2. Randevunun oluşturulması
    appointment = Appointment(
        tenant_id=payload.tenant_id,
        service_id=payload.service_id,
        staff_id=payload.staff_id,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        appointment_date=payload.appointment_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        notes=payload.notes,
        total_price=payload.total_price or 0.0,
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
            start_time=payload.start_time,
            end_time=payload.end_time,
        )

    # Celery asenkron hatırlatıcı
    send_appointment_reminder.delay(
        appointment_id=appointment.id,
        customer_phone=appointment.customer_phone,
        customer_name=appointment.customer_name,
        date_str=str(appointment.appointment_date)
    )

    return appointment

@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(tenant_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Appointment)
    if tenant_id:
        query = query.filter(Appointment.tenant_id == tenant_id)
    return query.all()

@router.patch("/{appointment_id}/status")
def update_appointment_status(appointment_id: str, status: str, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Randevu bulunamadı.")
    
    appointment.status = status
    db.commit()
    return {"message": "Randevu durumu güncellendi.", "status": status}
