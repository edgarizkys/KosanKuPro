'use client';

import { useState } from 'react';
import { useProperty } from '@/lib/PropertyContext';

export default function FaqSection() {
  const { property } = useProperty();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { id: 'ALL', label: 'Semua' },
    { id: 'SEWA', label: 'Sewa & Fasilitas' },
    { id: 'ACCESS', label: 'IoT & Smart Lock' },
    { id: 'PAYMENT', label: 'Pembayaran & DP' },
  ];

  const faqs = [
    {
      cat: 'SEWA',
      q: 'Apakah harga sewa bulanan sudah termasuk tagihan WiFi dan fasilitas?',
      a: 'Ya, seluruh harga sewa di KosanKu Pro sudah all-inclusive mencakup akses internet fiber 100Mbps dedicated, air bersih, fasilitas bersama (dapur & rooftop), free laundry berkala 5kg/bulan, dan cleaning service rutin tanpa biaya admin tersembunyi.',
      tag: 'All-Inclusive',
    },
    {
      cat: 'ACCESS',
      q: 'Bagaimana cara check-in dan apakah perlu membawa kunci fisik?',
      a: 'Seluruh unit kami terintegrasi dengan teknologi IoT Smart Keyless Access. Setelah pembayaran DP terkonfirmasi, Anda akan otomatis menerima kode PIN digital atau akses fingerprint yang aktif tepat di hari mulai sewa. Anda tidak perlu repot membawa atau khawatir kehilangan kunci fisik.',
      tag: 'Smart Lock IoT',
    },
    {
      cat: 'SEWA',
      q: 'Bagaimana cara melakukan survei kamar sebelum menyewa?',
      a: 'Anda dapat menekan tombol "Survei" pada unit kamar yang diminati untuk memilih jadwal kunjungan langsung, atau memilih survei online melalui WhatsApp Video Call yang dipandu langsung oleh representatif tim operasional kami.',
      tag: 'Free Survei',
    },
    {
      cat: 'SEWA',
      q: 'Apakah tersedia opsi sewa harian dan mingguan?',
      a: 'Ya, beberapa tipe unit kamar kami menyediakan opsi sewa harian dan mingguan yang sangat ideal untuk keperluan dinas, magang medis (seperti di area RSHS Bandung), ataupun keluarga yang berkunjung.',
      tag: 'Fleksibel',
    },
    {
      cat: 'ACCESS',
      q: 'Bagaimana sistem keamanan dan aturan jam malam untuk penghuni?',
      a: 'Keamanan dijamin 24/7 dengan pengawasan CCTV di seluruh area publik, smart door gate access untuk penghuni, serta satpam berjaga. Penghuni memiliki akses masuk 24 jam bebas menggunakan kartu/PIN smart lock mereka.',
      tag: 'Keamanan 24/7',
    },
    {
      cat: 'PAYMENT',
      q: 'Bagaimana metode pembayaran sewa dan konfirmasi perpanjangan?',
      a: 'Pembayaran sewa bulanan dapat dilakukan melalui QRIS instan, Virtual Account bank, ataupun transfer bank. Sistem kami akan mengirimkan pengingat ramah via WhatsApp H-3 sebelum jatuh tempo agar Anda terbebas dari denda keterlambatan.',
      tag: 'QRIS & VA',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) => activeCategory === 'ALL' || f.cat === activeCategory
  );

  return (
    <section id="faq-section" className="relative w-full py-12 sm:py-20 text-slate-900 dark:text-white select-none">
      
      {/* 2-COLUMN LUXURY SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-7xl mx-auto">
        
        {/* LEFT COLUMN (5 cols): Sticky Brand Intro & Direct Support Card */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          <div className="space-y-3">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#047857]/10 dark:bg-emerald-500/10 text-[#047857] dark:text-emerald-400 font-black text-[11px] uppercase tracking-wider border border-emerald-500/20 shadow-xs">
              Pusat Bantuan &amp; FAQ
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Pertanyaan yang Sering <span className="text-[#047857] dark:text-emerald-400 font-serif italic font-normal">Diajukan</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Semua rincian transparan mengenai fasilitas all-inclusive, sistem kunci IoT, hingga proses booking instan di KosanKu Pro.
            </p>
          </div>

          {/* Clean Category Filter Pills (No Icons) */}
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((c) => {
              const isSelected = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(c.id);
                    setOpenIndex(0);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#047857] text-white shadow-md shadow-emerald-900/20 scale-102 border border-emerald-400/30'
                      : 'neu-btn text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Direct WhatsApp Concierge Card */}
          <div className="p-5 sm:p-6 neu-card rounded-3xl border border-white/80 dark:border-white/10 shadow-xl space-y-4">
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Punya Pertanyaan Lain?</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tim Customer Service kami siap merespon cepat 24/7</p>
            </div>

            <a
              href={`https://wa.me/${(property.whatsapp || '6282114242634').replace(/[^0-9]/g, '')}?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20ingin%20tanya%20informasi%20sewa%20dan%20fasilitas%20kosan`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
            >
              <span>Tanya CS via WhatsApp</span>
            </a>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Clean Accordion Cards (No Icons) */}
        <div className="lg:col-span-7 space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`neu-card rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 border ${
                  isOpen
                    ? 'border-[#047857]/40 dark:border-emerald-500/40 shadow-xl ring-1 ring-emerald-500/20'
                    : 'border-white/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4 font-bold transition-colors cursor-pointer"
                >
                  <div className="space-y-1.5 flex-1 pr-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-wider inline-block">
                      {faq.tag}
                    </span>
                    <h3 className={`text-xs sm:text-sm font-extrabold leading-snug ${
                      isOpen ? 'text-[#047857] dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}>
                      {faq.q}
                    </h3>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-xs shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#047857] dark:text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    <i className="fa-solid fa-chevron-down text-[10px]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed border-t border-slate-100 dark:border-white/5 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
