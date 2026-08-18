'use client';

import { useState } from 'react';
import type { MultiPropertyRoomItem } from '@/lib/multiPropertyRoomsData';

interface SurveyScheduleModalProps {
  room: MultiPropertyRoomItem | null;
  onClose: () => void;
  onSuccess?: (surveyData: any) => void;
}

export default function SurveyScheduleModal({
  room,
  onClose,
  onSuccess = () => {},
}: SurveyScheduleModalProps) {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('14:00 - 15:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPhone.trim() || !surveyDate) return;

    setIsSubmitting(true);

    const surveyData = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      roomNumber: room.number,
      roomType: room.type,
      propertySlug: room.propertySlug,
      propertyName: room.propertyName,
      visitorName,
      visitorPhone,
      surveyDate,
      timeSlot,
      notes,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Post to Backend Survey API
      await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: room.propertySlug || 'prop-001',
          propertyName: room.propertyName,
          roomId: room.id,
          roomNumber: room.number,
          prospectName: visitorName,
          prospectPhone: visitorPhone,
          scheduledAt: new Date(`${surveyDate}T${timeSlot.slice(0, 5)}:00`).toISOString(),
          surveyType: 'ONSITE',
          notes: `${timeSlot} - ${notes}`,
        }),
      }).catch(() => {});

      // 2. Save survey to localStorage for instant cross-tab reactivity
      const existing = JSON.parse(localStorage.getItem('kosanku_surveys') || '[]');
      localStorage.setItem('kosanku_surveys', JSON.stringify([surveyData, ...existing]));

      // 3. Broadcast to Staff / Owner channel
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          const bc = new BroadcastChannel('kosanku_order_channel');
          bc.postMessage({ type: 'SURVEY_SCHEDULED', survey: surveyData });
          bc.close();
        } catch {}
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        onSuccess(surveyData);
      }, 500);
    } catch {
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Pengelola ${room.propertyName}, saya ${visitorName} ingin konfirmasi jadwal survei/visit fisik kamar ${room.number} (${room.type}) pada tanggal ${surveyDate} jam ${timeSlot}.`
    );
    window.open(`https://wa.me/6281223798307?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#151221] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
                <i className="fa-solid fa-calendar-check" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Jadwalkan Survei Fisik
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {room.propertyName} • {room.propertyCity}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Room Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 flex items-center gap-3.5">
              <img
                src={room.imageUrl || '/images/kosanku_logo.svg'}
                alt={room.type}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-white/10 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    Kamar {room.number} — {room.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                    Lt {room.floor}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rp {room.price.toLocaleString('id-ID')}/bln • {room.size || 'Kamar Nyaman'}
                </p>
              </div>
            </div>

            {/* Input Nama & No WA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Dimas Pratama"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0812-xxxx-xxxx"
                  value={visitorPhone}
                  onChange={(e) => setVisitorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            {/* Input Tanggal & Slot Waktu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggal Rencana Survei <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Pilihan Jam Kunjungan
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="10:00 - 11:00 (Pagi)">10:00 - 11:00 (Pagi)</option>
                  <option value="13:00 - 14:00 (Siang)">13:00 - 14:00 (Siang)</option>
                  <option value="14:00 - 15:00 (Siang)">14:00 - 15:00 (Siang)</option>
                  <option value="16:00 - 17:00 (Sore)">16:00 - 17:00 (Sore)</option>
                  <option value="19:00 - 20:00 (Malam)">19:00 - 20:00 (Malam)</option>
                </select>
              </div>
            </div>

            {/* Catatan / Kebutuhan Khusus */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Misal: Saya mau bawa motor / butuh info jemuran..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Guarantee Note */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2">
              <i className="fa-solid fa-circle-info text-amber-500 mt-0.5 shrink-0" />
              <span>
                Survei gratis tanpa biaya. Staf lapangan/satpam di {room.propertyName} akan menyambut dan mendampingi kunjungan Anda.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> Menyimpan Jadwal...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check" /> Konfirmasi Jadwal Survei
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 text-3xl flex items-center justify-center mx-auto animate-bounce">
              <i className="fa-solid fa-check-double" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Jadwal Survei Berhasil Dibuat!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Terima kasih, <strong>{visitorName}</strong>. Jadwal kunjungan Anda ke <strong>{room.propertyName}</strong> (Kamar {room.number}) pada <strong>{surveyDate} ({timeSlot})</strong> telah tercatat di sistem staf kami.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
              >
                <i className="fa-brands fa-whatsapp text-sm" /> Chat Konfirmasi ke WA Pengelola
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
