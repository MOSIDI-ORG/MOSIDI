#!/bin/bash
set -e

# Only restore if DB is empty
TABLE_COUNT=$(psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" | xargs)

if [ "$TABLE_COUNT" -eq "0" ]; then
    echo "Database is empty. Restoring backup..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/brandenburg.sql
else
    echo "Database already initialized. Skipping restore."
fi



