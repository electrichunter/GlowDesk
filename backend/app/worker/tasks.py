import logging
from app.worker.celery_app import celery_app

logger = logging.getLogger(__name__)

@celery_app.task(name="send_appointment_reminder")
def send_appointment_reminder(appointment_id: str, customer_phone: str, customer_name: str, date_str: str):
    """
    Arka planda SMS/E-posta randevu hatırlatıcısı gönderen Celery task'ı.
    """
    logger.info(f"[Celery Worker] Sending reminder for appointment {appointment_id} to {customer_name} ({customer_phone}) on {date_str}")
    # SMS / E-posta entegrasyonu buraya gelecek
    return {"status": "success", "appointment_id": appointment_id}

@celery_app.task(name="generate_monthly_report")
def generate_monthly_report(tenant_id: str, month: str):
    """
    Arka planda ağır finansal / randevu raporları oluşturan Celery task'ı.
    """
    logger.info(f"[Celery Worker] Generating monthly report for tenant {tenant_id} - Month: {month}")
    return {"status": "completed", "tenant_id": tenant_id}
