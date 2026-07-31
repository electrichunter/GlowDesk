import json
import logging
from typing import Any, Optional
import redis
from app.core.config import settings

logger = logging.getLogger("glowdesk.cache")

class CacheService:
    def __init__(self):
        try:
            self.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.error(f"Redis connection error: {e}")
            self.client = None

    def get(self, key: str) -> Optional[Any]:
        if not self.client:
            return None
        try:
            val = self.client.get(key)
            if val:
                return json.loads(val)
        except Exception as e:
            logger.warning(f"Cache get error for key '{key}': {e}")
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        if not self.client:
            return False
        try:
            serialized = json.dumps(value, default=str)
            return bool(self.client.setex(key, ttl_seconds, serialized))
        except Exception as e:
            logger.warning(f"Cache set error for key '{key}': {e}")
            return False

    def delete(self, key: str) -> bool:
        if not self.client:
            return False
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            logger.warning(f"Cache delete error for key '{key}': {e}")
            return False

    def clear_pattern(self, pattern: str) -> int:
        if not self.client:
            return 0
        try:
            keys = self.client.keys(pattern)
            if keys:
                return self.client.delete(*keys)
        except Exception as e:
            logger.warning(f"Cache clear_pattern error for '{pattern}': {e}")
        return 0

cache_service = CacheService()
