# metadata.py
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

# The SQL script for creating and populating the table_metadata table
CREATE_METADATA_SQL = """
CREATE OR REPLACE FUNCTION insert_table_metadata() 
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    table_rec RECORD;
    column_rec RECORD;
    indikator_rec RECORD;
    bounding_box GEOMETRY;
    centroid GEOMETRY;
    geom_type TEXT;
BEGIN
    -- Create the metadata table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.table_metadata (
        dct_title TEXT,
        dct_description TEXT,
        dct_catalog_title TEXT,
        dct_catalog_description TEXT,
        dct_catalog_publisher TEXT,
        dct_accessurl TEXT,
        dct_license TEXT,
        dct_identifier TEXT,
        dcatde_contributorid TEXT,
        dct_distribution TEXT,
        dct_language TEXT,
        dct_bbox GEOMETRY,
        dct_centroid GEOMETRY,
        geometry_type TEXT, -- New column for geometry type
        dcatde_politicalGeocodingLevelURI TEXT,
        dcatde_politicalGeocodingURI TEXT,
        dcatde_geocodingText TEXT,
        dct_modified TIMESTAMP,
        dct_issued TIMESTAMP,
        dct_accrualperiodicity TEXT,
        dct_temporal_startdata TIMESTAMP,
        dct_temporal_enddate TIMESTAMP,
        table_name TEXT,
        details JSONB,
        imported TIMESTAMP,
        dct_type TEXT,
        legend_url TEXT,
        CONSTRAINT table_metadata_pkey PRIMARY KEY (table_name)
    );

    -- Loop through all tables in the public schema
    /*
    FOR table_rec IN 
        SELECT c.relname AS table_name
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r' AND n.nspname = 'public'
    LOOP
        -- Initialize bounding_box, centroid, and geometry_type as NULL
        bounding_box := NULL;
        centroid := NULL;
        geom_type := NULL;

        -- For each table, check if it has a geometry column
        FOR column_rec IN 
            SELECT a.attname AS column_name
            FROM pg_attribute a
            JOIN pg_type t ON t.oid = a.atttypid
            WHERE a.attrelid = (quote_ident('public') || '.' || quote_ident(table_rec.table_name))::regclass
              AND t.typname = 'geometry' -- Check if the column is a geometry type
        LOOP
            -- Get the bounding box and centroid
            EXECUTE format('SELECT ST_Extent(%I) FROM public.%I', column_rec.column_name, table_rec.table_name) INTO bounding_box;
            EXECUTE format('SELECT ST_Centroid(%I) FROM public.%I', column_rec.column_name, table_rec.table_name) INTO centroid;

            -- Get the geometry type
            --EXECUTE format('SELECT REPLACE(ST_GeometryType(%I), 'ST_', '') FROM public.%I LIMIT 1;', column_rec.column_name, table_rec.table_name) INTO geom_type;
			EXECUTE format('SELECT REPLACE(ST_GeometryType(%I), ''ST_'', '''') FROM public.%I LIMIT 1', column_rec.column_name, table_rec.table_name) INTO geom_type;

            
            EXIT; -- Exit after processing the first geometry column
        END LOOP;

        -- Insert metadata for the table
        INSERT INTO public.table_metadata (
            dct_title, dct_description, dct_catalog_title, dct_catalog_description,
            dct_catalog_publisher, dct_accessurl, dct_license, dct_identifier, dcatde_contributorid,
            dct_distribution, dct_language, dct_bbox, dct_centroid, geometry_type,
            dcatde_politicalGeocodingLevelURI, dcatde_politicalGeocodingURI, dcatde_geocodingText,
            dct_modified, dct_issued, dct_accrualperiodicity, dct_temporal_startdata,
            dct_temporal_enddate, table_name, details, imported, dct_type
        )
        SELECT 
            table_rec.table_name AS dct_title,
            table_rec.table_name AS dct_description,
            table_rec.table_name AS dct_catalog_title,
            table_rec.table_name AS dct_catalog_description,
            'Publisher Name' AS dct_catalog_publisher,
            table_rec.table_name AS dct_accessurl,
            table_rec.table_name AS dct_license,
            table_rec.table_name AS dct_identifier,
            table_rec.table_name AS dcatde_contributorid,
            table_rec.table_name AS dct_distribution,
            'de' AS dct_language,
            COALESCE(bounding_box, ST_GeomFromText('POLYGON((0 0, 0 0, 0 0, 0 0, 0 0))')) AS dct_bbox,
            COALESCE(
                CASE
                    WHEN ST_IsValid(centroid) THEN centroid
                    ELSE ST_GeomFromText('POINT(0 0)')
                END,
                ST_GeomFromText('POINT(0 0)')
            ) AS dct_centroid,
            geom_type AS geometry_type, -- Populate the geometry type
            table_rec.table_name AS dcatde_politicalGeocodingLevelURI,
            table_rec.table_name AS dcatde_politicalGeocodingURI,
            table_rec.table_name AS dcatde_geocodingText,
            CURRENT_TIMESTAMP AS dct_modified,
            CURRENT_TIMESTAMP AS dct_issued,
            'Monthly' AS dct_accrualperiodicity,
            CURRENT_TIMESTAMP AS dct_temporal_startdata,
            CURRENT_TIMESTAMP AS dct_temporal_enddate,
            table_rec.table_name,
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'column_name', a.attname,
                    'column_type', t.typname,
                    'column_description', col_description(a.attrelid, a.attnum)
                )
            ) FROM pg_attribute a
            JOIN pg_type t ON t.oid = a.atttypid
            WHERE a.attrelid = (quote_ident('public') || '.' || quote_ident(table_rec.table_name))::regclass
            AND a.attnum > 0) AS details,
            CURRENT_TIMESTAMP AS imported,
            'table' AS dct_type
        ON CONFLICT (table_name) DO NOTHING;
    END LOOP;
        */
    -- Loop through all external WMS sources
    FOR indikator_rec IN 
        SELECT DISTINCT 
            id, dct_type, dct_title, description, url, bbox, layer, crs, periodicity, start_date, end_date, attribution, legend_url
        FROM public.external_wms_sources
    LOOP
        INSERT INTO public.table_metadata (
            geometry_type, 
			dct_title, 
			dct_description, 
			dct_catalog_title, 
			dct_catalog_description,
            dct_catalog_publisher, 
			dct_accessurl, 
			dct_license,
			dct_identifier, 
			dcatde_contributorid,
            dct_distribution, 
			dct_language, 
			dct_bbox, 
			dct_centroid,
			dcatde_politicalGeocodingLevelURI,
            dcatde_politicalGeocodingURI, 
			dcatde_geocodingText, 
			dct_modified, 
			dct_issued,
            dct_accrualperiodicity, 
			dct_temporal_startdata, 
			dct_temporal_enddate, 
			table_name,
            details, 
			imported, 
			dct_type,
            legend_url
        )
        VALUES (
            'raster',  -- Geometry type from your input
            indikator_rec.dct_title,
            indikator_rec.description,
            indikator_rec.dct_title,
            indikator_rec.description,
            indikator_rec.attribution,
            indikator_rec.url,
            'License',
            indikator_rec.id::text,
            'External Contributor',
            indikator_rec.url,
            'de',
            -- Convert JSON bbox array to geometry (assuming 0th object in array)
            CASE 
                WHEN indikator_rec.bbox IS NOT NULL THEN
                    ST_MakeEnvelope(
                        (indikator_rec.bbox->0->>'minx')::double precision,
                        (indikator_rec.bbox->0->>'miny')::double precision,
                        (indikator_rec.bbox->0->>'maxx')::double precision,
                        (indikator_rec.bbox->0->>'maxy')::double precision,
                        4326
                    )
                ELSE 
                    NULL
            END,
            -- Centroid
            CASE 
                WHEN indikator_rec.bbox IS NOT NULL THEN
                    ST_Centroid(
                        ST_MakeEnvelope(
                            (indikator_rec.bbox->0->>'minx')::double precision,
                            (indikator_rec.bbox->0->>'miny')::double precision,
                            (indikator_rec.bbox->0->>'maxx')::double precision,
                            (indikator_rec.bbox->0->>'maxy')::double precision,
                            4326
                        )
                    )
                ELSE 
                    NULL
            END,
            indikator_rec.crs,
            indikator_rec.layer,
            Null,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            indikator_rec.periodicity,
            indikator_rec.start_date,
            indikator_rec.end_date,
            indikator_rec.id,
            jsonb_build_object(
                
                'layer', indikator_rec.layer,
                'crs', indikator_rec.crs
            ),
            CURRENT_TIMESTAMP,
            indikator_rec.dct_type,
            indikator_rec.legend_url
        )
        ON CONFLICT (table_name)
        DO UPDATE
        SET 
            dct_description = EXCLUDED.dct_description,
            dct_accessurl = EXCLUDED.dct_accessurl,
            dct_bbox = EXCLUDED.dct_bbox,
            dct_centroid = EXCLUDED.dct_centroid,
            imported = EXCLUDED.imported,
            dct_catalog_publisher= EXCLUDED.dct_catalog_publisher;
    END LOOP;

    
    FOR indikator_rec IN 
        SELECT DISTINCT indikator, source FROM public.dashboard_data_de
    LOOP
        INSERT INTO public.table_metadata (
            geometry_type, dct_title, dct_description, dct_catalog_title, dct_catalog_description,
            dct_catalog_publisher, dct_accessurl, dct_license, dct_identifier, dcatde_contributorid,
            dct_distribution, dct_language, dct_bbox, dct_centroid, dcatde_politicalGeocodingLevelURI,
            dcatde_politicalGeocodingURI, dcatde_geocodingText, dct_modified, dct_issued,
            dct_accrualperiodicity, dct_temporal_startdata, dct_temporal_enddate, table_name, details, imported, dct_type
        )
        SELECT 
            'Polygon', indikator_rec.indikator, indikator_rec.indikator, indikator_rec.indikator, indikator_rec.indikator,
            indikator_rec.source, indikator_rec.indikator, 'License', indikator_rec.indikator, 'Contributor ID',
            'Distribution', 'de', NULL, NULL, NULL, NULL, NULL,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'Monthly',
            (SELECT TO_TIMESTAMP(MIN(zeitbezug)::text, 'YYYY') 
             FROM public.dashboard_data_de 
             WHERE indikator = indikator_rec.indikator) AS dct_temporal_startdata,
            (SELECT TO_TIMESTAMP(MAX(zeitbezug)::text, 'YYYY') 
             FROM public.dashboard_data_de 
             WHERE indikator = indikator_rec.indikator) AS dct_temporal_enddate,
            indikator_rec.indikator,
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'column_name', a.attname,
                    'column_type', t.typname,
                    'column_description', col_description(a.attrelid, a.attnum)
                )
            ) FROM pg_attribute a
            JOIN pg_type t ON t.oid = a.atttypid
            WHERE a.attrelid = 'public.dashboard_data_de'::regclass
            AND a.attnum > 0) AS details,
            CURRENT_TIMESTAMP,
            'indikator'
        ON CONFLICT (table_name)
    DO UPDATE
    SET 
        -- only updates the following fields and doesn't touch the rest that had been modified manually
        dct_temporal_startdata = EXCLUDED.dct_temporal_startdata,
        dct_temporal_enddate = EXCLUDED.dct_temporal_enddate;
        END LOOP;
END;
$$;

-- Run the function
SELECT insert_table_metadata();



"""

def create_and_populate_metadata():
    """Create and populate the table_metadata table."""
    print("Executing custom SQL to populate table_metadata...")

    # Connect to the database
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        # Execute the SQL
        connection.execute(text(CREATE_METADATA_SQL))
        # Commit the changes to the database
        connection.commit()  # Explicit commit to ensure changes are saved
    print("Metadata summary table created and populated successfully.")

if __name__ == "__main__":
    create_and_populate_metadata()
