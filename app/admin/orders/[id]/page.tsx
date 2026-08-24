'use client';

import React, { useEffect, useState, use } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Receipt,
  User,
  FileEdit,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Eye,
  X,
  Download
} from 'lucide-react';
import { Order, OrderStatus, isWhatsAppOrder } from '@/lib/admin-types';
import { getOrderById, updateOrderStatus, updateAdminNotes } from '@/lib/supabase-service';
import { calculateProofRetention } from '@/lib/storage-retention';

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showProofModal, setShowProofModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      try {
        const data = await getOrderById(orderId);
        if (data) {
          setOrder(data);
          setAdminNotes(data.admin_notes || '');

          // Auto-fetch Roblox User ID from Roblox API if missing
          if (!data.roblox_user_id && data.roblox_username) {
            fetch(`/api/roblox-check?username=${encodeURIComponent(data.roblox_username)}`)
              .then((res) => res.json())
              .then((roblox) => {
                if (roblox.success && roblox.userId) {
                  setOrder((prev) => prev ? { ...prev, roblox_user_id: String(roblox.userId) } : null);
                }
              })
              .catch(console.warn);
          }
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    showToast(`Berhasil menyalin ${field}!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNotes = async () => {
    if (!order) return;
    setIsSavingNotes(true);
    try {
      await updateAdminNotes(order.id, adminNotes);
      setOrder({ ...order, admin_notes: adminNotes });
      showToast('Catatan admin berhasil disimpan!');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan catatan.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, order_status: newStatus });
      showToast(`Status pesanan diperbarui menjadi: ${getStatusLabel(newStatus)}`);
    } catch (err) {
      console.error(err);
      showToast('Gagal mengubah status.');
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

  const formatDateWIB = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
      };
      return `${new Intl.DateTimeFormat('id-ID', options).format(d)} WIB`;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'awaiting_activation':
        return {
          label: 'Menunggu Aktivasi ID',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'pending':
        return {
          label: 'Menunggu Pembayaran',
          bg: 'bg-amber-50 text-amber-600 border-amber-200',
        };
      case 'processing':
        return {
          label: 'Sedang Diproses',
          bg: 'bg-blue-50 text-blue-600 border-blue-200',
        };
      case 'completed':
        return {
          label: 'Selesai',
          bg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        };
      case 'cancelled':
        return {
          label: 'Dibatalkan',
          bg: 'bg-rose-50 text-rose-600 border-rose-200',
        };
      default:
        return {
          label: status,
          bg: 'bg-zinc-100 text-zinc-600 border-zinc-200',
        };
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    return getStatusBadge(status).label;
  };

  const handleContactWhatsApp = () => {
    if (!order) return;
    const phone = order.customer_phone ? order.customer_phone.replace(/\D/g, '').replace(/^0/, '62') : '';
    if (!phone) {
      alert('Pelanggan ini belum mencantumkan nomor WhatsApp.');
      return;
    }
    const message = encodeURIComponent(
      `Halo Kak @${order.roblox_username}!\n\nKami dari Admin BloxyLucy mengenai pesanan Robux Kakak (*#${order.order_code}*).\nPaket: ${formatRobux(order.robux)} Robux\nStatus saat ini: *${getStatusLabel(order.order_status)}*\n\nAda yang bisa kami bantu?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleShareReviewLink = () => {
    if (!order) return;
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

  const handleDownloadProof = async () => {
    if (!order?.payment_proof_path) return;
    try {
      const response = await fetch(order.payment_proof_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bukti-transfer-${order.order_code}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(order.payment_proof_path, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-pink-600">Memuat detail order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <h2 className="text-lg font-black text-zinc-800">Order Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-500">
          Order dengan kode atau ID &quot;{orderId}&quot; tidak dapat ditemukan di sistem.
        </p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-xs hover:bg-pink-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Order</span>
        </Link>
      </div>
    );
  }

  const badge = getStatusBadge(order.order_status);
  const totalPayment = order.total_payment || order.price + (order.activation_fee || 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12 animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-zinc-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Back Link */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-pink-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke Order Masuk</span>
        </Link>
      </div>

      {/* Order Title & Status Header */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-pink-600 tracking-tight flex items-center gap-1">
            <span>ORDER</span>
            <span>#{order.order_code}</span>
          </h1>

          <span
            className={`px-3.5 py-1 rounded-full text-xs font-black border ${badge.bg} shadow-2xs`}
          >
            {badge.label}
          </span>
        </div>

        <p className="text-xs font-medium text-zinc-500">
          {formatDateWIB(order.created_at)}
        </p>
      </div>

      {/* Quick Action Status Workflow Bar */}
      <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1">
          Ubah Status Cepat:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {order.order_status !== 'processing' && (
            <button
              type="button"
              onClick={() => handleStatusChange('processing')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Proses Pesanan
            </button>
          )}

          {order.order_status !== 'completed' && (
            <button
              type="button"
              onClick={() => handleStatusChange('completed')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Selesaikan Order
            </button>
          )}

          {order.order_status === 'completed' && (
            <button
              type="button"
              onClick={handleShareReviewLink}
              className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Kirim Link Token Review</span>
            </button>
          )}

          {order.order_status !== 'cancelled' && (
            <button
              type="button"
              onClick={() => handleStatusChange('cancelled')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Batalkan
            </button>
          )}

          <button
            type="button"
            onClick={handleContactWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-[#25D366]/10 text-[#20bd5a] hover:bg-[#25D366]/20 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-[#20bd5a]" />
            <span>Chat Pelanggan</span>
          </button>
        </div>
      </div>

      {/* CARD 1: DETAIL PESANAN */}
      <div className="rounded-3xl border border-pink-200/80 bg-white shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-pink-100">
          <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <Receipt className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-wide text-zinc-900 uppercase">
            DETAIL PESANAN
          </h2>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">
            <span>Produk</span>
            <span>Harga</span>
          </div>

          {/* Product row */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-center shadow-2xs p-1">
                <Image
                  src="/images/robux.webp"
                  alt="Robux"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="text-sm sm:text-base font-black text-zinc-900">
                {formatRobux(order.robux)} Robux
              </span>
            </div>
            <span className="text-sm sm:text-base font-extrabold text-zinc-900">
              {formatRupiah(order.price)}
            </span>
          </div>

          {/* Biaya Aktivasi row */}
          {(order.activation_fee ?? 0) > 0 && (
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-600 py-1">
              <span>Biaya Aktivasi ID Roblox</span>
              <span className="font-bold text-zinc-800">
                {formatRupiah(order.activation_fee || 0)}
              </span>
            </div>
          )}

          {/* Payment Method row */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-zinc-600 py-1">
            <span>Metode Pembayaran</span>
            {(() => {
              const isWa = isWhatsAppOrder(order);
              return (
                <span
                  className={`font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg border ${
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

          {/* Divider */}
          <div className="border-t border-pink-100 my-2 pt-2"></div>

          {/* TOTAL PEMBAYARAN */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs sm:text-sm font-black text-pink-600 uppercase tracking-wide">
              TOTAL PEMBAYARAN
            </span>
            <span className="text-lg sm:text-xl font-black text-pink-600 tracking-tight">
              {formatRupiah(totalPayment)}
            </span>
          </div>

          {/* Payment Proof Preview Button & Retention Info */}
          {(() => {
            const retention = calculateProofRetention(order);
            if (order.payment_proof_path) {
              return (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowProofModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Bukti Transfer Pelanggan</span>
                  </button>

                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600 flex items-center justify-between">
                    <span className="font-semibold">Retensi Storage:</span>
                    {retention.isExpiringSoon ? (
                      <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        ⚠️ Kedaluwarsa dlm {retention.daysRemaining} hari
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Tersimpan ({retention.daysRemaining} hari lagi)
                      </span>
                    )}
                  </div>
                </div>
              );
            }
            return (
              <div className="pt-2">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-center text-xs text-zinc-400 font-medium">
                  Foto bukti transfer telah dibersihkan oleh sistem retensi atau tidak diunggah.
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* CARD 2: INFORMASI PELANGGAN */}
      <div className="rounded-3xl border border-pink-200/80 bg-white shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-pink-100">
          <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <User className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-wide text-zinc-900 uppercase">
            INFORMASI PELANGGAN
          </h2>
        </div>

        <div className="space-y-3.5 pt-1 text-xs sm:text-sm">
          {/* Username */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-500">Username</span>
            <div className="flex items-center gap-2">
              <span className="font-black text-pink-600">
                @{order.roblox_username}
              </span>
              <a
                href={`https://www.roblox.com/search/users?keyword=${encodeURIComponent(order.roblox_username)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Cek Profil Roblox"
                className="text-zinc-400 hover:text-pink-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* User ID Roblox */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-500">User ID Roblox</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-800 font-mono">
                {order.roblox_user_id || '-'}
              </span>
              {order.roblox_user_id && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.roblox_user_id!, 'User ID')}
                  className="p-1 rounded-md text-zinc-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                  title="Salin User ID"
                >
                  {copiedField === 'User ID' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Nomor WhatsApp */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-500">No. WhatsApp</span>
            {order.customer_phone ? (
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Kak @${order.roblox_username}!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 hover:underline bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                  <span>+{order.customer_phone.replace(/^0/, '62')}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(order.customer_phone!, 'No. WhatsApp')}
                  className="p-1 rounded-md text-zinc-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                  title="Salin Nomor WhatsApp"
                >
                  {copiedField === 'No. WhatsApp' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <span className="font-medium text-zinc-400">-</span>
            )}
          </div>

          {/* Catatan Pelanggan */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-zinc-500">Catatan Pelanggan</span>
            <span className="font-medium text-zinc-700">
              {order.customer_notes || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* CARD 3: CATATAN ADMIN */}
      <div className="rounded-3xl border border-pink-200/80 bg-white shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-pink-100">
          <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
            <FileEdit className="w-4 h-4 stroke-[2.5]" />
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-wide text-zinc-900 uppercase">
            CATATAN ADMIN
          </h2>
        </div>

        <div className="space-y-3 pt-1">
          <textarea
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Tulis catatan untuk order ini (hanya admin)..."
            className="w-full p-3.5 rounded-2xl border border-pink-200/80 bg-[#fffafc] focus:bg-white text-xs sm:text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 transition-all resize-none shadow-2xs"
          />

          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={isSavingNotes}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs sm:text-sm font-black shadow-md shadow-pink-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
          >
            {isSavingNotes ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </div>
      </div>

      {/* Bukti Transfer Modal Rendered to Portal (Matches Pricelist Modal Style) */}
      {showProofModal && order.payment_proof_path && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProofModal(false);
          }}
          className="fixed inset-0 z-[99999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-pink-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100/80">
              <h3 className="text-base font-black text-zinc-900">
                Bukti Transfer Pelanggan
              </h3>
              <button
                type="button"
                onClick={() => setShowProofModal(false)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-pink-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full rounded-2xl border border-pink-100/80 bg-zinc-50 overflow-hidden flex items-center justify-center p-2">
              <img
                src={order.payment_proof_path}
                alt="Bukti Transfer"
                className="max-h-[55vh] max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-pink-100/80">
              <p className="text-xs font-bold text-zinc-500">
                #{order.order_code} • @{order.roblox_username}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleDownloadProof}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
