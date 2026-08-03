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
    resources, packages, dashboard, legal, finance,
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
    "http://127.0.0.1",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under both /api/v1 and /api for backward & frontend compatibility
routers = [
    auth.router, appointments.router, storage.router, tenants.router,
    users.router, roles.router, staff.router, invoices.router,
    customers.router, services.router, blog.router, health.router,
    waitlist.router, notifications.router, chat.router, payments.router,
<<<<<<< Updated upstream
    resources.router, packages.router, commissions.router, dashboard.router
=======
    resources.router, packages.router, dashboard.router, legal.router, finance.router
>>>>>>> Stashed changes
]

for router in routers:
    app.include_router(router, prefix="/api/v1")
    app.include_router(router, prefix="/api")

@app.get("/")
@app.get("/api")
@app.get("/api/v1")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": f"{settings.API_V1_STR}/docs"
    }
