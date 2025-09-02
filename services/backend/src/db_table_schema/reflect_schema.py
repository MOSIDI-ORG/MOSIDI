# reflect_schema.py
from sqlalchemy import create_engine, MetaData
from sqlalchemy.schema import CreateTable
from geoalchemy2 import Geometry
from ..database import dbConfig
import os


# Define your PostgreSQL connection string
DATABASE_URL = f"postgresql://{dbConfig['user']}:{dbConfig['password']}@{dbConfig['host']}:{dbConfig['port']}/{dbConfig['dbname']}"


def reflect_and_save_schema():
    print("Reflecting database schema...")  
    engine = create_engine(DATABASE_URL)

    metadata = MetaData()
    metadata.reflect(bind=engine)

    # Ensure directory exists
    output_folder = os.path.dirname(__file__)  # Should be /app/src/db_table_schema
    if not os.path.isdir(output_folder):
        print(f"Creating directory: {output_folder}")
        os.makedirs(output_folder, exist_ok=True)
    else:
        print(f"Directory already exists: {output_folder}")

    output_path = os.path.join(output_folder, "schema.sqlalchemy")  # Save as .sqlalchemy file
    print(f"Saving schema to {output_path}...")  

    if os.path.exists(output_path):
        print(f"File already exists, overwriting: {output_path}")

    with open(output_path, "w") as f:
        for table in metadata.sorted_tables:
            f.write(str(CreateTable(table).compile(engine)) + ";\n")

if __name__ == "__main__":
    reflect_and_save_schema()