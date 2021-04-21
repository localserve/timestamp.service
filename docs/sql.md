# SQL

DataBase is Postgres; running at `jdbc:postgresql://localhost:54003/timestampdb`

## Create `timestamps` table.

```SQL

create table timestamps
(
    id        bigserial not null constraint timestamps_pk primary key,
    app       varchar(32),
    what      varchar(64),
    ts        timestamp default CURRENT_TIMESTAMP,
    requestid text
);

alter table timestamps
    owner to "timestamp-db-user";

create unique index timestamps_id_uindex
    on timestamps (id);

```

## CR a `timestamp`

Does not offer update and delete functionality by design.


