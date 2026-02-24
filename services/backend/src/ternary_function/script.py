# ternary.py
from sqlalchemy import create_engine, text
from os import getenv

dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'brandenburg'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}

# Define your PostgreSQL connection string
DATABASE_URL = f"postgresql://{dbConfig['user']}:{dbConfig['password']}@{dbConfig['host']}:{dbConfig['port']}/{dbConfig['dbname']}"

# SQL to create the ternary function
CREATE_TERNARY_SQL = """
CREATE OR REPLACE FUNCTION public.get_ternary_data(
    ind1 text, zeit1 integer,
    ind2 text, zeit2 integer,
    ind3 text, zeit3 integer,
    gran text
)
RETURNS TABLE(
    kennziffer text,
    share1 double precision,
    share2 double precision,
    share3 double precision
)
LANGUAGE sql
AS $function$
WITH ranked AS (
    SELECT
        kennziffer,
        indikator,
        zeitbezug,
        percent_rank() OVER (
            PARTITION BY indikator, zeitbezug, granularity
            ORDER BY wert
        ) AS pct
    FROM dashboard_data_de
    WHERE (
        (indikator = ind1 AND zeitbezug = zeit1)
        OR (indikator = ind2 AND zeitbezug = zeit2)
        OR (indikator = ind3 AND zeitbezug = zeit3)
    )
    AND granularity = gran
),
base AS (
    SELECT
        kennziffer,
        MAX(CASE WHEN indikator = ind1 AND zeitbezug = zeit1 THEN pct END) AS val1,
        MAX(CASE WHEN indikator = ind2 AND zeitbezug = zeit2 THEN pct END) AS val2,
        MAX(CASE WHEN indikator = ind3 AND zeitbezug = zeit3 THEN pct END) AS val3
    FROM ranked
    GROUP BY kennziffer
),
filtered AS (
    SELECT * FROM base
    WHERE val1 IS NOT NULL
      AND val2 IS NOT NULL
      AND val3 IS NOT NULL
),
total AS (
    SELECT *,
           NULLIF(val1 + val2 + val3, 0) AS row_sum
    FROM filtered
)
SELECT
    kennziffer,
    val1 / row_sum AS share1,
    val2 / row_sum AS share2,
    val3 / row_sum AS share3
FROM total
WHERE row_sum IS NOT NULL;
$function$;
"""



def define_ternary_function():
    """Create ternary function in PostgreSQL"""
    print("Executing SQL to create ternary function...")

    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        connection.execute(text(CREATE_TERNARY_SQL))
        connection.commit()  # Ensure function is created
    print("Created ternary function.")

if __name__ == "__main__":
    define_ternary_function()

