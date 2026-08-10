'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('KosanKuPro Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0710] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-2xl">
        <i className="fa-solid fa-triangle-exclamation" />
      </div>
      <h2 className="text-xl font-bold">Terjadi Kesalahan Sistem</h2>
      <p className="text-sm text-slate-400 max-w-md leading-relaxed">
        Aplikasi mengalami gangguan sementara. Silakan tekan tombol di bawah untuk memuat ulang komponen.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-lg hover:scale-105 transition-all"
      >
        Muat Ulang
      </button>
    </div>
  );
}
