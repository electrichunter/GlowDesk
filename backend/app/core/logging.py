import logging
import sys
from app.core.config import settings

def setup_logging():
    log_level = logging.DEBUG if settings.APP_ENV == "development" else logging.INFO

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] %(levelname)s in %(module)s (%(lineno)d): %(message)s",
            },
            "json": {
                "format": '{"time": "%(asctime)s", "level": "%(levelname)s", "module": "%(module)s", "line": %(lineno)d, "message": "%(message)s"}',
            }
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "default" if settings.APP_ENV == "development" else "json",
            }
        },
        "root": {
            "level": log_level,
            "handlers": ["console"],
        }
    }

    import logging.config
    logging.config.dictConfig(logging_config)
    logger = logging.getLogger("glowdesk")
    logger.info(f"Logging initialized. Environment: {settings.APP_ENV}, Level: {log_level}")
    return logger
