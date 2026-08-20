'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Zap, ArrowRight, Clock, Sparkles, ShieldCheck, CheckCircle2, MessageCircle } from 'lucide-react';
import { StoreSettings } from '@/lib/admin-types';
import { getStoreSettings, INITIAL_MOCK_SETTINGS } from '@/lib/supabase-service';

export default function HeroBanner() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_MOCK_SETTINGS);
  const [timeLeft, setTimeLeft] = useState({
    days: 19,
    hours: 23,
    minutes: 59,
    seconds: 50,
  });

  useEffect(() => {
    getStoreSettings().then((data) => {
      if (data) setSettings(data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!settings.promo_active) return;

    const calculateTimeLeft = () => {
      if (!settings.promo_end_date) {
        return { days: 19, hours: 23, minutes: 59, seconds: 50 };
      }
      const diff = new Date(settings.promo_end_date).getTime() - new Date().getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.promo_active, settings.promo_end_date]);

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num).replace('Rp', 'Rp');
  };

  const formatRobux = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const isPromo = settings.promo_active ?? true;

  // Split title if it contains multiple words for pink highlight
  const renderTitle = (title: string) => {
    const parts = title.split(' ');
    if (parts.length > 1) {
      const first = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
      const second = parts.slice(Math.ceil(parts.length / 2)).join(' ');
      return (
        <>
          {first} <span className="text-pink-600">{second}</span>
        </>
      );
    }
    return <span className="text-pink-600">{title}</span>;
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-r from-[#ffeef4]/80 via-[#fff8fa] to-[#fff3f6] p-6 sm:p-8 md:p-10 shadow-xs">
        
        {/* Banner Image Background in Customer Hero Card */}
        {settings.banner_image_path && (
          <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none">
            <img
              src={settings.banner_image_path}
              alt="Promo Banner Background"
              className="w-full h-full object-cover object-center opacity-75 transition-opacity duration-300"
            />
            {/* Responsive Gradient Mask: atas-ke-bawah di layar HP, kiri-ke-kanan di layar desktop */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#ffeef4]/95 via-[#ffeef4]/80 to-[#ffeef4]/30 lg:bg-gradient-to-r lg:from-[#ffeef4]/95 lg:via-[#ffeef4]/80 lg:to-[#ffeef4]/30" />
          </div>
        )}
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text & Promo / Normal Details */}
          <div className="flex-1 text-center lg:text-left space-y-3.5 max-w-2xl">
            
            {/* Promo or Default Badge */}
            {isPromo ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-pink-200 text-pink-700 text-xs font-bold shadow-2xs">
                <span>{settings.promo_tag || 'PROMO SPESIAL BULAN INI'}</span>
                <span className="bg-rose-500 text-white text-[10px] uppercase px-2 py-0.5 rounded-full font-extrabold tracking-wider">
                  {settings.promo_badge || 'LIMITED STOCK'}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-pink-200 text-pink-700 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span className="tracking-wide uppercase">TOP UP ROBUX RESMI &amp; TERPERCAYA</span>
              </div>
            )}

            {/* Main Title */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 font-sans">
                {isPromo ? (
                  renderTitle(settings.promo_title || 'ROBUX BULAN INI')
                ) : (
                  <>
                    TOP UP ROBUX <span className="text-pink-600">CEPAT &amp; AMAN</span>
                  </>
                )}
              </h1>
              <p className="text-zinc-500 text-xs sm:text-sm md:text-base font-medium">
                {isPromo
                  ? settings.promo_subtitle || 'Top Up Robux Instant, Cepat, Legal, Aman & Bergaransi 100% Uang Kembali!'
                  : 'Layanan top up Robux proses kilat, 100% legal, bergaransi uang kembali, dan harga terbaik untuk akun Roblox kamu.'}
              </p>
            </div>

            {/* Price Typography (Only if Promo is active) */}
            {isPromo && (
              <div className="space-y-0.5 pt-1">
                <div className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
                  {formatRobux(settings.promo_robux_amount || 2200)}{' '}
                  <span className="text-xs sm:text-sm font-bold text-zinc-500">ROBUX</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  {settings.promo_original_label && (
                    <span className="text-sm sm:text-base text-zinc-400 line-through font-semibold">
                      {settings.promo_original_label}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-black text-pink-600">
                    {formatRupiah(settings.promo_discount_price || 45000)}
                  </span>
                </div>
              </div>
            )}

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

          {/* Right Side: Countdown Timer (If Promo) OR Trust Feature Card (If No Promo) */}
          {isPromo ? (
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
                    src={settings.logo_image_path || '/images/logo.jpeg'}
                    alt="Store Mascot"
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
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm w-full lg:w-80 space-y-4">
              <div className="flex items-center gap-3 border-b border-pink-50 pb-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-pink-300 shrink-0">
                  <Image
                    src={settings.logo_image_path || '/images/logo.jpeg'}
                    alt="Store Logo"
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-900">{settings.store_name || 'BloxyLucy'}</h4>
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Layanan Buka 24/7
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-zinc-700 font-semibold">
                  <div className="w-5 h-5 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  </div>
                  <span>Proses Cepat 1-5 Menit</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 font-semibold">
                  <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span>100% Robux Legal &amp; Aman</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 font-semibold">
                  <div className="w-5 h-5 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <span>Garansi Uang Kembali 100%</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
