import fs from 'node:fs';
import pg from 'pg';

const { Pool } = pg;

function getSslConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || process.env.NODE_ENV !== 'production') return undefined;

  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get('sslmode');
  const rootCertPath = url.searchParams.get('sslrootcert');

  const ca = process.env.AIVEN_CA_CERT || (rootCertPath && fs.existsSync(rootCertPath) ? fs.readFileSync(rootCertPath, 'utf8') : undefined);
  if (sslMode !== 'verify-full' || !ca) return { rejectUnauthorized: false };
  return { rejectUnauthorized: true, ca };
}

let pool: pg.Pool | undefined;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Add the Aiven PostgreSQL connection string.');
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: getSslConfig(),
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
