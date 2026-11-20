import { createClient } from '@libsql/client';

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL || 'file:dont-understand.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  return createClient({
    url,
    authToken,
  });
}

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return false;

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json();
  return data.success === true && data.score > 0.5;
}
