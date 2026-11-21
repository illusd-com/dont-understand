import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: { username: string } }
) {
  const me = cookies().get('user')?.value;
  if (!me) return NextResponse.json({ error: '未登入' }, { status: 401 });

  const target = params.username;
  if (me === target) return NextResponse.json({ error: '不能關注自己' }, { status: 400 });

  const db = getDb();

  const meRes = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [me] });
  const targetRes = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [target] });

  if (meRes.rows.length === 0 || targetRes.rows.length === 0) {
    return NextResponse.json({ error: '使用者不存在' }, { status: 400 });
  }

  const meId = meRes.rows[0].id as number;
  const targetId = targetRes.rows[0].id as number;

  const existing = await db.execute({
    sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
    args: [meId, targetId],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      args: [meId, targetId],
    });
    return NextResponse.json({ following: false });
  } else {
    await db.execute({
      sql: 'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      args: [meId, targetId],
    });
    return NextResponse.json({ following: true });
  }
}
