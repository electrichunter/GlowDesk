from app.services.notification_service import NotificationService

def test_send_sms_success():
    result = NotificationService.send_sms("+905551234567", "Test mesajı")
    assert result is True

def test_send_email_success():
    result = NotificationService.send_email("test@glowdesk.com", "Konu", "İçerik")
    assert result is True
