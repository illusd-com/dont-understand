import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT p.id, u.username, p.content, p.created_at, p.reply_count, p.like_count
          FROM posts p
          JOIN users u ON p.user_id = u.id
          WHERE p.parent_id = ?
          ORDER BY p.created_at ASC`,
    args: [params.id],
  });
  return NextResponse.json(result.rows);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const username = cookies().get('user')?.value;
  if (!username) return NextResponse.json({ error: '未登入' }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim() || content.length > 500) {
    return NextResponse.json({ error: '內容無效' }, { status: 400 });
  }

  const db = getDb();
  const userRes = await db.execute({
    sql: 'SELECT id FROM users WHERE username = ?',
    args: [username],
  });
  if (userRes.rows.length === 0) return NextResponse.json({ error: '使用者不存在' }, { status: 400 });
  const userId = userRes.rows[0].id;

  await db.execute({
    sql: 'INSERT INTO posts (user_id, content, parent_id) VALUES (?, ?, ?)',
    args: [userId, content.trim(), params.id],
  });

  await db.execute({
    sql: 'UPDATE posts SET reply_count = reply_count + 1 WHERE id = ?',
    args: [params.id],
  });

  return NextResponse.json({ ok: true });
}
