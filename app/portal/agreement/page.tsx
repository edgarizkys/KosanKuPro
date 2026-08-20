'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function RentalAgreementPortal() {
  const [tenantName, setTenantName] = useState('dr. Rizky Pratama, Sp.A');
  const [roomNumber, setRoomNumber] = useState('EKS-01');
  const [propertyAddress, setPropertyAddress] = useState('Jl. Prof. Dr. Eyckman No. 28, Depan RSHS Bandung');
  const [monthlyRent, setMonthlyRent] = useState(2200000);
  const [depositAmount, setDepositAmount] = useState(1000000);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [durationMonths, setDurationMonths] = useState(6);
  const [signed, setSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('tenant')) setTenantName(p.get('tenant')!);
    if (p.get('room')) setRoomNumber(p.get('room')!);
    if (p.get('rent')) setMonthlyRent(Number(p.get('rent')));
  }, []);

  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  // Signature Canvas Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#047857';

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setSigned(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-8 flex flex-col items-center font-sans antialiased">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Top Title */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full neu-card-sm text-[#047857] text-xs font-black mb-3 border border-emerald-500/20 shadow-xs">
            <i className="fa-solid fa-file-contract text-xs" />
            <span>DOKUMEN HUKUM RESMI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Surat Perjanjian Sewa Menyewa Kos</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">KosanKu Pro Executive Living &bull; Nomor: KSK/{new Date().getFullYear()}/AGR-{roomNumber}</p>
        </div>

        {/* Contract Document Sheet */}
        <div className="neu-card rounded-3xl p-6 sm:p-10 border border-white/80 dark:border-white/10 shadow-2xl space-y-6 bg-white dark:bg-slate-900 text-xs sm:text-sm leading-relaxed">
          
          <div className="border-b border-slate-200 dark:border-white/10 pb-4 text-center">
            <h2 className="text-base sm:text-lg font-black tracking-wider uppercase text-slate-900 dark:text-white">SURAT PERJANJIAN SEWA HUNIAN KOSANKU PRO</h2>
            <span className="text-[11px] text-slate-500">Berlaku sah sejak tanggal ditandatangani secara digital</span>
          </div>

          {/* Parties Involved */}
          <div className="space-y-3">
            <p>Pada hari ini telah disepakati perjanjian sewa hunian antara pihak-pihak sebagai berikut:</p>
            
            <div className="p-4 rounded-2xl neu-inset space-y-1.5">
              <div className="font-bold text-[#047857] dark:text-emerald-400 text-xs uppercase">PIHAK PERTAMA (PENGELOLA KOS):</div>
              <div className="font-black text-slate-900 dark:text-white">Manajemen KosanKu Pro ({propertyAddress})</div>
              <div className="text-slate-500 text-xs">Bertindak sebagai penyedia fasilitas kamar dan operasional hunian.</div>
            </div>

            <div className="p-4 rounded-2xl neu-inset space-y-1.5">
              <div className="font-bold text-[#047857] dark:text-emerald-400 text-xs uppercase">PIHAK KEDUA (PENYEWA):</div>
              <div className="font-black text-slate-900 dark:text-white">{tenantName}</div>
              <div className="text-slate-500 text-xs">Penyewa resmi Kamar <strong>{roomNumber}</strong> untuk durasi <strong>{durationMonths} Bulan</strong> terhitung mulai <strong>{startDate}</strong>.</div>
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-4 pt-2">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">PASAL 1: BIAYA SEWA &amp; DEPOSIT</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Biaya sewa bulanan disepakati sebesar <strong>{fmt(monthlyRent)}/bulan</strong> mencakup internet fiber 100Mbps, air, dan fasilitas kamar.</li>
              <li>Penyewa menitipkan Uang Jaminan (Deposit) sebesar <strong>{fmt(depositAmount)}</strong> yang akan dikembalikan 100% saat masa sewa berakhir setelah verifikasi serah terima unit kamar.</li>
              <li>Pembayaran sewa wajib dilunasi paling lambat tanggal jatuh tempo setiap bulannya melalui portal QRIS / Transfer Bank resmi KosanKu Pro.</li>
            </ul>

            <h3 className="font-black text-sm text-slate-900 dark:text-white">PASAL 2: TATA TERTIB &amp; AKSES SMART KEYLESS LOCK</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
              <li>Akses kamar menggunakan teknologi IoT Smart Keyless Lock (PIN &amp; Fingerprint). Dilarang keras membagikan kode PIN akses kepada pihak luar yang tidak terdaftar.</li>
              <li>Penghuni wajib menjaga ketenangan bersama, kebersihan area publik, dan mematuhi aturan tidak membawa hewan peliharaan tanpa izin tertulis.</li>
              <li>Dilarang keras menyimpan barang terlarang, zat adiktif/narkotika, serta senjata tajam di dalam lingkungan KosanKu Pro.</li>
            </ul>
          </div>

          {/* E-Signature Canvas */}
          <div className="pt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">Tanda Tangan Digital Penyewa (E-Signature)</h4>
                <p className="text-[11px] text-slate-400">Goreskan tanda tangan Anda pada area kotak di bawah ini:</p>
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="px-3 py-1.5 rounded-xl neu-btn text-[10px] font-bold text-rose-500 cursor-pointer"
              >
                Hapus / Reset
              </button>
            </div>

            <div className="w-full h-40 rounded-2xl neu-inset border-2 border-dashed border-slate-300 dark:border-white/20 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
              <canvas
                ref={canvasRef}
                width={700}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair touch-none"
              />
              {!signed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-bold">
                  ✍️ Tanda tangani di sini menggunakan jari atau mouse
                </div>
              )}
            </div>

            {signed && (
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500" />
                <span>Tanda tangan digital terverifikasi dan sah secara hukum.</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <button
              onClick={() => window.print()}
              disabled={!signed}
              className="py-3.5 rounded-2xl bg-[#047857] hover:bg-[#065f46] disabled:opacity-40 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <i className="fa-solid fa-download" />
              <span>Simpan &amp; Unduh Dokumen PDF</span>
            </button>
            <a
              href="https://wa.me/6282114242634?text=Halo%20Admin%20KosanKu%20Pro,%20saya%20sudah%20menandatangani%20Surat%20Perjanjian%20Sewa%20Digital"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 rounded-2xl neu-btn text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border border-white/80 dark:border-white/10"
            >
              <i className="fa-brands fa-whatsapp text-emerald-600" />
              <span>Kirim Konfirmasi ke Owner</span>
            </a>
          </div>

        </div>

        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro &bull; Dokumen Elektronik Sah Berdasarkan UU ITE No. 11/2008</p>
      </div>
    </div>
  );
}
