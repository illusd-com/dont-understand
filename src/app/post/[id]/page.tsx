'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  username: string;
  content: string;
  created_at: string;
  reply_count: number;
  like_count: number;
}

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.username) router.push('/');
      else setUsername(d.username);
    });

    // Simple fetch for the parent post via posts list filter (or add dedicated endpoint later)
    fetch('/api/posts').then(r => r.json()).then((all: Post[]) => {
      const found = all.find(p => p.id === Number(id));
      setPost(found || null);
    });

    fetch(`/api/posts/${id}/replies`).then(r => r.json()).then(setReplies);
  }, [id, router]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch(`/api/posts/${id}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setContent('');
    const newReplies = await fetch(`/api/posts/${id}/replies`).then(r => r.json());
    setReplies(newReplies);
    if (post) setPost({ ...post, reply_count: post.reply_count + 1 });
  }

  if (!post) return <div className="p-10 text-center text-[#888]">載入中...</div>;

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#222] px-6 py-4 flex items-center gap-4 sticky top-0 bg-[#0a0a0a] z-10">
        <Link href="/home" className="text-[#888] hover:text-white">←</Link>
        <div className="font-semibold">貼文</div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="border-b border-[#222] pb-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#333]" />
            <div>
              <div className="font-medium">{post.username}</div>
              <div className="text-sm text-[#888]">{post.created_at}</div>
            </div>
          </div>
          <div className="text-lg leading-relaxed">{post.content}</div>
          <div className="mt-4 text-sm text-[#888]">讚 {post.like_count} · 回覆 {post.reply_count}</div>
        </div>

        <form onSubmit={handleReply} className="mb-8">
          <textarea
            className="w-full bg-[#141414] border border-[#222] rounded-xl p-4 focus:outline-none focus:border-[#ff6b00]"
            placeholder="回覆這則搞不懂..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            required
          />
          <button type="submit" className="mt-3 bg-[#ff6b00] text-black font-semibold px-6 py-2 rounded-full">
            回覆
          </button>
        </form>

        <div className="space-y-0">
          {replies.map(r => (
            <div key={r.id} className="border-b border-[#222] py-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#333]" />
                <div>
                  <div className="font-medium text-sm">{r.username}</div>
                  <div className="text-xs text-[#888]">{r.created_at}</div>
                </div>
              </div>
              <div className="text-base">{r.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
