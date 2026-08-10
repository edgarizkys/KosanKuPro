'use client';

import { useEffect, useRef } from 'react';

const REVIEWS = [
  { id: 1, name: 'Budi Santoso', role: 'Software Engineer', room: 'A-101', text: 'Pembayaran QRIS otomatisnya juara! Begitu bayar via Midtrans, langsung terupdate Lunas. Nggak perlu kirim bukti transfer manual lagi.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 2, name: 'Siti Rahma', role: 'Product Designer', room: 'B-201', text: 'AC kamar sempat kurang dingin, isi form tiket di dashboard, besoknya teknisi langsung datang. Profesional banget!', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80' },
  { id: 3, name: 'Rian Pratama', role: 'Financial Analyst', room: 'C-302', text: 'H-3 jatuh tempo selalu dapat reminder WhatsApp. Nggak pernah lagi kena denda karena lupa bayar.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
  { id: 4, name: 'Dion Permana', role: 'Senior Consultant', room: 'D-401', text: 'Smart Lock bikin hidup simpel. Nggak perlu bawa kunci fisik, cukup fingerprint atau PIN saja.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
];

export default function ReviewsSection() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;
    const SwiperLib = (window as any).Swiper;
    if (!SwiperLib) return;

    new SwiperLib('.swiperReviews', {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.swiperReviews .swiper-pagination', clickable: true },
      breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
    });
  }, []);

  return (
    <section id="reviews-section" className="space-y-6 sm:space-y-10 reveal" ref={ref}>
      <div className="text-center max-w-2xl mx-auto px-2">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Testimoni</span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">Kata Mereka</h2>
        <div className="flex items-center justify-center gap-1 mt-2 sm:mt-3 text-amber-400 text-xs sm:text-sm">
          <i className="fa-solid fa-star animate-pulse" /><i className="fa-solid fa-star animate-pulse" /><i className="fa-solid fa-star animate-pulse" /><i className="fa-solid fa-star animate-pulse" /><i className="fa-solid fa-star animate-pulse" />
          <span className="text-slate-600 dark:text-slate-400 text-[10px] sm:text-xs ml-2 font-medium">4.9/5 dari 50+ review terverifikasi</span>
        </div>
      </div>
      <div className="swiper swiperReviews">
        <div className="swiper-wrapper py-4">
          {REVIEWS.map((rev, i) => (
            <div key={rev.id} className="swiper-slide h-auto">
              <div className="bg-white dark:bg-slate-900/90 border border-black/5 dark:border-white/10 p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 h-full flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-2 card-premium transition-all duration-500 group">
                <div className="flex gap-1 text-amber-400 text-xs group-hover:scale-105 transition-transform origin-left">
                  <i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" />
                </div>
                <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 italic leading-relaxed flex-1 font-light">&ldquo;{rev.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                  <img src={rev.avatar} alt={rev.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/40 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{rev.name}</h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">Kamar {rev.room} • {rev.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="swiper-pagination mt-5 sm:mt-8" />
      </div>
    </section>
  );
}
