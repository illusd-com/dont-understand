'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const token = await (window as any).grecaptcha?.execute(
      process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      { action: 'register' }
    );

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, recaptchaToken: token }),
    });

    if (res.ok) {
      router.push('/');
    } else {
      const data = await res.json();
      setError(data.error || '註冊失敗');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#111] border border-[#222] rounded-2xl p-8 md:p-10">
        <h1 className="text-2xl font-medium mb-1">建立帳號</h1>
        <p className="text-sm text-[#888] mb-6">就是搞不懂，沒有別的。</p>
        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
            placeholder="使用者名稱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            type="email"
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            type="password"
            className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff6b00] transition-colors"
            placeholder="密碼（至少6字）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <button
            type="submit"
            className="w-full bg-[#ff6b00] text-black font-medium py-3 rounded-xl active:scale-[0.97] transition-transform duration-150"
          >
            註冊
          </button>
        </form>
        <p className="mt-6 text-sm text-[#888]">
          已有帳號？{' '}
          <a href="/" className="text-[#ff6b00] hover:underline">
            登入
          </a>
        </p>
      </div>
      <script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        async
        defer
      />
    </div>
  );
}
