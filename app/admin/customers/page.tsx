'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';
import { Customer } from '@/lib/admin-types';
import { getCustomers, toggleCustomerBlacklist } from '@/lib/supabase-service';

function CustomersContent() {
  const searchParams = useSearchParams();
  const isBlacklistPage = searchParams.get('tab') === 'blacklist';

  const [mounted, setMounted] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualUsername, setManualUsername] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualRobloxUserId, setManualRobloxUserId] = useState('');
  const [manualReason, setManualReason] = useState('Indikasi penipuan atau penyalahgunaan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBlacklist = async (cust: Customer) => {
    const action = cust.is_blacklisted ? 'membuka blokir' : 'mem-blacklist';
    if (confirm(`Apakah Anda yakin ingin ${action} akun @${cust.roblox_username}?`)) {
      setLoading(true);
      try {
        await toggleCustomerBlacklist(cust, cust.roblox_username);
        await loadData();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddManualBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUsername.trim()) {
      alert('Mohon masukkan username Roblox');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roblox_username: manualUsername.trim(),
          phone: manualPhone.trim() || undefined,
          roblox_user_id: manualRobloxUserId.trim() || undefined,
          is_blacklisted: true,
          reason: manualReason.trim() || 'Indikasi penipuan atau penyalahgunaan',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setManualUsername('');
        setManualPhone('');
        setManualRobloxUserId('');
        await loadData();
      } else {
        alert(json.error || 'Gagal menambahkan blacklist');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num).replace('Rp', 'Rp ');
  };

  // Filter strictly based on active page type
  const filtered = customers.filter((c) => {
    if (isBlacklistPage) {
      if (!c.is_blacklisted) return false;
    } else {
      if (c.is_blacklisted) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.roblox_username.toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Header (Dedicated per page) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
            {isBlacklistPage ? 'Daftar Blacklist' : 'Daftar Pelanggan'}
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            {isBlacklistPage
              ? 'Daftar akun pelanggan yang diblokir karena indikasi penipuan atau penyalahgunaan'
              : 'Kelola seluruh data akun pelanggan aktif dan riwayat belanja Robux'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isBlacklistPage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-black shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Blacklist</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Manual Blacklist Modal */}
      {showAddModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          className="fixed inset-0 z-[99999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-rose-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-zinc-900">
                  Tambah Akun ke Blacklist
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddManualBlacklist} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  Username Roblox
                </label>
                <input
                  type="text"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  required
                  placeholder="Contoh: APG_Channel11"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 bg-[#fffdfd]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  Nomor WhatsApp (Opsional)
                </label>
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  placeholder="Contoh: 087816959979 atau 628..."
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 bg-[#fffdfd] font-mono"
                />
                <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                  Nomor WhatsApp ini juga akan langsung diblokir saat checkout.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  ID Roblox (Opsional)
                </label>
                <input
                  type="text"
                  value={manualRobloxUserId}
                  onChange={(e) => setManualRobloxUserId(e.target.value)}
                  placeholder="Contoh: 1350738735 (jika diketahui)"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 bg-[#fffdfd] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-zinc-700 mb-1.5">
                  Alasan Pemblokiran
                </label>
                <input
                  type="text"
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer palsu / spam pesanan"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-rose-200 text-sm font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 bg-[#fffdfd]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-rose-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-black shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Blokir Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Customer List Card */}
      <div className="bg-white rounded-3xl border border-pink-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isBlacklistPage ? 'Cari akun blacklist...' : 'Cari username atau email pelanggan...'}
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-pink-200 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          <span className="text-xs font-bold text-zinc-400">
            Menampilkan {filtered.length} {isBlacklistPage ? 'akun blacklist' : 'pelanggan'}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-500">Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
              {isBlacklistPage ? (
                <ShieldCheck className="w-6 h-6 text-pink-500" />
              ) : (
                <Users className="w-6 h-6 text-pink-500" />
              )}
            </div>
            <p className="text-sm font-bold text-zinc-700">
              {isBlacklistPage
                ? 'Tidak ada pelanggan yang di-blacklist saat ini'
                : 'Belum ada data pelanggan'}
            </p>
            {search && (
              <p className="text-xs text-zinc-400">Tidak ada hasil yang cocok dengan &quot;{search}&quot;</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-pink-100/60">
            {filtered.map((cust) => (
              <div
                key={cust.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-pink-50/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-black text-pink-600">
                      @{cust.roblox_username}
                    </span>
                    {cust.is_blacklisted && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">
                        BLACKLISTED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 flex-wrap">
                    <span className="font-mono">
                      ID:{' '}
                      {cust.roblox_user_id ? (
                        <span className="text-zinc-800 font-bold">{cust.roblox_user_id}</span>
                      ) : (
                        <span className="text-zinc-400 italic">Belum terdata</span>
                      )}
                    </span>
                    <span>•</span>
                    <span>
                      WA:{' '}
                      {cust.phone ? (
                        <a
                          href={`https://wa.me/${cust.phone.replace(/\D/g, '').replace(/^0/, '62')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          {cust.phone}
                        </a>
                      ) : (
                        <span className="text-zinc-400 italic">Belum terdata</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-black text-zinc-900">
                      {cust.total_orders || 0} Pesanan
                    </div>
                    <div className="text-xs font-bold text-pink-600">
                      Total: {formatRupiah(cust.total_spent || 0)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBlacklist(cust)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      cust.is_blacklisted
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {cust.is_blacklisted ? 'Buka Blokir' : 'Blacklist'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-bold text-pink-600">Memuat data pelanggan...</p>
      </div>
    }>
      <CustomersContent />
    </Suspense>
  );
}
