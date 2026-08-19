'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Customer } from '@/lib/admin-types';
import { getCustomers, toggleCustomerBlacklist } from '@/lib/supabase-service';

function CustomersContent() {
  const searchParams = useSearchParams();
  const isBlacklistPage = searchParams.get('tab') === 'blacklist';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const handleToggleBlacklist = async (id: string) => {
    await toggleCustomerBlacklist(id);
    await loadData();
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

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 text-xs font-bold shadow-2xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

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
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto text-xl">
              {isBlacklistPage ? '🛡️' : '👥'}
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
                    onClick={() => handleToggleBlacklist(cust.id)}
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
