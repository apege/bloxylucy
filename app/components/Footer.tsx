'use client';

import React from 'react';
import Image from 'next/image';
import { 
  Globe, 
  MessageCircle, 
  ShieldCheck, 
  Heart, 
  ArrowUp
} from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full border-t border-pink-100 bg-white text-zinc-600 text-xs pt-12 pb-24 md:pb-16 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-pink-100">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-pink-300 shadow-xs">
                <Image
                  src="/images/logo.jpeg"
                  alt="BloxyLucy"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <span className="text-xl font-black text-pink-600">
                Bloxy<span className="text-zinc-900">Lucy</span>
              </span>
            </div>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Platform top up Roblox &amp; game instant terpercaya. Proses 5-10 menit kilat, 100% legal, aman hanya butuh username dengan garansi 200% uang kembali.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Trusted Store Indonesia</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-zinc-900">
              Menu Cepat
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#pricelist" className="text-zinc-600 hover:text-pink-600 transition-colors">
                  Pricelist Robux Promo
                </a>
              </li>
              <li>
                <a href="#cara-order" className="text-zinc-600 hover:text-pink-600 transition-colors">
                  Panduan &amp; Cara Order
                </a>
              </li>
              <li>
                <a href="#testimoni" className="text-zinc-600 hover:text-pink-600 transition-colors">
                  Ulasan &amp; Testimoni Member
                </a>
              </li>
            </ul>
          </div>

          {/* Jam Operasional */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-zinc-900">Jam Layanan &amp; Support</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Website buka <strong>24 Jam Nonstop</strong> (Transaksi Otomatis).<br />
              Customer Service Admin: Setiap Hari (08:00 - 23:00 WIB).
            </p>
            <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-200 text-[11px] text-pink-700 font-medium">
              🌸 Dapatkan bonus Robux ekstra di setiap event bulanan BloxyLucy!
            </div>
          </div>

          {/* Socials & Contacts */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-zinc-900">Hubungi Kami</h4>
            <div className="space-y-2">
              <a
                href="https://instagram.com/bloxylucy.id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-pink-50/50 hover:bg-pink-100/60 border border-pink-200 text-pink-700 transition-all text-xs"
              >
                <svg className="w-4 h-4 fill-pink-600" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>@bloxylucy.id</span>
              </a>

              <a
                href="https://wa.me/6287816959979"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-all text-xs"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: +62 878-1695-9979</span>
              </a>

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
                <Globe className="w-4 h-4 text-sky-600" />
                <span>www.bloxylucy.my.id</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-zinc-500 flex items-center justify-center sm:justify-start gap-1">
            © 2026 BloxyLucy. All rights reserved. Made with{' '}
            <Heart className="w-3 h-3 fill-rose-500 text-rose-500 inline" /> for Indonesian Gamers.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-[11px] font-bold transition-all cursor-pointer"
          >
            <span>Kembali ke Atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
