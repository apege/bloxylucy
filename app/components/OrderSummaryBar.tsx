'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RobuxItem } from './data';
import { 
  Zap, 
  ShoppingCart, 
  X, 
  MessageCircle, 
  RefreshCw,
} from 'lucide-react';
import { submitCheckout } from '@/lib/supabase-service';

interface OrderSummaryBarProps {
  username: string;
  robloxUserId?: string | number;
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
  robloxUserId,
  selectedItem,
  paymentChannel,
  cart,
  isOpenCart,
  onCloseCart,
  onRemoveFromCart,
  onClearCart,
}: OrderSummaryBarProps) {
  const router = useRouter();
  const [isSubmittingWa, setIsSubmittingWa] = useState(false);

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

  const handleProceedCheckout = async () => {
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
      setIsSubmittingWa(true);
      const adminPhone = '6287816959979';
      let orderCode = `BLX${Date.now().toString().slice(-6)}`;

      try {
        const res = await submitCheckout({
          roblox_username: username.trim(),
          roblox_user_id: robloxUserId ? String(robloxUserId) : undefined,
          amount: totalRobux,
          price: grandTotal,
          payment_method: 'WhatsApp',
          customer_notes: 'Pemesanan via WhatsApp Direct',
          cart_items: isCartCheckout ? cart : undefined,
        });

        if (res?.order?.order_code) {
          orderCode = res.order.order_code;
        }
      } catch (err) {
        console.warn('Auto submit WhatsApp order notice:', err);
      } finally {
        setIsSubmittingWa(false);
      }

      const itemsText = isCartCheckout
        ? cart.map((c) => `- ${c.amount} Robux (${formatRupiah(c.price)})`).join('\n')
        : `- ${formatRobux(totalRobux)} Robux (${formatRupiah(grandTotal)})`;

      const message = encodeURIComponent(
        `Halo Admin BloxyLucy!\n\nSaya ingin melakukan Top Up Robux:\n\n*Kode Order:* #${orderCode}\n*Username Roblox:* ${username}\n*Pesanan:*\n${itemsText}\n*Total Harga:* ${formatRupiah(grandTotal)}\n*Metode Pembayaran:* WhatsApp Direct / Chat Admin\n\nMohon segera diproses ya min, terima kasih!`
      );
      
      window.open(`https://wa.me/${adminPhone}?text=${message}`, '_blank');

      // Also redirect user to Success Confirmation Page
      const encodedUser = encodeURIComponent(username.trim());
      const encodedUid = robloxUserId ? encodeURIComponent(String(robloxUserId)) : '';
      router.push(`/checkout?username=${encodedUser}&amount=${totalRobux}&price=${grandTotal}&userId=${encodedUid}&orderCode=${orderCode}&channel=whatsapp&success=true`);
      return;
    }

    // Navigate to dedicated Checkout Page
    const encodedUser = encodeURIComponent(username.trim());
    const encodedUid = robloxUserId ? encodeURIComponent(String(robloxUserId)) : '';
    router.push(`/checkout?username=${encodedUser}&amount=${totalRobux}&price=${grandTotal}&userId=${encodedUid}`);
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
