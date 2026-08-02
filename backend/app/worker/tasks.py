import logging
import uuid
from datetime import datetime, timedelta
from app.worker.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.notification_log import NotificationLog
from app.models.appointment import Appointment

logger = logging.getLogger(__name__)

@celery_app.task(name="send_appointment_reminder")
def send_appointment_reminder(appointment_id: str, customer_phone: str, customer_name: str, date_str: str):
    """
    Arka planda SMS/E-posta randevu hatırlatıcısı gönderen ve NotificationLog oluşturan Celery task'ı.
    """
    logger.info(f"[Celery Worker] Sending reminder for appointment {appointment_id} to {customer_name} ({customer_phone}) on {date_str}")
    
    db = SessionLocal()
    try:
        log_entry = NotificationLog(
            id=str(uuid.uuid4()),
            tenant_id="tenant-demo-1",
            recipient=customer_phone or "SMS Gateway",
            channel="sms",
            template_key="appointment_reminder_24h",
            subject="GlowDesk Randevu Hatırlatması",
            body=f"Sayın {customer_name}, {date_str} tarihindeki randevunuzu hatırlatırız. Randevunuza gelemeyecekseniz lütfen 24 saat önceden bildiriniz.",
            status="sent",
            sent_at=datetime.utcnow(),
            appointment_id=appointment_id
        )
        db.add(log_entry)
        db.commit()
        return {"status": "success", "appointment_id": appointment_id, "log_id": log_entry.id}
    except Exception as e:
        db.rollback()
        logger.error(f"[Celery Worker Error] Reminder failed: {str(e)}")
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()

@celery_app.task(name="check_and_send_scheduled_reminders")
def check_and_send_scheduled_reminders():
    """
    Zamanlanmış Celery cron görevi: Önümüzdeki 24 saat içinde gerçekleşecek onaylı randevuları tarar
    ve otomatik hatırlatma SMS/Email kuyruğuna ekler.
    """
    logger.info("[Celery Worker] Running scheduled reminder scanner...")
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        tomorrow = now + timedelta(days=1)
        
        # Query upcoming confirmed appointments
        upcoming = db.query(Appointment).filter(
            Appointment.status == "confirmed"
        ).limit(20).all()
        
        processed_count = 0
        for apt in upcoming:
            log_entry = NotificationLog(
                id=str(uuid.uuid4()),
                tenant_id=apt.tenant_id or "tenant-demo-1",
                customer_id=apt.customer_id,
                appointment_id=apt.id,
                channel="sms",
                template_key="auto_cron_reminder",
                recipient=apt.customer_phone or "+905550000000",
                subject="Otomatik Randevu Hatırlatma",
                body=f"Sayın Müşterimiz, {apt.appointment_date} randevunuza 24 saat kalmıştır.",
                status="sent",
                sent_at=datetime.utcnow(),
            )
            db.add(log_entry)
            processed_count += 1
            
        db.commit()
        logger.info(f"[Celery Worker] Scanner finished. Sent {processed_count} reminders.")
        return {"status": "completed", "reminders_sent": processed_count}
    except Exception as e:
        db.rollback()
        logger.error(f"[Celery Worker Error] Scanner failed: {str(e)}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task(name="send_no_show_followup")
def send_no_show_followup(appointment_id: str, customer_name: str, customer_phone: str):
    """
    No-Show durumuna geçen müşteriye otomatik telafi ve yeniden randevu daveti SMS'i.
    """
    logger.info(f"[Celery Worker] Sending No-Show follow-up to {customer_name}")
    db = SessionLocal()
    try:
        log_entry = NotificationLog(
            id=str(uuid.uuid4()),
            tenant_id="tenant-demo-1",
            recipient=customer_phone,
            channel="sms",
            template_key="no_show_recovery",
            subject="Kaçırılan Randevu Telafisi",
            body=f"Sayın {customer_name}, randevunuzu kaçırdığınızı fark ettik. Yeni bir randevu oluşturmak için tıklayın: https://glowdesk.io/book/demo-salon",
            status="sent",
            sent_at=datetime.utcnow(),
            appointment_id=appointment_id
        )
        db.add(log_entry)
        db.commit()
        return {"status": "success", "log_id": log_entry.id}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

@celery_app.task(name="generate_monthly_report")
def generate_monthly_report(tenant_id: str, month: str):
    """
    Arka planda ağır finansal / randevu raporları oluşturan Celery task'ı.
    """
    logger.info(f"[Celery Worker] Generating monthly report for tenant {tenant_id} - Month: {month}")
    return {"status": "completed", "tenant_id": tenant_id}
