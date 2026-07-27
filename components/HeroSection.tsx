'use client';

import { useEffect, useRef, useState } from 'react';

const WORDS = ['Ribet.', 'Bising.', 'Khawatir.'];

export default function HeroSection({ onLogin }: { onLogin: () => void }) {
  const [wordIdx, setWordIdx] = useState(0);
  const [wordState, setWordState] = useState<'idle' | 'exit' | 'enter'>('idle');

  useEffect(() => {
    const interval = setInterval(() => {
      setWordState('exit');
      setTimeout(() => {
        setWordIdx((prev) => (prev + 1) % WORDS.length);
        setWordState('enter');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setWordState('idle'));
        });
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const wordClass = wordState === 'exit' ? 'rotating-word word-exit' : wordState === 'enter' ? 'rotating-word word-enter' : 'rotating-word';

  return (
    <section className="relative min-h-[65vh] sm:min-h-[85vh] flex items-center justify-center rounded-2xl sm:rounded-[2.5rem] overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orchid-deep via-orchid-dark to-orchid-surface animate-mesh opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(142,110,149,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(218,165,32,0.06),transparent_50%)]" />

      {/* Aurora beams */}
      <div className="aurora-container absolute inset-0 overflow-hidden pointer-events-none">
        <div className="aurora-beam aurora-beam-1" />
        <div className="aurora-beam aurora-beam-2" />
        <div className="aurora-beam aurora-beam-3" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-12 left-8 sm:top-16 sm:left-16 w-14 h-14 sm:w-20 sm:h-20 border border-orchid-tint/10 rounded-xl sm:rounded-2xl animate-float rotate-12" />
      <div className="absolute bottom-16 right-12 sm:bottom-24 sm:right-20 w-10 h-10 sm:w-14 sm:h-14 border border-orchid-gold/15 rounded-full animate-float-delay" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orchid-tint/30 rounded-full animate-glow" />
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-orchid-gold/40 rounded-full animate-glow" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto space-y-5 sm:space-y-8">
        <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-full text-orchid-tint text-[9px] sm:text-[11px] font-bold uppercase tracking-widest animate-fade-down backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Premium Kos Executive • Dago Bandung
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
          <span className="blur-reveal-word" style={{ '--i': 0 } as React.CSSProperties}>Hunian</span>{' '}
          <span className="blur-reveal-word" style={{ '--i': 1 } as React.CSSProperties}>Mewah</span>
          <br />
          <span className="blur-reveal-word" style={{ '--i': 2 } as React.CSSProperties}>Tanpa</span>{' '}
          <span className="rotating-word-wrapper">
            <span className={`${wordClass} text-gradient-animated`}>{WORDS[wordIdx]}</span>
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed animate-fade-up delay-2" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          Pembayaran otomatis via Midtrans, pengingat WhatsApp, Smart Lock 24/7.
          Semua dalam satu platform elegan.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up delay-3" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <button
            onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-orchid-dark font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/25 hover:scale-[1.03] transition-all duration-300 magnetic-btn ripple-effect flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-search text-[10px] sm:text-xs" /> Jelajahi Kamar
          </button>
          <button onClick={onLogin} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white/5 text-white font-semibold text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2">
            <i className="fa-solid fa-play text-[9px] sm:text-[10px]" /> Dashboard Demo
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 sm:gap-12 pt-4 sm:pt-6 animate-fade-up delay-4" style={{ opacity: 0, animationFillMode: 'forwards' }}>
          <div className="text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">12</div>
            <div className="text-[8px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Unit Kamar</div>
          </div>
          <div className="w-px h-7 sm:h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">98%</div>
            <div className="text-[8px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Kepuasan</div>
          </div>
          <div className="w-px h-7 sm:h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-xl sm:text-2xl lg:text-3xl font-black text-white">24/7</div>
            <div className="text-[8px] sm:text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">Support</div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orchid-dark to-transparent" />
    </section>
  );
}
