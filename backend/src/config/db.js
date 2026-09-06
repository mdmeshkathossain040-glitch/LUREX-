const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.NODE_ENV === 'production' && !config.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
});

/**
 * Execute query with connection pool
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (config.NODE_ENV === 'development') {
      console.log(`[SQL Query] (${duration}ms): ${text.slice(0, 100)}...`);
    }
    return res;
  } catch (error) {
    console.error(`[SQL Error]: ${error.message} on query: ${text.slice(0, 100)}`);
    throw error;
  }
}

/**
 * Helper to run transactions
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  transaction
};
