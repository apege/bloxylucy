'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  TrendingUp,
  RefreshCw,
  MessageCircle,
  QrCode,
  Globe,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Order, isWhatsAppOrder } from '@/lib/admin-types';
import { getOrders } from '@/lib/supabase-service';

function FinanceContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState<'all' | 'Website' | 'WhatsApp'>('all');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Only paid / completed orders are included in revenue
  const paidOrders = orders.filter(
    (o) => o.payment_status === 'paid' || o.order_status === 'completed'
  );

  const totalRevenue = paidOrders.reduce((acc, o) => acc + (o.total_payment || o.price), 0);
  const totalRobuxDelivered = paidOrders.reduce((acc, o) => acc + o.robux, 0);

  // Breakdown metrics: Website channel vs WhatsApp
  const waOrders = paidOrders.filter((o) => isWhatsAppOrder(o));
  const websiteOrders = paidOrders.filter((o) => !isWhatsAppOrder(o));

  const websiteRevenue = websiteOrders.reduce((acc, o) => acc + (o.total_payment || o.price), 0);
  const waRevenue = waOrders.reduce((acc, o) => acc + (o.total_payment || o.price), 0);

  const websitePercent = totalRevenue > 0 ? ((websiteRevenue / totalRevenue) * 100).toFixed(1) : '0.0';
  const waPercent = totalRevenue > 0 ? ((waRevenue / totalRevenue) * 100).toFixed(1) : '0.0';

  // Filtered transactions
  const filteredOrders = paidOrders.filter((o) => {
    const isWa = isWhatsAppOrder(o);
    const methodChannel = isWa ? 'WhatsApp' : 'Website';

    if (filterChannel !== 'all' && methodChannel !== filterChannel) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.order_code.toLowerCase().includes(q) ||
        o.roblox_username.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Riwayat Pembayaran
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Log mutasi kas masuk dan ringkasan pembayaran pesanan Robux yang berhasil
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 text-xs font-bold shadow-2xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Dana Masuk */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100/90 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
              Total Dana Masuk
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-pink-600">
            {formatRupiah(totalRevenue)}
          </div>
          <p className="text-[11px] font-medium text-zinc-500">
            Dari {paidOrders.length} transaksi pembayaran lunas
          </p>
        </div>

        {/* Total Robux Terjual */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100/90 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
              Total Robux Terjual
            </span>
            <div className="relative w-7 h-7">
              <Image
                src="/images/robux.webp"
                alt="Robux"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-500 flex items-center gap-1.5">
            <span>{formatRobux(totalRobuxDelivered)}</span>
            <span className="text-xs font-extrabold text-amber-600/70 uppercase">R$</span>
          </div>
          <p className="text-[11px] font-medium text-zinc-500">
            Robux terkirim ke akun pelanggan
          </p>
        </div>

        {/* Rata-rata Nilai Order (AOV) */}
        <div className="p-5 rounded-3xl bg-white border border-pink-100/90 shadow-xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider">
              Rata-Rata Order
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-xs">
              AOV
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-900">
            {paidOrders.length > 0
              ? formatRupiah(Math.round(totalRevenue / paidOrders.length))
              : 'Rp 0'}
          </div>
          <p className="text-[11px] font-medium text-emerald-600 font-semibold">
            Average Order Value per transaksi
          </p>
        </div>

      </div>

      {/* Omset per Metode Pembayaran (Matching Reference Image) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-xs sm:text-sm font-black text-zinc-900 uppercase tracking-tight">
            OMSET PER METODE PEMBAYARAN
          </h3>
          <p className="text-xs text-zinc-400 font-medium">
            Ringkasan total pemasukan berdasarkan metode pembayaran
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 1. Website Card */}
          <div className="p-5 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-pink-100/70 text-pink-600 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-zinc-900 tracking-wider uppercase">
                  WEBSITE
                </h4>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-pink-100/60 text-pink-600">
                {websitePercent}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="block text-[11px] font-bold text-zinc-400">Total Omset</span>
                <span className="text-base sm:text-lg font-black text-pink-600">
                  {formatRupiah(websiteRevenue)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-zinc-400">Transaksi</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-700">
                  <strong className="font-black text-zinc-900">{websiteOrders.length}</strong> transaksi
                </span>
              </div>
            </div>

            {/* Pink Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-pink-100/70 overflow-hidden">
              <div
                className="h-full bg-pink-600 rounded-full transition-all duration-500"
                style={{ width: `${websitePercent}%` }}
              ></div>
            </div>
          </div>

          {/* 2. WhatsApp Card */}
          <div className="p-5 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 fill-emerald-600" />
                </div>
                <h4 className="text-xs sm:text-sm font-black text-zinc-900 tracking-wider uppercase">
                  WHATSAPP
                </h4>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100/60 text-emerald-600">
                {waPercent}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <span className="block text-[11px] font-bold text-zinc-400">Total Omset</span>
                <span className="text-base sm:text-lg font-black text-pink-600">
                  {formatRupiah(waRevenue)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-zinc-400">Transaksi</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-700">
                  <strong className="font-black text-zinc-900">{waOrders.length}</strong> transaksi
                </span>
              </div>
            </div>

            {/* Emerald Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-emerald-100/70 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${waPercent}%` }}
              ></div>
            </div>
          </div>

        </div>
      </div>

      {/* Log Mutasi Pembayaran Masuk */}
      <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden space-y-0">
        
        {/* Card Header & Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-pink-100/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-zinc-900">
              Log Mutasi Pembayaran Masuk
            </h3>
            <p className="text-[11px] text-zinc-400 font-medium">
              Riwayat penerimaan pembayaran yang valid dan sudah lunas
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Channel Pills */}
            <button
              onClick={() => setFilterChannel('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterChannel === 'all'
                  ? 'bg-pink-500 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Semua ({paidOrders.length})
            </button>
            <button
              onClick={() => setFilterChannel('Website')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterChannel === 'Website'
                  ? 'bg-pink-500 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Website ({websiteOrders.length})
            </button>
            <button
              onClick={() => setFilterChannel('WhatsApp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterChannel === 'WhatsApp'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              WhatsApp ({waOrders.length})
            </button>
          </div>
        </div>

        {/* Search inside table */}
        <div className="p-3 bg-pink-50/20 border-b border-pink-100/60 px-4 sm:px-5">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kode order atau username..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-pink-200 bg-white text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>

        {/* Transaction Rows */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-500">Memuat log mutasi...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="text-sm font-bold text-zinc-700">Tidak ada log pembayaran ditemukan</p>
            <p className="text-xs text-zinc-400">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="divide-y divide-pink-100/60">
            {filteredOrders.map((order) => {
              const isWa = isWhatsAppOrder(order);
              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-pink-50/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-black text-zinc-900">
                        #{order.order_code}
                      </span>
                      <span className="text-xs font-bold text-pink-600">
                        @{order.roblox_username}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                        LUNAS
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                      <span
                        className={`font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          isWa
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-pink-50 text-pink-600 border border-pink-200'
                        }`}
                      >
                        {isWa ? 'WhatsApp' : 'Website'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1">
                    <div className="text-sm sm:text-base font-black text-emerald-600">
                      +{formatRupiah(order.total_payment || order.price)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                      <div className="relative w-3.5 h-3.5">
                        <Image
                          src="/images/robux.webp"
                          alt="Robux"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span>{formatRobux(order.robux)} Robux</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-pink-600">Memuat riwayat pembayaran...</p>
      </div>
    }>
      <FinanceContent />
    </Suspense>
  );
}
