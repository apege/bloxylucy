'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  RefreshCw,
  Zap,
  Sparkles,
  Users,
  CreditCard
} from 'lucide-react';
import { Order, DashboardStats, isWhatsAppOrder } from '@/lib/admin-types';
import { getOrders, computeDashboardStats } from '@/lib/supabase-service';
import StorageRetentionBanner from './components/StorageRetentionBanner';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrdersCount: 0,
    processingOrdersCount: 0,
    completedOrdersCount: 0,
    cancelledOrdersCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
      setStats(computeDashboardStats(fetchedOrders));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Storage Retention & H-7 ZIP Warning Banner */}
      <StorageRetentionBanner orders={orders} onCleanupSuccess={loadData} />

      {/* Top Banner / Welcome (Matching Reference Image 1) */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-pink-200/70 p-6 sm:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        
        {/* Soft background radial glow */}
        <div className="absolute -top-24 -right-12 w-96 h-96 rounded-full bg-pink-50/80 pointer-events-none -z-0 blur-2xl"></div>

        {/* Left side content */}
        <div className="relative z-10 space-y-5 flex-1 max-w-2xl">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-[11px] font-extrabold text-pink-600 shadow-2xs">
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span>BloxyLucy Admin Control</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span>Selamat Datang di Panel Admin!</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium leading-relaxed max-w-xl">
              Pantau transaksi top up Robux, proses aktivasi pesanan secara instan, dan kelola katalog produk toko dengan mudah.
            </p>
          </div>

          {/* 3 Mini Feature Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/70 border border-pink-100/60">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 shadow-2xs">
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-900 leading-tight">Transaksi Cepat</h4>
                <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Pantau top up Robux secara real-time.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/70 border border-pink-100/60">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Zap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-900 leading-tight">Aktivasi Instan</h4>
                <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Proses pesanan otomatis dan cepat.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50/70 border border-pink-100/60">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 shadow-2xs">
                <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-900 leading-tight">Kelola Katalog</h4>
                <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">Atur produk dan stok dengan mudah.</p>
              </div>
            </div>

          </div>

        </div>

        {/* Right side button */}
        <div className="relative z-10 flex items-center shrink-0 self-start sm:self-center">
          {/* Button: Kelola Order */}
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Kelola Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Omset */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Total Omset
            </span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-zinc-900 tracking-tight">
            {formatRupiah(stats.totalRevenue)}
          </div>
          <span className="text-[11px] font-bold text-emerald-600 block">
            ↑ Transaksi sukses
          </span>
        </div>

        {/* Order Masuk (Pending) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Order Masuk
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-600 tracking-tight">
            {stats.pendingOrdersCount}
          </div>
          <Link
            href="/admin/orders?status=pending"
            className="text-[11px] font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Perlu diproses</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Order Diproses */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Sedang Diproses
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-blue-600 tracking-tight">
            {stats.processingOrdersCount}
          </div>
          <Link
            href="/admin/orders?status=processing"
            className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
          >
            <span>Dalam antrean gamepass</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Order Selesai */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-pink-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
              Order Selesai
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-600 tracking-tight">
            {stats.completedOrdersCount}
          </div>
          <span className="text-[11px] font-bold text-zinc-400 block">
            Dari {stats.totalOrders} total order
          </span>
        </div>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div>
            <h2 className="text-sm sm:text-base font-black text-zinc-900">
              Pesanan Terbaru
            </h2>
            <p className="text-[11px] text-zinc-400">
              5 transaksi terakhir yang masuk ke sistem
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-xs font-bold text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-zinc-100">
          {recentOrders.map((o) => (
            <div
              key={o.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-pink-50/30 px-2 rounded-2xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                  <Image
                    src="/images/robux.webp"
                    alt="Robux"
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <div>
                  <Link
                    href={`/admin/orders/${o.order_code}`}
                    className="text-xs sm:text-sm font-black text-pink-600 hover:underline"
                  >
                    #{o.order_code}
                  </Link>
                  <div className="text-[11px] text-zinc-500 font-semibold">
                    @{o.roblox_username} • {formatRobux(o.robux)} Robux
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs sm:text-sm font-black text-zinc-900">
                  {formatRupiah(o.total_payment || o.price)}
                </div>
                {(() => {
                  const isWa = isWhatsAppOrder(o);
                  return (
                    <span
                      className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                        isWa
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-pink-50 text-pink-600 border-pink-200'
                      }`}
                    >
                      {isWa ? 'WhatsApp' : 'Website'}
                    </span>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
