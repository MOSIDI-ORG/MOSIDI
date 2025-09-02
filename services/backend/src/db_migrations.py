from yoyo import read_migrations, get_backend
from .database import dbConfig
import os

def run_db_migrations():
    # Database connection string
    backend = get_backend(f"postgresql://{dbConfig['user']}:{dbConfig['password']}@{dbConfig['host']}:{dbConfig['port']}/{dbConfig['dbname']}")
    
    # Construct the path to the migrations directory
    migration_path = os.path.join(os.path.dirname(__file__), 'db_migrations')
    if not os.path.exists(migration_path):
        print(f"Error: Migration path {migration_path} does not exist.")
        return
    
    # Read migrations from the directory
    migrations = read_migrations(migration_path)
    print(f"Detected migrations: {[migration.id for migration in migrations]}")

    # Apply the migrations
    with backend.lock():

        backend.apply_migrations(backend.to_apply(migrations))

if __name__ == "__main__":
    run_db_migrations()