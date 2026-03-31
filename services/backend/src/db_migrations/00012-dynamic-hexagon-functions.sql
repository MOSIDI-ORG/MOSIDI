-- create_hexagon_functions.sql

-- Function 1: hexagon
CREATE OR REPLACE FUNCTION public.hexagon(i integer, j integer, edge float8)
RETURNS geometry
AS $$
DECLARE
    h float8 := edge * cos(pi() / 6.0);
    cx float8 := 1.5 * i * edge;
    cy float8 := h * (2 * j + abs(i % 2));
BEGIN
    RETURN ST_MakePolygon(ST_MakeLine(ARRAY[
        ST_MakePoint(cx - 1.0 * edge, cy),
        ST_MakePoint(cx - 0.5 * edge, cy - h),
        ST_MakePoint(cx + 0.5 * edge, cy - h),
        ST_MakePoint(cx + 1.0 * edge, cy),
        ST_MakePoint(cx + 0.5 * edge, cy + h),
        ST_MakePoint(cx - 0.5 * edge, cy + h),
        ST_MakePoint(cx - 1.0 * edge, cy)
    ]));
END;
$$ LANGUAGE 'plpgsql'
IMMUTABLE
STRICT
PARALLEL SAFE;

-- Function 2: hexagoncoordinates
CREATE OR REPLACE FUNCTION public.hexagoncoordinates(bounds geometry, edge float8,
    OUT i integer, OUT j integer)
RETURNS SETOF record
AS $$
DECLARE
    h float8 := edge * cos(pi() / 6);
    mini integer := floor(st_xmin(bounds) / (1.5 * edge));
    minj integer := floor(st_ymin(bounds) / (2 * h));
    maxi integer := ceil(st_xmax(bounds) / (1.5 * edge));
    maxj integer := ceil(st_ymax(bounds) / (2 * h));
BEGIN
    FOR i, j IN
    SELECT a, b
    FROM generate_series(mini, maxi) a,
         generate_series(minj, maxj) b
    LOOP
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE 'plpgsql'
IMMUTABLE
STRICT
PARALLEL SAFE;

-- Function 3: tilehexagons
CREATE OR REPLACE FUNCTION public.tilehexagons(z integer, x integer, y integer, step integer,
    OUT geom geometry(Polygon, 3857), OUT i integer, OUT j integer)
RETURNS SETOF record
AS $$
DECLARE
    bounds geometry;
    maxbounds geometry := ST_TileEnvelope(0, 0, 0);
    edge float8;
BEGIN
    bounds := ST_TileEnvelope(z, x, y);
    edge := (ST_XMax(bounds) - ST_XMin(bounds)) / pow(2, step);
    FOR geom, i, j IN
    SELECT ST_SetSRID(hexagon(h.i, h.j, edge), 3857), h.i, h.j
    FROM hexagoncoordinates(bounds, edge) h
    LOOP
        IF maxbounds ~ geom AND bounds && geom THEN
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$ LANGUAGE 'plpgsql'
IMMUTABLE
STRICT
PARALLEL SAFE;
