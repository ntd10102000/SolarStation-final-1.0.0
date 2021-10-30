var pg = require("pg");

var config_db = {
    user: "postgres",
    database: "gee",
    password: "admin_humg",
    host: "localhost",
    port: "5432",
    max: 10,
    idleTimeoutMillis: 30000
};

var pool_db = new pg.Pool(config_db);

module.exports = { pool_db, config_db };