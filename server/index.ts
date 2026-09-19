import express from 'express';
import crypto from 'node:crypto';
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
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof (value as { id?: unknown }).id !== 'string') throw new Error('A record with a string id is required');
  return value;
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password: string, stored: string) {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}
function tokenHash(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }
function setSessionCookie(res: express.Response, token: string) { res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`); }
async function sessionUser(req: express.Request) {
  const cookie = req.headers.cookie?.match(/(?:^|; )session=([^;]+)/)?.[1];
  if (!cookie) return null;
  const result = await query<{ id: string; username: string; avatar_url: string; uploaded_stickers: string[] }>(
    'SELECT u.id,u.username,u.avatar_url,u.uploaded_stickers FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at > now()', [tokenHash(cookie)]
  );
  return result.rows[0] ?? null;
}
function publicUser(user: { id: string; username: string; avatar_url: string; uploaded_stickers: string[] }) { return { id: user.id, username: user.username, avatarUrl: user.avatar_url, uploadedStickers: user.uploaded_stickers ?? [] }; }
async function requireUser(req: express.Request, res: express.Response) {
  const user = await sessionUser(req);
  if (!user) { res.status(401).json({ error: 'Please log in to continue.' }); return null; }
  return user;
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const avatarUrl = typeof req.body?.avatarUrl === 'string' ? req.body.avatarUrl : '';
    if (!username) return res.status(400).json({ error: 'A username is required.' });
    if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters.' });
    if (!avatarUrl) return res.status(400).json({ error: 'A profile picture is required.' });
    const id = crypto.randomUUID();
    const inserted = await query<{ id: string; username: string; avatar_url: string; uploaded_stickers: string[] }>(
      'INSERT INTO users (id,username,password_hash,avatar_url) VALUES ($1,$2,$3,$4) RETURNING id,username,avatar_url,uploaded_stickers', [id, username, hashPassword(password), avatarUrl]
    );
    const token = crypto.randomBytes(32).toString('hex');
    await query('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,now()+interval \'30 days\')', [tokenHash(token), id]);
    setSessionCookie(res, token);
    console.log('[api] signup succeeded', { userId: id });
    res.status(201).json({ user: publicUser(inserted.rows[0]) });
  } catch (error) {
    console.error('[api] signup failed', error);
    res.status(400).json({ error: 'That username may already be taken.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const result = await query<{ id: string; username: string; password_hash: string; avatar_url: string; uploaded_stickers: string[] }>('SELECT id,username,password_hash,avatar_url,uploaded_stickers FROM users WHERE LOWER(username)=LOWER($1)', [username]);
    const account = result.rows[0];
    if (!account || !verifyPassword(password, account.password_hash)) return res.status(401).json({ error: 'Invalid username or password.' });
    const token = crypto.randomBytes(32).toString('hex');
    await query('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,now()+interval \'30 days\')', [tokenHash(token), account.id]);
    setSessionCookie(res, token);
    console.log('[api] login succeeded', { userId: account.id });
    res.json({ user: publicUser(account) });
  } catch (error) { console.error('[api] login failed', error); res.status(500).json({ error: 'Unable to log in right now.' }); }
});

app.get('/api/auth/me', async (req, res) => { try { const user = await sessionUser(req); res.json({ user: user ? publicUser(user) : null }); } catch (error) { console.error('[api] session lookup failed', error); res.status(500).json({ error: 'Unable to restore session.' }); } });
app.post('/api/auth/logout', async (req, res) => { const cookie = req.headers.cookie?.match(/(?:^|; )session=([^;]+)/)?.[1]; if (cookie) await query('DELETE FROM sessions WHERE token_hash=$1', [tokenHash(cookie)]); res.setHeader('Set-Cookie', 'session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'); res.status(204).end(); });
app.get('/api/stats', async (_req, res) => {
  const result = await query<{ friends: number; unopened: number }>(`SELECT (SELECT count(*)::int FROM users) AS friends, ((SELECT count(*) FROM wish_cards WHERE COALESCE((constellation_data->>'unopened')::boolean, false)) + (SELECT count(*) FROM app_records WHERE store_name IN ('stories','voiceNotes','nebulaWords','blackHoleWishes') AND COALESCE((data->>'unopened')::boolean, false)))::int AS unopened`);
  console.log('[api] shared stats read', result.rows[0]);
  res.json(result.rows[0]);
});

app.get('/api/wishes', async (_req, res) => {
  try {
    const result = await query<{ id: string; title: string; constellation_data: unknown; created_at: string }>(
      'SELECT id, title, constellation_data, created_at FROM wish_cards ORDER BY created_at ASC',
    );
    console.log('[api] SELECT wish_cards succeeded', { count: result.rowCount });
    res.json(result.rows.map((row) => ({ ...((row.constellation_data as object) ?? {}), id: row.id, title: row.title, createdAt: row.created_at })));
  } catch (error) {
    console.error('[api] SELECT wish_cards failed', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to list wishes' });
  }
});

app.post('/api/wishes', async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const data = record(req.body) as Record<string, unknown>;
    const title = typeof data.title === 'string' ? data.title : '';
    const userId = user.id;
    const { id, title: _title, userId: _userId, createdAt: _createdAt, ...payload } = data;
    const result = await query<{ id: string; title: string; constellation_data: unknown; created_at: string }>(
      `INSERT INTO wish_cards (id, user_id, title, constellation_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, now(), now())
       ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, title = EXCLUDED.title,
         constellation_data = EXCLUDED.constellation_data, updated_at = now()
       RETURNING id, title, constellation_data, created_at`,
      [id, userId, title, JSON.stringify(payload)],
    );
    console.log('[api] INSERT wish_cards succeeded', { id, rowCount: result.rowCount });
    const row = result.rows[0];
    res.status(201).json({ ...((row.constellation_data as object) ?? {}), id: row.id, title: row.title, createdAt: row.created_at });
  } catch (error) {
    console.error('[api] INSERT wish_cards failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save wish' });
  }
});

app.get('/api/wishes/:id', async (req, res) => {
  try {
    const result = await query<{ id: string; title: string; constellation_data: unknown; created_at: string }>(
      'SELECT id, title, constellation_data, created_at FROM wish_cards WHERE id = $1', [req.params.id],
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Wish not found' });
    const row = result.rows[0];
    console.log('[api] SELECT wish_cards/:id succeeded', { id: req.params.id });
    res.json({ ...((row.constellation_data as object) ?? {}), id: row.id, title: row.title, createdAt: row.created_at });
  } catch (error) {
    console.error('[api] SELECT wish_cards/:id failed', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to get wish' });
  }
});

app.delete('/api/wishes/:id', async (req, res) => {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const result = await query('DELETE FROM wish_cards WHERE id = $1 AND user_id = $2', [req.params.id, user.id]);
    if (!result.rowCount) return res.status(403).json({ error: "You don't have permission to modify this." });
    console.log('[api] DELETE wish_cards succeeded', { id: req.params.id, rowCount: result.rowCount });
    res.status(204).end();
  } catch (error) {
    console.error('[api] DELETE wish_cards failed', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unable to delete wish' });
  }
});

app.get('/api/records/:store', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    if (store === 'accounts') {
      const users = await query<{ id: string; username: string; avatar_url: string; uploaded_stickers: string[]; created_at: string }>('SELECT id,username,avatar_url,uploaded_stickers,created_at FROM users ORDER BY created_at ASC');
      return res.json(users.rows.map((user) => ({ id: user.id, username: user.username, password: '', avatarUrl: user.avatar_url, uploadedStickers: user.uploaded_stickers ?? [], createdAt: new Date(user.created_at).getTime() })));
    }
    const result = await query<{ data: unknown }>(
      'SELECT data FROM app_records WHERE store_name = $1 ORDER BY created_at ASC',
      [store],
    );
    console.log('[api] SELECT records succeeded', { store, count: result.rowCount });
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

async function saveRecord(store: string, id: string, data: object) {
  const result = await query<{ data: unknown }>(
    `INSERT INTO app_records (store_name, id, data, created_at, updated_at)
     VALUES ($1, $2, $3::jsonb, now(), now())
     ON CONFLICT (store_name, id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
     RETURNING data`,
    [store, id, JSON.stringify(data)],
  );
  console.log('[api] record saved', { store, id, rowCount: result.rowCount });
  return result.rows[0].data;
}

app.post('/api/records/:store', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    if (store === 'accounts') return res.status(405).json({ error: 'Use the authentication endpoint.' });
    const user = await requireUser(req, res);
    if (!user) return;
    const input = record(req.body) as Record<string, unknown>;
    const data = (store === 'flags' || store === 'discoveredStars') ? input : { ...input, creatorId: user.id };
    console.log('[api] POST record', { store, id: data.id });
    res.status(201).json(await saveRecord(store, data.id as string, data));
  } catch (error) {
    console.error('[api] POST record failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save record' });
  }
});

app.put('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    const user = await requireUser(req, res);
    if (!user) return;
    const input = record(req.body) as Record<string, unknown>;
    if (input.id !== req.params.id) return res.status(400).json({ error: 'Path id must match record id' });
    const data = (store === 'flags' || store === 'discoveredStars') ? input : { ...input, creatorId: user.id };
    if (store !== 'flags' && store !== 'discoveredStars') {
      const owned = await query('SELECT 1 FROM app_records WHERE store_name=$1 AND id=$2 AND (data->>\'creatorId\'=$3 OR data->>\'userId\'=$3)', [store, req.params.id, user.id]);
      if (!owned.rowCount && store !== 'accounts') return res.status(403).json({ error: "You don't have permission to modify this." });
    }
    console.log('[api] PUT record', { store, id: req.params.id });
    res.json(await saveRecord(store, req.params.id, data));
  } catch (error) {
    console.error('[api] PUT record failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to save record' });
  }
});

app.delete('/api/records/:store/:id', async (req, res) => {
  try {
    const store = storeName(req.params.store);
    const user = await requireUser(req, res);
    if (!user) return;
    const result = await query('DELETE FROM app_records WHERE store_name = $1 AND id = $2 AND (data->>\'creatorId\' = $3 OR data->>\'userId\' = $3)', [store, req.params.id, user.id]);
    if (!result.rowCount) return res.status(403).json({ error: "You don't have permission to modify this." });
    res.status(204).end();
  } catch (error) {
    console.error('[api] delete record failed', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Unable to delete record' });
  }
});

if (!process.env.VERCEL) app.listen(port, () => console.log(`[api] PostgreSQL API listening on :${port}`));
export default app;
