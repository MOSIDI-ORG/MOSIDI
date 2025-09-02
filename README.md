# Project Setup

## For users

Clone the repository and run the docker-compose.yml file located at the root directory:

```
 docker compose up
```

The following four containers are created:

- **brandenburg_db**  which is a database container
- **fastapi-vue-frontend-1**  frontend container which is accessible at http://localhost:8080/ url
- **pg_tileserv** the tileserver container accessible at http://localhost:7800/ 
- **fastapi-vue-backend-1** python middleware container whose api definitins are accessible at http://localhost:5000/docs#/

To populate the database the following steps might be taken:

> Don't forget to replace the password (1234) and the user (postgres) with the actual credentials from the environmental variables

```
docker exec -i brandenburg_db /bin/bash -c "PGPASSWORD=1234 psql --username postgres brandenburg" < path_to_your_local_database_dump.sql
```
in which restores your locally dumped database into a database named "brandenburg".

By populating the database, the tables with geometry columns are visible and interactable via tile server service accessible at http://localhost:7800/ 

## Metadata table

A table named metadata is created to populate the metadata information specific to each table.
```
 create table metadata (table_name text, details json);
```
In which the metadata information for each table (table_name) is saved as JSON. The JSON instance takes arbitrary column names and values. As an instance:

```
 insert into metadata select 'burnt_areas_2013_2023','{"source":"https://effis.jrc.ec.europa.eu/applications","description":"burnt Areas in brandenburg from 2015 to 2023"}';

```
