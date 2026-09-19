import express from 'express';
import { query } from './db';

const app = express();
const port = Number(process.env.PORT ?? 8787);
const validStores = new Set(['accounts', 'wishes', 'stories', 'nebulaWords', 'voiceNotes', 'blackHoleWishes', 'discoveredStars', 'flags']);

app.use(express.json({ limit: '2mb' }));

function storeName(value: unknown) {
  if (typeof value !== 'string' || !validStores.has(value)) throw new Error('Invalid store');
  return value;
}

function record(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof (value as { id?: unknown }).id !== 'string') {
    throw new Error('A record with a string id is required');
  }
  return value;
}

app.get('/api/records/:store', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    const result = await query<{ data: unknown }>(
      'SELECT data FROM app_records WHERE store_name = $1 ORDER BY created_at ASC',
      [store],
    );
    res.json(result.rows.map((row) => row.data));
  } catch (error) {
    console.error('[api] list records failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to list records' });
  }
});

app.get('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    const result = await query<{ data: unknown }>(
      'SELECT data FROM app_records WHERE store_name = $1 AND id = $2',
      [store, req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0].data);
  } catch (error) {
    console.error('[api] get record failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to get record' });
  }
});

app.put('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    const data = record(req.body);
    if ((data as { id: string }).id !== req.params.id) return res.status(400).json({ error: 'Path id must match record id' });
    const result = await query<{ data: unknown }>(
      `INSERT INTO app_records (store_name, id, data)
       VALUES ($1, $2, $3::jsonb)
       ON CONFLICT (store_name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
       RETURNING data`,
      [store, req.params.id, JSON.stringify(data)],
    );
    res.json(result.rows[0].data);
  } catch (error) {
    console.error('[api] upsert record failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save record' });
  }
});

app.delete('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    await query('DELETE FROM app_records WHERE store_name = $1 AND id = $2', [store, req.params.id]);
    res.status(204).end();
  } catch (error) {
    console.error('[api] delete record failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to delete record' });
  }
});

app.listen(port, () => console.log(`[api] PostgreSQL API listening on :${port}`));
