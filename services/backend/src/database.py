import psycopg2
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
  
    cur.execute("""select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(t.*)::json)
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
