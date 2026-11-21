import { createClient } from '@libsql/client';

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL || 'file:dont-understand.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  return createClient({
    url,
    authToken,
  });
}

export async function verifyRecaptcha(token: string): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false, reason: 'missing secret' };
  if (!token) return { ok: false, reason: 'missing token' };

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });

  const data = await res.json();

  // v3: score > 0.3 is usually fine; also accept if success and no score (v2)
  if (data.success && (data.score === undefined || data.score >= 0.3)) {
    return { ok: true };
  }

  return { ok: false, reason: data['error-codes']?.join(',') || 'low score' };
}
