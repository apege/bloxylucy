'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RobuxItem } from './data';
import { 
  Zap, 
  ShoppingCart, 
  X, 
  MessageCircle, 
} from 'lucide-react';

interface OrderSummaryBarProps {
  username: string;
  selectedItem: RobuxItem | null;
  paymentChannel: 'website' | 'whatsapp';
  cart: RobuxItem[];
  isOpenCart: boolean;
  onCloseCart: () => void;
  onRemoveFromCart: (index: number) => void;
  onClearCart: () => void;
}

export default function OrderSummaryBar({
  username,
  selectedItem,
  paymentChannel,
  cart,
  isOpenCart,
  onCloseCart,
  onRemoveFromCart,
  onClearCart,
}: OrderSummaryBarProps) {
  const router = useRouter();

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

  const isCartCheckout = cart.length > 0;
  const totalRobux = isCartCheckout
    ? cart.reduce((sum, item) => sum + item.amount, 0)
    : selectedItem?.amount || 0;
  
  const grandTotal = isCartCheckout
    ? cart.reduce((sum, item) => sum + item.price, 0)
    : selectedItem?.price || 0;

  const handleProceedCheckout = () => {
    if (!username.trim()) {
      alert('Silakan isi username Roblox terlebih dahulu di Langkah 1!');
      const el = document.getElementById('username-input');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!selectedItem && cart.length === 0) {
      alert('Silakan pilih nominal Robux yang ingin dibeli di Langkah 2!');
      const el = document.getElementById('pricelist');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (paymentChannel === 'whatsapp') {
      const adminPhone = '6287816959979';
      const itemsText = isCartCheckout
        ? cart.map((c) => `- ${c.amount} Robux (${formatRupiah(c.price)})`).join('%0A')
        : `- ${formatRobux(totalRobux)} Robux (${formatRupiah(grandTotal)})`;

      const message = `Halo Admin BloxyLucy! 🌸%0A%0ASaya ingin melakukan Top Up Robux dengan rincian:%0A%0A👤 *Username Roblox:* ${username}%0A💎 *Pesanan:*%0A${itemsText}%0A💰 *Total Harga:* ${formatRupiah(grandTotal)}%0A💳 *Metode Pembayaran:* WhatsApp Direct / Admin Transfer%0A%0AMohon segera diproses ya min, terima kasih! ✨`;
      
      window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');
      return;
    }

    // Navigate to dedicated Checkout Page
    const encodedUser = encodeURIComponent(username.trim());
    router.push(`/checkout?username=${encodedUser}&amount=${totalRobux}&price=${grandTotal}`);
  };

  if (!selectedItem && cart.length === 0) return null;

  return (
    <>
      {/* Sticky Bottom Bar Matching Image 1 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-pink-100 backdrop-blur-md px-4 sm:px-8 py-3 shadow-[0_-4px_25px_rgba(236,72,153,0.08)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Summary Details Left */}
          <div className="flex items-center gap-3.5 w-full sm:w-auto justify-between sm:justify-start">
            <div className="text-left">
              <span className="text-[11px] text-zinc-400 block font-medium">Total Pesanan</span>
              <span className="text-sm sm:text-base font-black text-zinc-900">
                {formatRobux(totalRobux)} Robux
              </span>
            </div>

            <div className="text-base sm:text-xl font-black text-pink-600 sm:ml-4">
              {formatRupiah(grandTotal)}
            </div>

            {isCartCheckout && (
              <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-lg font-bold">
                {cart.length} Item
              </span>
            )}
          </div>

          {/* Action Button Right */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleProceedCheckout}
              className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl font-extrabold text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                paymentChannel === 'whatsapp'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/20'
              }`}
            >
              {paymentChannel === 'whatsapp' ? (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>Beli via WhatsApp</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-yellow-200 text-yellow-200" />
                  <span>Bayar Sekarang</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Cart Drawer Modal */}
      {isOpenCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-pink-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-base">
                <ShoppingCart className="w-5 h-5 text-pink-600" />
                <span>Keranjang Belanja BloxyLucy</span>
              </div>
              <button
                onClick={onCloseCart}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm text-zinc-500">Keranjang masih kosong</p>
                <p className="text-xs text-pink-600">Pilih paket Robux di pricelist dan klik tombol '+'</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto">
                {cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-pink-50/50 border border-pink-100 text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-zinc-900">{formatRobux(item.amount)} Robux</h5>
                      <span className="text-pink-600 font-bold">{formatRupiah(item.price)}</span>
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(idx)}
                      className="text-rose-600 hover:text-rose-700 text-xs font-bold cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-pink-100 flex items-center justify-between font-bold">
              <span className="text-zinc-600 text-xs">Total:</span>
              <span className="text-lg text-pink-600">{formatRupiah(grandTotal)}</span>
            </div>

            <button
              onClick={() => {
                onCloseCart();
                handleProceedCheckout();
              }}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Lanjut ke Pembayaran
            </button>
          </div>
        </div>
      )}
    </>
  );
}
