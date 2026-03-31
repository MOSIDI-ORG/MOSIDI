from dataclasses import dataclass

@dataclass
class IndicatorRequest:
    indicator: str
    granularity: str
@dataclass
class ClassificationRequest:
    dataArray: list
    selectedClassificationMethod: str

@dataclass
class TableRequest:
    tablename: str

@dataclass
class categorizationRequest:
    columnName: str
    tableName: str
   
@dataclass
class dataClassificationRequest:
    columnName: str
    tableName: str
    selectedClassificationMethod: str

@dataclass
class geojsonInstanceRequest:
    
    tablename: str
    featureId: str


@dataclass
class ternaryInstanceRequest:
    ind1: str
    zeit1: int
    ind2: str
    zeit2: int
    ind3: str
    zeit3: int
    gran: str
