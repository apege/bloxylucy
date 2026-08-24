'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Flame, ShieldCheck, Menu, X, MessageCircle } from 'lucide-react';
import { getStoreSettings, getCachedStoreSettings } from '@/lib/supabase-service';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
}

export default function Navbar({ cartCount, onOpenCart }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeName, setStoreName] = useState('BloxyLucy');
  const [logoPath, setLogoPath] = useState('/images/logo.jpeg');
  const [csPhone, setCsPhone] = useState('6285828378025');

  useEffect(() => {
    getStoreSettings().then((s) => {
      if (s?.store_name) setStoreName(s.store_name);
      if (s?.logo_image_path) setLogoPath(s.logo_image_path);
      if (s?.whatsapp_number) setCsPhone(s.whatsapp_number);
    }).catch(console.error);
  }, []);

    const renderBrandName = (name: string) => {
    if (name.toLowerCase().startsWith('bloxy')) {
      const prefix = name.slice(0, 5); // "Bloxy"
      const rest = name.slice(5);      // "Lucy"
      return (
        <>
          <span className="text-pink-600">{prefix}</span>
          <span className="text-zinc-900">{rest}</span>
        </>
      );
    }
    return <span className="text-pink-600">{name}</span>;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-100 bg-white/90 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
              <div className="relative w-11 h-11 md:w-13 md:h-13 rounded-full overflow-hidden border-2 border-pink-300 bg-pink-50 flex items-center justify-center shadow-sm">
                <Image
                  src={logoPath}
                  alt={storeName}
                  width={52}
                  height={52}
                  priority
                  className="object-cover w-full h-full scale-105"
                  unoptimized={logoPath.startsWith('http')}
                />
              </div>
            </div>
            
            <a href="#" className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl md:text-2xl font-black tracking-tight font-sans">
                  {renderBrandName(storeName)}
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline-block">
                Top Up Robux Resmi &amp; Legal
              </span>
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a
              href="#pricelist"
              className="text-zinc-600 hover:text-pink-600 transition-colors flex items-center gap-1.5 py-1"
            >
              <Flame className="w-4 h-4 text-pink-500" />
              Pricelist Robux
            </a>
            <a
              href="#cara-order"
              className="text-zinc-600 hover:text-pink-600 transition-colors py-1"
            >
              Cara Order
            </a>
            <a
              href="#testimoni"
              className="text-zinc-600 hover:text-pink-600 transition-colors flex items-center gap-1.5 py-1"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Testimoni
            </a>
          </nav>

          {/* Actions: WhatsApp CS & Cart */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${csPhone}?text=Halo%20Admin%20${encodeURIComponent(storeName)},%20saya%20mau%20tanya%20top%20up%20Robux`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-all duration-200 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Hubungi CS</span>
            </a>

            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 transition-all duration-200 active:scale-95 shadow-sm group"
              title="Lihat Keranjang / Pesanan"
            >
              <ShoppingCart className="w-5 h-5 text-pink-600 group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white px-4 pt-3 pb-5 space-y-2.5 shadow-lg">
          <a
            href="#pricelist"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-700 hover:bg-pink-50 hover:text-pink-600 text-sm font-semibold"
          >
            Pricelist Robux
          </a>
          <a
            href="#cara-order"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-700 hover:bg-pink-50 hover:text-pink-600 text-sm font-semibold"
          >
            Cara Order
          </a>
          <a
            href="#testimoni"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-zinc-700 hover:bg-pink-50 hover:text-pink-600 text-sm font-semibold"
          >
            Testimoni Member
          </a>
          <a
            href={`https://wa.me/${csPhone}?text=Halo%20Admin%20${encodeURIComponent(storeName)},%20saya%20mau%20tanya%20top%20up%20Robux`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold mt-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat WhatsApp Admin</span>
          </a>
        </div>
      )}
    </header>
  );
}
