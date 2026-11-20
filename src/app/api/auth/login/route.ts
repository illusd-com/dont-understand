import { NextResponse } from 'next/server';
import { getDb, verifyRecaptcha } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { username, password, recaptchaToken } = await req.json();

  if (!(await verifyRecaptcha(recaptchaToken))) {
    return NextResponse.json({ error: 'reCAPTCHA 驗證失敗' }, { status: 400 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT id, password_hash FROM users WHERE username = ?',
    args: [username],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash as string);
  if (!valid) {
    return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
  }

  cookies().set('user', username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
