'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { User, CheckCircle, AlertCircle, Search, UserCheck, XCircle } from 'lucide-react';

interface AccountDataSectionProps {
  username: string;
  onChangeUsername: (username: string) => void;
}

interface RobloxAccountData {
  userId: number;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export default function AccountDataSection({
  username,
  onChangeUsername,
}: AccountDataSectionProps) {
  const [accountData, setAccountData] = useState<RobloxAccountData | null>(null);
  const [checking, setChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckUser = async () => {
    if (!username.trim()) return;

    setChecking(true);
    setErrorMessage(null);
    setAccountData(null);

    try {
      const res = await fetch(`/api/roblox-check?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();

      if (data.success) {
        setAccountData({
          userId: data.userId,
          username: data.username,
          displayName: data.displayName || data.username,
          avatarUrl: data.avatarUrl || '',
        });
        // Normalize username to exact casing returned from Roblox API
        onChangeUsername(data.username);
      } else {
        setErrorMessage(data.message || 'Username Roblox tidak ditemukan. Pastikan ejaan benar!');
      }
    } catch {
      setErrorMessage('Terjadi gangguan jaringan saat mengecek akun. Coba beberapa saat lagi.');
    } finally {
      setChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCheckUser();
    }
  };

  return (
    <section id="username-input" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="overflow-hidden rounded-3xl border border-pink-200 bg-white shadow-xs">
        
        {/* Step Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50/80 to-white border-b border-pink-100 px-6 py-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-500 text-white font-extrabold text-base shadow-sm">
            1
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-wide">
              Masukkan Data Akun
            </h2>
            <p className="text-[11px] text-zinc-500">
              Isi data username Roblox kamu untuk pengiriman pesanan otomatis
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-4">
          <div>
            <label className="block text-sm font-bold text-zinc-800 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-pink-500" />
              <span>Username Roblox</span>
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    onChangeUsername(e.target.value);
                    if (accountData || errorMessage) {
                      setAccountData(null);
                      setErrorMessage(null);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: BloxyGamer123"
                  className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 border border-pink-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:border-pink-500 focus:ring-2 focus:ring-pink-200 font-medium text-sm sm:text-base transition-all"
                />
                {username.trim().length > 0 && !checking && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {accountData ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : errorMessage ? (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    ) : (
                      <span className="text-xs text-zinc-400">Tekan Enter atau Cek</span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCheckUser}
                disabled={!username.trim() || checking}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 cursor-pointer"
              >
                {checking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Mengecek...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Cek Akun</span>
                  </>
                )}
              </button>
            </div>

            {/* Real Roblox Account Verified Card with Avatar */}
            {accountData && (
              <div className="mt-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-pink-50/40 border-2 border-emerald-200 flex items-center justify-between gap-4 animate-fadeIn shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Real Roblox Headshot Avatar */}
                  <div className="relative w-13 h-13 rounded-2xl overflow-hidden bg-white border-2 border-emerald-300 shadow-sm shrink-0 flex items-center justify-center">
                    {accountData.avatarUrl ? (
                      <Image
                        src={accountData.avatarUrl}
                        alt={accountData.username}
                        width={52}
                        height={52}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <UserCheck className="w-7 h-7 text-emerald-600" />
                    )}
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-zinc-900 truncate">
                        {accountData.displayName}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 shrink-0">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Terverifikasi
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                      Username: <strong className="text-pink-600 font-bold">@{accountData.username}</strong>
                      <span className="text-zinc-400 ml-2 hidden sm:inline">• ID: {accountData.userId}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block text-right shrink-0">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-lg border border-emerald-200">
                    ✓ Akun Siap Menerima Robux
                  </span>
                </div>
              </div>
            )}

            {/* Error message state */}
            {errorMessage && (
              <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            <p className="text-xs text-zinc-500 mt-3 flex items-start gap-1.5 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <span>*Silakan masukkan username Roblox Anda dengan benar untuk proses transaksi otomatis 5-10 menit. Akun aman dan privasi terjaga 100%.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
