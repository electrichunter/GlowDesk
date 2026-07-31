import os
import logging
from typing import BinaryIO, Optional
from minio import Minio
from app.core.config import settings

logger = logging.getLogger("glowdesk.storage")

class StorageService:
    """
    Bulut Depolama Soyutlama Servisi (Cloud Storage Abstraction Layer)
    AWS S3, MinIO ve Yerel Depolama (Local Fallback) arasında şeffaf geçiş sağlar.
    """

    def __init__(self):
        self.endpoint = settings.MINIO_ENDPOINT
        self.access_key = settings.MINIO_ACCESS_KEY
        self.secret_key = settings.MINIO_SECRET_KEY
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self.client: Optional[Minio] = None

        try:
            self.client = Minio(
                self.endpoint,
                access_key=self.access_key,
                secret_key=self.secret_key,
                secure=False
            )
            # Bucket yoksa otomatik oluştur
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"[StorageService] Bucket '{self.bucket_name}' created.")
        except Exception as e:
            logger.warning(f"[StorageService] MinIO connection failed: {e}. Falling back to local storage.")
            self.client = None

    def upload_file(self, file_data: BinaryIO, filename: str, content_type: str, length: int) -> str:
        object_name = f"uploads/{filename}"
        if self.client:
            try:
                self.client.put_object(
                    self.bucket_name,
                    object_name,
                    file_data,
                    length=length,
                    content_type=content_type
                )
                url = f"http://{self.endpoint}/{self.bucket_name}/{object_name}"
                logger.info(f"[StorageService] File uploaded to S3/MinIO: {url}")
                return url
            except Exception as e:
                logger.error(f"[StorageService] S3/MinIO upload error: {e}")

        # Local Fallback
        local_dir = "/tmp/glowdesk_uploads"
        os.makedirs(local_dir, exist_ok=True)
        local_path = os.path.join(local_dir, filename)
        with open(local_path, "wb") as f:
            f.write(file_data.read())
        return f"/storage/local/{filename}"

    def delete_file(self, object_name: str) -> bool:
        if self.client:
            try:
                self.client.remove_object(self.bucket_name, object_name)
                return True
            except Exception as e:
                logger.error(f"[StorageService] Delete file error: {e}")
        return False

storage_service = StorageService()
