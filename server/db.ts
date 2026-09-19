import fs from 'node:fs';
import pg from 'pg';

const { Pool } = pg;

function getSslConfig(): pg.PoolConfig['ssl'] {
  const ca = process.env.AIVEN_CA_CERT;
  if (ca) {
    return { ca, rejectUnauthorized: true };
  }

  const databaseUrl = process.env.DATABASE_URL;
  const rootCertPath = databaseUrl ? new URL(databaseUrl).searchParams.get('sslrootcert') : null;
  if (rootCertPath && fs.existsSync(rootCertPath)) {
    return { ca: fs.readFileSync(rootCertPath, 'utf8'), rejectUnauthorized: true };
  }

  throw new Error('AIVEN_CA_CERT is not configured. Add the Aiven CA certificate to the Vercel environment.');
}

let pool: pg.Pool | undefined;

export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured. Add the Aiven PostgreSQL connection string.');
  }

  pool ??= new Pool({
    connectionString,
    ssl: getSslConfig(),
    max: 5,
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
