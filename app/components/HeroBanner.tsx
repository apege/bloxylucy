'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Zap, ArrowRight, Clock } from 'lucide-react';

export default function HeroBanner() {
  const [timeLeft, setTimeLeft] = useState({
    days: 19,
    hours: 23,
    minutes: 59,
    seconds: 50,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-r from-[#ffeef4]/80 via-[#fff8fa] to-[#fff3f6] p-6 sm:p-8 md:p-10 shadow-xs">
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text & Promo Details */}
          <div className="flex-1 text-center lg:text-left space-y-3.5 max-w-2xl">
            {/* Promo Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-pink-200 text-pink-700 text-xs font-bold shadow-2xs">
              <span>PROMO SPESIAL BULAN INI</span>
              <span className="bg-rose-500 text-white text-[10px] uppercase px-2 py-0.5 rounded-full font-extrabold tracking-wider">
                LIMITED STOCK
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 font-sans">
                ROBUX <span className="text-pink-600">BULAN INI</span>
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm md:text-base font-medium">
                Top Up Robux Instant, Cepat, Legal, Aman &amp; Bergaransi 100% Uang Kembali!
              </p>
            </div>

            {/* Clean Price Typography (No bulky container) */}
            <div className="space-y-0.5 pt-1">
              <div className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                2.200 <span className="text-xs sm:text-sm font-bold text-zinc-500">ROBUX</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <span className="text-sm sm:text-base text-zinc-400 line-through font-semibold">2.000 Robux</span>
                <span className="text-2xl sm:text-3xl font-black text-pink-600">Rp45.000</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a
                href="#pricelist"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-yellow-200 text-yellow-200" />
                <span>Beli Robux Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#testimoni"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-700 font-bold text-sm shadow-2xs transition-colors cursor-pointer"
              >
                <span>Lihat Testimoni</span>
              </a>
            </div>
          </div>

          {/* Right Side: Digital Countdown Timer & Mascot */}
          <div className="flex flex-col items-center gap-3.5 bg-white p-5 sm:p-6 rounded-3xl border border-pink-100 shadow-sm w-full lg:w-auto">
            <div className="flex items-center gap-2 text-pink-600 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-pink-500" />
              <span>PROMO BERAKHIR DALAM</span>
            </div>

            {/* Digital Timer Display */}
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5 text-center">
              <div className="flex flex-col items-center bg-pink-50/50 border border-pink-100 px-3 py-2 rounded-2xl min-w-[58px] sm:min-w-[66px]">
                <span className="text-xl sm:text-2xl font-mono font-black text-pink-600">
                  {formatNumber(timeLeft.days)}
                </span>
                <span className="text-[9px] font-bold uppercase text-zinc-400 mt-0.5">HARI</span>
              </div>
              <div className="flex flex-col items-center bg-pink-50/50 border border-pink-100 px-3 py-2 rounded-2xl min-w-[58px] sm:min-w-[66px]">
                <span className="text-xl sm:text-2xl font-mono font-black text-pink-600">
                  {formatNumber(timeLeft.hours)}
                </span>
                <span className="text-[9px] font-bold uppercase text-zinc-400 mt-0.5">JAM</span>
              </div>
              <div className="flex flex-col items-center bg-pink-50/50 border border-pink-100 px-3 py-2 rounded-2xl min-w-[58px] sm:min-w-[66px]">
                <span className="text-xl sm:text-2xl font-mono font-black text-pink-600">
                  {formatNumber(timeLeft.minutes)}
                </span>
                <span className="text-[9px] font-bold uppercase text-zinc-400 mt-0.5">MENIT</span>
              </div>
              <div className="flex flex-col items-center bg-pink-50/50 border border-pink-100 px-3 py-2 rounded-2xl min-w-[58px] sm:min-w-[66px]">
                <span className="text-xl sm:text-2xl font-mono font-black text-rose-600 animate-pulse">
                  {formatNumber(timeLeft.seconds)}
                </span>
                <span className="text-[9px] font-bold uppercase text-zinc-400 mt-0.5">DETIK</span>
              </div>
            </div>

            {/* Mascot Mini Card */}
            <div className="flex items-center gap-3 w-full bg-pink-50/60 border border-pink-100 p-2.5 rounded-2xl">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-pink-300 shrink-0">
                <Image
                  src="/images/logo.jpeg"
                  alt="BloxyLucy Mascot"
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-zinc-900">Garansi Proses Kilat</p>
                <p className="text-[11px] text-zinc-500">Langsung otomatis ke akun kamu</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
