'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { INITIAL_TESTIMONIALS, Testimonial } from './data';
import { Star, MessageSquare, Send, CheckCircle, ShieldCheck } from 'lucide-react';

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  
  // Form state
  const [formUsername, setFormUsername] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formPackage, setFormPackage] = useState('10.500 Robux');
  const [formComment, setFormComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitTestimony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formComment.trim()) return;

    const newTestimonial: Testimonial = {
      id: `t-${Date.now()}`,
      username: formUsername.trim(),
      rating: formRating,
      robuxPackage: formPackage,
      comment: formComment.trim(),
      timeAgo: 'Baru saja',
      avatarLetter: formUsername.charAt(0).toUpperCase(),
      hasProof: true,
      proofAmount: formPackage.replace(' Robux', ''),
      adminReply: {
        adminName: 'Admin BloxyLucy Official',
        message: 'Terima kasih atas testimoni dan kepercayaannya kak! Ditunggu orderan selanjutnya yaa 💕✨',
      },
    };

    setTestimonials([newTestimonial, ...testimonials]);
    setFormUsername('');
    setFormComment('');
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <section id="testimoni" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
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

        {/* Content Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Testimonials List */}
          <div className="lg:col-span-7 space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl border border-pink-100 bg-pink-50/30 hover:bg-pink-50/60 transition-colors space-y-3"
              >
                {/* Header User & Rating */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
                      {t.avatarLetter}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-900">{t.username}</h4>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 font-semibold">
                          Terverifikasi
                        </span>
                      </div>
                      
                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < t.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-zinc-200 text-zinc-200'
                            }`}
                          />
                        ))}
                        <span className="text-[10px] text-zinc-400 ml-1.5">{t.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-pink-700 bg-pink-100 border border-pink-200 px-2.5 py-1 rounded-xl">
                    {t.robuxPackage}
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                  "{t.comment}"
                </p>

                {/* Proof Attachment Badge */}
                {t.hasProof && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-pink-200 text-xs text-zinc-800 shadow-2xs">
                    <div className="w-5 h-5 rounded-md bg-pink-50 flex items-center justify-center p-0.5">
                      <Image
                        src="/images/robux.webp"
                        alt="Robux"
                        width={18}
                        height={18}
                        className="object-contain"
                      />
                    </div>
                    <span className="font-bold text-zinc-900">{t.proofAmount} Robux Masuk</span>
                    <span className="text-[10px] text-emerald-600 ml-1 font-bold">✓ Bukti Valid</span>
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
                      <span className="text-[11px] font-bold text-pink-700 flex items-center gap-1">
                        {t.adminReply.adminName}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 italic pl-7">
                      "{t.adminReply.message}"
                    </p>
                  </div>
                )}

              </div>
            ))}
          </div>

          {/* Right Column: Submit Form */}
          <div className="lg:col-span-5">
            <div className="p-5 sm:p-6 rounded-2xl border border-pink-200 bg-pink-50/40 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-600" />
                <h3 className="text-base font-bold text-zinc-900">Tulis Testimoni</h3>
              </div>

              {isSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Testimoni Anda berhasil dikirim dan ditayangkan! Terima kasih 💕</span>
                </div>
              )}

              <form onSubmit={handleSubmitTestimony} className="space-y-3.5">
                
                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Nama / Username Anda
                  </label>
                  <input
                    type="text"
                    required
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="Contoh: GamerSultan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-pink-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-pink-500 text-xs sm:text-sm font-medium"
                  />
                </div>

                {/* Rating Select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Rating Kepuasan
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormRating(star)}
                        className="p-1 text-zinc-300 hover:text-amber-400 focus:outline-none transition-colors cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-pink-700 font-bold ml-1">
                      ({formRating === 5 ? 'Sangat Puas ⭐' : `${formRating} Bintang`})
                    </span>
                  </div>
                </div>

                {/* Robux Package Select */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Paket yang Dibeli
                  </label>
                  <select
                    value={formPackage}
                    onChange={(e) => setFormPackage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-pink-200 text-zinc-900 text-xs sm:text-sm font-medium focus:outline-none focus:border-pink-500"
                  >
                    <option value="1.800 Robux">1.800 Robux</option>
                    <option value="2.200 Robux">2.200 Robux (Promo)</option>
                    <option value="3.200 Robux">3.200 Robux</option>
                    <option value="5.500 Robux">5.500 Robux</option>
                    <option value="10.500 Robux">10.500 Robux</option>
                    <option value="20.500 Robux">20.500 Robux</option>
                    <option value="30.500 Robux">30.500 Robux</option>
                  </select>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                    Komentar Ulasan
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Ceritakan pengalaman Anda top up di BloxyLucy..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-pink-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-pink-500 text-xs sm:text-sm resize-none font-medium"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Testimoni</span>
                </button>

              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
