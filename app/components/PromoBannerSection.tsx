'use client';

import React from 'react';
import { 
  Clock, 
  User, 
  ShieldCheck 
} from 'lucide-react';

export default function PromoBannerSection() {
  return (
    <section id="cara-order" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="rounded-3xl border border-pink-100 bg-white p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-xs font-bold shadow-2xs">
            <span>ALUR TRANSAKSI MUDAH &amp; CEPAT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Top Up Robux Tanpa Ribet
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            Hanya butuh 3 langkah singkat, Robux langsung mendarat ke akun kamu
          </p>
        </div>

        {/* 3 Step Columns with Vertical Dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 pt-2">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-3 px-4 md:border-r md:border-zinc-100">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shadow-2xs">
              <User className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-black text-pink-600 uppercase tracking-wider block mb-1">
                LANGKAH 1
              </span>
              <h3 className="text-base sm:text-lg font-black text-zinc-900">
                Hanya Butuh Username
              </h3>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Cukup masukkan username Roblox kamu tanpa perlu password akun.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 px-4 md:border-r md:border-zinc-100">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-black text-pink-600 uppercase tracking-wider block mb-1">
                LANGKAH 2
              </span>
              <h3 className="text-base sm:text-lg font-black text-zinc-900">
                Proses 5 - 10 Menit
              </h3>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Scan QRIS dari aplikasi e-wallet atau m-banking apa saja.
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 px-4">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-black text-pink-600 uppercase tracking-wider block mb-1">
                LANGKAH 3
              </span>
              <h3 className="text-base sm:text-lg font-black text-zinc-900">
                Tinggal Duduk Manis
              </h3>
            </div>
            <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
              Robux otomatis masuk ke akun Anda dengan garansi 100% aman.
            </p>
          </div>

        </div>

        {/* Bottom Banner Strip */}
        <div className="p-4 sm:p-4.5 rounded-2xl bg-pink-50/50 border border-pink-100/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
            <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0" />
            <span>Garansi 100% Uang Kembali Jika Pesanan Gagal</span>
          </div>

          <div className="text-xs sm:text-sm font-black text-pink-600 tracking-wide uppercase">
            MERDEKA TOP UP, MERDEKA JADI SULTAN!
          </div>
        </div>

      </div>
    </section>
  );
}
