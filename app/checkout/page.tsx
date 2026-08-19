'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Check, 
  CheckCircle2,
  UploadCloud, 
  MessageCircle, 
  ShieldCheck, 
  FileCheck, 
  QrCode, 
  ArrowLeft,
  Zap,
  FileText,
  Copy
} from 'lucide-react';
import SakuraFalling from '../components/SakuraFalling';
import { compressImageToWebP, CompressionResult } from '../components/imageCompressor';
import { getStoreSettings, submitCheckout } from '@/lib/supabase-service';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'BloxyGamer';
  const initialUserId = searchParams.get('userId') || '';
  const amount = parseInt(searchParams.get('amount') || '2200', 10);
  const price = parseInt(searchParams.get('price') || '45000', 10);

  const [verifiedUserId, setVerifiedUserId] = useState<string>(initialUserId);
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [qrisImage, setQrisImage] = useState('/images/qris.webp');
  const [storeTitle, setStoreTitle] = useState('BLOXYLUCY OFFICIAL');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedOrderCode, setSubmittedOrderCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getStoreSettings().then((s) => {
      if (s?.qris_image_path) setQrisImage(s.qris_image_path);
      if (s?.store_name) setStoreTitle(s.store_name.toUpperCase());
    }).catch(console.error);

    // Auto-fetch Roblox User ID if not provided in searchParams
    if (!initialUserId && username && username !== 'BloxyGamer') {
      fetch(`/api/roblox-check?username=${encodeURIComponent(username.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.userId) {
            setVerifiedUserId(String(data.userId));
          }
        })
        .catch(console.warn);
    }
  }, [initialUserId, username]);

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

  const normalizePhone = (num: string) => {
    let cleaned = num.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    } else if (!cleaned.startsWith('62')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Silakan upload file gambar bukti transfer (JPG, PNG, WEBP).');
        return;
      }
      try {
        setIsCompressing(true);
        const result = await compressImageToWebP(file);
        setCompressedResult(result);
      } catch (err) {
        console.error('Compression error:', err);
        alert('Gagal mengompres gambar.');
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleConfirmWhatsApp = async () => {
    if (!customerPhone.trim()) {
      alert('Silakan isi Nomor WhatsApp Aktif Anda untuk konfirmasi pesanan.');
      return;
    }

    const formattedPhone = normalizePhone(customerPhone);
    if (formattedPhone.length < 10) {
      alert('Nomor WhatsApp tidak valid. Silakan masukkan nomor HP yang benar (contoh: 081234567890).');
      return;
    }

    setIsSubmitting(true);
    let orderCode = `BLX${Date.now().toString().slice(-6)}`;

    try {
      const res = await submitCheckout({
        roblox_username: username,
        roblox_user_id: verifiedUserId || initialUserId || undefined,
        amount,
        price,
        payment_method: 'Website',
        payment_proof_path: compressedResult ? compressedResult.dataUrl : null,
        customer_phone: formattedPhone,
        customer_notes: customerNotes.trim() || undefined,
      });

      if (res.order?.order_code) {
        orderCode = res.order.order_code;
      }
    } catch (err) {
      console.warn('Auto submit checkout notice:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Set submitted state to show the success confirmation card
    setSubmittedOrderCode(orderCode);
    setIsSubmitted(true);

    // Also open WhatsApp message in new tab
    const adminPhone = '6287816959979';
    const proofNote = compressedResult
      ? '\n*Status:* Bukti Transfer Sudah Diupload di Website'
      : '\n*Status:* Bukti Transfer Saya Lampirkan di Chat Ini';
    const notesLine = customerNotes.trim() ? `\n*Catatan:* ${customerNotes.trim()}` : '';

    const message = encodeURIComponent(
      `Halo Admin BloxyLucy!\n\nSaya ingin konfirmasi pembayaran Top Up Robux via QRIS:\n\n*Kode Order:* #${orderCode}\n*Username Roblox:* ${username}\n*No. WA Pembeli:* ${formattedPhone}${proofNote}${notesLine}\n*Pesanan:* ${formatRobux(amount)} Robux\n*Total Pembayaran:* ${formatRupiah(price)}\n\nMohon segera dicek dan diproses ke akun Roblox saya ya min. Terima kasih!`
    );

    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-10 bg-[#fff7fa] text-[#2d1822]">
      
      {/* Sakura falling effect */}
      <SakuraFalling />

      {/* Top Header Logo */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-zinc-700 hover:text-pink-600 hover:bg-pink-50 text-xs font-bold shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-pink-300">
            <Image src="/images/logo.jpeg" alt="BloxyLucy" width={28} height={28} className="object-cover" />
          </div>
          <span className="text-sm font-black text-pink-600">BloxyLucy</span>
        </div>
      </div>

      {/* STATE 1: Pesanan Berhasil Dikirim (Success Confirmation View) */}
      {isSubmitted ? (
        <div className="relative w-full max-w-md rounded-3xl border border-pink-200 bg-white shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-5 animate-fadeIn">
          
          {/* Animated Success Checkmark */}
          <div className="relative mx-auto w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Pesanan Berhasil Dikirim!
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-xs font-black text-pink-600 shadow-2xs">
              <span>Kode Pesanan: #{submittedOrderCode}</span>
            </div>
          </div>

          {/* Rincian Pesanan Box */}
          <div className="rounded-2xl bg-zinc-50 border border-pink-100/80 p-4 text-left space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
              <span className="font-semibold text-zinc-500">Akun Roblox:</span>
              <span className="font-black text-zinc-900">@{username}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
              <span className="font-semibold text-zinc-500">Nominal Robux:</span>
              <span className="font-black text-pink-600">{formatRobux(amount)} Robux</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60">
              <span className="font-semibold text-zinc-500">Total Pembayaran:</span>
              <span className="font-black text-zinc-900">{formatRupiah(price)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Status Bukti:</span>
              <span className="font-black text-emerald-600">
                {compressedResult ? '✓ Bukti Transfer Terkirim' : 'Via Chat WhatsApp'}
              </span>
            </div>
          </div>

          {/* Info Status Pesanan */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs space-y-1 text-left">
            <p className="font-black flex items-center gap-1.5 text-emerald-800">
              <span>🚀 Pesanan Sedang Diproses Admin</span>
            </p>
            <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
              Data pembayaran dan akun kamu sudah berhasil diterima. Admin BloxyLucy sedang memproses pengiriman Robux ke akun <strong>@{username}</strong>.
            </p>
            <p className="text-[10px] text-emerald-600 pt-1 font-semibold">
              ⏱️ Estimasi waktu pengiriman: 5 - 10 menit.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                const adminPhone = '6287816959979';
                const formattedPhone = normalizePhone(customerPhone);
                const proofNote = compressedResult
                  ? '\n*Status:* Bukti Transfer Sudah Diupload di Website'
                  : '\n*Status:* Bukti Transfer Saya Lampirkan di Chat Ini';
                const notesLine = customerNotes.trim() ? `\n*Catatan:* ${customerNotes.trim()}` : '';
                const message = encodeURIComponent(
                  `Halo Admin BloxyLucy!\n\nSaya ingin konfirmasi pembayaran Top Up Robux via QRIS:\n\n*Kode Order:* #${submittedOrderCode}\n*Username Roblox:* ${username}\n*No. WA Pembeli:* ${formattedPhone}${proofNote}${notesLine}\n*Pesanan:* ${formatRobux(amount)} Robux\n*Total Pembayaran:* ${formatRupiah(price)}\n\nMohon segera dicek dan diproses ke akun Roblox saya ya min. Terima kasih!`
                );
                window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Buka Chat WhatsApp Admin</span>
            </button>

            <Link
              href="/"
              className="block w-full py-3 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-600 font-black text-xs transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      ) : (
        /* STATE 2: Form Pembayaran & QRIS Normal View */
        <div className="relative w-full max-w-md rounded-3xl border border-pink-200 bg-white shadow-xl overflow-hidden p-6 sm:p-8 text-center space-y-5">
          
          {/* Top Status Icon (Green Circle Checkmark) */}
          <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          {/* Title & Order Detail */}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Menunggu Pembayaran
            </h1>
            <p className="text-sm font-extrabold text-zinc-700">
              {formatRobux(amount)} Robux
              {username && (
                <span className="text-pink-600 font-black ml-1">(@{username})</span>
              )}
            </p>
            {verifiedUserId && (
              <p className="text-[11px] font-mono text-zinc-400">
                Roblox ID: {verifiedUserId}
              </p>
            )}
          </div>

          {/* Total Price */}
          <div className="space-y-0.5">
            <span className="text-xs text-zinc-500 block font-medium">Total Pembayaran:</span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {formatRupiah(price)}
            </div>
          </div>

          {/* QRIS Frame */}
          <div className="space-y-2">
            <div className="relative mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/30 p-2 flex flex-col items-center justify-center overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={qrisImage}
                  alt="QRIS Pembayaran"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 font-semibold">
              Scan QRIS di atas via BCA, GoPay, OVO, Dana, ShopeePay, LinkAja, dll.
            </p>
          </div>

          {/* Upload Proof Section */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />

          {isCompressing ? (
            <div className="p-4 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/40 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-bold text-pink-600">Memproses bukti transfer...</span>
            </div>
          ) : compressedResult ? (
            <div className="relative p-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 flex items-center gap-3 text-left">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-300 bg-white shrink-0">
                <Image
                  src={compressedResult.dataUrl}
                  alt="Bukti Transfer"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-900 truncate">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{compressedResult.fileName}</span>
                </div>
                <span className="text-[10px] text-emerald-700 block font-medium">
                  Ukuran file: {((compressedResult.compressedSize) / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCompressedResult(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-[11px] font-bold cursor-pointer shrink-0"
              >
                Ganti
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer border-2 border-dashed border-zinc-300 hover:border-pink-400 rounded-2xl p-4 text-center bg-zinc-50/60 hover:bg-pink-50/30 transition-all space-y-1.5"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-200/80 text-zinc-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-black text-zinc-800">
                Klik untuk upload bukti bayar
              </div>
              <p className="text-[11px] text-zinc-500">
                Format JPG, PNG (Maksimal 5MB)
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 shadow-2xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Dilindungi OCR Anti-Fraud</span>
                </span>
              </div>
            </div>
          )}

          {/* WhatsApp Customer Phone Input */}
          <div className="space-y-1.5 text-left bg-pink-50/50 border border-pink-200/70 p-3.5 rounded-2xl">
            <label className="block text-xs font-bold text-zinc-800">
              Nomor WhatsApp Anda <span className="text-pink-600 font-black">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 text-xs font-black tracking-wider">
                +62
              </div>
              <input
                type="tel"
                value={customerPhone.startsWith('62') ? customerPhone.slice(2) : customerPhone.startsWith('0') ? customerPhone.slice(1) : customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="81234567890"
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-400/20 rounded-xl text-sm font-bold text-zinc-900 placeholder-zinc-400 outline-none transition-all shadow-2xs"
              />
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Nomor ini digunakan admin untuk konfirmasi pesanan &amp; mengirimkan link review otomatis setelah selesai.
            </p>
          </div>

          {/* Catatan Pelanggan (Opsional) */}
          <div className="space-y-1.5 text-left bg-zinc-50/80 border border-zinc-200/80 p-3.5 rounded-2xl">
            <label className="block text-xs font-bold text-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-pink-500" />
                <span>Catatan Pesanan</span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400">Opsional</span>
            </label>
            <textarea
              rows={2}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Contoh: Tolong kirim ke Gamepass / catatan tambahan..."
              className="w-full p-2.5 bg-white border border-zinc-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-400/20 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 outline-none transition-all resize-none shadow-2xs"
            />
          </div>

          {/* Full Width Green WhatsApp Confirmation Button */}
          <button
            type="button"
            onClick={handleConfirmWhatsApp}
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Konfirmasi Pembayaran</span>
              </>
            )}
          </button>

          {/* Back Link */}
          <div>
            <Link
              href="/"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 underline transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fff7fa] text-pink-600 font-bold">
        Memuat halaman pembayaran...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
