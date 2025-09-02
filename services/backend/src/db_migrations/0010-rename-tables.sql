-- Rename tables if they exist

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'aa_kita') THEN
        ALTER TABLE aa_kita RENAME TO "Kindertagesstätten Zugänglichkeit";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'aoi') THEN
        ALTER TABLE aoi RENAME TO "InNoWest Projektgebiet";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'arzt') THEN
        ALTER TABLE arzt RENAME TO "Arzte";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'baum') THEN
        ALTER TABLE baum RENAME TO "Baume";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gebaeude') THEN
        ALTER TABLE gebaeude RENAME TO "Gebäude (ALKIS)";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'burnt_areas_2013_2023') THEN
        ALTER TABLE burnt_areas_2013_2023 RENAME TO "Waldbrände 2013-2023";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'zahnarzt') THEN
        ALTER TABLE zahnarzt RENAME TO "Zahnarzte";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'drain') THEN
        ALTER TABLE drain RENAME TO "Gewässerläufe";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flurstueck_brandenburg') THEN
        ALTER TABLE flurstueck_brandenburg RENAME TO "Flurstücke";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'krankenhaus') THEN
        ALTER TABLE krankenhaus RENAME TO "Krankenhäuser";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kita') THEN
        ALTER TABLE kita RENAME TO "Kindertagesstätten";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'landbedeckung') THEN
        ALTER TABLE landbedeckung RENAME TO "Landbedeckung";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'landkreis') THEN
        ALTER TABLE landkreis RENAME TO "Landkreis";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schule') THEN
        ALTER TABLE schule RENAME TO "Schule";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wasser') THEN
        ALTER TABLE wasser RENAME TO "Wasser";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'windkraftanlagen') THEN
        ALTER TABLE windkraftanlagen RENAME TO "Windkraftanlagen";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kommunales_gebiet_de') THEN
        ALTER TABLE kommunales_gebiet_de RENAME TO "Kommunale Gebiete Deutschland";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kommunales_gebiet_de_centroid') THEN
        ALTER TABLE kommunales_gebiet_de_centroid RENAME TO "Kommunale Gebiete Deutschland Mittelpunkt";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kommunales_gebiet') THEN
        ALTER TABLE kommunales_gebiet RENAME TO "Kommunale Gebiete Brandenburg (InNoWest)";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kommunales_gebiet_centroid') THEN
        ALTER TABLE kommunales_gebiet_centroid RENAME TO "Kommunale Gebiete Brandenburg (InNoWest) Mittelpunkt";
    END IF;
END $$;
