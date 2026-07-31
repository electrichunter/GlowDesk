from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import GlowDeskException, glowdesk_exception_handler, global_exception_handler
from app.middleware.rate_limiter import limiter
from app.db.session import engine, Base
from app.api import auth, appointments, storage, tenants, users, staff, invoices, customers, services, blog, roles
from app.api.v1 import (
    health, waitlist, notifications, chat, payments,
    resources, packages, commissions, dashboard,
)
import app.models  # Register all models with Base

# Setup structured logging
logger = setup_logging()

# Initialize DB Tables (Self-healing schema creation)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs"
)

# Attach state for slowapi Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Exception Handlers
app.add_exception_handler(GlowDeskException, glowdesk_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
api_prefix = settings.API_V1_STR

app.include_router(auth.router, prefix=api_prefix)
app.include_router(appointments.router, prefix=api_prefix)
app.include_router(storage.router, prefix=api_prefix)
app.include_router(tenants.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(roles.router, prefix=api_prefix)
app.include_router(staff.router, prefix=api_prefix)
app.include_router(invoices.router, prefix=api_prefix)
app.include_router(customers.router, prefix=api_prefix)
app.include_router(services.router, prefix=api_prefix)
app.include_router(blog.router, prefix=api_prefix)

# Additional Module Routers
app.include_router(health.router, prefix=api_prefix)
app.include_router(waitlist.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(chat.router, prefix=api_prefix)
app.include_router(payments.router, prefix=api_prefix)
app.include_router(resources.router, prefix=api_prefix)
app.include_router(packages.router, prefix=api_prefix)
app.include_router(commissions.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": f"{settings.API_V1_STR}/docs"
    }

