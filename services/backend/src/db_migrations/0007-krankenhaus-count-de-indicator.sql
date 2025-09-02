DO $$
BEGIN
    -- Check if the required tables exist
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'kommunales_gebiet_de')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'krankenhaus')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data_de')
       AND EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND tablename = 'dashboard_data_metadata') THEN

        -- If all tables exist, perform the operations
        WITH krankenhaus_count AS (
            SELECT
                kommunales_gebiet_de.nationalco AS kennziffer, 
                kommunales_gebiet_de.name,
                COUNT(krankenhaus.geom) AS wert
            FROM
                kommunales_gebiet_de
            LEFT JOIN
                krankenhaus ON ST_Contains(kommunales_gebiet_de.geom, krankenhaus.geom)
            GROUP BY
                kommunales_gebiet_de.id
        )
        INSERT INTO dashboard_data_de (wert, zeitbezug, indikator, kennziffer, granularity, source)
        SELECT
             wert,
            2024 AS zeitbezug,
            'krankenhaus' AS indikator,
             kennziffer,
            'Gemeindeebene' AS granularity,
            'OpenStreetMap (OSM)' AS source
        FROM 
            krankenhaus_count
        WHERE 
            NOT EXISTS (
                SELECT 1 
                FROM dashboard_data_de 
                WHERE indikator = 'krankenhaus' 
                AND kennziffer = krankenhaus_count.kennziffer
            );

        -- Insert krankenhaus metadata into dashboard_data_metadata
        INSERT INTO dashboard_data_metadata (kurzname, "name", algorithmus, anmerkungen, zeitreihe_jahr_entwicklung)
        SELECT  'krankenhaus', 'krankenhaus', 'Anzahl der krankenhaus', 'der krankenhaus-Datensatz wurde von OpenStrretMap abgerufen', '2024'
        WHERE
            NOT EXISTS (
                SELECT kurzname FROM dashboard_data_metadata WHERE kurzname = 'krankenhaus'
            );

    ELSE
        -- If any table does not exist, raise an exception
        RAISE EXCEPTION 'One or more required tables do not exist.';
    END IF;
END $$;