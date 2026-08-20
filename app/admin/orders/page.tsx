'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarCheck2,
  MessageCircle
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/admin-types';
import { getOrders, updateOrderStatus } from '@/lib/supabase-service';
import StorageRetentionBanner from '../components/StorageRetentionBanner';
import { calculateProofRetention } from '@/lib/storage-retention';

function OrdersContent() {
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'pending';
  const queryParam = searchParams.get('q') || '';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParam);

  const fetchOrdersList = async () => {
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
    fetchOrdersList();
  }, [currentStatus]);

  const handleQuickStatusChange = async (
    orderId: number | string,
    newStatus: OrderStatus,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.order_code === String(orderId)
            ? { ...o, order_status: newStatus }
            : o
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleShareReviewLink = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const reviewUrl = `${origin}/?token=${order.order_code}#testimoni`;

    const phone = order.customer_phone ? order.customer_phone.replace(/[^0-9]/g, '') : '';
    const targetPhone = phone.startsWith('0') ? `62${phone.slice(1)}` : phone;

    const message = encodeURIComponent(
      `Halo kak @${order.roblox_username}!\n\nTerima kasih sudah top up ${new Intl.NumberFormat('id-ID').format(order.robux)} Robux di BloxyLucy! Pesananmu dengan kode #${order.order_code} telah SELESAI diproses.\n\nYuk berikan ulasan pengalaman belanja kamu melalui link token terverifikasi di bawah ini:\n${reviewUrl}\n\nDitunggu orderan berikutnya yaa!`
    );

    if (targetPhone) {
      window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
    } else {
      navigator.clipboard.writeText(reviewUrl);
      alert(`Link review untuk @${order.roblox_username} berhasil disalin ke clipboard:\n${reviewUrl}`);
    }
  };

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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_activation':
        return { label: 'Menunggu Aktivasi', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'pending':
        return { label: 'Menunggu Bayar', bg: 'bg-amber-50 text-amber-600 border-amber-200' };
      case 'processing':
        return { label: 'Diproses', bg: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'completed':
        return { label: 'Selesai', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'cancelled':
        return { label: 'Dibatalkan', bg: 'bg-rose-50 text-rose-600 border-rose-200' };
      default:
        return { label: status, bg: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
    }
  };

  // Dedicated page info based on route / status
  const getPageInfo = () => {
    switch (currentStatus) {
      case 'processing':
        return {
          title: 'Order Diproses',
          subtitle: 'Daftar pesanan yang sedang diproses pengiriman Robux ke akun pembeli',
          emptyMessage: 'Tidak ada order yang sedang diproses saat ini.',
        };
      case 'completed':
        return {
          title: 'Order Selesai',
          subtitle: 'Riwayat seluruh pesanan Robux yang telah berhasil diselesaikan',
          emptyMessage: 'Belum ada pesanan yang selesai.',
        };
      case 'cancelled':
        return {
          title: 'Order Dibatalkan',
          subtitle: 'Daftar pesanan yang telah dibatalkan oleh pembeli atau admin',
          emptyMessage: 'Tidak ada pesanan yang dibatalkan.',
        };
      case 'pending':
      default:
        return {
          title: 'Order Masuk',
          subtitle: 'Kelola dan proses seluruh pesanan Robux baru yang masuk ke BloxyLucy',
          emptyMessage: 'Tidak ada order masuk baru saat ini.',
        };
    }
  };

  const pageInfo = getPageInfo();

  // Strict category filter
  const filteredOrders = orders.filter((o) => {
    // Status Category Filter
    if (currentStatus === 'processing') {
      if (o.order_status !== 'processing') return false;
    } else if (currentStatus === 'completed') {
      if (o.order_status !== 'completed') return false;
    } else if (currentStatus === 'cancelled') {
      if (o.order_status !== 'cancelled') return false;
    } else {
      // 'pending' or default -> ONLY incoming orders
      if (o.order_status !== 'pending' && o.order_status !== 'awaiting_activation') return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = o.order_code.toLowerCase().includes(q);
      const matchUser = o.roblox_username.toLowerCase().includes(q);
      const matchEmail = (o.customer_email || '').toLowerCase().includes(q);
      const matchPhone = (o.customer_phone || '').includes(q);
      return matchCode || matchUser || matchEmail || matchPhone;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Storage Retention & H-7 ZIP Warning Banner */}
      <StorageRetentionBanner orders={orders} onCleanupSuccess={fetchOrdersList} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            {pageInfo.subtitle}
          </p>
        </div>

        <button
          onClick={fetchOrdersList}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 text-xs font-bold shadow-2xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Orders Table & Cards */}
      <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 border-b border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter order atau username..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-pink-200/70 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <span className="text-xs font-bold text-zinc-400">
            Menampilkan {filteredOrders.length} pesanan
          </span>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-500">Memuat data pesanan...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto text-xl">
              📦
            </div>
            <p className="text-sm font-bold text-zinc-700">{pageInfo.emptyMessage}</p>
            {searchQuery && (
              <p className="text-xs text-zinc-400">Tidak ada pesanan yang cocok dengan &quot;{searchQuery}&quot;</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-pink-100/60">
            {filteredOrders.map((order) => {
              const statusCfg = getStatusBadge(order.order_status);
              const total = order.total_payment || order.price + (order.activation_fee || 0);
              const proofRetention = calculateProofRetention(order);

              return (
                <div
                  key={order.id}
                  className="p-4 sm:p-5 hover:bg-pink-50/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Left: Code, Customer, Date, Proof Retention */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/orders/${order.order_code}`}
                        className="text-sm sm:text-base font-black text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1"
                      >
                        <span>#{order.order_code}</span>
                      </Link>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusCfg.bg}`}>
                        {statusCfg.label}
                      </span>
                      {proofRetention.hasProof && proofRetention.isExpiringSoon && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                          ⚠️ Bukti H-{proofRetention.daysRemaining}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 flex-wrap">
                      <span className="text-zinc-900 font-extrabold">@{order.roblox_username}</span>
                      <span className="text-zinc-300">•</span>
                      <span>{formatDate(order.created_at)}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="uppercase text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.2 rounded">
                        {order.payment_method}
                      </span>
                      {proofRetention.hasProof ? (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          📷 Bukti ({proofRetention.daysRemaining} hari)
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-zinc-400 italic">
                          (Tanpa foto)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Product & Total */}
                  <div className="flex items-center gap-4">
                    <div className="text-left md:text-right">
                      <div className="text-xs font-black text-zinc-900 flex items-center md:justify-end gap-1.5">
                        <div className="relative w-4 h-4 shrink-0">
                          <Image
                            src="/images/robux.webp"
                            alt="Robux"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span>{formatRobux(order.robux)} Robux</span>
                      </div>
                      <div className="text-xs font-black text-pink-600">
                        {formatRupiah(total)}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {order.order_status === 'pending' || order.order_status === 'awaiting_activation' ? (
                      <button
                        onClick={(e) => handleQuickStatusChange(order.id, 'processing', e)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                        title="Tandai Sedang Diproses"
                      >
                        Proses
                      </button>
                    ) : null}

                    {order.order_status === 'processing' ? (
                      <button
                        onClick={(e) => handleQuickStatusChange(order.id, 'completed', e)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer"
                        title="Tandai Selesai"
                      >
                        Selesaikan
                      </button>
                    ) : null}
                    
                    {order.order_status === 'completed' && (
                      <button
                        onClick={(e) => handleShareReviewLink(order, e)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Kirim link review testimoni via WhatsApp / Salin Link"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Link Review</span>
                      </button>
                    )}

                    <Link
                      href={`/admin/orders/${order.order_code}`}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 text-white hover:bg-pink-600 text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                    >
                      <span>Detail</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-pink-600">Memuat data order...</p>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
