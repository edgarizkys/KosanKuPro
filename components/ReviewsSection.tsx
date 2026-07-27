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
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-orchid-gold">Testimoni</span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-2">Kata Mereka</h2>
        <div className="flex items-center justify-center gap-1 mt-2 sm:mt-3 text-amber-400 text-xs sm:text-sm">
          <i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" />
          <span className="text-slate-400 text-[10px] sm:text-xs ml-2">4.9/5 dari 50+ review</span>
        </div>
      </div>
      <div className="swiper swiperReviews">
        <div className="swiper-wrapper">
          {REVIEWS.map((rev) => (
            <div key={rev.id} className="swiper-slide">
              <div className="glass-card p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4 h-full flex flex-col">
                <div className="flex gap-0.5 text-amber-400 text-xs">
                  <i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" /><i className="fa-solid fa-star" />
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed flex-1">&ldquo;{rev.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <img src={rev.avatar} alt={rev.name} className="w-9 h-9 rounded-full object-cover ring-2 ring-orchid-violet/30" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{rev.name}</h4>
                    <p className="text-[10px] text-slate-500">Kamar {rev.room} • {rev.role}</p>
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
