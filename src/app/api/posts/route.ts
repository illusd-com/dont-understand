import { NextResponse } from 'next/server';
import { getDb, ensureTables } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  await ensureTables();
  const db = getDb();
  const result = await db.execute(`
    SELECT p.id, u.username, p.content, p.created_at, p.reply_count, p.like_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.parent_id IS NULL
    ORDER BY p.created_at DESC
    LIMIT 50
  `);

  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  await ensureTables();
  const username = cookies().get('user')?.value;
  if (!username) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content?.trim() || content.length > 500) {
    return NextResponse.json({ error: '內容無效' }, { status: 400 });
  }

  const db = getDb();
  const userResult = await db.execute({
    sql: 'SELECT id FROM users WHERE username = ?',
    args: [username],
  });

  if (userResult.rows.length === 0) {
    return NextResponse.json({ error: '使用者不存在' }, { status: 400 });
  }

  const userId = userResult.rows[0].id;
  await db.execute({
    sql: 'INSERT INTO posts (user_id, content) VALUES (?, ?)',
    args: [userId, content.trim()],
  });

  return NextResponse.json({ ok: true });
}
