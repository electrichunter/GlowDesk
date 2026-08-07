from typing import Optional, List
from datetime import date, time
from pydantic import BaseModel, Field, field_validator

class AppointmentCreate(BaseModel):
    tenant_id: str = Field(..., min_length=2)
    service_id: Optional[str] = None
    staff_id: Optional[str] = None
    customer_name: str = Field(..., min_length=2, max_length=255)
    customer_phone: str = Field(..., min_length=5, max_length=50)
    appointment_date: date
    start_time: time
    end_time: time
    notes: Optional[str] = None
    total_price: Optional[float] = Field(0.0, ge=0.0)

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, v: time, info):
        start = info.data.get("start_time")
        if start and v <= start:
            raise ValueError("Bitiş saati başlangıç saatinden sonra olmalıdır.")
        return v

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
    reference_code: Optional[str] = None
    notes: Optional[str] = None
    total_price: float

    class Config:
        from_attributes = True


