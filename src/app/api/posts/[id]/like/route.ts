import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const username = cookies().get('user')?.value;
  if (!username) return NextResponse.json({ error: '未登入' }, { status: 401 });

  const postId = params.id;
  const db = getDb();

  const userRes = await db.execute({
    sql: 'SELECT id FROM users WHERE username = ?',
    args: [username],
  });
  if (userRes.rows.length === 0) return NextResponse.json({ error: '使用者不存在' }, { status: 400 });
  const userId = userRes.rows[0].id as number;

  const existing = await db.execute({
    sql: 'SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?',
    args: [userId, postId],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: 'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
      args: [userId, postId],
    });
    await db.execute({
      sql: 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?',
      args: [postId],
    });
    return NextResponse.json({ liked: false });
  } else {
    await db.execute({
      sql: 'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
      args: [userId, postId],
    });
    await db.execute({
      sql: 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?',
      args: [postId],
    });
    return NextResponse.json({ liked: true });
  }
}
