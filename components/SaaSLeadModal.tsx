'use client';

import { useState } from 'react';

interface SaaSLeadModalProps {
  onClose: () => void;
}

export default function SaaSLeadModal({ onClose }: SaaSLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [city, setCity] = useState('Bandung');
  const [totalRooms, setTotalRooms] = useState('12');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create WhatsApp message format
      const waMsg = `Halo Superadmin KosanKu Pro! Saya berminat bermitra SaaS:%0A%0A` +
        `👤 *Nama*: ${name}%0A` +
        `📱 *No. WA*: ${phone}%0A` +
        `🏢 *Nama Kosan*: ${propertyName}%0A` +
        `📍 *Kota*: ${city}%0A` +
        `🚪 *Est. Jumlah Kamar*: ${totalRooms}%0A` +
        `💬 *Catatan*: ${notes || '-'}`;

      const waUrl = `https://wa.me/6282114242634?text=${waMsg}`;
      
      // Open WhatsApp window
      window.open(waUrl, '_blank');
      setSubmitted(true);
    } catch {
      setError('Gagal mengirimkan formulir konsultasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#f2f5fa] dark:bg-[#120e24] text-slate-900 dark:text-white w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl shadow-lg neu-card-sm">
              <i className="fa-solid fa-handshake" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Konsultasi &amp; Penawaran SaaS</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daftarkan Kosan Anda &amp; Otomatiskan Bisnis Bersama KosanKu Pro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 flex items-center justify-center text-slate-700 dark:text-white transition-all"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-3xl mx-auto neu-card">
              <i className="fa-solid fa-circle-check" />
            </div>
            <h4 className="text-lg font-black">Permintaan Penawaran Terkirim!</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Tim Superadmin KosanKu Pro telah menerima informasi kosan Anda. Tim kami akan segera menghubungi WhatsApp <strong>{phone}</strong> untuk proses penyettingan workspace &amp; aktivasi akun Owner.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              Tutup &amp; Kembali ke Beranda
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Nama Lengkap Pemilik Kos</label>
              <input
                type="text"
                required
                placeholder="Contoh: Hendra Wijaya"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">No. WhatsApp Aktif</label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Kota Lokasi Kos</label>
                <input
                  type="text"
                  required
                  placeholder="Bandung / Jakarta"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Nama Kosan Anda</label>
                <input
                  type="text"
                  required
                  placeholder="Griya Dago Residence"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Estimasi Jumlah Kamar</label>
                <input
                  type="number"
                  required
                  placeholder="12"
                  value={totalRooms}
                  onChange={(e) => setTotalRooms(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">Catatan / Kebutuhan Khusus (Optional)</label>
              <textarea
                rows={2}
                placeholder="Ingin fasilitas smart lock, pembayaran QRIS otomatis, dll..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:outline-none focus:border-emerald-500 text-sm font-medium resize-none"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-300 flex items-start gap-2">
              <i className="fa-solid fa-[#047857] fa-circle-info text-base mt-0.5" />
              <span>Data penawaran Anda akan langsung dikirimkan ke <strong>Superadmin KosanKu Pro</strong> untuk diterbitkan workspace khusus kosan Anda.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" />
                  <span>Mengirimkan Penawaran...</span>
                </>
              ) : (
                <>
                  <i className="fa-brands fa-whatsapp text-lg" />
                  <span>Kirim Penawaran ke Superadmin via WA</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
