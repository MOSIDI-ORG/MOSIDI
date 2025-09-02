DO $$
BEGIN
    -- Check if the required tables exist
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'kommunales_gebiet')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'kita')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data_metadata') THEN

        -- If all tables exist, perform the operations
        WITH kita_count AS (
            SELECT
                kommunales_gebiet.nationalco AS kennziffer, 
                kommunales_gebiet.name,
                COUNT(kita.geom) AS wert
            FROM
                kommunales_gebiet
            LEFT JOIN
                kita ON ST_Contains(kommunales_gebiet.geom, kita.geom)
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
            'kita' AS indikator,
            kennziffer::integer
        FROM 
            kita_count
        WHERE 
            NOT EXISTS (
                SELECT 1 
                FROM dashboard_data 
                WHERE indikator = 'kita' 
                AND kennziffer = kita_count.kennziffer::integer
            );

        -- Insert kita metadata into dashboard_data_metadata
        INSERT INTO dashboard_data_metadata (kurzname, "name", algorithmus, anmerkungen, zeitreihe_jahr_entwicklung)
        SELECT  'kita', 'KITA', 'Anzahl der KITAs', 'der kita-Datensatz wurde von OpenStrretMap abgerufen', '2024'
        WHERE
            NOT EXISTS (
                SELECT kurzname FROM dashboard_data_metadata WHERE kurzname = 'kita'
            );

    ELSE
        -- If any table does not exist, raise an exception
        RAISE EXCEPTION 'One or more required tables do not exist.';
    END IF;
END $$;