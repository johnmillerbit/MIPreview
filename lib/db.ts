import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: '210807',
  host: 'localhost',
  port: 5432,
  database: 'MIP',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.stack);
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

export default pool;