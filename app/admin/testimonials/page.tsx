'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  Star,
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Send,
  Reply,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Search,
  Check,
  X,
  Plus,
  Edit2,
  UploadCloud,
  FileCheck,
  MessageCircleHeart,
  ImageIcon,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Testimonial } from '@/lib/admin-types';
import { compressImageToWebP } from '@/app/components/imageCompressor';

function TestimonialsContent() {
  const [mounted, setMounted] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'hidden' | 'need_reply'>('all');
  const [search, setSearch] = useState('');
  const [replyingId, setReplyingId] = useState<string | number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Modal State for Create & Edit Testimonial
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressingProof, setIsCompressingProof] = useState(false);
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);
  const [pricelistPackages, setPricelistPackages] = useState<{ robux: number; label: string; price: number }[]>([]);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/testimonials', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTestimonials(json.data);
        }
      }

      // Load products strictly from actual Pricelist
      try {
        const prodRes = await fetch('/api/products', { cache: 'no-store' });
        if (prodRes.ok) {
          const prodJson = await prodRes.json();
          if (prodJson.success && Array.isArray(prodJson.data) && prodJson.data.length > 0) {
            const list = prodJson.data
              .filter((p: any) => p.is_active !== false)
              .sort((a: any, b: any) => Number(a.robux) - Number(b.robux))
              .map((p: any) => ({
                robux: Number(p.robux),
                label: `${new Intl.NumberFormat('id-ID').format(p.robux)} Robux`,
                price: Number(p.price || 0),
              }));
            setPricelistPackages(list);
          }
        }
      } catch (err) {
        console.warn('Load pricelist for testimonials notice:', err);
      }
    } catch (err) {
      console.error('Fetch testimonials error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleActive = async (t: Testimonial) => {
    const newStatus = !(t.is_active !== false);
    // Optimistic update
    setTestimonials((prev) =>
      prev.map((item) => (item.id === t.id ? { ...item, is_active: newStatus } : item))
    );

    try {
      await fetch(`/api/testimonials/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      });
      showToast(newStatus ? 'Testimoni ditampilkan di website!' : 'Testimoni disembunyikan.');
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan testimoni ini?')) return;

    setTestimonials((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      showToast('Testimoni berhasil dihapus.');
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleSendReply = async (id: string | number) => {
    if (!replyText.trim()) return;

    const replyObj = {
      adminName: 'Admin BloxyLucy Official',
      message: replyText.trim(),
      replyDate: new Date().toISOString(),
    };

    setTestimonials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, adminReply: replyObj } : item))
    );
    setReplyingId(null);
    setReplyText('');

    try {
      await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_reply: replyObj }),
      });
      showToast('Balasan admin berhasil dipublikasikan!');
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleDeleteReply = async (id: string | number) => {
    if (!confirm('Hapus balasan admin pada ulasan ini?')) return;

    setTestimonials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, adminReply: null } : item))
    );

    try {
      await fetch(`/api/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_reply: null }),
      });
      showToast('Balasan admin dihapus.');
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  const handleModalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Silakan upload file foto (JPG, PNG, WEBP).');
        return;
      }
      try {
        setIsCompressingProof(true);
        const result = await compressImageToWebP(file);
        setEditingItem((prev) => prev ? { ...prev, proofImage: result.dataUrl } : null);
      } catch (err) {
        console.error('Compress proof error:', err);
        alert('Gagal memproses gambar foto.');
      } finally {
        setIsCompressingProof(false);
      }
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.username?.trim() || !editingItem.comment?.trim()) {
      alert('Mohon isi Username Roblox dan Isi Komentar Ulasan.');
      return;
    }

    const payloadItem: Testimonial = {
      id: editingItem.id || `testi-${Date.now()}`,
      username: editingItem.username.trim(),
      avatarLetter: editingItem.username.trim()[0]?.toUpperCase() || 'U',
      rating: editingItem.rating || 5,
      comment: editingItem.comment.trim(),
      robuxPackage: editingItem.order_code || 'Robux',
      order_code: editingItem.order_code || undefined,
      timeAgo: 'Baru saja',
      hasProof: Boolean(editingItem.proofImage),
      proofImage: editingItem.proofImage || undefined,
      is_active: editingItem.is_active !== false,
      adminReply: editingItem.adminReply || undefined,
      created_at: new Date().toISOString(),
    };

    // Optimistic UI Update - Instantly close modal and update list
    if (editingItem.id) {
      setTestimonials((prev) =>
        prev.map((t) => (t.id === editingItem.id ? { ...t, ...payloadItem } : t))
      );
      showToast('Testimoni berhasil diperbarui!');
    } else {
      setTestimonials((prev) => [payloadItem, ...prev]);
      showToast('Testimoni baru berhasil ditambahkan!');
    }

    setIsEditModalOpen(false);
    setEditingItem(null);

    try {
      if (editingItem.id) {
        // EDIT Existing Testimonial
        await fetch(`/api/testimonials/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: payloadItem.username,
            message: payloadItem.comment,
            rating: payloadItem.rating,
            image_path: payloadItem.proofImage || null,
            order_code: payloadItem.order_code || null,
            is_active: payloadItem.is_active !== false,
            admin_reply: payloadItem.adminReply || null,
          }),
        });
      } else {
        // CREATE New Testimonial
        await fetch('/api/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            is_admin_create: true,
            name: payloadItem.username,
            message: payloadItem.comment,
            rating: payloadItem.rating,
            image_path: payloadItem.proofImage || null,
            order_code: payloadItem.order_code || null,
            status: payloadItem.is_active !== false ? 'approved' : 'rejected',
            admin_reply: payloadItem.adminReply || null,
          }),
        });
      }
    } catch (err) {
      console.error(err);
      loadData();
    }
  };

  // Filtered List
  const filtered = testimonials.filter((t) => {
    if (filterTab === 'active' && t.is_active === false) return false;
    if (filterTab === 'hidden' && t.is_active !== false) return false;
    if (filterTab === 'need_reply' && t.adminReply) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.username.toLowerCase().includes(q) ||
        t.comment.toLowerCase().includes(q) ||
        (t.order_code && t.order_code.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const activeCount = testimonials.filter((t) => t.is_active !== false).length;
  const hiddenCount = testimonials.filter((t) => t.is_active === false).length;
  const needReplyCount = testimonials.filter((t) => !t.adminReply).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-zinc-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Image Preview Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <div className="relative max-w-xl max-h-[85vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl">
            <img src={previewImage} alt="Preview Foto Bukti" className="max-h-[80vh] max-w-full object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* Create / Edit Testimonial Modal (Rendered to Portal) */}
      {isEditModalOpen && editingItem && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsEditModalOpen(false);
          }}
          className="fixed inset-0 z-[99999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full border border-pink-100 shadow-2xl flex flex-col" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            {/* Fixed Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-pink-100/80 shrink-0">
              <h3 className="text-base font-black text-zinc-900">
                {editingItem.id ? 'Edit Ulasan Testimoni' : 'Tambah Testimoni Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-pink-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              
              {/* Username Roblox */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  Username Roblox <span className="text-pink-600 font-black">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-pink-500 pointer-events-none">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={editingItem.username || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, username: e.target.value })}
                    placeholder="Contoh: APG_Channel11"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-2xl border border-pink-200 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 transition-all bg-[#fffcfd]"
                  />
                </div>
              </div>

              {/* Rating Bintang */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  Rating Kepuasan (1 - 5 Bintang)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, rating: star })}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        star <= (editingItem.rating || 5)
                          ? 'bg-amber-50 border-amber-300 text-amber-500 shadow-2xs'
                          : 'bg-white border-zinc-200 text-zinc-300 hover:border-amber-200'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= (editingItem.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-1">
                    {editingItem.rating || 5} Bintang
                  </span>
                </div>
              </div>

              {/* Komentar Ulasan */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  Isi Ulasan Testimoni <span className="text-pink-600 font-black">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.comment || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, comment: e.target.value })}
                  placeholder="Tuliskan pengalaman / ulasan kepuasan pembeli..."
                  className="w-full p-3 rounded-2xl border border-pink-200 text-xs sm:text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 transition-all bg-[#fffcfd] resize-none"
                />
              </div>

              {/* Upload Foto Bukti Pembayaran / Landing */}
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5 flex items-center justify-between">
                  <span>Foto Bukti Transfer / Landing (Opsional)</span>
                  {editingItem.proofImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({ ...editingItem, proofImage: null });
                        if (modalFileInputRef.current) modalFileInputRef.current.value = '';
                      }}
                      className="text-[11px] text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  )}
                </label>

                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {isCompressingProof ? (
                  <div className="p-3 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/40 text-center flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-pink-600">Memproses foto bukti...</span>
                  </div>
                ) : editingItem.proofImage ? (
                  <div className="p-3 rounded-2xl border border-pink-200 bg-zinc-50 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 shrink-0 bg-white">
                      <img src={editingItem.proofImage} alt="Bukti" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-zinc-800 block truncate">Foto Bukti Terpasang</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">✓ Siap Ditampilkan</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => modalFileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white border border-pink-200 text-pink-600 text-xs font-bold hover:bg-pink-50 cursor-pointer shrink-0"
                    >
                      Ganti
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => modalFileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-zinc-200 hover:border-pink-400 rounded-2xl p-3 text-center bg-zinc-50 hover:bg-pink-50/30 transition-all space-y-1"
                  >
                    <UploadCloud className="w-5 h-5 text-zinc-400 mx-auto" />
                    <div className="text-xs font-bold text-zinc-700">Klik untuk upload foto bukti</div>
                    <p className="text-[10px] text-zinc-400">Format JPG, PNG, WEBP (Max 5MB)</p>
                  </div>
                )}
              </div>

              {/* Custom Pink Robux Package Dropdown */}
              <div className="relative space-y-1.5">
                <label className="block text-xs font-extrabold text-zinc-700 flex items-center justify-between">
                  <span>Paket Robux / Kode Order (Opsional)</span>
                  <span className="text-[10px] font-bold text-pink-500">Pilih dari List atau Ketik</span>
                </label>

                {/* Dropdown Trigger Button */}
                <div
                  onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-pink-200 hover:border-pink-400 focus:border-pink-500 bg-[#fffcfd] flex items-center justify-between cursor-pointer transition-all shadow-2xs group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-pink-100/80 text-pink-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    {editingItem.order_code ? (
                      <span className="text-sm font-black text-pink-600 truncate">
                        {editingItem.order_code}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-zinc-400">
                        Pilih paket nominal Robux...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {editingItem.order_code && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({ ...editingItem, order_code: '' });
                        }}
                        className="text-[10px] font-bold text-zinc-400 hover:text-pink-600 px-1.5 py-0.5 rounded-md hover:bg-pink-50 transition-colors"
                      >
                        Reset
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-pink-400 group-hover:text-pink-600 transition-transform duration-200 ${isPackageDropdownOpen ? 'rotate-180 text-pink-600' : ''}`} />
                  </div>
                </div>

                {/* Dropdown Menu Overlay */}
                {isPackageDropdownOpen && (
                  <div className="mt-1.5 bg-white rounded-2xl border border-pink-200 shadow-xl shadow-pink-500/10 p-3 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-black text-pink-600 uppercase tracking-wider">
                        Pilih Paket Nominal Robux
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">Klik untuk memilih</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
                      {pricelistPackages.map((pkg) => {
                        const isSelected = editingItem.order_code === pkg.label;
                        return (
                          <button
                            key={pkg.robux}
                            type="button"
                            onClick={() => {
                              setEditingItem({ ...editingItem, order_code: pkg.label });
                              setIsPackageDropdownOpen(false);
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-black text-left flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/25 ring-2 ring-pink-300'
                                : 'bg-pink-50/60 hover:bg-pink-100 text-pink-700 border border-pink-100 hover:border-pink-300'
                            }`}
                          >
                            <span className="truncate">{pkg.label}</span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {pkg.price > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-pink-100/80 text-pink-600'
                                }`}>
                                  Rp {new Intl.NumberFormat('id-ID').format(pkg.price)}
                                </span>
                              )}
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Input Field at the bottom */}
                    <div className="pt-2.5 border-t border-pink-100">
                      <label className="block text-[10px] font-extrabold text-zinc-600 mb-1">
                        Atau Masukkan Manual (Kode Order / Paket Kustom):
                      </label>
                      <input
                        type="text"
                        value={editingItem.order_code || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, order_code: e.target.value })}
                        placeholder="Contoh: BLX28749973 atau 15.000 Robux"
                        className="w-full px-3 py-2 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-[#fffcfd]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Status Tampilkan */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveTesti"
                  checked={editingItem.is_active !== false}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-pink-600 rounded border-pink-300 focus:ring-pink-400 cursor-pointer accent-pink-500"
                />
                <label htmlFor="isActiveTesti" className="text-xs font-bold text-zinc-700 cursor-pointer select-none">
                  Publikasikan dan Tampilkan Testimoni di Website
                </label>
              </div>

              </div>{/* end scrollable body */}

              {/* Fixed Footer with Action Buttons */}
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-pink-100/80 shrink-0 bg-white rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Menyimpan...' : (editingItem.id ? 'Simpan Perubahan' : 'Tambah Testimoni')}
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Kelola Testimoni &amp; Ulasan
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Moderasi ulasan pembeli, tambah ulasan manual, balas testimoni, dan kontrol publikasi di website
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingItem({
                username: '',
                rating: 5,
                comment: '',
                proofImage: null,
                is_active: true,
                order_code: '',
              });
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Testimoni</span>
          </button>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Total Ulasan</span>
          <span className="text-xl sm:text-2xl font-black text-zinc-900">{testimonials.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Rating Rata-rata</span>
          <span className="text-xl sm:text-2xl font-black text-amber-500 flex items-center gap-1">
            5.0 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Aktif (Tampil)</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600">{activeCount}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Perlu Balasan</span>
          <span className="text-xl sm:text-2xl font-black text-pink-600">{needReplyCount}</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden">
        
        {/* Filter Pills & Search */}
        <div className="p-4 sm:p-5 border-b border-pink-100/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-pink-50/20">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-pink-500 text-white shadow-2xs'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-pink-100'
              }`}
            >
              Semua ({testimonials.length})
            </button>
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterTab === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-pink-100'
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              onClick={() => setFilterTab('hidden')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterTab === 'hidden'
                  ? 'bg-zinc-800 text-white shadow-2xs'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-pink-100'
              }`}
            >
              Disembunyikan ({hiddenCount})
            </button>
            <button
              onClick={() => setFilterTab('need_reply')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterTab === 'need_reply'
                  ? 'bg-pink-600 text-white shadow-2xs'
                  : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-pink-100'
              }`}
            >
              Perlu Balasan ({needReplyCount})
            </button>
          </div>

          <div className="relative max-w-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari username atau ulasan..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-pink-200 bg-white text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
        </div>

        {/* List of Testimonials */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-500">Memuat data testimoni...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-sm font-bold text-zinc-700">Tidak ada ulasan ditemukan</p>
            <p className="text-xs text-zinc-400">Coba pilih tab filter atau kata kunci lain, atau klik "Tambah Testimoni"</p>
          </div>
        ) : (
          <div className="divide-y divide-pink-100/70">
            {filtered.map((t) => {
              const isActive = t.is_active !== false;
              const isReplying = replyingId === t.id;

              return (
                <div
                  key={t.id}
                  className={`p-5 sm:p-6 transition-colors space-y-3.5 ${
                    isActive ? 'hover:bg-pink-50/20' : 'bg-zinc-50/70 opacity-75'
                  }`}
                >
                  
                  {/* Top Bar: Reviewer info + Action buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-black flex items-center justify-center text-sm shadow-2xs shrink-0">
                        {(t.username || 'U')[0].toUpperCase()}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-black text-zinc-900">
                            @{t.username}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Terverifikasi</span>
                          </span>
                          {t.robuxPackage && (
                            <span className="text-[10px] font-extrabold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                              {t.robuxPackage}
                            </span>
                          )}
                          {t.order_code && (
                            <span className="text-[10px] font-mono text-zinc-400">
                              #{t.order_code}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          {/* Stars */}
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < (t.rating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-zinc-200 text-zinc-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span>•</span>
                          <span>{t.timeAgo || 'Baru saja'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {/* Toggle Active/Hide */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                        }`}
                        title={isActive ? 'Sembunyikan ulasan' : 'Tampilkan ulasan di web'}
                      >
                        {isActive ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tampil</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Disembunyikan</span>
                          </>
                        )}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem(t);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-pink-50 hover:text-pink-600 text-zinc-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-zinc-200/80"
                        title="Edit ulasan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Reply Button */}
                      {!t.adminReply && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(isReplying ? null : t.id);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 border border-pink-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Balas</span>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus ulasan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pl-13">
                    &ldquo;{t.comment}&rdquo;
                  </p>

                  {/* Attached Proof Image if any */}
                  {t.proofImage && (
                    <div className="pl-13 pt-1">
                      <div
                        onClick={() => setPreviewImage(t.proofImage!)}
                        className="inline-flex items-center gap-2 p-2 rounded-2xl bg-zinc-50 border border-pink-200 hover:border-pink-300 transition-all cursor-pointer group max-w-sm"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                          <img src={t.proofImage} alt="Bukti Foto" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left pr-2">
                          <span className="text-[11px] font-bold text-zinc-800 block group-hover:text-pink-600">
                            Lihat Foto Bukti Pembeli
                          </span>
                          <span className="text-[10px] text-zinc-400">Klik untuk memperbesar</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Official Reply (Rendered Bubble) */}
                  {t.adminReply && (
                    <div className="pl-13 pt-1">
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#ffeef4] to-[#fff5f8] border border-pink-200 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-pink-300 bg-pink-100 shrink-0 mt-0.5">
                            <Image src="/images/logo.jpeg" alt="Admin" fill className="object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-black text-pink-700 block">
                              {t.adminReply.adminName || 'Admin BloxyLucy Official'}
                            </span>
                            <p className="text-xs text-zinc-800 mt-0.5 leading-relaxed">
                              {t.adminReply.message}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteReply(t.id)}
                          className="text-[10px] text-zinc-400 hover:text-rose-600 font-bold transition-colors cursor-pointer shrink-0"
                          title="Hapus balasan"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Reply Input Box */}
                  {isReplying && (
                    <div className="pl-13 pt-2 space-y-2 animate-fadeIn">
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Tulis balasan resmi untuk @${t.username}... (contoh: Makasih kak sudah order!)`}
                          className="w-full p-3 rounded-2xl border border-pink-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendReply(t.id)}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-black shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim Balasan</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}

export default function AdminTestimonialsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-pink-600">Memuat manajemen testimoni...</p>
      </div>
    }>
      <TestimonialsContent />
    </Suspense>
  );
}
