'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle,
  DownloadCloud,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  FolderArchive,
  History,
  X,
  ChevronDown,
  Info
} from 'lucide-react';
import { Order, StorageRetentionStats, StorageCleanupLog } from '@/lib/admin-types';
import {
  analyzeRetentionOrders,
  downloadPaymentProofsZip,
  RETENTION_DAYS,
  WARNING_DAYS,
} from '@/lib/storage-retention';

interface StorageRetentionBannerProps {
  orders?: Order[];
  onCleanupSuccess?: () => void;
  compact?: boolean;
}

export default function StorageRetentionBanner({
  orders = [],
  onCleanupSuccess,
  compact = false,
}: StorageRetentionBannerProps) {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<StorageRetentionStats>({
    totalWithProof: 0,
    activeCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    expiringSoonOrders: [],
    expiredOrders: [],
    recentLogs: [],
  });

  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ percent: number; text: string }>({
    percent: 0,
    text: '',
  });
  const [isCleaning, setIsCleaning] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showExpiringListModal, setShowExpiringListModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch stats and analyze
  const refreshStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/cleanup-proofs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) {
          setStats(json.stats);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch cleanup stats from API, fallback to client calculation:', err);
    } finally {
      setLoading(false);
    }

    // Fallback calculation from orders prop
    if (orders && orders.length > 0) {
      const computed = analyzeRetentionOrders(orders);
      setStats((prev) => ({ ...computed, recentLogs: prev.recentLogs }));
    }
  };

  useEffect(() => {
    refreshStats();
  }, [orders.length]);

  // Handle ZIP Download for Expiring Soon (H-7)
  const handleDownloadExpiringSoon = async () => {
    const target = stats.expiringSoonOrders.length > 0
      ? stats.expiringSoonOrders
      : orders.filter((o) => {
          const ret = analyzeRetentionOrders([o]);
          return ret.expiringSoonCount > 0;
        });

    if (target.length === 0) {
      alert('Tidak ada bukti transfer yang berada dalam masa H-7 (83–90 hari).');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress({ percent: 0, text: 'Mempersiapkan gambar H-7...' });

      const dateStr = new Date().toISOString().slice(0, 10);
      const zipName = `Arsip_Bukti_H7_BloxyLucy_${dateStr}.zip`;

      const result = await downloadPaymentProofsZip(target, {
        zipFilename: zipName,
        onProgress: (percent, text) => setDownloadProgress({ percent, text }),
      });

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Berhasil mengunduh ${result.count} bukti transfer (H-7) dalam format ZIP.`,
        });
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        alert(result.error || 'Gagal mengunduh ZIP.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunduh file ZIP.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ percent: 0, text: '' });
    }
  };

  // Handle ZIP Download for All Proofs
  const handleDownloadAllProofs = async () => {
    const target = orders.filter((o) => Boolean(o.payment_proof_path));
    if (target.length === 0) {
      alert('Tidak ada bukti transfer yang tersimpan.');
      return;
    }

    try {
      setIsDownloading(true);
      setDownloadProgress({ percent: 0, text: 'Mempersiapkan seluruh gambar...' });

      const dateStr = new Date().toISOString().slice(0, 10);
      const zipName = `Semua_Bukti_Transfer_BloxyLucy_${dateStr}.zip`;

      const result = await downloadPaymentProofsZip(target, {
        zipFilename: zipName,
        onProgress: (percent, text) => setDownloadProgress({ percent, text }),
      });

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Berhasil mengunduh ${result.count} seluruh bukti transfer dalam format ZIP.`,
        });
        setTimeout(() => setStatusMessage(null), 5000);
      } else {
        alert(result.error || 'Gagal mengunduh ZIP.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Terjadi kesalahan saat mengunduh file ZIP.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress({ percent: 0, text: '' });
    }
  };

  // Handle Safe Cleanup (> 90 Days)
  const handleExecuteCleanup = async () => {
    setShowConfirmModal(false);
    setIsCleaning(true);
    try {
      const res = await fetch('/api/admin/cleanup-proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'manual', executed_by: 'admin_manual' }),
      });

      const json = await res.json();
      if (json.success) {
        setStatusMessage({
          type: 'success',
          text: json.message || `Berhasil membersihkan ${json.cleaned_count} bukti transfer lama.`,
        });
        await refreshStats();
        if (onCleanupSuccess) onCleanupSuccess();
        setTimeout(() => setStatusMessage(null), 6000);
      } else {
        setStatusMessage({
          type: 'error',
          text: json.error || 'Gagal menjalankan pembersihan.',
        });
      }
    } catch (err: any) {
      console.error('Execute cleanup error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan jaringan.',
      });
    } finally {
      setIsCleaning(false);
    }
  };

  const hasExpiringSoon = stats.expiringSoonCount > 0;
  const hasExpired = stats.expiredCount > 0;

  // If no warnings and compact mode requested, show clean status indicator
  if (!hasExpiringSoon && !hasExpired && compact) {
    return (
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-pink-100 shadow-2xs text-xs">
        <div className="flex items-center gap-2 text-zinc-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Retensi Penyimpanan: <strong>{stats.totalWithProof} bukti aktif</strong> (Maks 90 hari)</span>
        </div>
        <button
          onClick={handleDownloadAllProofs}
          disabled={isDownloading || stats.totalWithProof === 0}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>Download Semua ZIP</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl transition-all space-y-3">
      {/* Toast Alert Message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-xs animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Retention Banner Card */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all ${
          hasExpiringSoon || hasExpired
            ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-pink-50/80 border-amber-200/80 shadow-xs'
            : 'bg-white border-pink-100/90 shadow-2xs'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          
          {/* Left info column */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {hasExpiringSoon ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>PERINGATAN H-7 RETENSI STORAGE</span>
                </div>
              ) : hasExpired ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>BUKTI KEDALUWARSA (&gt; 90 HARI)</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black tracking-wider uppercase shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>STATUS STORAGE AMAN</span>
                </div>
              )}

              <span className="text-[11px] text-zinc-500 font-bold">
                Kebijakan Retensi: 90 Hari (Auto-Cleanup)
              </span>
            </div>

            <div>
              <h3 className="text-sm sm:text-base font-black text-zinc-900 tracking-tight">
                {hasExpiringSoon
                  ? `Terdapat ${stats.expiringSoonCount} Bukti Transfer yang Akan Dihapus dalam 7 Hari`
                  : hasExpired
                  ? `Terdapat ${stats.expiredCount} Bukti Transfer yang Melewati 90 Hari`
                  : `Kapasitas Storage Terkelola (${stats.totalWithProof} Bukti Aktif)`}
              </h3>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-0.5 max-w-2xl">
                {hasExpiringSoon
                  ? 'Foto bukti transfer yang berumur 83–90 hari akan otomatis dibersihkan pada hari ke-90. Unduh arsip ZIP di bawah ini jika ingin mencadangkan foto sebelum terhapus.'
                  : hasExpired
                  ? 'Foto bukti transfer telah melewati 90 hari. Anda dapat menjalankan pembersihan untuk mengosongkan storage database tanpa menghilangkan riwayat data pesanan.'
                  : 'Seluruh foto bukti transfer baru akan tersimpan selama 90 hari. Sistem akan otomatis memunculkan peringatan H-7 sebelum bukti dihapus.'}
              </p>
            </div>

            {/* Micro stats counter */}
            <div className="flex items-center gap-4 pt-1 text-[11px] font-semibold text-zinc-600 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Aktif: <strong>{stats.activeCount}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>H-7 Expiring: <strong>{stats.expiringSoonCount}</strong></span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Expired (&gt;90d): <strong>{stats.expiredCount}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setShowLogsModal(true)}
                className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 underline font-bold cursor-pointer ml-auto sm:ml-0"
              >
                <History className="w-3.5 h-3.5" />
                <span>Riwayat Cleanup</span>
              </button>
            </div>
          </div>

          {/* Right action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
            
            {/* Primary Action Button: Download ZIP H-7 */}
            {hasExpiringSoon && (
              <button
                type="button"
                onClick={handleDownloadExpiringSoon}
                disabled={isDownloading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Unduh ZIP H-7 ({stats.expiringSoonCount})</span>
              </button>
            )}

            {/* Download All ZIP Option */}
            <button
              type="button"
              onClick={handleDownloadAllProofs}
              disabled={isDownloading || stats.totalWithProof === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-pink-200 hover:bg-pink-50/80 text-zinc-800 font-bold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FolderArchive className="w-4 h-4 text-pink-600" />
              <span>Unduh Semua ZIP</span>
            </button>

            {/* Cleanup Expired Proofs Button (Fallback / Manual) */}
            {hasExpired && (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={isCleaning}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Bersihkan ({stats.expiredCount})</span>
              </button>
            )}

            {/* Refresh Stats Button */}
            <button
              type="button"
              onClick={refreshStats}
              disabled={loading}
              title="Perbarui Status"
              className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

          </div>

        </div>

        {/* Live ZIP Generation Progress Bar */}
        {isDownloading && (
          <div className="mt-4 pt-4 border-t border-amber-200/60 space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>{downloadProgress.text || 'Sedang membuat arsip ZIP...'}</span>
              </span>
              <span className="text-amber-700">{downloadProgress.percent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-pink-500 transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress.percent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Confirm Manual Cleanup (Rendered via Portal to document.body) */}
      {showConfirmModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirmModal(false);
          }}
          className="fixed inset-0 z-[99999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-pink-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-zinc-900">Konfirmasi Pembersihan</h3>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-pink-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-center">
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Tindakan ini akan mengosongkan foto bukti transfer pada <strong className="text-zinc-900">{stats.expiredCount} pesanan</strong> yang usianya sudah lebih dari 90 hari.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-pink-100/80 text-left text-xs space-y-1.5 text-zinc-600">
              <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Data Transaksi 100% Tetap Aman:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-500 pl-1">
                <li>Nomor Order, Akun Roblox & Harga TIDAK dihapus.</li>
                <li>Laporan pembukuan & riwayat status tetap utuh.</li>
                <li>Foto ulasan testimoni TIDAK disentuh (permanen).</li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-zinc-200 text-zinc-700 font-bold text-xs hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteCleanup}
                className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Ya, Bersihkan Foto
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: Cleanup Audit Logs (Rendered via Portal to document.body) */}
      {showLogsModal && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogsModal(false);
          }}
          className="fixed inset-0 z-[99999] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 transition-all animate-fadeIn"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-pink-100 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-zinc-900">Riwayat Log Pembersihan Storage</h3>
              </div>
              <button
                onClick={() => setShowLogsModal(false)}
                className="w-8 h-8 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-pink-50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
              {stats.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-zinc-50 border border-pink-100/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-zinc-900 text-xs">
                        {log.cleaned_count} Bukti Foto Dibersihkan
                      </span>
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-[10px] font-black uppercase">
                        {log.mode}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Waktu: {new Date(log.created_at).toLocaleString('id-ID')} • Eksekutor: {log.executed_by || 'system'}
                    </p>
                    {log.order_codes && log.order_codes.length > 0 && (
                      <div className="text-[10px] text-zinc-400 truncate pt-0.5">
                        Kode Order: {log.order_codes.slice(0, 5).join(', ')}
                        {log.order_codes.length > 5 ? ` (+${log.order_codes.length - 5} lainnya)` : ''}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto text-xl">
                    📁
                  </div>
                  <p className="text-xs font-bold text-zinc-500">Belum ada riwayat pembersihan yang tercatat.</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-pink-100/80">
              <button
                type="button"
                onClick={() => setShowLogsModal(false)}
                className="w-full py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
