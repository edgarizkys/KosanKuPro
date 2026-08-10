import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0710] text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h2 className="text-5xl font-black text-gradient-animated">404</h2>
      <p className="text-sm text-slate-400">Halaman yang Anda cari tidak ditemukan.</p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-lg hover:scale-105 transition-all"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
