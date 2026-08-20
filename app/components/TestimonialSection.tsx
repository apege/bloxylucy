'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { INITIAL_TESTIMONIALS, Testimonial } from './data';
import { 
  Star, 
  Send, 
  CheckCircle, 
  CheckCircle2,
  ShieldCheck, 
  UploadCloud, 
  FileCheck, 
  X,
  Zap,
  Lock,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { compressImageToWebP, CompressionResult } from './imageCompressor';

interface VerifiedOrder {
  order_code: string;
  roblox_username: string;
  robux: number;
  order_status: string;
}

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  
  // Review Token Verification State
  const [reviewToken, setReviewToken] = useState<string | null>(null);
  const [verifiedOrder, setVerifiedOrder] = useState<VerifiedOrder | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Form state
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [mediaResult, setMediaResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Fetch active testimonials & check review token on load
  useEffect(() => {
    fetch('/api/testimonials?active_only=true', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setTestimonials(json.data);
        }
      })
      .catch((err) => console.warn('Fetch testimonials notice:', err));

    // Parse token from URL query or hash
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      let tokenParam = urlParams.get('token') || urlParams.get('review_token');

      if (!tokenParam && hash.includes('token=')) {
        const match = hash.match(/token=([^&]+)/);
        if (match) tokenParam = match[1];
      }

      if (tokenParam) {
        setReviewToken(tokenParam);
        setIsVerifyingToken(true);
        fetch(`/api/testimonials/verify-token?token=${encodeURIComponent(tokenParam)}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.valid && json.order) {
              setVerifiedOrder(json.order);
              setTokenError(null);
            } else {
              setVerifiedOrder(null);
              setTokenError(json.message || 'Token ulasan tidak valid atau pesanan belum selesai.');
            }
          })
          .catch(() => {
            setTokenError('Gagal memverifikasi token ulasan.');
          })
          .finally(() => setIsVerifyingToken(false));
      }
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format file tidak didukung. Silakan upload file foto/gambar (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 15MB.');
      return;
    }

    try {
      setIsCompressing(true);
      const result = await compressImageToWebP(file);
      setMediaResult(result);
    } catch (err) {
      console.error('Compression error:', err);
      alert('Gagal memproses gambar.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComment.trim() || !verifiedOrder || !reviewToken) return;

    setIsSending(true);
    try {
      const payload = {
        token: reviewToken,
        username: verifiedOrder.roblox_username,
        robuxPackage: `${new Intl.NumberFormat('id-ID').format(verifiedOrder.robux)} Robux`,
        rating: formRating,
        comment: formComment.trim(),
        proofImage: mediaResult ? mediaResult.dataUrl : null,
      };

      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setTestimonials((prev) => [json.data, ...prev]);
        setFormComment('');
        handleRemoveMedia();
        setIsSubmitted(true);
        setVerifiedOrder(null); // Consumed token
      } else {
        alert(json.error || 'Gagal mengirim ulasan.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menghubungi server.');
    } finally {
      setIsSending(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section id="testimoni" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 content-auto">
      <div className="overflow-hidden rounded-3xl border border-pink-200 bg-white shadow-xs">
        
        {/* Header Bar */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50/80 to-white border-b border-pink-100 px-6 py-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-pink-500 text-white font-extrabold text-base shadow-sm">
            <Star className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 tracking-wide">
              Testimoni Member
            </h2>
            <p className="text-[11px] text-zinc-500">
              Apa kata mereka yang sudah top up Robux di BloxyLucy
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Scrollable Testimonial Cards */}
            <div className="lg:col-span-7 space-y-4 max-h-[640px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              {testimonials.map((t) => (
                <div 
                  key={t.id}
                  className="p-5 rounded-2xl bg-white border border-pink-100/90 shadow-2xs hover:shadow-xs hover:border-pink-300 transition-all duration-200 space-y-3"
                >
                  {/* Top Bar: Avatar, Name, Rating & Time */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                        {t.avatarLetter || (t.username || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-extrabold text-zinc-900">
                            @{t.username}
                          </span>
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Terverifikasi</span>
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {t.timeAgo || 'Baru saja'}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-0.5 text-amber-400 bg-amber-50/50 px-2 py-1 rounded-lg border border-amber-100">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < t.rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal">
                    &ldquo;{t.comment}&rdquo;
                  </p>

                  {/* Proof Photo + Robux Amount — shown together when any data is available */}
                  {(t.proofImage || t.proofAmount || t.robuxPackage) && (
                    <div className="pt-1 space-y-2">
                      {/* Robux Amount Badge */}
                      {(t.proofAmount || t.robuxPackage) && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs text-zinc-800 shadow-2xs">
                          <div className="w-5 h-5 rounded-md bg-pink-50 flex items-center justify-center p-0.5 shrink-0">
                            <Image
                              src="/images/robux.webp"
                              alt="Robux"
                              width={18}
                              height={18}
                              className="object-contain"
                            />
                          </div>
                          <span className="font-bold text-zinc-900">
                            {t.proofAmount && t.proofAmount !== 'Bukti'
                              ? t.proofAmount
                              : t.robuxPackage || 'Robux'}
                          </span>
                          {t.proofImage && (
                            <span className="text-[10px] text-emerald-600 font-bold">✓ Ada Foto Bukti</span>
                          )}
                        </div>
                      )}

                      {/* Proof Photo */}
                      {t.proofImage && (
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border border-pink-200 bg-zinc-50 shadow-2xs">
                          <img
                            src={t.proofImage}
                            alt="Foto Bukti"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Official Admin Reply */}
                  {t.adminReply && (
                    <div className="mt-3 pl-3 border-l-2 border-pink-400 space-y-1 bg-white p-3 rounded-r-xl border-y border-r border-pink-100 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-pink-300 shrink-0">
                          <Image
                            src="/images/logo.jpeg"
                            alt="Admin"
                            width={20}
                            height={20}
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-extrabold text-pink-600">
                          {t.adminReply.adminName || 'Admin BloxyLucy'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-relaxed pl-7">
                        {t.adminReply.message}
                      </p>
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* Right Column: Submit Form OR Locked Verified-Buyer Guard */}
            <div className="lg:col-span-5">
              {isVerifyingToken ? (
                <div className="p-8 rounded-3xl border border-pink-200 bg-white shadow-xs text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-bold text-pink-600">Memverifikasi token ulasan...</p>
                </div>
              ) : isSubmitted ? (
                <div className="p-6 sm:p-8 rounded-3xl border border-emerald-200 bg-emerald-50/50 shadow-xs text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-emerald-950">Ulasan Berhasil Dikirim!</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Terima kasih banyak atas ulasan dan kepercayaannya top up di BloxyLucy 💕
                  </p>
                </div>
              ) : verifiedOrder ? (
                /* UNLOCKED FORM (For verified buyer with token) */
                <div className="p-5 sm:p-7 rounded-3xl border border-pink-200 bg-white shadow-xs space-y-4 animate-fadeIn">
                  
                  {/* Verified Buyer Ribbon */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-pink-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-zinc-900 block">
                          Pembeli: @{verifiedOrder.roblox_username}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          {new Intl.NumberFormat('id-ID').format(verifiedOrder.robux)} Robux • #{verifiedOrder.order_code}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-black">
                      Terverifikasi ✓
                    </span>
                  </div>

                  <form onSubmit={handleSubmitTestimony} className="space-y-4">
                    
                    {/* 1. Rating Kepuasan */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                        Rating Kepuasan
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormRating(star)}
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                              star <= formRating
                                ? 'bg-pink-50/50 border-pink-200 text-pink-500 shadow-2xs'
                                : 'bg-white border-pink-100 hover:border-pink-200 text-pink-300'
                            }`}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= formRating
                                  ? 'fill-pink-500 text-pink-500'
                                  : 'text-pink-400 stroke-[1.5]'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs text-pink-600 font-bold ml-1">
                          {formRating ? `(${formRating} Bintang)` : '(Pilih rating)'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Komentar Ulasan */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                        Komentar Ulasan
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={formComment}
                        onChange={(e) => setFormComment(e.target.value)}
                        placeholder="Ceritakan pengalamanmu top up di BloxyLucy..."
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-pink-100/90 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-pink-400 text-xs sm:text-sm resize-none font-medium shadow-2xs"
                      />
                    </div>

                    {/* 3. Drag & Drop Photo Upload */}
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5 flex items-center justify-between">
                        <span>Upload Foto Bukti</span>
                        <span className="text-[11px] text-zinc-400 font-normal">Opsional</span>
                      </label>

                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {isCompressing ? (
                        <div className="p-5 rounded-2xl border-2 border-dashed border-pink-300 bg-pink-50/40 text-center flex flex-col items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-bold text-pink-600">Memproses foto bukti...</span>
                        </div>
                      ) : mediaResult ? (
                        /* Preview State */
                        <div className="relative p-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white border border-emerald-200 shrink-0">
                            <Image
                              src={mediaResult.dataUrl}
                              alt="Foto Bukti"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                              <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{mediaResult.fileName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 mt-0.5 font-medium">
                              <span className="font-bold text-emerald-700">{formatBytes(mediaResult.compressedSize)}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveMedia}
                            className="p-1.5 rounded-full bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 transition-colors cursor-pointer"
                            title="Hapus foto"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* Dropzone Container */
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`cursor-pointer border-2 border-dashed rounded-2xl p-4 text-center transition-all space-y-1 ${
                            isDragging
                              ? 'border-pink-500 bg-pink-100/50 scale-[1.01]'
                              : 'border-pink-200/80 hover:border-pink-400 bg-pink-50/30 hover:bg-pink-50/60'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                          <div className="text-xs font-bold text-zinc-800">
                            Klik atau Drag &amp; Drop foto bukti di sini
                          </div>
                          <p className="text-[10px] text-zinc-400">
                            Format JPG, PNG (Maksimal 5MB)
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 4. Submit Button */}
                    <button
                      type="submit"
                      disabled={isSending}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isSending ? 'Mengirim Ulasan...' : 'Kirim Ulasan Terverifikasi'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* LOCKED FORM GUARD (No Token or Invalid Token) */
                <div className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-pink-200 bg-[#fff9fb] shadow-xs text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center mx-auto shadow-md shadow-pink-500/20">
                    <Lock className="w-7 h-7" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-700 border border-pink-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Ulasan Terverifikasi Pembeli</span>
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight">
                      Form Ulasan Khusus Pembeli
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                      Untuk menjaga ulasan 100% asli &amp; bebas spam, formulir ini hanya dapat diisi melalui <strong>Link Token Review</strong> yang dikirimkan Admin setelah pesanan Robux selesai diproses.
                    </p>
                  </div>

                  {tokenError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                      ⚠️ {tokenError}
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href="https://wa.me/6287816959979?text=Halo%20Admin%20BloxyLucy!%20Saya%20ingin%20minta%20link%20review%20pesanan%20Robux%20saya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-pink-300 hover:border-pink-400 text-pink-600 hover:bg-pink-50 text-xs font-black shadow-2xs transition-all cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Hubungi CS / Minta Link Review</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
