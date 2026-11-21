import { createClient } from '@libsql/client';

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL || 'file:dont-understand.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  return createClient({
    url,
    authToken,
  });
}

export async function verifyRecaptcha(token: string | undefined): Promise<{ ok: boolean; reason?: string }> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // No secret configured → skip verification
  if (!secret) return { ok: true, reason: 'skipped (no secret)' };

  // No token (script failed to load) → allow through for now
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

    // Verification failed but don't block the user
    return { ok: true, reason: 'soft-fail: ' + (data['error-codes']?.join(',') || 'low score') };
  } catch {
    return { ok: true, reason: 'soft-fail: network' };
  }
}
