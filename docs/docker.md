# Docker

```shell

docker run -p 54003:5432 
  --name timestamp-service-db 
  -e POSTGRES_DB="timestampdb" 
  -e PGDATABASE="timestampdb" 
  -e POSTGRES_USER="timestamp_db_user" 
  -e POSTGRES_PASSWORD="timestamp_db_password" 
  -e PGDATA="/var/lib/postgresql/data/pgdata" 
  -v "/home/f0c1s/data/postgres/timestampdb:/var/lib/postgresql/data" 
  -d postgres

```

```shell

docker run --publish 54325:5432 \
  --name timestamp-service-db \
  -e POSTGRES_DB=timestampdb \
  -e POSTGRES_USER="timestamp_db_user" \
  -e POSTGRES_PASSWORD="timestamp_db_password" \
  -e PGDATA=/var/lib/postgresql/data/pgdata \
  -v /home/f0c1s/Data/postgres/timestampdb:/var/lib/postgresql/data \
  -d postgres

```