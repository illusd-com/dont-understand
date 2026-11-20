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

    // reCAPTCHA v3
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-[#141414] border border-[#222] rounded-2xl p-10 text-center">
        <h1 className="text-3xl font-semibold mb-2 tracking-tight">搞不懂</h1>
        <p className="text-[#888] mb-8">Don't Understand</p>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full bg-[#0f0f0f] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff6b00]"
            placeholder="使用者名稱"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full bg-[#0f0f0f] border border-[#222] rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff6b00]"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-[#ff6b00] text-black font-semibold py-3 rounded-xl active:scale-[0.97] transition-transform"
          >
            登入
          </button>
        </form>
        <p className="mt-6 text-sm text-[#888]">
          還沒有帳號？ <a href="/register" className="text-[#ff6b00]">註冊</a>
        </p>
      </div>
      <script src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} async defer></script>
    </div>
  );
}
