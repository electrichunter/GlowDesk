import pytest
from unittest.mock import MagicMock
from app.services.auth_service import AuthService
from app.core.exceptions import UnauthorizedError, NotFoundError

def test_login_invalid_credentials(db_session):
    service = AuthService(db_session)
    with pytest.raises(UnauthorizedError):
        service.login(email="nonexistent@example.com", password="wrongpassword")

def test_request_password_reset_not_found(db_session):
    service = AuthService(db_session)
    with pytest.raises(NotFoundError):
        service.request_password_reset(email="unknown@example.com")
