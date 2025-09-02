import psycopg2
from psycopg2 import sql

from os import getenv

dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'brandenburg'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}

def connect():
    
    return psycopg2.connect(
    host=dbConfig['host'],
    port=dbConfig['port'], 
    dbname=dbConfig['dbname'], 
    user=dbConfig['user'], 
    password=dbConfig['password'])

def get_home_data():
    conn = connect()
    cur = conn.cursor()
    cur.execute(r"""
        WITH table_specification AS (
    SELECT 
        c.relname AS table_name,  -- Convert table names to lowercase
        regexp_replace(
            regexp_replace(format_type(a.atttypid, a.atttypmod),'[0-9\(\)]+','', 'g'),
            'geometry|,',
            '',
            'g'
        ) AS data_type
    FROM 
        pg_class c
    JOIN 
        pg_namespace n ON c.relnamespace = n.oid
    JOIN 
        pg_attribute a ON c.oid = a.attrelid
    WHERE 
        n.nspname = 'public'  -- Filter schema
    AND 
        format_type(a.atttypid, a.atttypmod) LIKE 'geometry%'
),
metadata AS (
    SELECT table_name AS table_name, details -- Make metadata table names lowercase as well
    FROM metadata
)
SELECT 
    ts.table_name, ts.data_type, m.details
FROM 
    table_specification ts
LEFT JOIN 
    metadata m ON ts.table_name = m.table_name 
WHERE 
    length(ts.data_type) > 0;
"""
    )
    data = cur.fetchall()
    cur.close()
    conn.close()
    return data

def get_indicator_list():
    conn = connect()
    cur = conn.cursor()
    cur.execute(""" 
        SELECT json_agg(
            jsonb_build_object(
                'indikator', indikator,
                'source', source,
                'granularity', granularity
            )
        )
        FROM (
            SELECT DISTINCT indikator, source, granularity
                FROM dashboard_data_de
        ) subquery;
       """
    )
    indicators = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return indicators

def get_indicator_data(indicator):
    conn = connect()
    cur = conn.cursor()
    
    cur.execute("""SELECT  json_agg(
    json_build_object(
        'kennziffer', kennziffer,
        'wert', wert,
        'zeitbezug', zeitbezug
        )
    ) 
    FROM dashboard_data_de
    WHERE indikator = '%s'; """ % (indicator,))
    
    #cur.execute(""" select zeit_wert_array from dashboard_data_de where indikator = '%s'; """ % (indicator,))

    data = cur.fetchall()
    cur.execute("""SELECT json_agg(row_to_json(d)) 
        FROM (
            SELECT *
            FROM dashboard_data_metadata 
            WHERE kurzname = '%s'
        ) d; """ % (indicator,))
    metadata = cur.fetchall()[0][0]

    cur.execute("""SELECT json_agg(distinct zeitbezug) from dashboard_data_de where indikator = '%s'; """ % (indicator,))
    availabeYears = cur.fetchall()
    
    cur.close()
    conn.close()
    return {'indicator': data, 'metadata': metadata, 'availabeYears': availabeYears}

def get_geojson_data(tablename):
    conn = connect()
    cur = conn.cursor()
  
    cur.execute("""
                SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', json_agg(
                json_build_object(
                    'type', 'Feature',
                    'geometry', ST_AsGeoJSON(t.geom)::json,
                    'properties', to_jsonb(t) - 'geom'
                )
            )
        )
    from "%s" as t
        ;""" %(tablename))
    user = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return user

def get_layer_extent(tablename):
    conn = connect()
    cur = conn.cursor()
  
    cur.execute("""SELECT 
                 json_build_object(
                
            'x-min', min(ST_XMin(geom)),
            'y-min', min(ST_YMin(geom)) ,
            'x-max',max(ST_XMax(geom)),
            'y-max',max(ST_YMax(geom))
                )
        FROM "%s"; 
        """ % (tablename,))
    extent = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return extent

