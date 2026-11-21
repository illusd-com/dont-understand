'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: number;
  username: string;
  content: string;
  created_at: string;
  reply_count: number;
  like_count: number;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => {
      if (!d.username) router.push('/');
      else setUsername(d.username);
    });
    fetch('/api/posts').then(r => r.json()).then(setPosts);
  }, [router]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    setContent('');
    const newPosts = await fetch('/api/posts').then(r => r.json());
    setPosts(newPosts);
  }

  async function handleLike(postId: number) {
    const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      setPosts(posts.map(p => p.id === postId ? {
        ...p,
        like_count: p.like_count + (data.liked ? 1 : -1)
      } : p));
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#222] px-6 py-4 flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-10">
        <div className="font-semibold text-xl tracking-tight">搞不懂</div>
        <div className="text-sm text-[#888]">{username}</div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6">
        <form onSubmit={handlePost} className="mb-8">
          <textarea
            className="w-full bg-[#141414] border border-[#222] rounded-xl p-4 text-base resize-y min-h-[100px] focus:outline-none focus:border-[#ff6b00]"
            placeholder="搞不懂什麼？寫下來讓大家評理..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            required
          />
          <button type="submit" className="mt-3 bg-[#ff6b00] text-black font-semibold px-6 py-2 rounded-full active:scale-[0.97] transition-transform">
            發佈
          </button>
        </form>

        <div className="space-y-0">
          {posts.length === 0 && (
            <div className="text-center text-[#888] py-10">還沒有人發文，來當第一個搞不懂的人吧。</div>
          )}
          {posts.map(post => (
            <div key={post.id} className="border-b border-[#222] py-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#333]" />
                <div>
                  <div className="font-medium">{post.username}</div>
                  <div className="text-sm text-[#888]">{post.created_at}</div>
                </div>
              </div>
              <div className="text-base leading-relaxed mb-3">{post.content}</div>
              <div className="text-sm text-[#888] flex gap-6 items-center">
                <Link href={`/post/${post.id}`} className="hover:text-white">
                  回覆 {post.reply_count}
                </Link>
                <button
                  onClick={() => handleLike(post.id)}
                  className="hover:text-white active:scale-95 transition-transform"
                >
                  讚 {post.like_count}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
