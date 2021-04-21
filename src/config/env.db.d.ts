declare type DBENV = {
    host: string;
    database: string;
    schema: string;
    user: string;
    port: number;
    password?: string;
};
declare type DB = {
    timestampdb: DBENV;
};
export default DBENV;
export { DB, DBENV };
//# sourceMappingURL=env.db.d.ts.map