type DBENV = {
    host: string
    database: string
    schema: string
    user: string
    port: number
    password?: string
}

type DB = {
    timestampdb: DBENV,
}

export default DBENV;

export {DB, DBENV};