def get_layer_column_names(tablename):
    conn = connect()
    cur = conn.cursor()
  
    cur.execute("""SELECT json_agg(column_name)
                FROM information_schema.columns
                WHERE table_name = '%s'
                AND column_name NOT IN ('geom', 'geometry') ; 
        """ % (tablename,))
    columnNames = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return columnNames

def create_hexagon_function(tablename):
    conn = connect()
    cur = conn.cursor()
  
    # Define function name as "tablename hexagon"
    function_name = f"{tablename} hexagon"

    # Construct the SQL command with placeholders for safer formatting
    query = sql.SQL("""
    CREATE OR REPLACE FUNCTION public.{function_name}(z integer, x integer, y integer, step integer default 6)
    RETURNS bytea
    AS $$
    DECLARE
        result bytea;
    BEGIN
        WITH
        bounds AS (
            SELECT ST_TileEnvelope(z, x, y) AS geom
        ),
        rows AS (
            SELECT Count(p.*) AS point_count, h.i, h.j, h.geom
            FROM TileHexagons(z, x, y, step) h
            JOIN {table_name} p
            ON ST_Intersects(p.geom, ST_Transform(h.geom, 4326))
            GROUP BY h.i, h.j, h.geom
        ),
        mvt AS (
            SELECT ST_AsMVTGeom(rows.geom, bounds.geom) AS geom,
                   rows.point_count, ntile(5) over (order by rows.point_count) as quantile
            FROM rows, bounds
        )
        SELECT ST_AsMVT(mvt, 'default')
        INTO result
        FROM mvt;

        RETURN result;
    END;
    $$ LANGUAGE plpgsql
    STABLE
    STRICT
    PARALLEL SAFE;

    COMMENT ON FUNCTION public.{function_name} IS 'Hex summary of point count in each hexagon. Step parameter determines how many hexes (2^step) to generate per tile.';
    """).format(
        function_name=sql.Identifier(function_name),
        table_name=sql.Identifier(tablename)
    )

    # Execute the formatted query
    cur.execute(query)
    conn.commit()

    cur.close()
    conn.close()

def get_distinct_values_per_column_name(columnName, tableName):
    conn = connect()
    cur = conn.cursor()
    
    cur.execute("""SELECT json_agg(distinct(%s))
                FROM "%s" LIMIT 10;
                
        """ % (columnName, tableName,))
    
    distinct_vals = cur.fetchall()[0][0]
    print(len(distinct_vals))
    if (len(distinct_vals)>100):
        result = "too many rows to be categorized: more than 100"
    else:
        result = distinct_vals
    cur.close()
    conn.close()
    return result

def get_numerical_column_names_for_classification(tableName):
    conn = connect()
    cur = conn.cursor()
    
    cur.execute("""SELECT json_agg(
           json_build_object('column_name', column_name, 'data_type', data_type)
       ) AS columns
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = '%s'
    AND data_type IN ('integer', 'bigint', 'smallint', 'numeric', 'decimal', 'real', 'double precision')
    AND column_name != 'id';
                
        """ % ( tableName,))
    
    distinct_vals = cur.fetchall()[0][0]
    
    cur.close()
    conn.close()
    return distinct_vals

# Helper function to retrieve data from the database
def fetch_column_values_from_db(columnName, tableName):
    conn = connect()  # Your database connection function
    cur = conn.cursor()
    
    # Query to get values from the specified column
    cur.execute("""SELECT %s FROM "%s"
                ;  
        """ % (columnName, tableName,))
    data = [row[0] for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    return data

def get_table_metadata_from_db():
    conn = connect()
    cur = conn.cursor()
    cur.execute("""SELECT json_agg(row_to_json(d)) 
        FROM (
            SELECT *
            FROM table_metadata 
            WHERE geometry_type is not null
    ) d; """ )
    data = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return data

def get_external_wms_layers_from_db():
    conn = connect()
    cur = conn.cursor()
    cur.execute("""SELECT json_agg(row_to_json(d)) 
        FROM (
            SELECT *
            FROM external_wms_sources 
            
    ) d; """ )
    data = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return data