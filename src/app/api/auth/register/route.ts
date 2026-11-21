import { NextResponse } from 'next/server';
import { getDb, verifyRecaptcha } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { username, email, password, recaptchaToken } = await req.json();

  const recaptcha = await verifyRecaptcha(recaptchaToken);
  if (!recaptcha.ok) {
    return NextResponse.json(
      { error: `reCAPTCHA 驗證失敗 (${recaptcha.reason || 'unknown'})` },
      { status: 400 }
    );
  }

  if (username.length < 2 || password.length < 6) {
    return NextResponse.json({ error: '使用者名稱至少2字，密碼至少6字' }, { status: 400 });
  }

  const db = getDb();
  const hash = await bcrypt.hash(password, 10);

  try {
    await db.execute({
      sql: 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      args: [username, email, hash],
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '使用者名稱或Email已被使用' }, { status: 400 });
  }
}
