'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      setError('reCAPTCHA Site Key 沒設定（NEXT_PUBLIC_RECAPTCHA_SITE_KEY）');
      setLoading(false);
      return;
    }

    let timeout = setTimeout(() => {
      if (!ready) {
        setError('reCAPTCHA 載入超時，請確認網域已加入 reCAPTCHA 後台，並重新整理');
        setLoading(false);
      }
    }, 8000);

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onerror = () => {
      setError('reCAPTCHA script 載入失敗');
      setLoading(false);
      clearTimeout(timeout);
    };
    script.onload = () => {
      const grecaptcha = (window as any).grecaptcha;
      if (grecaptcha && grecaptcha.ready) {
        grecaptcha.ready(() => {
          setReady(true);
          setLoading(false);
          clearTimeout(timeout);
        });
      } else {
        setError('reCAPTCHA 未正確初始化');
        setLoading(false);
        clearTimeout(timeout);
      }
    };
    document.head.appendChild(script);

    return () => {
      clearTimeout(timeout);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!ready) {
      setError('reCAPTCHA 未準備好');
      return;
    }

    try {
      const token = await (window as any).grecaptcha.execute(
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
    } catch {
      setError('reCAPTCHA 執行失敗');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 md:px-10 py-5 flex items-center justify-between border-b border-[#1f1f1f]">
        <div className="text-sm font-medium tracking-tight">搞不懂</div>
        <a href="/register" className="text-sm text-[#8a8a8a] hover:text-white transition-colors">
          註冊
        </a>
      </header>

      <main className="flex-1 flex items-center px-6 md:px-10 py-16">
        <div className="w-full max-w-5xl mx-auto grid md:grid-cols-[1.2fr_0.8fr] gap-16 md:gap-24 items-start">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#5c5c5c] mb-6">
              Don't Understand
            </p>
            <h1 className="text-5xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05] mb-6">
              搞不懂的事，<br />寫下來。
            </h1>
            <p className="text-lg text-[#b0b0b0] leading-relaxed max-w-md mb-8">
              工作上的規定、朋友的講法、新聞裡的因果、自己為什麼會這樣想。不管大小，搞不懂就貼上來，讓看過的人幫你把它講清楚。
            </p>
            <ul className="text-sm text-[#6a6a6a] space-y-2">
              <li>不接推銷廣告</li>
              <li>不發色情</li>
              <li>不討論不實內容</li>
            </ul>
          </div>

          <div className="md:pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <div>
                <label className="block text-xs text-[#6a6a6a] mb-1.5">使用者名稱</label>
                <input
                  className="w-full bg-transparent border-b border-[#2a2a2a] px-0 py-2.5 text-base focus:outline-none focus:border-[#ff6b00] transition-colors"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="block text-xs text-[#6a6a6a] mb-1.5">密碼</label>
                <input
                  type="password"
                  className="w-full bg-transparent border-b border-[#2a2a2a] px-0 py-2.5 text-base focus:outline-none focus:border-[#ff6b00] transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !ready}
                className="mt-4 w-full bg-[#ff6b00] text-black font-medium py-3 rounded-full active:scale-[0.98] transition-transform duration-150 disabled:opacity-50"
              >
                {loading ? '載入中...' : '登入'}
              </button>
              <p className="text-xs text-[#5c5c5c] text-center">
                登入後才能看和發
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
