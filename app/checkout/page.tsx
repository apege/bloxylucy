'use client';

import React, { useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Check, 
  UploadCloud, 
  MessageCircle, 
  ShieldCheck, 
  FileCheck,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import SakuraFalling from '../components/SakuraFalling';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username') || 'BloxyGamer';
  const amount = parseInt(searchParams.get('amount') || '2200', 10);
  const price = parseInt(searchParams.get('price') || '45000', 10);

  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmWhatsApp = () => {
    const adminPhone = '6287816959979';
    const proofNote = proofImage
      ? '%0A%E2%9C%85 *Status:* Bukti Transfer Sudah Diupload di Website'
      : '%0A%E2%9C%85 *Status:* Bukti Transfer Saya Lampirkan di Chat Ini';

    const message = `Halo Admin BloxyLucy! 🌸%0A%0ASaya ingin konfirmasi pembayaran Top Up Robux via QRIS:%0A%0A👤 *Username Roblox:* ${username}${proofNote}%0A💎 *Pesanan:* ${formatRobux(amount)} Robux%0A💰 *Total Pembayaran:* ${formatRupiah(price)}%0A%0AMohon segera dicek dan diproses ke akun Roblox saya ya min. Terima kasih! ✨`;

    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 py-10 bg-[#fff7fa] text-[#2d1822]">
      
      {/* Sakura falling effect */}
      <SakuraFalling />

      {/* Top back button */}
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

      {/* Main Card */}
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
              <span className="text-pink-600 font-bold ml-1">(@{username})</span>
            )}
          </p>
        </div>

        {/* Total Price */}
        <div className="space-y-0.5">
          <span className="text-xs text-zinc-500 block font-medium">Total Pembayaran:</span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {formatRupiah(price)}
          </div>
        </div>

        <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
          Silahkan Scan QRIS untuk melakukan pembayaran sesuai dengan total Pembayaran diatas
        </p>

        {/* QRIS Card Frame */}
        <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2 max-w-[280px] mx-auto">
          <div className="border border-zinc-200 rounded-xl p-3 bg-white space-y-2">
            {/* Header QRIS & GPN Logo */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black tracking-wider text-zinc-900">
                QRIS
              </span>
              <span className="text-[10px] font-bold text-rose-600">
                GPN
              </span>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono">
              BLOXYLUCY OFFICIAL<br />
              <span className="text-[9px] text-zinc-400">NMID: ID102003004050</span>
            </div>

            {/* QR Image Box */}
            <div className="relative w-44 h-44 mx-auto bg-zinc-50 rounded-lg p-1.5 flex items-center justify-center border border-zinc-200">
              <QrCode className="w-40 h-40 text-zinc-900" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  🌸
                </div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 font-medium pt-0.5">
            Scan QRIS untuk pembayaran
          </p>
        </div>

        {/* Upload Proof Box (Dashed Container) */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {proofImage ? (
          <div className="relative p-3.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 flex items-center gap-3 text-left">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-emerald-300 bg-white shrink-0">
              <Image
                src={proofImage}
                alt="Bukti Transfer"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-900 truncate">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{proofFileName || 'Bukti_Transfer.jpg'}</span>
              </div>
              <span className="text-[10px] text-emerald-700 block">Bukti transfer terlampir ✓</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setProofImage(null);
                setProofFileName('');
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
              Format JPG, PNG max 5MB
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-zinc-200 text-[10px] font-bold text-zinc-600 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Dilindungi OCR Anti-Fraud</span>
              </span>
            </div>
          </div>
        )}

        {/* WhatsApp Instructions */}
        <p className="text-xs text-zinc-500 leading-relaxed px-2">
          Setelah transfer, silakan konfirmasi pembayaran ke Admin via WhatsApp.
        </p>

        {/* Full Width Green WhatsApp Confirmation Button */}
        <button
          type="button"
          onClick={handleConfirmWhatsApp}
          className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span>Konfirmasi Pembayaran</span>
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
