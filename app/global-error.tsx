'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="bg-[#0a0710] text-white flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h2 className="text-xl font-bold mb-3">Terjadi Kesalahan Fatal Sistem</h2>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs shadow-lg hover:scale-105 transition-all"
        >
          Muat Ulang Halaman
        </button>
      </body>
    </html>
  );
}
