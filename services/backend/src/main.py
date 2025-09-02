from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from os import getenv
from dataclasses import dataclass
from .models import IndicatorRequest, ClassificationRequest, TableRequest
from .database import (
    get_home_data,
    get_indicator_list,
    get_indicator_data,
    get_geojson_data,
    get_layer_extent
)
import mapclassify
import warnings
from .db_migrations import run_db_migrations
import gzip
import json
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080","http://localhost", "http://194.94.235.201:8080", "http://127.0.0.1", "http://194.94.235.201", "http://tv4-geo.innowest-brandenburg.de:8080", "http://tv4-geo.innowest-brandenburg.de", "https://194.94.235.209", "https://194.94.235.209:8080",  "https://tv4-geo-dev.innowest-brandenburg.de:8080", "https://tv4-geo-dev.innowest-brandenburg.de"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
dbConfig = {
    'host': getenv('POSTGRES_HOST', 'localhost'),
    'port': getenv('POSTGRES_PORT', 5432),
    'dbname': getenv('POSTGRES_DB', 'brandenburg'),
    'user': getenv('POSTGRES_USER', 'postgres'),
    'password': getenv('POSTGRES_PASSWORD', '1234')
}

def connect():    
    return psycopg2.connect(
    host=dbConfig['host'],
    port=dbConfig['port'], 
    dbname=dbConfig['dbname'], 
    user=dbConfig['user'], 
    password=dbConfig['password'])

@app.on_event("startup")
async def startup_event():
    print("Running database migrations...")
    run_db_migrations()
    print("Database migrations completed!!")


@app.get("/api/table_names")
def home():
    data = get_home_data()
    return data

@app.get("/api/indicators_list")
def indicator_list():
    indicators = get_indicator_list()
    return indicators

@app.post("/api/get_indicator_data")
async def indicator_data(
    request: Request, 
    indicator_request: IndicatorRequest,
):
    indicator = indicator_request.indicator
    data = get_indicator_data(indicator)
    data = json.dumps(data)
    gzipped_data = gzip.compress(data.encode('utf-8'))
    return Response(content=gzipped_data, headers={"Content-Encoding": "gzip", "Content-Type": "application/json"})

@app.post("/api/classify")
async def get_class_intervals(
    request: Request, 
    classification_request: ClassificationRequest,
): 
    selectedClassificationMethod = classification_request.selectedClassificationMethod
    dataArray = classification_request.dataArray
    classification_method = getattr(mapclassify, selectedClassificationMethod)

    # Check if the selected classification method supports 'k' as number of classes
    supports_k = 'k' in classification_method.__init__.__code__.co_varnames
    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")
        #result = classification_method(dataArray, k=5)
        result = classification_method(dataArray, k=5) if supports_k else classification_method(dataArray)
        # Check if there were any UserWarnings
        if any(issubclass(warning.category, UserWarning) for warning in w):
            warning_messages = [str(warning.message) for warning in w if issubclass(warning.category, UserWarning)]
            result_intervals = {
                'minMax' : [min(dataArray), max(dataArray)],
                'intervals': [(int(interval)) for interval in result.bins],
                'counts': result.counts.astype(int).tolist(),
                'warnings': warning_messages,
            }
        else:
            result_intervals = {
                'minMax' : [min(dataArray), max(dataArray)],
                'intervals': [(interval) for interval in result.bins],
                'counts': result.counts.astype(int).tolist(),
            }
    return result_intervals

@app.post("/api/get_geojson")
def get_geojson_data_from_db(
    request: Request, 
    table_request: TableRequest,
):
    tablename = table_request.tablename
    print(tablename)
    geojson = get_geojson_data(tablename)
    data = json.dumps(geojson)
    gzipped_data = gzip.compress(data.encode('utf-8'))
    return Response(content=gzipped_data, headers={"Content-Encoding": "gzip", "Content-Type": "application/json"})

@app.post("/api/get_layer_extent")
def get_layer_extent_from_db(
    request: Request, 
    table_request: TableRequest,
):
    tablename = table_request.tablename
    print(tablename)
    extent = get_layer_extent(tablename)
    return extent
