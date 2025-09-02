from dataclasses import dataclass

@dataclass
class IndicatorRequest:
    indicator: str
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
