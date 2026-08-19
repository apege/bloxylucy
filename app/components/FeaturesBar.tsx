'use client';

import React from 'react';
import { Zap, ShieldCheck, User, Headphones, Award } from 'lucide-react';

export default function FeaturesBar() {
  const features = [
    {
      icon: Zap,
      title: 'Proses Cepat',
      desc: '5 - 10 Menit Beres',
      iconColor: 'text-pink-500',
    },
    {
      icon: ShieldCheck,
      title: 'Pembayaran Aman',
      desc: 'Legal & Terpercaya',
      iconColor: 'text-pink-500',
    },
    {
      icon: User,
      title: 'Hanya Username',
      desc: 'Tanpa Password Akun',
      iconColor: 'text-pink-500',
    },
    {
      icon: Headphones,
      title: 'Fast Respon 24/7',
      desc: 'Admin Ramah & Sigap',
      iconColor: 'text-pink-500',
    },
    {
      icon: Award,
      title: 'Garansi 100%',
      desc: 'Uang Kembali Jika Gagal',
      iconColor: 'text-pink-500',
    },
  ];

  // Duplicate for seamless infinite marquee loop on mobile
  const marqueeFeatures = [...features, ...features];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="bg-white rounded-3xl border border-pink-100 shadow-xs p-3 sm:p-5 overflow-hidden">
        
        {/* 1. Mobile & Tablet: Auto-Scrolling Marquee (Right to Left) */}
        <div className="lg:hidden w-full overflow-hidden relative">
          {/* Subtle edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee gap-3 py-1">
            {marqueeFeatures.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-pink-50/30 border border-pink-100/70 shrink-0 min-w-[205px]"
                >
                  <div className={`p-2 rounded-xl bg-pink-50 border border-pink-100 ${item.iconColor} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left whitespace-nowrap">
                    <h4 className="text-xs font-bold text-zinc-900">{item.title}</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Desktop: Static 5-Column Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-pink-50/40 transition-colors"
              >
                <div className={`p-2 rounded-xl bg-pink-50 border border-pink-100 ${item.iconColor} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
