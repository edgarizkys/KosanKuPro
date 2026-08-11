'use client';

import { useState, useEffect, useRef } from 'react';
import BookingModal, { RoomForBooking } from './BookingModal';

interface BookingViewProps {
  room?: RoomForBooking | null;
  onClose: () => void;
  onBookingSuccess: (roomId: string) => void;
}

const DEFAULT_ROOM: RoomForBooking = {
  id: '1',
  number: 'A-101',
  type: 'Executive Deluxe Suite',
  price: 2500000,
  floor: 1,
  imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80',
};

export default function BookingView({ room, onClose, onBookingSuccess }: BookingViewProps) {
  const activeRoom = room || DEFAULT_ROOM;

  return (
    <div className="min-h-screen w-full bg-[#f0f3f8] dark:bg-[#0a0710] text-slate-900 dark:text-white flex flex-col justify-between transition-colors relative z-50">
      {/* SaaS Top Header Navbar */}
      <header className="w-full px-4 sm:px-10 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/10 bg-[#f0f3f8]/80 dark:bg-[#0a0710]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onClose}>
          <div className="w-10 h-10 rounded-2xl bg-[#120e20] p-0.5 flex items-center justify-center shadow-md border border-white/20 group-hover:scale-105 transition-transform">
            <img src="/images/logo.png" alt="KosanKu Pro Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-lg tracking-tight text-slate-900 dark:text-white">
              KosanKu <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-black text-[10px] tracking-wider uppercase">PRO</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Portal Pemesanan Kamar Eksekutif</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 neu-btn rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-red-500 transition-all flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left text-[11px]" />
          <span>Kembali ke Beranda</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Room Executive Summary & Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="neu-card rounded-3xl p-6 sm:p-7 space-y-5 border border-black/5 dark:border-white/10 shadow-2xl">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-[10px] uppercase rounded-full border border-emerald-500/20">
              Unit Siap Huni • Verification Guaranteed
            </span>

            <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden neu-inset p-1.5 group">
              <img
                src={activeRoom.imageUrl || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80'}
                alt={activeRoom.type}
                className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/70 backdrop-blur-md rounded-xl text-white">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Kamar {activeRoom.number}</span>
                <h3 className="text-lg font-black">{activeRoom.type}</h3>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs p-3 neu-inset rounded-2xl">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Harga Sewa Bulanan:</span>
                <span className="text-lg font-black text-[#047857] dark:text-emerald-400 font-mono">
                  Rp {activeRoom.price.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-3 neu-card-sm rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Lantai Unit</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Lantai {activeRoom.floor}</span>
                </div>
                <div className="p-3 neu-card-sm rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Estimasi DP (50%)</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    Rp {Math.round(activeRoom.price * 0.5).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 neu-inset rounded-2xl text-xs space-y-2 text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2 text-[#047857] dark:text-emerald-400 font-bold">
                <i className="fa-solid fa-shield-halved" /> <span>Jaminan Booking Aman &amp; Otomatis</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Pemesanan via KosanKu Pro menggunakan penguncian unit otomatis. Status kamar langsung terkunci aman dan kuitansi digital langsung diterbitkan.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Full Booking Form Page (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="neu-card rounded-3xl p-6 sm:p-10 border border-black/5 dark:border-white/10 shadow-2xl space-y-6">
            <div className="border-b border-slate-200/60 dark:border-white/10 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Formulir Reservasi Unit Eksekutif
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lengkapi identitas diri untuk menerbitkan kontrak digital dan penguncian kamar #{activeRoom.number}
              </p>
            </div>

            {/* Embedded Booking Form Component (Clean Render without Backdrop) */}
            <div className="relative">
              <BookingModal
                room={activeRoom}
                onClose={onClose}
                onBookingSuccess={onBookingSuccess}
                isFullPage={true}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-black/5 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
        &copy; 2026 KosanKu Pro — Platform Manajemen Kos Premium &amp; Smart Living. All rights reserved.
      </footer>
    </div>
  );
}
