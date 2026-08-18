'use client';

import React from 'react';
import { 
  CreditCard, 
  MessageCircle, 
  Check, 
  Zap, 
  ShieldCheck, 
  QrCode
} from 'lucide-react';

interface PaymentSectionProps {
  paymentChannel: 'website' | 'whatsapp';
  onChangeChannel: (channel: 'website' | 'whatsapp') => void;
}

export default function PaymentSection({
  paymentChannel,
  onChangeChannel,
}: PaymentSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="overflow-hidden rounded-3xl border border-pink-200 bg-white shadow-xs">
        
        {/* Step Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50/80 to-white border-b border-pink-100 px-6 py-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-500 text-white font-extrabold text-base shadow-sm">
            3
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-wide">
              Pilih Pembayaran
            </h2>
            <p className="text-[11px] text-zinc-500">
              Pilih metode pembayaran yang paling nyaman untuk Anda
            </p>
          </div>
        </div>

        {/* Cards Body */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* 1. Pembayaran via Website Card */}
            <div
              onClick={() => onChangeChannel('website')}
              className={`relative p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                paymentChannel === 'website'
                  ? 'border-pink-300 bg-white shadow-sm ring-1 ring-pink-300'
                  : 'border-zinc-200 bg-white hover:border-pink-200 hover:bg-pink-50/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-pink-100/70 text-pink-600 flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 leading-tight">
                        Pembayaran via Website
                      </h3>
                      <div className="text-xs font-bold text-pink-600 flex items-center gap-1 mt-1">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan QRIS &amp; Upload Bukti</span>
                      </div>
                    </div>
                  </div>

                  {paymentChannel === 'website' && (
                    <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                  Scan barcode QRIS (BCA, Mandiri, BRI, DANA, GoPay, OVO, ShopeePay) lalu upload bukti transfer langsung di website.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-pink-600 font-bold">
                  <Zap className="w-4 h-4 fill-pink-600 text-pink-600" />
                  <span>Verifikasi Otomatis</span>
                </div>
                
                <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                  paymentChannel === 'website'
                    ? 'bg-pink-50 text-pink-600'
                    : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {paymentChannel === 'website' ? 'Dipilih' : 'Pilih'}
                </span>
              </div>
            </div>

            {/* 2. Pembayaran via WhatsApp Card */}
            <div
              onClick={() => onChangeChannel('whatsapp')}
              className={`relative p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                paymentChannel === 'whatsapp'
                  ? 'border-emerald-300 bg-white shadow-sm ring-1 ring-emerald-300'
                  : 'border-zinc-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-zinc-900 leading-tight">
                        Pembayaran via WhatsApp
                      </h3>
                      <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat Langsung dengan Admin</span>
                      </div>
                    </div>
                  </div>

                  {paymentChannel === 'whatsapp' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                  Pesan langsung melalui WhatsApp resmi BloxyLucy dengan format pesanan instan, dibantu langsung oleh admin sampai selesai.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Fast Respon 24 Jam</span>
                </div>
                
                <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                  paymentChannel === 'whatsapp'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {paymentChannel === 'whatsapp' ? 'Dipilih' : 'Pilih'}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
