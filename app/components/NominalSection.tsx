'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ROBUX_PRICELIST, RobuxItem } from './data';
import { Zap, Check, Plus, Flame, Crown } from 'lucide-react';

interface NominalSectionProps {
  selectedItem: RobuxItem | null;
  onSelectItem: (item: RobuxItem) => void;
  onAddToCart: (item: RobuxItem) => void;
}

export default function NominalSection({
  selectedItem,
  onSelectItem,
  onAddToCart,
}: NominalSectionProps) {
  const [items, setItems] = useState<RobuxItem[]>(ROBUX_PRICELIST);
  const [activeFilter, setActiveFilter] = useState<'all' | 'promo' | 'popular' | 'sultan'>('all');

  React.useEffect(() => {
    fetch('/api/products?active_only=true')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: RobuxItem[] = json.data.map((p: any) => ({
            id: `rbx-${p.id}`,
            amount: p.robux,
            price: p.price,
            originalPrice: p.original_price,
            isPromo: Boolean(p.is_promo),
            isPopular: Boolean(p.is_popular),
            isBestValue: Boolean(p.is_best_value),
          }));
          setItems(mapped);
        }
      })
      .catch((err) => console.warn('Fetch products notice:', err));
  }, []);

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'promo') return item.isPromo || item.price <= 50000;
    if (activeFilter === 'popular') return item.isPopular;
    if (activeFilter === 'sultan') return item.amount >= 10500;
    return true;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num).replace('Rp', 'Rp ');
  };

  const formatRobux = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <section id="pricelist" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="overflow-hidden rounded-3xl border border-pink-200 bg-white shadow-xs">
        
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-pink-50/80 to-white border-b border-pink-100 px-5 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-500 text-white font-extrabold text-base shadow-sm">
              2
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-wide flex items-center gap-2">
                Pilih Robux
                <span className="text-xs font-normal text-pink-600 hidden sm:inline">(Pricelist Resmi BloxyLucy)</span>
              </h2>
              <p className="text-[11px] text-zinc-500">
                Pilih paket nominal Robux yang ingin Anda beli
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              Semua ({ROBUX_PRICELIST.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('popular')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                activeFilter === 'popular'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Populer
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('promo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                activeFilter === 'promo'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              Promo
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('sultan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                activeFilter === 'sultan'
                  ? 'bg-pink-500 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              Paket Sultan
            </button>
          </div>
        </div>

        {/* Cards Grid: 2 Columns on Mobile, 3 on Tablet, 4 on Desktop */}
        <div className="p-3.5 sm:p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden group ${
                    isSelected
                      ? 'border-pink-500 bg-gradient-to-b from-pink-50/80 to-white shadow-md ring-2 ring-pink-400/50 translate-y-[-2px]'
                      : 'border-pink-200/80 bg-white hover:border-pink-300 hover:shadow-xs'
                  }`}
                >
                  {/* Top Badges & Add Cart Button */}
                  <div className="p-3 sm:p-4 pb-2">
                    <div className="flex items-start justify-between gap-1.5 mb-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {item.isPopular && (
                          <span className="bg-orange-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                            POPULER
                          </span>
                        )}
                        {item.isBestValue && (
                          <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                            SULTAN
                          </span>
                        )}
                        {item.isPromo && (
                          <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                            PROMO
                          </span>
                        )}
                      </div>

                      {/* Cart Add Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(item);
                        }}
                        title="Tambah ke Keranjang"
                        className="p-1 sm:p-1.5 rounded-full bg-pink-50 hover:bg-pink-600 border border-pink-200 text-pink-600 hover:text-white transition-colors cursor-pointer shrink-0 ml-auto"
                      >
                        <Plus className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Robux Amount & Robux Hexagon Icon */}
                    <div className="flex items-center gap-2 sm:gap-3 my-1">
                      <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border p-1 sm:p-1.5 transition-transform duration-200 group-hover:scale-105 ${
                        isSelected
                          ? 'bg-pink-100 border-pink-300 shadow-xs'
                          : 'bg-pink-50/80 border-pink-200/70'
                      }`}>
                        <Image
                          src="/images/robux.webp"
                          alt="Robux"
                          width={28}
                          height={28}
                          className="object-contain w-full h-full drop-shadow-xs"
                        />
                      </div>

                      <div className="text-left overflow-hidden">
                        <h3 className="text-xs sm:text-base font-black text-zinc-900 tracking-tight leading-tight truncate">
                          {formatRobux(item.amount)} <span className="text-[10px] sm:text-xs font-bold text-pink-600">Robux</span>
                        </h3>
                        <p className={`text-xs sm:text-base font-black mt-0.5 ${
                          isSelected ? 'text-pink-600' : 'text-rose-600'
                        }`}>
                          {formatRupiah(item.price)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer on Card: Delivery Badge */}
                  <div className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 border-t flex items-center justify-between text-[10px] sm:text-xs ${
                    isSelected ? 'bg-pink-100/70 border-pink-200' : 'bg-zinc-50 border-zinc-100'
                  }`}>
                    <div className="flex items-center gap-1 font-bold text-emerald-600">
                      <Zap className="w-3 h-3 fill-emerald-600 shrink-0" />
                      <span className="truncate">INSTAN</span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-zinc-500 shrink-0">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-pink-700 font-extrabold">
                          <Check className="w-3 h-3 text-pink-600 stroke-[3]" /> Dipilih
                        </span>
                      ) : (
                        <span>Pilih</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
