'use client';

import { useState, useEffect, useRef } from 'react';

export interface RoomForBooking {
  id: string;
  number: string;
  type: string;
  price: number;
  floor: number;
  imageUrl?: string | null;
}

interface BookingFormData {
  email: string;
  namaLengkap: string;
  noTlp: string;
  alasanKost: string[];
  alasanLainnya: string;
  fotoIdName: string;
  fotoIdDataUrl: string;
  namaKerabat: string;
  nomorDarurat: string;
  tanggalMulai: string;
  durasiSewa: string;
}

const ALASAN_OPTIONS = ['RESIDENCE', 'KOAS', 'MAHASISWA'];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function BookingModal({
  room,
  onClose,
  onBookingSuccess,
}: {
  room: RoomForBooking;
  onClose: () => void;
  onBookingSuccess: (roomId: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<BookingFormData>({
    email: '',
    namaLengkap: '',
    noTlp: '',
    alasanKost: [],
    alasanLainnya: '',
    fotoIdName: '',
    fotoIdDataUrl: '',
    namaKerabat: '',
    nomorDarurat: '',
    tanggalMulai: '',
    durasiSewa: '1',
  });
  const [emailSelf, setEmailSelf] = useState(false);
  const [alasanLain, setAlasanLain] = useState(false);
  const [fotoError, setFotoError] = useState('');
  const fotoRef = useRef<HTMLInputElement>(null);

  // Step 2: QRIS / Payment
  const DP_AMOUNT = Math.round(room.price * 0.5);
  const [qrisCountdown, setQrisCountdown] = useState(0);
  const [qrisScanning, setQrisScanning] = useState(false);
  const [qrisSuccess, setQrisSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer'>('qris');
  const [bookingId] = useState(`BKG-${Date.now().toString().slice(-6)}`);

  useEffect(() => {
    if (qrisCountdown > 0) {
      const t = setTimeout(() => setQrisCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
    if (qrisCountdown === 0 && qrisScanning) {
      setQrisScanning(false);
      setQrisSuccess(true);
    }
  }, [qrisCountdown, qrisScanning]);

  const toggleAlasan = (val: string) => {
    setForm((p) => ({
      ...p,
      alasanKost: p.alasanKost.includes(val)
        ? p.alasanKost.filter((x) => x !== val)
        : [...p.alasanKost, val],
    }));
  };

  const handleFotoId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFotoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setFotoError('Ukuran file melebihi 10MB. Pilih file yang lebih kecil.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((p) => ({ ...p, fotoIdName: file.name, fotoIdDataUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirmBooking = () => {
    onBookingSuccess(room.id);
    setStep(3);
  };

  const inputCls =
    'w-full px-0 py-2 border-b-2 border-slate-300 dark:border-white/20 focus:border-rose-500 dark:focus:border-rose-400 outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 transition-colors bg-transparent';
  const labelCls = 'text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 block mb-2';

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1a1130] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-slate-200 dark:border-white/10 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER ===== */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-white font-black text-base">
              {step === 1 ? 'Data Tenant Juragan Kost' : step === 2 ? 'Pembayaran DP Booking' : '🎉 Booking Berhasil!'}
            </h2>
            <p className="text-rose-200 text-[10px] font-medium mt-0.5">
              {step === 1
                ? `Data Calon Penghuni Juragan Kost`
                : step === 2
                ? `Booking ID: ${bookingId}`
                : 'Menunggu verifikasi admin · Kamar status BOOKING'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 text-white hover:bg-white/30 flex items-center justify-center text-sm transition-colors shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ===== STEP INDICATOR ===== */}
        <div className="flex items-center px-5 py-3 bg-rose-50 dark:bg-black/20 border-b border-rose-100 dark:border-white/10 shrink-0 gap-0">
          {[
            { n: 1, label: 'Data Diri' },
            { n: 2, label: 'Bayar DP' },
            { n: 3, label: 'Selesai' },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-all ${
                step === s.n ? 'bg-rose-600 text-white ring-2 ring-rose-300' :
                step > s.n ? 'bg-emerald-500 text-white' :
                'bg-slate-200 dark:bg-white/10 text-slate-400'
              }`}>
                {step > s.n ? <i className="fa-solid fa-check text-[9px]" /> : s.n}
              </div>
              <span className={`ml-1.5 text-[10px] font-bold ${
                step === s.n ? 'text-rose-600' : step > s.n ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
              }`}>{s.label}</span>
              {i < 2 && <div className={`flex-1 h-0.5 mx-2 rounded-full ${step > s.n ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* =========== STEP 1: DATA DIRI =========== */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="overflow-y-auto flex-1 flex flex-col">
            <div className="p-5 space-y-3 flex-1">

              {/* Info Banner */}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 space-y-0.5">
                <p>Nama, alamat email, dan foto yang terkait dengan Akun Anda akan direkam saat mengupload file dan mengirimkan formulir ini.</p>
                <p className="text-rose-500 font-bold mt-1">* Menunjukkan pertanyaan wajib diisi</p>
              </div>

              {/* Email */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                <label className={labelCls}>Email <span className="text-rose-500">*</span></label>
                <label className="flex items-start gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={emailSelf}
                    onChange={(e) => {
                      setEmailSelf(e.target.checked);
                      if (e.target.checked) setForm((p) => ({ ...p, email: 'calon.tenant@email.com' }));
                    }}
                    className="mt-0.5 w-3.5 h-3.5 accent-rose-500"
                  />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Rekam email saya sebagai email yang disertakan dengan respons saya
                  </span>
                </label>
                <input required type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="Jawaban Anda" className={inputCls} />
              </div>

              {/* Nama Pengisi Kamar */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                <label className={labelCls}>Nama Pengisi Kamar <span className="text-rose-500">*</span></label>
                <input required value={form.namaLengkap} onChange={(e) => setForm((p) => ({ ...p, namaLengkap: e.target.value }))} placeholder="Jawaban Anda" className={inputCls} />
              </div>

              {/* No TLP */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                <label className={labelCls}>NO TLP <span className="text-rose-500">*</span></label>
                <input required type="tel" value={form.noTlp} onChange={(e) => setForm((p) => ({ ...p, noTlp: e.target.value }))} placeholder="Jawaban Anda" className={`${inputCls} font-mono`} />
              </div>

              {/* Alasan Kost */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                <label className={labelCls}>ALASAN KOST <span className="text-rose-500">*</span></label>
                <div className="space-y-2.5">
                  {ALASAN_OPTIONS.map((opt) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                        form.alasanKost.includes(opt)
                          ? 'bg-rose-500 border-rose-500'
                          : 'border-slate-300 dark:border-white/30 group-hover:border-rose-400'
                      }`} onClick={() => toggleAlasan(opt)}>
                        {form.alasanKost.includes(opt) && <i className="fa-solid fa-check text-white text-[8px]" />}
                      </div>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{opt}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 ${
                      alasanLain ? 'bg-rose-500 border-rose-500' : 'border-slate-300 dark:border-white/30 group-hover:border-rose-400'
                    }`} onClick={() => setAlasanLain((p) => !p)}>
                      {alasanLain && <i className="fa-solid fa-check text-white text-[8px]" />}
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Yang lain:</span>
                  </label>
                  {alasanLain && (
                    <input
                      value={form.alasanLainnya}
                      onChange={(e) => setForm((p) => ({ ...p, alasanLainnya: e.target.value }))}
                      placeholder="Sebutkan..."
                      className="ml-7 border-b border-slate-300 dark:border-white/20 outline-none text-sm bg-transparent text-slate-900 dark:text-white focus:border-rose-400 w-[calc(100%-1.75rem)] py-1 placeholder-slate-400"
                    />
                  )}
                </div>
              </div>

              {/* Foto ID */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                <label className={labelCls}>FOTO ID <span className="text-rose-500">*</span></label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2.5">Upload 1 file yang didukung. Maks 10 MB.</p>
                <input ref={fotoRef} type="file" accept="image/*,.pdf" onChange={handleFotoId} className="hidden" id="fotoIdInput" />
                {form.fotoIdDataUrl ? (
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-3">
                    {form.fotoIdDataUrl.startsWith('data:image') ? (
                      <img src={form.fotoIdDataUrl} alt="Foto ID" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-lg flex items-center justify-center">
                        <i className="fa-solid fa-file-pdf text-rose-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{form.fotoIdName}</p>
                      <p className="text-[9px] text-emerald-600 flex items-center gap-1"><i className="fa-solid fa-circle-check" /> Berhasil diunggah</p>
                    </div>
                    <button type="button" onClick={() => { setForm((p) => ({ ...p, fotoIdName: '', fotoIdDataUrl: '' })); if (fotoRef.current) fotoRef.current.value = ''; }} className="text-slate-400 hover:text-rose-500 cursor-pointer p-1 transition-colors">
                      <i className="fa-solid fa-xmark text-xs" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="fotoIdInput" className="inline-flex items-center gap-2 cursor-pointer border border-slate-300 dark:border-white/20 hover:border-rose-400 rounded-xl px-4 py-2 transition-all bg-white dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 group">
                    <i className="fa-solid fa-arrow-up-from-bracket text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tambahkan file</span>
                  </label>
                )}
                {fotoError && <p className="text-[10px] text-rose-500 mt-1.5 flex items-center gap-1"><i className="fa-solid fa-triangle-exclamation" /> {fotoError}</p>}
              </div>

              {/* Nama Kerabat */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                <label className={labelCls}>NAMA KERABAT / ORANG TERDEKAT <span className="text-rose-500">*</span></label>
                <input required value={form.namaKerabat} onChange={(e) => setForm((p) => ({ ...p, namaKerabat: e.target.value }))} placeholder="Jawaban Anda" className={inputCls} />
              </div>

              {/* Nomor Darurat */}
              <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                <label className={labelCls}>NOMOR DARURAT <span className="text-rose-500">*</span></label>
                <input required type="tel" value={form.nomorDarurat} onChange={(e) => setForm((p) => ({ ...p, nomorDarurat: e.target.value }))} placeholder="Jawaban Anda" className={`${inputCls} font-mono`} />
              </div>

              {/* Tanggal Mulai & Durasi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                  <label className={labelCls}>TANGGAL MULAI <span className="text-rose-500">*</span></label>
                  <input required type="date" value={form.tanggalMulai} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm((p) => ({ ...p, tanggalMulai: e.target.value }))} className={inputCls} />
                </div>
                <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/3">
                  <label className={labelCls}>DURASI SEWA</label>
                  <select value={form.durasiSewa} onChange={(e) => setForm((p) => ({ ...p, durasiSewa: e.target.value }))} className={`${inputCls} cursor-pointer`}>
                    {[1, 2, 3, 6, 12].map((m) => <option key={m} value={String(m)}>{m} Bulan</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Fixed bottom buttons */}
            <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-[#1a1130] shrink-0">
              <button type="button" onClick={onClose} className="px-5 py-3 bg-slate-100 dark:bg-white/10 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer text-slate-700 dark:text-slate-300">Batal</button>
              <button type="submit" className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                Lanjut ke Pembayaran DP <i className="fa-solid fa-arrow-right" />
              </button>
            </div>
          </form>
        )}

        {/* =========== STEP 2: BAYAR DP =========== */}
        {step === 2 && (
          <div className="overflow-y-auto flex-1 flex flex-col">
            <div className="p-5 space-y-4 flex-1">
              {/* Room summary */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                {room.imageUrl && <img src={room.imageUrl} alt={room.number} className="w-full h-24 object-cover" />}
                <div className="p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white">Kamar {room.number}</p>
                      <p className="text-[10px] text-slate-500">{room.type} · Lantai {room.floor} · {form.durasiSewa} bulan</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pemohon: <b>{form.namaLengkap}</b> · Mulai: {form.tanggalMulai || '-'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-rose-600 text-sm">{formatIDR(room.price)}</p>
                      <p className="text-[9px] text-slate-400">/bulan</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DP Card */}
              <div className="bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-200 dark:border-rose-500/20 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">DP Booking (50% sewa bulan pertama)</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Sisa {formatIDR(room.price - DP_AMOUNT)} dibayar saat check-in</p>
                </div>
                <p className="font-black text-rose-600 text-xl shrink-0">{formatIDR(DP_AMOUNT)}</p>
              </div>

              {/* Metode Bayar */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-2">
                  {[{ key: 'qris', icon: 'fa-qrcode', label: 'QRIS' }, { key: 'transfer', icon: 'fa-building-columns', label: 'Transfer Bank' }].map((m) => (
                    <button key={m.key} type="button" onClick={() => { setPaymentMethod(m.key as any); setQrisSuccess(false); setQrisScanning(false); }}
                      className={`p-3 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${paymentMethod === m.key ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400' : 'border-slate-200 dark:border-white/10 text-slate-500 hover:border-rose-300'}`}>
                      <i className={`fa-solid ${m.icon} text-sm`} />{m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* QRIS */}
              {paymentMethod === 'qris' && (
                <div className="text-center space-y-3">
                  {!qrisSuccess ? (
                    <>
                      <div className="w-44 h-44 mx-auto bg-white rounded-2xl border-2 border-slate-900 dark:border-white p-3 shadow-xl">
                        <div className="w-full h-full grid grid-cols-7 gap-px">
                          {Array.from({ length: 49 }).map((_, i) => {
                            const corners = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,47,48];
                            const edge = [8,15,22,29,36];
                            const center = [24];
                            const isDark = corners.includes(i) || (i % 3 === 0 && !edge.includes(i)) || center.includes(i);
                            return <div key={i} className={`rounded-[1px] ${isDark ? 'bg-slate-900' : 'bg-white'}`} />;
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Scan dengan dompet digital</p>
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">GoPay · OVO · DANA · ShopeePay · BCA · Mandiri</p>
                        <p className="text-base font-black text-rose-600 mt-1">{formatIDR(DP_AMOUNT)}</p>
                      </div>
                      {qrisScanning ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-rose-500 font-bold text-sm">Memverifikasi pembayaran... {qrisCountdown}s</span>
                        </div>
                      ) : (
                        <button type="button" onClick={() => { setQrisScanning(true); setQrisCountdown(8); }}
                          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl cursor-pointer flex items-center gap-2 mx-auto transition-all">
                          <i className="fa-solid fa-qrcode" /> Simulasikan Pembayaran QRIS
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="py-6 space-y-2">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 text-3xl flex items-center justify-center mx-auto">
                        <i className="fa-solid fa-circle-check" />
                      </div>
                      <p className="text-emerald-600 dark:text-emerald-400 font-black">Pembayaran QRIS Berhasil!</p>
                      <p className="text-[10px] text-slate-500">{formatIDR(DP_AMOUNT)} telah diterima sistem</p>
                    </div>
                  )}
                </div>
              )}

              {/* Transfer */}
              {paymentMethod === 'transfer' && (
                <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-200 dark:border-blue-500/20 p-4 space-y-2 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide text-[10px]">Rekening Tujuan</p>
                  {[['Bank', 'BCA'], ['No. Rekening', '8830-1928-44'], ['Atas Nama', 'KosanKu Pro'], ['Jumlah Transfer', formatIDR(DP_AMOUNT)]].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center">
                      <span className="text-slate-500">{k}</span>
                      <span className={`font-black ${k === 'Jumlah Transfer' ? 'text-rose-600 text-sm' : 'font-mono text-slate-800 dark:text-white'}`}>{v}</span>
                    </div>
                  ))}
                  <p className="text-[9px] text-slate-500 border-t border-blue-200 dark:border-blue-500/20 pt-2 mt-1">Kirim bukti transfer via WhatsApp ke admin. Konfirmasi dalam 1×24 jam.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-[#1a1130] shrink-0">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-3 bg-slate-100 dark:bg-white/10 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all cursor-pointer text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <i className="fa-solid fa-arrow-left" /> Kembali
              </button>
              <button type="button" disabled={paymentMethod === 'qris' && !qrisSuccess} onClick={handleConfirmBooking}
                className="flex-1 py-3 bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                {paymentMethod === 'qris' && !qrisSuccess ? 'Selesaikan Pembayaran Dahulu' : <><i className="fa-solid fa-check" /> Konfirmasi Booking</>}
              </button>
            </div>
          </div>
        )}

        {/* =========== STEP 3: SUKSES =========== */}
        {step === 3 && (
          <div className="overflow-y-auto flex-1 p-6 flex flex-col items-center justify-center text-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-emerald-100 dark:shadow-emerald-500/10">
                <i className="fa-solid fa-circle-check" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">DP✓</div>
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Booking Berhasil! 🎉</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Kamar <b className="text-rose-600">{room.number}</b> kini berstatus <b className="text-amber-600">BOOKING</b>
              </p>
            </div>

            <div className="bg-slate-900 dark:bg-white/10 rounded-2xl px-6 py-4 w-full max-w-xs">
              <p className="text-[10px] text-slate-400 mb-0.5 uppercase tracking-widest">ID Booking</p>
              <p className="text-white font-black font-mono text-xl tracking-widest">{bookingId}</p>
              <p className="text-[9px] text-slate-500 mt-1">Screenshot & simpan nomor ini</p>
            </div>

            <div className="w-full max-w-xs space-y-2 text-left">
              {[
                { icon: 'fa-circle-check', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20', label: 'DP Diterima', desc: `${formatIDR(DP_AMOUNT)} berhasil dibayar`, done: true },
                { icon: 'fa-clock', color: 'text-amber-500 bg-amber-100 dark:bg-amber-500/20', label: 'Verifikasi Admin', desc: 'Proses dalam 1×24 jam kerja', done: false },
                { icon: 'fa-key', color: 'text-slate-400 bg-slate-100 dark:bg-white/10', label: 'Check-in', desc: `Tanggal ${form.tanggalMulai || '-'}`, done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                    <i className={`fa-solid ${item.icon} text-xs`} />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${item.done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>{item.label}</p>
                    <p className="text-[9px] text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full space-y-2 max-w-xs">
              <button type="button"
                onClick={() => window.open(`https://wa.me/6281234567890?text=Halo%20Admin%20KosanKu!%20Saya%20${encodeURIComponent(form.namaLengkap)}%20sudah%20booking%20Kamar%20${room.number}.%20ID%20Booking:%20${bookingId}.%20Mohon%20konfirmasi.`, '_blank')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2">
                <i className="fa-brands fa-whatsapp text-sm" /> Konfirmasi via WhatsApp Admin
              </button>
              <button type="button" onClick={onClose}
                className="w-full py-2.5 bg-slate-100 dark:bg-white/10 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer text-slate-700 dark:text-slate-300">
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
