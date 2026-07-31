from fastapi import Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger("glowdesk.exceptions")

class GlowDeskException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_400_BAD_REQUEST, details: dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)

class NotFoundError(GlowDeskException):
    def __init__(self, resource: str = "Kaynaksız öge"):
        super().__init__(message=f"{resource} bulunamadı.", status_code=status.HTTP_404_NOT_FOUND)

class UnauthorizedError(GlowDeskException):
    def __init__(self, message: str = "Yetkisiz erişim denemesi."):
        super().__init__(message=message, status_code=status.HTTP_401_UNAUTHORIZED)

class ForbiddenError(GlowDeskException):
    def __init__(self, message: str = "Bu işlem için yetkiniz yok."):
        super().__init__(message=message, status_code=status.HTTP_403_FORBIDDEN)

class ConflictError(GlowDeskException):
    def __init__(self, message: str = "Kayıt zaten mevcut."):
        super().__init__(message=message, status_code=status.HTTP_409_CONFLICT)

async def glowdesk_exception_handler(request: Request, exc: GlowDeskException):
    logger.warning(f"GlowDeskException [{exc.status_code}] on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "details": exc.details
        }
    )

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Beklenmeyen bir sunucu hatası oluştu.",
            "details": str(exc) if getattr(request.app, "debug", False) else {}
        }
    )
