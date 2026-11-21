'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const token = await (window as any).grecaptcha?.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      { action: 'login' }
    );

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, recaptchaToken: token }),
    });

    if (res.ok) {
      router.push('/home');
    } else {
      const data = await res.json();
      setError(data.error || '登入失敗');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Intro */}
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
            搞不懂
          </h1>
          <p className="text-lg text-[#a0a0a0] mb-6 leading-relaxed">
            一個專門拿來貼「搞不懂的事情」的地方。
          </p>
          <p className="text-[#888] leading-relaxed mb-4">
            工作上的規定、朋友的講法、新聞裡的因果、甚至自己為什麼會這樣想——不管大小，搞不懂就寫下來。讓看過的人幫你把它講清楚。
          </p>
          <p className="text-sm text-[#666]">
            不接推銷廣告、不發色情、不討論不實內容。就是搞不懂。
          </p>
        </div>

        {/* Login card */}
        <div className="bg-[#111] border border-[#222] rounded-2xl p-8 md:p-10">
          <h2 className="text-xl font-medium mb-1">登入</h2>
          <p className="text-sm text-[#888] mb-6">登入後才能看和發</p>
          {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#ff6b00] transition-colors"
              placeholder="使用者名稱"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
            <input
              type="password"
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-base focus:outline-none focus:border-[#ff6b00] transition-colors"
              placeholder="密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="w-full bg-[#ff6b00] text-black font-medium py-3 rounded-xl active:scale-[0.97] transition-transform duration-150"
            >
              登入
            </button>
          </form>
          <p className="mt-6 text-sm text-[#888]">
            還沒有帳號？{' '}
            <a href="/register" className="text-[#ff6b00] hover:underline">
              註冊
            </a>
          </p>
        </div>
      </div>

      <script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        async
        defer
      />
    </div>
  );
}
