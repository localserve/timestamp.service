# Setup database

0. Run a docker instance for postgres
1. `create database timestampdb;`
2. `create user timestamp_db_user with encrypted password 'timestamp_db_password';`
3. `grant all privileges on database timestampdb to timestamp_db_user;`
4. 