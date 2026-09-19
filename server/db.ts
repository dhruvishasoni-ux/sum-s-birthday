import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | undefined;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Add the Aiven PostgreSQL connection string.');
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: 10,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  return pool;
}

export async function query<T extends pg.QueryResultRow>(text: string, values: unknown[] = []) {
  const client = await getPool().connect();
  try {
    return await client.query<T>(text, values);
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool?.end();
  pool = undefined;
}
