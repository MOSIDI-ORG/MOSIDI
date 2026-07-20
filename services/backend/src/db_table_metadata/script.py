# metadata.py
from sqlalchemy import create_engine, text
from os import getenv
import os
import pandas as pd

dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'brandenburg'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}

# Define your PostgreSQL connection string
DATABASE_URL = f"postgresql://{dbConfig['user']}:{dbConfig['password']}@{dbConfig['host']}:{dbConfig['port']}/{dbConfig['dbname']}"

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
        geometry_type TEXT,
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
        dcat_ap_id TEXT,
        dcat_ap_title TEXT,
        -- Composite primary key: table_name + granularity
        CONSTRAINT table_metadata_pkey PRIMARY KEY (table_name, dcatde_politicalGeocodingLevelURI)
    );

   -- Loop through all external WMS sources
    FOR indikator_rec IN 
        SELECT DISTINCT ON (id)
            id, dct_type, dct_title, description, url, bbox, layer, crs, periodicity, start_date, end_date, attribution, legend_url
        FROM public.external_wms_sources
        ORDER BY id
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
        ON CONFLICT (table_name, dcatde_politicalGeocodingLevelURI)
        DO UPDATE
        SET 
            dct_description = EXCLUDED.dct_description,
            dct_accessurl = EXCLUDED.dct_accessurl,
            dct_bbox = EXCLUDED.dct_bbox,
            dct_centroid = EXCLUDED.dct_centroid,
            imported = EXCLUDED.imported,
            dct_catalog_publisher= EXCLUDED.dct_catalog_publisher;
    END LOOP;

    -- Loop through dashboard_data_de indicators with distinct (indikator, granularity) combos
    FOR indikator_rec IN 
        SELECT DISTINCT indikator, source, granularity FROM public.dashboard_data_de
    LOOP
        INSERT INTO public.table_metadata(
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
            dcat_ap_id  -- Set composite key as dcat_ap_id
        )
        SELECT 
            'Polygon', 
            indikator_rec.indikator,
            NULL, 
            NULL, 
            NULL,
            indikator_rec.source,
            NULL, 
            NULL, 
            NULL, 
            NULL,
            NULL, 
            'de', 
            NULL,
            NULL, 
            indikator_rec.granularity,  -- dcatde_politicalGeocodingLevelURI
            NULL, 
            NULL,
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP, 
            'Yearly',
            (SELECT TO_TIMESTAMP(MIN(zeitbezug)::text, 'YYYY') 
             FROM public.dashboard_data_de 
             WHERE indikator = indikator_rec.indikator) AS dct_temporal_startdata,
            (SELECT TO_TIMESTAMP(MAX(zeitbezug)::text, 'YYYY') 
             FROM public.dashboard_data_de
             WHERE indikator = indikator_rec.indikator) AS dct_temporal_enddate,
            indikator_rec.indikator,  -- table_name
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
            'indikator',
            -- dcat_ap_id = dct_title || dcatde_politicalGeocodingLevelURI || dct_catalog_publisher
            CONCAT(
                indikator_rec.indikator, '_',
                indikator_rec.granularity, '_',
                indikator_rec.source
            ) AS dcat_ap_id
        ON CONFLICT (table_name, dcatde_politicalGeocodingLevelURI)
        DO UPDATE
        SET 
            dct_temporal_startdata = EXCLUDED.dct_temporal_startdata,
            dct_temporal_enddate   = EXCLUDED.dct_temporal_enddate,
            dcat_ap_id             = EXCLUDED.dcat_ap_id;
    END LOOP;
END;
$$;

-- Run the function
SELECT insert_table_metadata();
-- Recreate materialized view fresh every time
DROP MATERIALIZED VIEW IF EXISTS source_granularities;

CREATE MATERIALIZED VIEW source_granularities AS
    SELECT DISTINCT source, indikator, granularity
    FROM dashboard_data_de;

CREATE UNIQUE INDEX idx_source_granularities_unique 
    ON source_granularities(source, indikator, granularity);

CREATE INDEX idx_source_granularities_indikator 
    ON source_granularities(indikator);



"""
def refresh_source_granularities():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        connection.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY source_granularities"))
        connection.commit()
    print("Materialized view refreshed successfully.")

def apply_csv_classifications(engine):
    """Reads the local CSV file and updates table_metadata fields."""
    csv_path = os.path.join(os.path.dirname(__file__), 'table_metadata_classified_llm.csv')
    
    if not os.path.exists(csv_path):
        print(f"⚠️ CSV mapping file not found at: {csv_path}. Skipping classification lookup.")
        return

    print("Mapping classifications from CSV file to table_metadata...")
    df_csv = pd.read_csv(csv_path)
    update_data = df_csv[['title', 'dcat_ap_id', 'dcat_ap_title']].dropna(subset=['title'])

    update_query = """
    UPDATE table_metadata
    SET dcat_ap_id = :dcat_ap_id, dcat_ap_title = :dcat_ap_title
    WHERE dct_title = :title;
    """
    
    updated_count = 0
    with engine.begin() as conn:
        for _, row in update_data.iterrows():
            title_val = str(row['title']).strip()
            id_val = None if pd.isna(row['dcat_ap_id']) else str(row['dcat_ap_id']).strip()
            title_ap_val = None if pd.isna(row['dcat_ap_title']) else str(row['dcat_ap_title']).strip()
            
            result = conn.execute(
                text(update_query), 
                {"dcat_ap_id": id_val, "dcat_ap_title": title_ap_val, "title": title_val}
            )
            updated_count += result.rowcount
            
    print(f"Successfully appended classification tokens to {updated_count} rows.")

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

    apply_csv_classifications(engine)
    refresh_source_granularities()

if __name__ == "__main__":
    create_and_populate_metadata()
