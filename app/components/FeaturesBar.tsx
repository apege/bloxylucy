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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="bg-white rounded-3xl border border-pink-100 shadow-xs p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                <div className="text-left overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 truncate">{item.title}</h4>
                  <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
