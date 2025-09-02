DO $$
BEGIN
    -- Check if the required tables exist
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'kommunales_gebiet')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'windkraftanlagen')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data_metadata') THEN


        WITH windkraftanlagen_count AS (
            SELECT
                kommunales_gebiet.nationalco AS kennziffer, 
                kommunales_gebiet.name,
                COUNT(windkraftanlagen.geom) AS wert
            FROM
                kommunales_gebiet
            LEFT JOIN
                windkraftanlagen ON ST_Contains(kommunales_gebiet.geom, windkraftanlagen.geom)
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
            'windkraftanlagen' AS indikator,
            kennziffer::integer
        FROM 
            windkraftanlagen_count
        WHERE 
            NOT EXISTS (
                SELECT 1 
                FROM dashboard_data 
                WHERE indikator = 'windkraftanlagen' 
                AND kennziffer = windkraftanlagen_count.kennziffer::integer
            );

        -- insert kita metadata into dashboard_data_metadata
        INSERT INTO dashboard_data_metadata (kurzname, "name", algorithmus, anmerkungen, zeitreihe_jahr_entwicklung)
        select  'windkraftanlagen', 'windkraftanlagen', 'Anzahl der windkraftanlagen', 'der windkraftanlagen-Datensatz wurde von https://metaver.de/trefferanzeige?docuuid=45C506E5-3E9D-4DE2-9073-C3DB636CE7CF abgerufen', '2024'
        WHERE
            NOT EXISTS (
                SELECT kurzname FROM dashboard_data_metadata WHERE kurzname = 'windkraftanlagen'
            );
    ELSE
        -- If any table does not exist, raise an exception
        RAISE EXCEPTION 'One or more required tables do not exist.';
    END IF;
END $$;