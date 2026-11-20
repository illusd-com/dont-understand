import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const username = cookies().get('user')?.value || null;
  return NextResponse.json({ username });
}
