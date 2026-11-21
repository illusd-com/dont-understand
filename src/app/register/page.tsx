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
    <div className="min-h-screen flex flex-col">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-[#1f1f1f]">
        <a href="/" className="text-sm font-medium tracking-tight hover:text-[#ff6b00] transition-colors">
          搞不懂
        </a>
        <a href="/" className="text-sm text-[#8a8a8a] hover:text-white transition-colors">
          登入
        </a>
      </header>

      <main className="flex-1 flex items-center px-6 py-16">
        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">建立帳號</h1>
          <p className="text-sm text-[#8a8a8a] mb-10">就是搞不懂，沒有別的。</p>

          {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">使用者名稱</label>
              <input
                className="w-full bg-transparent border-b border-[#2a2a2a] px-0 py-2.5 focus:outline-none focus:border-[#ff6b00] transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">Email</label>
              <input
                type="email"
                className="w-full bg-transparent border-b border-[#2a2a2a] px-0 py-2.5 focus:outline-none focus:border-[#ff6b00] transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs text-[#6a6a6a] mb-1.5">密碼（至少 6 字）</label>
              <input
                type="password"
                className="w-full bg-transparent border-b border-[#2a2a2a] px-0 py-2.5 focus:outline-none focus:border-[#ff6b00] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full bg-[#ff6b00] text-black font-medium py-3 rounded-full active:scale-[0.98] transition-transform duration-150"
            >
              註冊
            </button>
          </form>
        </div>
      </main>

      <script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        async
        defer
      />
    </div>
  );
}
