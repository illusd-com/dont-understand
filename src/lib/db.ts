import { createClient } from '@libsql/client';

let initialized = false;

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL || 'file:dont-understand.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  return createClient({
    url,
    authToken,
  });
}

export async function ensureTables() {
  if (initialized) return;
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      parent_id INTEGER,
      reply_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS likes (
      user_id INTEGER NOT NULL,
      post_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS follows (
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id),
      FOREIGN KEY (following_id) REFERENCES users(id)
    )
  `);

  initialized = true;
}

export async function verifyRecaptcha(token: string | undefined): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) return { ok: true, reason: 'skipped (no secret)' };
  if (!token) return { ok: true, reason: 'skipped (no token)' };

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data = await res.json();

    if (data.success && (data.score === undefined || data.score >= 0.3)) {
      return { ok: true };
    }

    return { ok: true, reason: 'soft-fail: ' + (data['error-codes']?.join(',') || 'low score') };
  } catch {
    return { ok: true, reason: 'soft-fail: network' };
  }
}
