import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import psycopg2
import json
from os import getenv
import isodate  # pip install isodate

# PostgreSQL config
dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'brandenburg'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}
conn = psycopg2.connect(**dbConfig)
cur = conn.cursor()
cur.execute("""
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'table_metadata'
    ) THEN
        DELETE FROM public.table_metadata
        WHERE dct_title IN (
            SELECT DISTINCT dct_title
            FROM public.external_wms_sources
            WHERE attribution = 'DWD'
        );
    END IF;
END
$$;
""")
cur.execute("DELETE FROM external_wms_sources where attribution='DWD';")

# WMS URL
wms_url = "https://maps.dwd.de/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities"
response = requests.get(wms_url)
tree = ET.fromstring(response.content)

ns = {'wms': 'http://www.opengis.net/wms', 'xlink': 'http://www.w3.org/1999/xlink'}

# Parse layers
for layer in tree.findall(".//wms:Layer[wms:Name]", ns):
    name = layer.find("wms:Name", ns).text
    title_elem = layer.find("wms:Title", ns)
    title = title_elem.text if title_elem is not None else name
    dimension = layer.find("wms:Dimension[@name='time']", ns)
    abstract_elem = layer.find("wms:Abstract", ns)
    abstract = abstract_elem.text.strip() if abstract_elem is not None and abstract_elem.text else None
    # Extract Legend URL (if available)
    legend_url = None
    legend_elem = layer.find("wms:Style/wms:LegendURL/wms:OnlineResource", ns)
    if legend_elem is not None:
        legend_url = legend_elem.attrib.get("{http://www.w3.org/1999/xlink}href")
    # Default bbox
    bbox_4326 = None
    bbox_elem = layer.find("wms:BoundingBox[@CRS='EPSG:4326']", ns)
    
    if bbox_elem is not None:
        try:
            minx = float(bbox_elem.attrib.get("minx"))
            miny = float(bbox_elem.attrib.get("miny"))
            maxx = float(bbox_elem.attrib.get("maxx"))
            maxy = float(bbox_elem.attrib.get("maxy"))
            bbox_4326 = [{'minx': minx, 'miny': miny, 'maxx': maxx, 'maxy': maxy}]
        except (TypeError, ValueError):
            pass

    layer_info = {
        "id": name.replace(":", "_"),
        "dct_type": "raster",
        "dct_title": title,
        "url": wms_url,
        "layer": name,
        "format": "image/png",
        "crs": "EPSG:3857",
        "attribution": "DWD",
        "metadata": wms_url,
        "geometry_type": "raster",
        "temporal": False,
        "available_time": None,
        "description": abstract,
        "bbox": bbox_4326,
        "periodicity": None,
        "start_date": None,
        "end_date": None,
        "legend_url": legend_url
    }

    if dimension is not None and dimension.text:
        layer_info["temporal"] = True
        time_text = dimension.text.strip()
        times = []

        if "/" in time_text and time_text.count("/") == 2:
            try:
                start_str, end_str, step_str = time_text.split("/")
                start = datetime.fromisoformat(start_str.replace("Z", "+00:00"))
                end = datetime.fromisoformat(end_str.replace("Z", "+00:00"))
                layer_info["start_date"] = start.isoformat()
                layer_info["end_date"] = end.isoformat()
                layer_info["periodicity"] = step_str  # e.g., P1D, PT1H

                step = isodate.parse_duration(step_str)
                if isinstance(step, isodate.duration.Duration):
                    step = step.timedelta
                current = start
                while current <= end:
                    times.append(current.isoformat())
                    current += step
            except Exception as e:
                times = [time_text]
        else:
            times = [t.strip() for t in time_text.split(",")]
            if times:
                try:
                    layer_info["start_date"] = times[0]
                    layer_info["end_date"] = times[-1]
                except Exception:
                    pass

        layer_info["available_time"] = times

    # Insert into PostgreSQL
    cur.execute("""
        INSERT INTO external_wms_sources (
            id, dct_type, dct_title, url, layer, format, crs,
            attribution, metadata, geometry_type, temporal, available_time,
            description, bbox, periodicity, start_date, end_date, legend_url
        ) VALUES (
            %(id)s, %(dct_type)s, %(dct_title)s, %(url)s, %(layer)s, %(format)s, %(crs)s,
            %(attribution)s, %(metadata)s, %(geometry_type)s, %(temporal)s, %(available_time)s,
            %(description)s, %(bbox)s, %(periodicity)s, %(start_date)s, %(end_date)s,  %(legend_url)s
        )
        ON CONFLICT (id) DO NOTHING;
    """, {
        **layer_info,
        "available_time": json.dumps(layer_info["available_time"]) if layer_info["available_time"] else None,
        "bbox": json.dumps(layer_info["bbox"]) if layer_info["bbox"] else None
    })

conn.commit()
cur.close()
conn.close()
print("All layers inserted into external_wms_sources.")
