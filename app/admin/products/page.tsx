'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Tag
} from 'lucide-react';
import { Product } from '@/lib/admin-types';
import { getProducts, saveProduct, deleteProduct } from '@/lib/supabase-service';

function ProductsContent() {
  const searchParams = useSearchParams();
  const shouldOpenAdd = searchParams.get('action') === 'add';

  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(
    shouldOpenAdd ? { robux: 1000, price: 20000, is_active: true, category: 'Robux' } : null
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadProductList = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductList();
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

  // Helper to format number with thousand dots while typing (e.g. 500.000)
  const formatNumberWithDots = (val: number | undefined | null) => {
    if (val === undefined || val === null || val === 0) return '';
    return new Intl.NumberFormat('id-ID').format(val);
  };

  const parseNumberFromDots = (str: string): number => {
    const clean = str.replace(/\D/g, '');
    return clean ? parseInt(clean, 10) : 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.robux || !editingProduct.price) {
      alert('Mohon isi nominal Robux dan Harga produk.');
      return;
    }
    setIsSaving(true);
    try {
      await saveProduct({
        ...editingProduct,
        name: editingProduct.name || `${formatRobux(editingProduct.robux)} Robux`,
      });
      setEditingProduct(null);
      await loadProductList();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Apakah kamu yakin ingin menghapus produk ini?')) {
      await deleteProduct(id);
      await loadProductList();
    }
  };

  const handleToggleActive = async (prod: Product) => {
    await saveProduct({ ...prod, is_active: !prod.is_active });
    await loadProductList();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Pricelist Robux
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Kelola daftar nominal Robux, harga jual, dan status ketersediaan
          </p>
        </div>

        <button
          onClick={() =>
            setEditingProduct({
              robux: 1000,
              price: 20000,
              is_active: true,
              category: 'Robux',
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition-all cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Nominal Baru</span>
        </button>
      </div>

      {/* Product Modal Rendered to Portal (Covers Whole Screen) */}
      {editingProduct && mounted && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingProduct(null);
          }}
          className="fixed inset-0 z-[99999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-pink-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100/80">
              <h3 className="text-base font-black text-zinc-900">
                {editingProduct.id ? 'Edit Nominal Robux' : 'Tambah Nominal Robux'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-pink-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-700 mb-1.5">
                  <span>Nominal Robux</span>
                  <div className="relative w-4 h-4 shrink-0 inline-flex items-center">
                    <Image
                      src="/images/robux.webp"
                      alt="Robux"
                      width={16}
                      height={16}
                      className="object-contain"
                    />
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithDots(editingProduct.robux)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        robux: parseNumberFromDots(e.target.value),
                      })
                    }
                    required
                    placeholder="Contoh: 500.000"
                    className="w-full pl-3.5 pr-14 py-2.5 rounded-2xl border border-pink-200 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 transition-all bg-[#fffcfd]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400 pointer-events-none">
                    R$
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  Harga Jual (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-pink-500 pointer-events-none">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberWithDots(editingProduct.price)}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseNumberFromDots(e.target.value),
                      })
                    }
                    required
                    placeholder="Contoh: 50.000"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-pink-200 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 transition-all bg-[#fffcfd]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingProduct.is_active ?? true}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-400 cursor-pointer accent-pink-500"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-zinc-700 cursor-pointer select-none">
                  Nominal Aktif & Ditampilkan di Web
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100/80">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Nominal'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((prod) => (
          <div
            key={prod.id}
            className={`rounded-3xl border p-5 bg-white shadow-xs transition-all space-y-3 relative ${
              prod.is_active ? 'border-pink-200/80 hover:border-pink-300' : 'border-zinc-200 opacity-60 bg-zinc-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-center p-1.5 shadow-2xs">
                  <Image
                    src="/images/robux.webp"
                    alt="Robux"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-zinc-900">
                    {formatRobux(prod.robux)} Robux
                  </h3>
                  <p className="text-xs font-black text-pink-600">
                    {formatRupiah(prod.price)}
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  prod.is_active
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                }`}
              >
                {prod.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => handleToggleActive(prod)}
                className="text-[11px] font-bold text-zinc-500 hover:text-pink-600 transition-colors cursor-pointer"
              >
                {prod.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(prod)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
                  title="Edit Nominal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(prod.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus Nominal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-pink-600">Memuat data pricelist...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
