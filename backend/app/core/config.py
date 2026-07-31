import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GlowDesk Core API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # Database
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "glowdesk_secret")
    DB_NAME: str = os.getenv("DB_NAME", "glowdesk")

    @property
    def DATABASE_URL(self) -> str:
        if self.APP_ENV == "test":
            return "sqlite:///:memory:"
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # JWT Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-key-change-in-production-glowdesk")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 Hours

    # Redis & Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # MinIO S3 Object Storage
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "glowdesk-uploads")

    class Config:
        case_sensitive = True

settings = Settings()
