from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from os import getenv
from dataclasses import dataclass
from .models import IndicatorRequest, ClassificationRequest, TableRequest, categorizationRequest, dataClassificationRequest
from .database import (
    get_home_data,
    get_indicator_list,
    get_indicator_data,
    get_geojson_data,
    get_layer_extent,
    get_layer_column_names,
    create_hexagon_function,
    get_distinct_values_per_column_name,
    fetch_column_values_from_db,
    get_numerical_column_names_for_classification,
    get_table_metadata_from_db,
    get_external_wms_layers_from_db
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
async def home():
    data = get_home_data()
    return data

@app.get("/api/indicators_list")
async def indicator_list():
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

        # Classify with 5 intervals
        result_5 = classification_method(dataArray, k=5) if supports_k else classification_method(dataArray)

        # Classify with 3 intervals
        result_3 = classification_method(dataArray, k=3) if supports_k else classification_method(dataArray)
        
        # Handling warnings and intervals for both classifications
        warning_messages_5 = [str(warning.message) for warning in w if issubclass(warning.category, UserWarning)]
        intervals_5 = {
            'minMax': [float(min(dataArray)), float(max(dataArray))],  # Convert to Python float
            'intervals': [float(interval) for interval in result_5.bins],  # Convert numpy types to float
            'counts': list(map(int, result_5.counts)),  # Convert numpy.int64 to Python int
            'warnings': warning_messages_5 if warning_messages_5 else None,
        }

        warning_messages_3 = [str(warning.message) for warning in w if issubclass(warning.category, UserWarning)]
        intervals_3 = {
            'minMax': [float(min(dataArray)), float(max(dataArray))],  # Convert to Python float
            'intervals': [float(interval) for interval in result_3.bins],  # Convert numpy types to float
            'counts': list(map(int, result_3.counts)),  # Convert numpy.int64 to Python int
            'warnings': warning_messages_3 if warning_messages_3 else None,
        }

    # Return both 5-class and 3-class intervals
    return {
        'intervals_5_classes': intervals_5,
        'intervals_3_classes': intervals_3
    }


@app.post("/api/get_geojson")
def get_geojson_data_from_db(
    request: Request, 
    table_request: TableRequest,
):
    tablename = table_request.tablename
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

@app.post("/api/get_layer_column_names")
def get_layer_column_names_from_db(
    request: Request, 
    table_request: TableRequest,
):
    tablename = table_request.tablename
    print(tablename)
    col_names = get_layer_column_names(tablename)
    return col_names

@app.post("/api/get_numerical_column_names_for_classification")
def get_layer_numerical_column_names_for_classification_from_db(
    request: Request, 
    table_request: TableRequest,
):
    print(table_request, "table_request")
    tablename = table_request.tablename
    col_names = get_numerical_column_names_for_classification(tablename)
    return col_names

@app.post("/api/cretae_hexagon_function")
def gcretae_hexagon_functio_from_db(
    request: Request, 
    table_request: TableRequest,
):
    tablename = table_request.tablename
    print(tablename)
    col_names = get_layer_column_names(tablename)
    return col_names
@app.post("/api/create_hexagon_function")
async def create_hexagon_function_endpoint(table_request: TableRequest):
    tablename = table_request.tablename
    try:
        create_hexagon_function(tablename)
        return {"message": f"Hexagon function for table {tablename} created successfully."}
    
    except Exception as e:
        print(e)
        return {"error": f"An unexpected error occurred: {e}"}

@app.post("/api/get_distinct_values_per_column_name")
def get_distinct_values_per_column_name_from_db(
    request: Request, 
    categorization_equest: categorizationRequest,
):  
    columnName = categorization_equest.columnName
    tableName = categorization_equest.tableName
    print(columnName, tableName)
    distinct_values = get_distinct_values_per_column_name(columnName, tableName)
    
   
    return distinct_values

@app.post("/api/classify_data")
async def get_class_intervals(
    request: Request, 
    classification_request: dataClassificationRequest,
): 
    selectedClassificationMethod = classification_request.selectedClassificationMethod
    columnName = classification_request.columnName
    tableName = classification_request.tableName
    dataArray = fetch_column_values_from_db(columnName, tableName)
    # Validate that all elements in dataArray are numerical (excluding None or null)
    if not all(isinstance(value, (int, float)) and value is not None for value in dataArray):
        return {"error": "The data contains invalid values. All values must be numeric and non-null."}
    classification_method = getattr(mapclassify, selectedClassificationMethod)

    # Check if the selected classification method supports 'k' as number of classes
    supports_k = 'k' in classification_method.__init__.__code__.co_varnames

    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")

        # Classify with 5 intervals
        result_5 = classification_method(dataArray, k=6) if supports_k else classification_method(dataArray)
        
        # Handling warnings and intervals for both classifications
        warning_messages_5 = [str(warning.message) for warning in w if issubclass(warning.category, UserWarning)]
        intervals_5 = {
            'minMax': [float(min(dataArray)), float(max(dataArray))],  # Convert to Python float
            'intervals': [float(interval) for interval in result_5.bins],  # Convert numpy types to float
            'counts': list(map(int, result_5.counts)),  # Convert numpy.int64 to Python int
            'warnings': warning_messages_5 if warning_messages_5 else None,
        }

        

    # Return both 5-class and 3-class intervals
    return {
        'intervals_5_classes': intervals_5,
    }

@app.get("/api/get_table_metadata")
async def get_table_metadata():
    table_metadata = get_table_metadata_from_db()
    return table_metadata

@app.get("/api/get_external_wms_layers")
async def get_external_wms_layers():
    table_metadata = get_external_wms_layers_from_db()
    return table_metadata
