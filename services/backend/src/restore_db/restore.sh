#!/bin/bash
set -e

# Wait for Postgres to be ready
until pg_isready -h localhost -p 5432 -U "$POSTGRES_USER"; do
  echo "Waiting for Postgres..."
  sleep 2
done

echo "Postgres is ready, restoring database..."

# Restore only if database is empty
TABLE_COUNT=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" | xargs)

if [ "$TABLE_COUNT" -eq "0" ]; then
    echo "Database is empty. Restoring from SQL..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/brandenburg.sql
else
    echo "Database already has tables. Skipping restore."
fi
