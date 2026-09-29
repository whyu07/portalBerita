#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/deploy/backups}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="$BACKUP_DIR/portal_berita_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"
cd "$ROOT_DIR"

# The database credentials are already injected into the PostgreSQL container by Compose.
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | gzip > "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"
