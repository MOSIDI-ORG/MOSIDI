
DO $$
BEGIN
    -- Check if the required tables exist
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'kommunales_gebiet')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data_metadata') THEN



        WITH area_km2 AS (
            SELECT
                kommunales_gebiet.nationalco AS kennziffer, 
                kommunales_gebiet.name,
                st_area(geom::geography)/ 1000000 AS wert
            FROM
                kommunales_gebiet
        GROUP BY
                kommunales_gebiet.id
        )
        INSERT INTO dashboard_data (zeit_wert_array, indikator, kennziffer)
        SELECT
            JSONB_BUILD_ARRAY(
                JSONB_BUILD_OBJECT(
                    'wert', wert,
                    'zeitbezug', 2024,
                    'kennziffer', kennziffer::integer
                )
            ) AS zeit_wert_array,
            'Fläche' AS indikator,
            kennziffer::integer
        FROM 
            area_km2

            WHERE 
            NOT EXISTS (
                SELECT 1 
                FROM dashboard_data 
                WHERE indikator = 'Fläche' 
                AND kennziffer = area_km2.kennziffer::integer
            );
            

        -- insert kita metadata into dashboard_data_metadata
        INSERT INTO dashboard_data_metadata (kurzname, "name", algorithmus, anmerkungen, zeitreihe_jahr_entwicklung)
        select  'Fläche', 'Fläche', 'Fläche in Quadratkilometern', 'die Fläche wurde mit Hilfe von GIS auf der Grundlage des kommunalen Gebietsdatensatzes von https://geoportal.brandenburg.de/ berechnet ', '2024'
        WHERE
            NOT EXISTS (
                SELECT kurzname FROM dashboard_data_metadata WHERE kurzname = 'Fläche'
            );
    ELSE
        -- If any table does not exist, raise an exception
        RAISE EXCEPTION 'One or more required tables do not exist.';
    END IF;
END $$;