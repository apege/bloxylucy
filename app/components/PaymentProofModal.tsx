'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { RobuxItem } from './data';
import { 
  Check, 
  UploadCloud, 
  MessageCircle, 
  ShieldCheck, 
  FileCheck,
  QrCode
} from 'lucide-react';
import { getStoreSettings, getCachedStoreSettings, submitCheckout } from '@/lib/supabase-service';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  selectedItem: RobuxItem | null;
  cart: RobuxItem[];
  onSuccessOrder: () => void;
}

export default function PaymentProofModal({
  isOpen,
  onClose,
  username,
  selectedItem,
  cart,
  onSuccessOrder,
}: PaymentProofModalProps) {
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  
  const [qrisImage, setQrisImage] = useState<string>('/images/qris.webp');
  const [storeTitle, setStoreTitle] = useState<string>('BLOXYLUCY OFFICIAL');
  const [adminPhone, setAdminPhone] = useState<string>('6285828378025');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getStoreSettings().then((s) => {
      if (s?.qris_image_path) setQrisImage(s.qris_image_path);
      if (s?.store_name) setStoreTitle(s.store_name.toUpperCase());
      if (s?.whatsapp_number) setAdminPhone(s.whatsapp_number);
    }).catch(console.error);
  }, []);

  if (!isOpen) return null;

  const isCartCheckout = cart.length > 0;
  const totalRobux = isCartCheckout
    ? cart.reduce((sum, item) => sum + item.amount, 0)
    : selectedItem?.amount || 0;
  
  const grandTotal = isCartCheckout
    ? cart.reduce((sum, item) => sum + item.price, 0)
    : selectedItem?.price || 0;

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

  const handleConfirmWhatsApp = async () => {
    if (!customerPhone.trim()) {
      alert('Silakan masukkan Nomor WhatsApp aktif Anda.');
      return;
    }
    const formattedPhone = normalizePhone(customerPhone);
    if (formattedPhone.length < 10) {
      alert('Nomor WhatsApp tidak valid. Silakan masukkan nomor HP yang benar (contoh: 081234567890).');
      return;
    }

    try {
      await submitCheckout({
        roblox_username: username || 'Guest',
        amount: totalRobux,
        price: grandTotal,
        payment_method: 'Website',
        payment_proof_path: proofImage || null,
        customer_phone: formattedPhone,
        customer_notes: customerNotes.trim() || undefined,
        cart_items: isCartCheckout ? cart : undefined,
      });
    } catch (err) {
      console.warn('Auto submit checkout error:', err);
    }

    const itemsText = isCartCheckout
      ? cart.map((c) => `- ${c.amount} Robux (${formatRupiah(c.price)})`).join('\n')
      : `- ${formatRobux(totalRobux)} Robux (${formatRupiah(grandTotal)})`;

    const proofNote = proofImage
      ? '\n*Status:* Bukti Transfer Sudah Diupload di Website'
      : '\n*Status:* Bukti Transfer Saya Lampirkan di Chat Ini';

    const message = encodeURIComponent(
      `Halo Admin BloxyLucy!\n\nSaya ingin konfirmasi pembayaran Top Up Robux via QRIS:\n\n*Username Roblox:* ${username || '-'}\n*No. WA Pembeli:* ${formattedPhone}${proofNote}\n*Pesanan:*\n${itemsText}\n*Total Pembayaran:* ${formatRupiah(grandTotal)}\n\nMohon segera dicek dan diproses ke akun Roblox saya ya min. Terima kasih!`
    );

    window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
    onSuccessOrder();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-pink-200 bg-white shadow-2xl overflow-hidden my-6 p-6 sm:p-8 text-center space-y-5">
        
        {/* Top Status Icon (Green Circle Checkmark) */}
        <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        {/* Title & Order Detail */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Menunggu Pembayaran
          </h2>
          <p className="text-sm font-extrabold text-zinc-700">
            {formatRobux(totalRobux)} Robux
            {username && (
              <span className="text-pink-600 font-bold ml-1">(@{username})</span>
            )}
          </p>
        </div>

        {/* Total Price */}
        <div className="space-y-0.5">
          <span className="text-xs text-zinc-500 block font-medium">Total Pembayaran:</span>
          <div className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            {formatRupiah(grandTotal)}
          </div>
        </div>

        <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
          Silahkan Scan QRIS untuk melakukan pembayaran sesuai dengan total Pembayaran diatas
        </p>

        {/* QRIS Card Frame (Clean Poster View) */}
        <div className="p-3 rounded-2xl bg-white border border-pink-200/80 shadow-xs space-y-2 max-w-[280px] mx-auto">
          <div className="relative w-full aspect-square max-w-[240px] mx-auto bg-zinc-50 rounded-xl p-1.5 flex items-center justify-center border border-zinc-200 overflow-hidden">
            <img
              src={qrisImage}
              alt="Barcode QRIS"
              className="max-h-full max-w-full object-contain rounded-lg"
            />
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
            Nomor ini digunakan admin untuk konfirmasi &amp; kirim link review pesanan otomatis.
          </p>
        </div>

        {/* Catatan Pelanggan (Opsional) */}
        <div className="space-y-1.5 text-left bg-zinc-50/80 border border-zinc-200/80 p-3.5 rounded-2xl">
          <label className="block text-xs font-bold text-zinc-800 flex items-center justify-between">
            <span>Catatan Pesanan</span>
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
          className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span>Konfirmasi Pembayaran</span>
        </button>

        {/* Back Link */}
        <div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 underline transition-colors cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>

      </div>
    </div>
  );
}
