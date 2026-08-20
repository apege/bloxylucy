'use client';

import React, { useState, Suspense, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowLeft, Loader2, Sparkles, Heart } from 'lucide-react';

// Sakura Petal Component for animated background
function SakuraBackground() {
  const petals = [
    { left: '8%', delay: '0s', duration: '9s', size: 'w-4 h-4', opacity: 'opacity-70' },
    { left: '18%', delay: '2.5s', duration: '12s', size: 'w-5 h-5', opacity: 'opacity-60' },
    { left: '28%', delay: '4s', duration: '10s', size: 'w-3 h-3', opacity: 'opacity-80' },
    { left: '42%', delay: '1s', duration: '11s', size: 'w-4 h-4', opacity: 'opacity-75' },
    { left: '55%', delay: '5s', duration: '14s', size: 'w-5 h-5', opacity: 'opacity-65' },
    { left: '68%', delay: '2s', duration: '8.5s', size: 'w-4 h-4', opacity: 'opacity-85' },
    { left: '78%', delay: '3.5s', duration: '13s', size: 'w-3 h-3', opacity: 'opacity-70' },
    { left: '88%', delay: '0.8s', duration: '10.5s', size: 'w-5 h-5', opacity: 'opacity-80' },
    { left: '94%', delay: '6s', duration: '11.5s', size: 'w-4 h-4', opacity: 'opacity-60' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {petals.map((petal, index) => (
        <div
          key={index}
          className={`absolute -top-6 ${petal.size} ${petal.opacity} animate-sakura`}
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        >
          {/* Sakura Petal SVG */}
          <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
            <path
              d="M15 2C15 2 7 8 7 17C7 22.5 10.5 26 15 28C19.5 26 23 22.5 23 17C23 8 15 2 15 2Z"
              fill="url(#sakuraGradient)"
            />
            <defs>
              <linearGradient id="sakuraGradient" x1="7" y1="2" x2="23" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fbcfe8" />
                <stop offset="0.6" stopColor="#f472b6" />
                <stop offset="1" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Username atau password salah!');
        setLoading(false);
        return;
      }

      // Success! Redirect to admin dashboard
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setErrorMsg('Gagal terhubung ke server. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-[#fff0f5] via-[#fde8ef] to-[#fce4ec] text-[#3b1828]">
      {/* Decorative Ambient Glass Glowing Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-300/40 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-[420px] h-[420px] bg-rose-200/50 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-200/50 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />

      {/* Falling Sakura Petals */}
      <SakuraBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Top Bar Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-pink-700 hover:text-pink-900 transition-all bg-white/60 hover:bg-white/80 px-3.5 py-2 rounded-xl backdrop-blur-md border border-pink-200/60 shadow-sm shadow-pink-200/30 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Ke Storefront
          </Link>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-pink-700 bg-pink-100/80 backdrop-blur-md border border-pink-300/60 px-3 py-1.5 rounded-full shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
            Admin Portal
          </div>
        </div>

        {/* Semi-Glass Login Card */}
        <div className="relative bg-white/50 backdrop-blur-xl border border-white/80 rounded-3xl p-7 sm:p-9 shadow-[0_12px_40px_rgba(244,114,182,0.18)] ring-1 ring-pink-200/50 transition-all">
          {/* Subtle Top Glow Overlay */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-t-3xl opacity-70" />

          {/* Header & Logo */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-3.5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-300/80 shadow-md shadow-pink-300/40 mx-auto bg-pink-50 p-1 backdrop-blur-sm">
                <Image
                  src="/images/logo.png"
                  alt="BloxyLucy Logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover rounded-xl"
                  priority
                />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-xs text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
            
            <h1 className="text-2xl font-black tracking-tight text-[#3b1828] flex items-center justify-center gap-1.5">
              BloxyLucy
              <span className="text-pink-600">Admin</span>
            </h1>
            <p className="text-xs text-pink-800/70 mt-1.5 font-medium">
              Silakan login untuk mengelola sistem &amp; pesanan
            </p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50/90 border border-rose-300/70 text-rose-700 text-xs font-semibold flex items-center gap-2.5 backdrop-blur-md shadow-sm">
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form (Admin Only - No Register) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-900/80 mb-2">
                Username Admin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-500/70">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-white/70 hover:bg-white/90 focus:bg-white border border-pink-200/80 focus:border-pink-400 focus:ring-4 focus:ring-pink-300/30 rounded-xl text-sm text-[#2d1822] placeholder-pink-400/50 outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-900/80 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-500/70">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-white/70 hover:bg-white/90 focus:bg-white border border-pink-200/80 focus:border-pink-400 focus:ring-4 focus:ring-pink-300/30 rounded-xl text-sm text-[#2d1822] placeholder-pink-400/50 outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-pink-500/70 hover:text-pink-700 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 text-white font-extrabold rounded-xl shadow-md shadow-pink-400/30 hover:shadow-lg hover:shadow-pink-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memverifikasi Akses...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Masuk ke Panel Admin
                </>
              )}
            </button>
          </form>

          {/* Footer Security / Info Badge */}
          <div className="mt-7 pt-5 border-t border-pink-200/60 text-center">
            <p className="text-[11px] text-pink-800/60 font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Akses Khusus Administrator BloxyLucy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-pink-50 flex items-center justify-center text-pink-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
