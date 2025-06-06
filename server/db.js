const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'client',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'logistics_company',
    password: process.env.DB_PASSWORD || 'parola123',
    port: process.env.DB_PORT || 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
