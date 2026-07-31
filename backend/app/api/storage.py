import io
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from minio import Minio
from app.core.config import settings

router = APIRouter(prefix="/storage", tags=["Object Storage (MinIO)"])

def get_minio_client() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False  # Set True in production with SSL
    )

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    client = get_minio_client()

    # Bucket var mı kontrol et, yoksa oluştur
    found = client.bucket_exists(settings.MINIO_BUCKET_NAME)
    if not found:
        client.make_bucket(settings.MINIO_BUCKET_NAME)

    ext = file.filename.split(".")[-1] if "." in file.filename else ""
    object_name = f"{uuid.uuid4()}{'.' + ext if ext else ''}"

    content = await file.read()
    file_size = len(content)

    client.put_object(
        settings.MINIO_BUCKET_NAME,
        object_name,
        io.BytesIO(content),
        length=file_size,
        content_type=file.content_type
    )

    public_url = f"/storage/{settings.MINIO_BUCKET_NAME}/{object_name}"

    return {
        "filename": file.filename,
        "object_name": object_name,
        "bucket": settings.MINIO_BUCKET_NAME,
        "size": file_size,
        "url": public_url
    }
