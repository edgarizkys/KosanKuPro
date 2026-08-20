'use client';

import { useState } from 'react';
import { useProperty } from '@/lib/PropertyContext';

interface PartnerAndAppSectionProps {
  onOpenConsultation?: () => void;
}

export default function PartnerAndAppSection({ onOpenConsultation }: PartnerAndAppSectionProps) {
  const { property } = useProperty();
  const [activeDurationTab, setActiveDurationTab] = useState('17');
  const [passengerCount, setPassengerCount] = useState(1);

  const stats = [
    { value: '98.4%', label: 'Rata-rata Okupansi' },
    { value: '3x', label: 'ROI Lebih Cepat' },
    { value: '0%', label: 'Biaya Admin Setup' },
    { value: '24/7', label: 'Monitoring IoT' },
  ];

  const handleWhatsApp = () => {
    const wa = (property.whatsapp || '6282114242634').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent('Halo Admin KosanKu Pro, saya tertarik dengan program Kemitraan & Manajemen Properti Kosan.');
    window.open(`https://wa.me/${wa}?text=${msg}`, '_blank');
  };

  return (
    <section className="relative w-full py-10 sm:py-16 text-slate-900 dark:text-white select-none">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
        
        {/* LEFT (5 cols) — Kemitraan Owner Pitch */}
        <div className="xl:col-span-5 space-y-6 reveal-left">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3.5 py-1 rounded-full neu-inset text-[#047857] dark:text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-500/20 shadow-xs">
              Kemitraan Manajemen Properti
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Punya Kosan Kosong? <br />
              <span className="text-[#047857] dark:text-emerald-400 font-serif italic font-normal">Tingkatkan Profit Hingga 300%.</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Serahkan operasional harian, pemasaran, IoT Smart Lock, penagihan sewa otomatis, hingga perawatan fasilitas kos Anda kepada ekosistem profesional KosanKu Pro.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stats.map((s, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl neu-inset text-center">
                <div className="text-lg sm:text-xl font-black text-[#047857] dark:text-emerald-400">{s.value}</div>
                <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="px-5 py-3 rounded-2xl bg-[#047857] hover:bg-[#065f46] text-white font-black text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
            >
              <i className="fa-brands fa-whatsapp text-sm" />
              <span>Konsultasi Kemitraan Gratis</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if ((window as any).__openOwnerRegister) (window as any).__openOwnerRegister();
                else if (onOpenConsultation) onOpenConsultation();
              }}
              className="px-5 py-3 rounded-2xl neu-btn text-slate-700 dark:text-slate-200 font-bold text-xs hover:text-[#047857] dark:hover:text-emerald-400 transition-all cursor-pointer"
            >
              Pelajari Simulasi ROI
            </button>
          </div>
        </div>

        {/* RIGHT (7 cols) — 100% NEUMORPHIC DUAL FLOATING APP SHOWCASE */}
        <div className="xl:col-span-7 relative p-6 sm:p-10 rounded-[3rem] neu-card-lg border border-white/80 dark:border-white/10 shadow-2xl overflow-hidden">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Subtitle */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#047857] dark:text-emerald-400">KosanKu Mobile App</span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Pengalaman Sewa Semudah Memesan Tiket</h3>
            </div>
            <div className="flex gap-2">
              <span className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-xs text-slate-700 dark:text-white shadow-sm"><i className="fa-brands fa-apple" /></span>
              <span className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-xs text-emerald-600 dark:text-emerald-400 shadow-sm"><i className="fa-brands fa-google-play" /></span>
            </div>
          </div>

          {/* Dual Phone Showcase Grid (Overlapping Neumorphic Surfaces) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start relative">
            
            {/* ══════════════════════════════════════════════════
                SCREEN 1 (LEFT): HOME & QUICK BOOKING FORM (NEUMORPHIC)
                ══════════════════════════════════════════════════ */}
            <div className="w-full neu-card rounded-[2.5rem] p-4 sm:p-5 border border-white/90 dark:border-white/10 shadow-xl flex flex-col justify-between space-y-4 hover:translate-y-[-4px] transition-all duration-300">
              
              {/* iOS Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-black text-slate-600 dark:text-slate-400 px-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-[9px]">
                  <i className="fa-solid fa-signal text-[8px]" />
                  <i className="fa-solid fa-wifi text-[8px]" />
                  <i className="fa-solid fa-battery-full text-[9px]" />
                </div>
              </div>

              {/* Header & Title with Visual 3D Badge */}
              <div className="flex items-start justify-between gap-2 pt-1">
                <div>
                  <button type="button" className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs mb-2">
                    <i className="fa-solid fa-bars-staggered text-[11px]" />
                  </button>
                  <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Mau sewa kamar <br />di mana kali ini?
                  </h4>
                </div>
                <div className="w-12 h-12 rounded-2xl neu-inset text-sky-500 flex items-center justify-center text-xl shadow-inner shrink-0">
                  <i className="fa-solid fa-house-chimney-user" />
                </div>
              </div>

              {/* Form Booking Card (Tactile Neumorphic Inset) */}
              <div className="p-3.5 rounded-2xl neu-inset space-y-3">
                {/* Location Switcher */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Area Kampus/RS</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Pasteur (RSHS)</span>
                    <span className="text-[8px] text-slate-400 block">Bandung Barat</span>
                  </div>
                  <div className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-sky-500 text-[10px] shadow-sm">
                    <i className="fa-solid fa-arrow-right-arrow-left" />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Tipe Kamar</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Eksekutif</span>
                    <span className="text-[8px] text-slate-400 block">KM Dalam + AC</span>
                  </div>
                </div>

                {/* Date / Month */}
                <div className="pt-2 border-t border-slate-300/40 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Mulai Sewa</span>
                    <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">1 September 2026</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full neu-card-sm text-[9px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/5">
                    1 Bulan
                  </span>
                </div>

                {/* Passenger / Guest Count + CTA */}
                <div className="pt-2 border-t border-slate-300/40 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      className="w-6 h-6 rounded-full neu-btn flex items-center justify-center text-[10px] font-black"
                    >-</button>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{passengerCount}</span>
                    <button
                      onClick={() => setPassengerCount(passengerCount + 1)}
                      className="w-6 h-6 rounded-full neu-btn flex items-center justify-center text-[10px] font-black"
                    >+</button>
                  </div>

                  {/* Vibrant Tactile Button */}
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[11px] font-black shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    CARI KAMAR
                  </button>
                </div>
              </div>

              {/* Subcard: Tiket / Kamar Aktif Saya */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Kamar Aktif Saya</span>
                <div className="p-3 rounded-2xl neu-card flex items-center justify-between border border-white/80 dark:border-white/10 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase">Aktif</span>
                    <div>
                      <span className="text-[11px] font-black text-slate-900 dark:text-white block leading-none">Eksekutif EKS-01</span>
                      <span className="text-[9px] text-slate-400">Smart Lock Terhubung</span>
                    </div>
                  </div>
                  <span className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] shadow-sm"><i className="fa-solid fa-arrow-right" /></span>
                </div>
              </div>

            </div>


            {/* ══════════════════════════════════════════════════
                SCREEN 2 (RIGHT): ROOM LISTING & DATE SELECTOR (NEUMORPHIC)
                ══════════════════════════════════════════════════ */}
            <div className="w-full neu-card rounded-[2.5rem] p-4 sm:p-5 border border-white/90 dark:border-white/10 shadow-xl flex flex-col justify-between space-y-3.5 hover:translate-y-[-4px] transition-all duration-300">
              
              {/* iOS Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-black text-slate-600 dark:text-slate-400 px-1">
                <span>9:41</span>
                <div className="flex items-center gap-1.5 text-[9px]">
                  <i className="fa-solid fa-signal text-[8px]" />
                  <i className="fa-solid fa-wifi text-[8px]" />
                  <i className="fa-solid fa-battery-full text-[9px]" />
                </div>
              </div>

              {/* Title with Back Arrow */}
              <div className="flex items-center gap-2 pt-1">
                <button type="button" className="w-7 h-7 rounded-xl neu-btn flex items-center justify-center text-slate-700 dark:text-slate-200 text-xs">
                  <i className="fa-solid fa-arrow-left text-[10px]" />
                </button>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                  Kosan Pasteur — RSHS Bandung
                </h4>
              </div>

              {/* Date / Month Horizontal Selector Pills (Neumorphic Inset Track) */}
              <div className="flex items-center justify-between gap-1 p-1 neu-inset rounded-2xl">
                {[
                  { day: '15', label: 'SAB' },
                  { day: '16', label: 'MIN' },
                  { day: '17', label: 'SEN' },
                  { day: '18', label: 'SEL' },
                  { day: '19', label: 'RAB' },
                ].map((d) => {
                  const isSelected = activeDurationTab === d.day;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setActiveDurationTab(d.day)}
                      className={`flex-1 py-1.5 rounded-xl text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-white font-black shadow-md shadow-sky-500/30'
                          : 'neu-btn text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-black block leading-none">{d.day}</span>
                      <span className="text-[8px] font-bold block mt-0.5 opacity-80">{d.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Room Listing Cards Stack (Neumorphic Elevated Cards) */}
              <div className="space-y-2">
                {[
                  { name: 'Kamar Eksekutif', time: 'KM Dalam • 16 m²', tag: 'Eksekutif - A', price: 'Rp 2.200.000', left: 'Sisa 2' },
                  { name: 'Paviliun VIP Balkon', time: 'Balkon Pribadi • 24 m²', tag: 'VIP - Premier', price: 'Rp 2.800.000', left: 'Sisa 1' },
                  { name: 'Nyaman Standard AC', time: 'KM Luar • 12 m²', tag: 'Standard - B', price: 'Rp 1.650.000', left: 'Sisa 4' },
                ].map((room, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl neu-card flex items-center justify-between gap-2 border border-white/80 dark:border-white/10 hover:translate-y-[-2px] transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{room.name}</div>
                      <div className="text-[9px] text-slate-400">{room.time}</div>
                      <span className="px-1.5 py-0.2 rounded neu-inset text-amber-600 dark:text-amber-400 text-[8px] font-extrabold uppercase">
                        {room.tag}
                      </span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white font-mono leading-none">{room.price}</span>
                      <span className="text-[8px] font-bold text-rose-500">{room.left}</span>
                      <button type="button" className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-[9px] shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all">
                        <i className="fa-solid fa-arrow-right" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Floating Filter Button */}
              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  className="px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-sliders text-[10px]" />
                  <span>FILTER UNIT</span>
                </button>
              </div>

            </div>

          </div>

          {/* Floating Tips Pill Overlay at the bottom (Neumorphic Badges) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl neu-card border border-white/90 dark:border-white/10 shadow-lg text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded neu-inset text-sky-600 dark:text-sky-400 text-[9px] font-black uppercase">Tips</span>
              <span>Smart Keyless Lock aktif otomatis 24 jam via smartphone</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl neu-card border border-white/90 dark:border-white/10 shadow-lg text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded neu-inset text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase">Update</span>
              <span>Tagihan QRIS instan terverifikasi otomatis tanpa admin</span>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
