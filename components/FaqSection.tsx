'use client';

import { useState } from 'react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Apakah harga sewa bulanan sudah termasuk tagihan WiFi dan fasilitas?',
      a: 'Ya, seluruh harga sewa di KosanKu Pro sudah all-inclusive mencakup akses internet fiber 100Mbps dedicated, air bersih, fasilitas bersama (dapur & rooftop), free laundry berkala 5kg/bulan, dan cleaning service rutin tanpa biaya admin tersembunyi.',
    },
    {
      q: 'Bagaimana cara check-in dan apakah perlu membawa kunci fisik?',
      a: 'Seluruh unit kami terintegrasi dengan teknologi IoT Smart Keyless Access. Setelah pembayaran DP terkonfirmasi, Anda akan otomatis menerima kode PIN digital atau akses fingerprint yang aktif tepat di hari mulai sewa. Anda tidak perlu repot membawa atau khawatir kehilangan kunci fisik.',
    },
    {
      q: 'Bagaimana cara melakukan survei kamar sebelum menyewa?',
      a: 'Anda dapat menekan tombol "Survei" pada unit kamar yang diminati untuk memilih jadwal kunjungan langsung, atau memilih survei online melalui WhatsApp Video Call yang dipandu langsung oleh representatif tim operasional kami.',
    },
    {
      q: 'Apakah tersedia opsi sewa harian dan mingguan?',
      a: 'Ya, beberapa tipe unit kamar kami menyediakan opsi sewa harian dan mingguan yang sangat ideal untuk keperluan dinas, magang medis (seperti di area RSHS Bandung), ataupun keluarga yang berkunjung.',
    },
    {
      q: 'Bagaimana sistem keamanan dan aturan jam malam untuk penghuni?',
      a: 'Keamanan dijamin 24/7 dengan pengawasan CCTV di seluruh area publik, smart door gate access untuk penghuni, serta satpam berjaga. Penghuni memiliki akses masuk 24 jam bebas menggunakan kartu/PIN smart lock mereka.',
    },
    {
      q: 'Bagaimana metode pembayaran sewa dan konfirmasi perpanjangan?',
      a: 'Pembayaran sewa bulanan dapat dilakukan melalui QRIS instan, Virtual Account bank, ataupun transfer bank. Sistem kami akan mengirimkan pengingat ramah via WhatsApp H-3 sebelum jatuh tempo agar Anda terbebas dari denda keterlambatan.',
    },
  ];

  return (
    <section className="relative w-full py-10 sm:py-16 text-slate-900 dark:text-white select-none">
      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3 reveal-blur">
          <div className="inline-flex items-center px-3.5 py-1 rounded-full neu-inset text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wider">
            Pusat Bantuan &amp; Informasi
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium max-w-lg mx-auto">
            Semua yang perlu Anda ketahui tentang proses sewa, fasilitas, dan keamanan di KosanKu Pro.
          </p>
        </div>

        {/* Accordion List — stagger */}
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="neu-card rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 hover:border-amber-500/40 stagger-item"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm transition-colors ripple-effect"
                >
                  <span className={`font-black ${isOpen ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                    {faq.q}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-xs shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-amber-500' : 'text-slate-500'
                    }`}
                  >
                    <i className="fa-solid fa-chevron-down text-[10px]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3 animate-fade-in">
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
