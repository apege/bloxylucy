'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Settings,
  Save,
  MessageCircle,
  QrCode,
  Store,
  CheckCircle2,
  Image as ImageIcon,
  UploadCloud,
  Eye,
  Sparkles,
  Flame,
  Clock,
  Zap,
  Tag,
  Calendar,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react';
import { StoreSettings } from '@/lib/admin-types';
import { getStoreSettings, saveStoreSettings, INITIAL_MOCK_SETTINGS } from '@/lib/supabase-service';
import CustomDateTimePicker from '../components/CustomDateTimePicker';
import { compressImageToWebP } from '@/app/components/imageCompressor';

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_MOCK_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Collapsible accordion states for each section (default closed on initial load)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    identity: false,
    promo: false,
    media: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAnyOpen = Object.values(openSections).some(Boolean);
  const toggleAllSections = () => {
    const next = !isAnyOpen;
    setOpenSections({
      identity: next,
      promo: next,
      media: next,
    });
  };

  // Formatted price strings for auto-dots
  const [formattedDiscountPrice, setFormattedDiscountPrice] = useState('45.000');
  const [formattedRobuxAmount, setFormattedRobuxAmount] = useState('2.200');

  // Drag & drop states
  const [isDraggingQris, setIsDraggingQris] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);

  const qrisInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const formatNumberWithDots = (val: number | string) => {
    const digits = val.toString().replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('id-ID');
  };

  const parseNumberFromDots = (val: string) => {
    return Number(val.replace(/\./g, '')) || 0;
  };

  const [previewTimeLeft, setPreviewTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getStoreSettings();
        if (data) {
          setSettings(data);
          if (data.promo_discount_price) {
            setFormattedDiscountPrice(formatNumberWithDots(data.promo_discount_price));
          }
          if (data.promo_robux_amount) {
            setFormattedRobuxAmount(formatNumberWithDots(data.promo_robux_amount));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Live countdown calculation for the preview card
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!settings.promo_end_date) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const diff = new Date(settings.promo_end_date).getTime() - new Date().getTime();
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return { days, hours, minutes, seconds };
    };

    setPreviewTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setPreviewTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [settings.promo_end_date]);

  const handleFileProcess = async (file: File, target: 'qris' | 'logo' | 'banner') => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon upload file gambar (PNG, JPG, JPEG, WEBP).');
      return;
    }
    try {
      const compressed = await compressImageToWebP(file, 1600, 1600, 0.85);
      if (target === 'qris') {
        setSettings((prev) => ({ ...prev, qris_image_path: compressed.dataUrl }));
      } else if (target === 'logo') {
        setSettings((prev) => ({ ...prev, logo_image_path: compressed.dataUrl }));
      } else {
        setSettings((prev) => ({ ...prev, banner_image_path: compressed.dataUrl }));
      }
    } catch (err) {
      console.error('Compression fallback:', err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (target === 'qris') {
          setSettings((prev) => ({ ...prev, qris_image_path: result }));
        } else if (target === 'logo') {
          setSettings((prev) => ({ ...prev, logo_image_path: result }));
        } else {
          setSettings((prev) => ({ ...prev, banner_image_path: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isPromoActive = Boolean(settings.promo_active ?? true);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: StoreSettings = {
        ...settings,
        promo_active: isPromoActive,
        promo_discount_price: parseNumberFromDots(formattedDiscountPrice),
        promo_robux_amount: parseNumberFromDots(formattedRobuxAmount),
      };
      await saveStoreSettings(payload);
      setToastMessage('Pengaturan toko & promo banner berhasil disimpan!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-zinc-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2.5 border border-zinc-700 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header with Collapse All Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            Pengaturan Toko &amp; Banner
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Konfigurasi identitas toko, nomor WhatsApp CS, barcode QRIS, dan banner promo pelanggan
          </p>
        </div>

        {/* Buka/Tutup Semua Toggle Button */}
        <button
          type="button"
          onClick={toggleAllSections}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 border border-pink-200 text-pink-600 text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" />
          <span>{isAnyOpen ? 'Tutup Semua Section' : 'Buka Semua Section'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">

        {/* SECTION 1: Identitas Toko & CS (Collapsible) */}
        <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden transition-all">
          {/* Header Button */}
          <div
            onClick={() => toggleSection('identity')}
            className="flex items-center justify-between p-5 sm:p-6 cursor-pointer hover:bg-pink-50/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shadow-2xs shrink-0">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                  Identitas Toko &amp; Kontak
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Nama toko di navbar pelanggan dan nomor WhatsApp CS
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {!openSections.identity && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-[10px] font-bold text-pink-700 border border-pink-100">
                  <span>{settings.store_name || 'BloxyLucy'}</span>
                  <span>•</span>
                  <span>WA: {settings.whatsapp_number || '-'}</span>
                </div>
              )}
              <div className={`w-7 h-7 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center transition-transform duration-300 ${
                openSections.identity ? 'rotate-180 bg-pink-100' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Collapsible Content */}
          {openSections.identity && (
            <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-pink-100/60 animate-fadeIn space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                {/* Nama Toko */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-zinc-800">
                    Nama Toko (Navbar Pelanggan)
                  </label>
                  <input
                    type="text"
                    value={settings.store_name}
                    onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                    required
                    placeholder="Contoh: BloxyLucy Top Up Robux"
                    className="w-full p-3 rounded-2xl border border-pink-200 text-xs sm:text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-[#fffcfd]"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Tampil di navbar web utama (Bloxy berwarna pink, Lucy hitam).
                  </p>
                </div>

                {/* Nomor WhatsApp Admin CS */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-zinc-800">
                    Nomor WhatsApp Admin CS (Format 62...)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    required
                    placeholder="Contoh: 6287816959979"
                    className="w-full p-3 rounded-2xl border border-pink-200 text-xs sm:text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono bg-[#fffcfd]"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Tujuan konfirmasi order dan tombol bantuan CS pelanggan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: PROMO BANNER PELANGGAN (Collapsible) */}
        <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden transition-all">
          {/* Header Button */}
          <div
            onClick={() => toggleSection('promo')}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-3 cursor-pointer hover:bg-pink-50/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-2xs shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                  Pengaturan Promo Banner Web Pelanggan
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Atur paket promo yang muncul pada banner hero bagian atas website toko
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {!openSections.promo && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-[10px] font-bold text-pink-700 border border-pink-100">
                  <span>{isPromoActive ? 'Promo Aktif' : 'Promo Nonaktif'}</span>
                  {isPromoActive && (
                    <>
                      <span>•</span>
                      <span>{formattedRobuxAmount || '2.200'} Robux (Rp {formattedDiscountPrice || '45.000'})</span>
                    </>
                  )}
                </div>
              )}

              {/* Toggle Switch */}
              <label
                onClick={(e) => e.stopPropagation()}
                className="relative inline-flex items-center cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={isPromoActive}
                  onChange={(e) => setSettings({ ...settings, promo_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                <span className="ml-2 text-xs font-black text-zinc-800 hidden xs:inline">
                  {isPromoActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </label>

              <div className={`w-7 h-7 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center transition-transform duration-300 ${
                openSections.promo ? 'rotate-180 bg-pink-100' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Collapsible Content */}
          {openSections.promo && (
            <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-pink-100/60 animate-fadeIn">
              {isPromoActive ? (
                <div className="space-y-5">
                  
                  {/* Form Input Promo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Promo Tag */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Promo Tag (Pill Kiri)
                      </label>
                      <input
                        type="text"
                        value={settings.promo_tag || ''}
                        onChange={(e) => setSettings({ ...settings, promo_tag: e.target.value })}
                        placeholder="Contoh: PROMO SPESIAL BULAN INI"
                        className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>

                    {/* Promo Badge */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Promo Badge (Tag Merah)
                      </label>
                      <input
                        type="text"
                        value={settings.promo_badge || ''}
                        onChange={(e) => setSettings({ ...settings, promo_badge: e.target.value })}
                        placeholder="Contoh: LIMITED STOCK"
                        className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>

                    {/* Promo Title */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Judul Promo Banner
                      </label>
                      <input
                        type="text"
                        value={settings.promo_title || ''}
                        onChange={(e) => setSettings({ ...settings, promo_title: e.target.value })}
                        placeholder="Contoh: ROBUX BULAN INI"
                        className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Subjudul / Deskripsi Singkat
                      </label>
                      <input
                        type="text"
                        value={settings.promo_subtitle || ''}
                        onChange={(e) => setSettings({ ...settings, promo_subtitle: e.target.value })}
                        placeholder="Top Up Robux Instant, Cepat, Legal..."
                        className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>

                    {/* Nominal Robux Promo */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Nominal Robux Promo
                      </label>
                      <input
                        type="text"
                        value={formattedRobuxAmount}
                        onChange={(e) => setFormattedRobuxAmount(formatNumberWithDots(e.target.value))}
                        placeholder="Contoh: 2.200"
                        className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono"
                      />
                    </div>

                    {/* Label Harga Asli (Coret) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Label Asli (Tercoret)
                      </label>
                      <input
                        type="text"
                        value={settings.promo_original_label || ''}
                        onChange={(e) => setSettings({ ...settings, promo_original_label: e.target.value })}
                        placeholder="Contoh: 2.000 Robux atau Rp 50.000"
                        className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                    </div>

                    {/* Harga Diskon Promo (Rp) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Harga Promo (Rp)
                      </label>
                      <input
                        type="text"
                        value={formattedDiscountPrice}
                        onChange={(e) => setFormattedDiscountPrice(formatNumberWithDots(e.target.value))}
                        placeholder="Contoh: 45.000"
                        className="w-full p-2.5 rounded-xl border border-pink-200 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-pink-300 font-mono text-pink-600"
                      />
                    </div>

                    {/* Tanggal Berakhir Countdown (Custom DateTime Picker) */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-extrabold text-zinc-800">
                        Waktu Berakhir Promo (Countdown Timer)
                      </label>
                      <CustomDateTimePicker
                        value={settings.promo_end_date || ''}
                        onChange={(isoString) => setSettings({ ...settings, promo_end_date: isoString })}
                      />
                    </div>

                    {/* Upload Foto Banner Promo */}
                    <div className="space-y-3 sm:col-span-2 pt-2 border-t border-pink-100/80">
                      <div>
                        <label className="block text-xs font-extrabold text-zinc-800 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-pink-500" />
                          <span>Foto / Background Banner Promo (Hero Web Pelanggan)</span>
                        </label>
                        <p className="text-[11px] text-zinc-400 font-medium">
                          Upload foto ilustrasi atau background banner promo yang akan muncul pada card pink promo di header website pelanggan
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                        
                        {/* Left: Drag & Drop Card */}
                        <div className="p-4 rounded-2xl bg-zinc-50/70 border border-pink-100 flex flex-col justify-between space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-zinc-600 flex items-center gap-1.5">
                              <UploadCloud className="w-3.5 h-3.5 text-pink-500" />
                              <span>Upload Banner Baru</span>
                            </span>
                            <span className="text-[10px] font-bold text-zinc-400">PNG / JPG / WEBP</span>
                          </div>

                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDraggingBanner(true);
                            }}
                            onDragLeave={() => setIsDraggingBanner(false)}
                            onDrop={(e) => {
                              e.preventDefault();
                              setIsDraggingBanner(false);
                              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleFileProcess(e.dataTransfer.files[0], 'banner');
                              }
                            }}
                            onClick={() => bannerInputRef.current?.click()}
                            className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center h-44 flex-1 ${
                              isDraggingBanner
                                ? 'border-pink-500 bg-pink-50/90 scale-[1.01]'
                                : 'border-pink-200 bg-white hover:bg-pink-50/30 hover:border-pink-300'
                            }`}
                          >
                            <input
                              ref={bannerInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleFileProcess(e.target.files[0], 'banner');
                                }
                              }}
                              className="hidden"
                            />
                            <div className="w-10 h-10 rounded-xl bg-pink-100/70 text-pink-600 flex items-center justify-center mb-1">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-black text-pink-600 block">
                              Upload Foto Banner Promo
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              Tarik banner ke sini atau klik browse
                            </span>
                          </div>
                        </div>

                        {/* Right: Live Preview Card */}
                        <div className="p-4 rounded-2xl bg-zinc-50/70 border border-pink-100 flex flex-col justify-between space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-extrabold text-zinc-600 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-pink-500" />
                              <span>Preview Foto Banner</span>
                            </span>
                            {settings.banner_image_path && (
                              <button
                                type="button"
                                onClick={() => setSettings({ ...settings, banner_image_path: '' })}
                                className="text-[10px] text-zinc-400 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                              >
                                Hapus Foto
                              </button>
                            )}
                          </div>

                          <div className="w-full h-44 rounded-xl bg-white border border-pink-100 flex items-center justify-center p-2 overflow-hidden flex-1 relative">
                            {settings.banner_image_path ? (
                              <img
                                src={settings.banner_image_path}
                                alt="Preview Banner Promo"
                                className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
                              />
                            ) : (
                              <div className="text-center space-y-1">
                                <ImageIcon className="w-6 h-6 text-zinc-300 mx-auto" />
                                <span className="text-xs font-bold text-zinc-400 block">Belum ada foto banner</span>
                                <span className="text-[10px] text-zinc-300">Tampilan default background pink</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Path text input fallback */}
                      <div>
                        <input
                          type="text"
                          value={settings.banner_image_path || ''}
                          onChange={(e) => setSettings({ ...settings, banner_image_path: e.target.value })}
                          placeholder="/images/pricelist.jpeg atau URL gambar banner promo"
                          className="w-full px-3.5 py-2 rounded-xl border border-pink-100 text-[11px] font-mono text-zinc-600 focus:outline-none focus:border-pink-300 bg-white"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Live Preview Box of Promo Banner */}
                  <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-200/80 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-pink-700">
                      <Eye className="w-4 h-4 text-pink-600" />
                      <span>Preview Tampilan Banner Promo Pelanggan</span>
                    </div>

                    <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#ffeef4] via-[#fff8fa] to-[#fff3f6] border border-pink-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                      {/* Banner Image Background in Preview */}
                      {settings.banner_image_path && (
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl pointer-events-none">
                          <img
                            src={settings.banner_image_path}
                            alt="Banner Background Preview"
                            className="w-full h-full object-cover object-center opacity-75 transition-opacity duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-[#ffeef4]/95 via-[#ffeef4]/80 to-[#ffeef4]/30 sm:bg-gradient-to-r sm:from-[#ffeef4]/95 sm:via-[#ffeef4]/80 sm:to-[#ffeef4]/30" />
                        </div>
                      )}

                      <div className="relative z-10 space-y-2 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white border border-pink-200 text-pink-700 text-[10px] font-bold shadow-2xs">
                          <span>{settings.promo_tag || 'PROMO SPESIAL BULAN INI'}</span>
                          <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold">
                            {settings.promo_badge || 'LIMITED STOCK'}
                          </span>
                        </div>

                        <h4 className="text-xl font-black text-zinc-900 tracking-tight">
                          {settings.promo_title || 'ROBUX BULAN INI'}
                        </h4>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-zinc-900">
                            {formattedRobuxAmount || '2.200'} ROBUX
                          </span>
                          {settings.promo_original_label && (
                            <span className="text-xs text-zinc-400 line-through font-semibold">
                              {settings.promo_original_label}
                            </span>
                          )}
                          <span className="text-lg font-black text-pink-600">
                            Rp {formattedDiscountPrice || '45.000'}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10 px-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-center space-y-1.5 shrink-0 shadow-xs">
                        <span className="text-[9px] font-bold text-pink-600 uppercase tracking-wider flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" /> PROMO BERAKHIR DALAM
                        </span>
                        <div className="grid grid-cols-4 gap-1.5 text-center font-mono font-black text-xs text-zinc-900">
                          <div className="bg-pink-50/70 px-2 py-1 rounded-lg border border-pink-100 min-w-[36px]">
                            <span className="block text-pink-600 text-xs font-black">{previewTimeLeft.days.toString().padStart(2, '0')}</span>
                            <span className="text-[8px] text-zinc-400 font-sans font-bold">HARI</span>
                          </div>
                          <div className="bg-pink-50/70 px-2 py-1 rounded-lg border border-pink-100 min-w-[36px]">
                            <span className="block text-pink-600 text-xs font-black">{previewTimeLeft.hours.toString().padStart(2, '0')}</span>
                            <span className="text-[8px] text-zinc-400 font-sans font-bold">JAM</span>
                          </div>
                          <div className="bg-pink-50/70 px-2 py-1 rounded-lg border border-pink-100 min-w-[36px]">
                            <span className="block text-pink-600 text-xs font-black">{previewTimeLeft.minutes.toString().padStart(2, '0')}</span>
                            <span className="text-[8px] text-zinc-400 font-sans font-bold">MNT</span>
                          </div>
                          <div className="bg-pink-50/70 px-2 py-1 rounded-lg border border-pink-100 min-w-[36px]">
                            <span className="block text-rose-600 text-xs font-black animate-pulse">{previewTimeLeft.seconds.toString().padStart(2, '0')}</span>
                            <span className="text-[8px] text-zinc-400 font-sans font-bold">DTK</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-2 py-6">
                  <p className="text-xs font-bold text-zinc-700">
                    Promo banner saat ini sedang dinonaktifkan.
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                    Banner di halaman utama pelanggan akan otomatis menyesuaikan diri menampilkan teks sambutan ramah, benefit layanan resmi, dan badge terpercaya tanpa harga promo / countdown.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 3: QRIS & LOGO (Collapsible) */}
        <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden transition-all">
          {/* Header Button */}
          <div
            onClick={() => toggleSection('media')}
            className="flex items-center justify-between p-5 sm:p-6 cursor-pointer hover:bg-pink-50/30 transition-colors select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center shadow-2xs shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                  Barcode QRIS &amp; Logo Toko
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Barcode pembayaran QRIS otomatis dan logo storefront toko
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {!openSections.media && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-50 text-[10px] font-bold text-pink-700 border border-pink-100">
                  <span>QRIS: {settings.qris_image_path ? 'Terpasang' : 'Default'}</span>
                  <span>•</span>
                  <span>Logo: {settings.logo_image_path ? 'Terpasang' : 'Default'}</span>
                </div>
              )}
              <div className={`w-7 h-7 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center transition-transform duration-300 ${
                openSections.media ? 'rotate-180 bg-pink-100' : ''
              }`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Collapsible Content */}
          {openSections.media && (
            <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-pink-100/60 animate-fadeIn space-y-6">
              {/* QRIS Upload */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-800 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-pink-500" />
                    <span>Gambar QRIS Pembayaran</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Upload barcode QRIS toko untuk menerima pembayaran otomatis dari website
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  
                  {/* Left: Drag & Drop Card */}
                  <div className="p-4 rounded-2xl bg-zinc-50/70 border border-pink-100 flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-zinc-600 flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-pink-500" />
                        <span>Upload QRIS Baru</span>
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">PNG / JPG / WEBP</span>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingQris(true);
                      }}
                      onDragLeave={() => setIsDraggingQris(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingQris(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileProcess(e.dataTransfer.files[0], 'qris');
                        }
                      }}
                      onClick={() => qrisInputRef.current?.click()}
                      className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center h-44 flex-1 ${
                        isDraggingQris
                          ? 'border-pink-500 bg-pink-50/90 scale-[1.01]'
                          : 'border-pink-200 bg-white hover:bg-pink-50/30 hover:border-pink-300'
                      }`}
                    >
                      <input
                        ref={qrisInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileProcess(e.target.files[0], 'qris');
                          }
                        }}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-xl bg-pink-100/70 text-pink-600 flex items-center justify-center mb-1">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-pink-600 block">
                        Upload Barcode QRIS
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Tarik gambar ke sini atau klik browse
                      </span>
                    </div>
                  </div>

                  {/* Right: Live Preview Card */}
                  <div className="p-4 rounded-2xl bg-zinc-50/70 border border-pink-100 flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-zinc-600 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-pink-500" />
                        <span>Live Preview QRIS</span>
                      </span>
                      {settings.qris_image_path && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, qris_image_path: '/images/qris.webp' })}
                          className="text-[10px] text-zinc-400 hover:text-pink-600 font-bold transition-colors cursor-pointer"
                        >
                          Reset Default
                        </button>
                      )}
                    </div>

                    <div className="w-full h-44 rounded-xl bg-white border border-pink-100 flex items-center justify-center p-2 overflow-hidden flex-1">
                      {settings.qris_image_path ? (
                        <img
                          src={settings.qris_image_path}
                          alt="Preview QRIS"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold text-zinc-400">Belum ada QRIS</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Path text input fallback */}
                <div>
                  <input
                    type="text"
                    value={settings.qris_image_path || ''}
                    onChange={(e) => setSettings({ ...settings, qris_image_path: e.target.value })}
                    placeholder="/images/qris.webp atau URL gambar"
                    className="w-full px-3.5 py-2 rounded-xl border border-pink-100 text-[11px] font-mono text-zinc-600 focus:outline-none focus:border-pink-300 bg-white"
                  />
                </div>
              </div>

              {/* Logo Toko Upload */}
              <div className="space-y-3 pt-4 border-t border-pink-100">
                <div>
                  <label className="block text-xs font-extrabold text-zinc-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-pink-500" />
                    <span>Logo Toko (Navbar Pelanggan)</span>
                  </label>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Upload logo bundar toko yang akan muncul di navbar storefront pelanggan
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  
                  {/* Left: Drag & Drop Card */}
                  <div className="p-4 rounded-2xl bg-zinc-50/70 border border-pink-100 flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-zinc-600 flex items-center gap-1.5">
                        <UploadCloud className="w-3.5 h-3.5 text-pink-500" />
                        <span>Upload Logo Baru</span>
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">PNG / JPG / WEBP</span>
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingLogo(true);
                      }}
                      onDragLeave={() => setIsDraggingLogo(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingLogo(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileProcess(e.dataTransfer.files[0], 'logo');
                        }
                      }}
                      onClick={() => logoInputRef.current?.click()}
                      className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center h-44 flex-1 ${
                        isDraggingLogo
                          ? 'border-pink-500 bg-pink-50/90 scale-[1.01]'
                          : 'border-pink-200 bg-white hover:bg-pink-50/30 hover:border-pink-300'
                      }`}
                    >
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileProcess(e.target.files[0], 'logo');
                          }
                        }}
                        className="hidden"
                      />
                      <div className="w-10 h-10 rounded-xl bg-pink-100/70 text-pink-600 flex items-center justify-center mb-1">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-pink-600 block">
                        Upload Logo Toko
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        Tarik logo ke sini atau klik browse
                      </span>
                    </div>
                  </div>

                  {/* Right: Live Preview Card */}
                  <div className="p-4 rounded-2xl bg-zinc-50/70 border border-pink-100 flex flex-col justify-between space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-zinc-600 flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-pink-500" />
                        <span>Live Preview Logo</span>
                      </span>
                      {settings.logo_image_path && (
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, logo_image_path: '/images/logo.jpeg' })}
                          className="text-[10px] text-zinc-400 hover:text-pink-600 font-bold transition-colors cursor-pointer"
                        >
                          Reset Default
                        </button>
                      )}
                    </div>

                    <div className="w-full h-44 rounded-xl bg-white border border-pink-100 flex items-center justify-center gap-3.5 p-3 flex-1">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-pink-300 bg-pink-50 shadow-sm shrink-0">
                        {settings.logo_image_path ? (
                          <img
                            src={settings.logo_image_path}
                            alt="Preview Logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">👑</div>
                        )}
                      </div>
                      <div className="text-left space-y-0.5">
                        <span className="text-xs font-black text-pink-600 block">
                          {settings.store_name || 'BloxyLucy'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium block">
                          Tampil di Navbar Toko
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Path text input fallback */}
                <div>
                  <input
                    type="text"
                    value={settings.logo_image_path || ''}
                    onChange={(e) => setSettings({ ...settings, logo_image_path: e.target.value })}
                    placeholder="/images/logo.jpeg atau URL gambar"
                    className="w-full px-3.5 py-2 rounded-xl border border-pink-100 text-[11px] font-mono text-zinc-600 focus:outline-none focus:border-pink-300 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-black shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan Pengaturan...' : 'Simpan Semua Pengaturan'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
