from typing import Optional, List
from datetime import date, time
from pydantic import BaseModel

class AppointmentCreate(BaseModel):
    tenant_id: str
    service_id: Optional[str] = None
    staff_id: Optional[str] = None
    customer_name: str
    customer_phone: str
    appointment_date: date
    start_time: time
    end_time: time
    notes: Optional[str] = None
    total_price: Optional[float] = 0.0

class AppointmentOrchestratedCreate(AppointmentCreate):
    resource_ids: List[str] = []
    buffer_after_minutes: Optional[int] = 0

class AppointmentResponse(BaseModel):
    id: str
    tenant_id: str
    customer_name: str
    customer_phone: str
    appointment_date: date
    start_time: time
    end_time: time
    status: str
    notes: Optional[str] = None
    total_price: float

    class Config:
        from_attributes = True

