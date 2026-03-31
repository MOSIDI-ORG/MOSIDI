
DO $$ 
BEGIN
   
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Kommunale Gebiete Deutschland Mittelpunkt') THEN
         CREATE UNIQUE INDEX kommunale_gebiete_deutschland_mittelpunkt_pkey ON public."Kommunale Gebiete Deutschland Mittelpunkt" USING btree (id);
         CREATE INDEX kommunale_gebiete_deutschland_mittelpunkt_geom ON public."Kommunale Gebiete Deutschland Mittelpunkt" USING gist (geom);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Kommunale Gebiete Brandenburg (InNoWest) Mittelpunkt') THEN
        CREATE UNIQUE INDEX kommunale_gebiete_brandenburg_mittelpunkt_pkey ON public."Kommunale Gebiete Brandenburg (InNoWest) Mittelpunkt" USING btree (id);
        CREATE INDEX kommunale_gebiete_brandenburg_mittelpunkt_geom ON public."Kommunale Gebiete Brandenburg (InNoWest) Mittelpunkt" USING gist (geom);    
    END IF;

    
END $$;
