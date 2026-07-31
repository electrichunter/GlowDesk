#!/bin/bash
# GlowDesk Automated MySQL Backup Script

DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASSWORD:-glowdesk_secret}"
DB_NAME="${DB_NAME:-glowdesk}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/glowdesk_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting MySQL backup for ${DB_NAME}..."
mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$FILENAME"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully: ${FILENAME}"
    # Retain backups for 7 days only
    find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm -f {} \;
else
    echo "[$(date)] ERROR: Backup failed!" >&2
    exit 1
fi
