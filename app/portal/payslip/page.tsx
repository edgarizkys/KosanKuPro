'use client';
import React, { useState, useEffect } from 'react';

interface PayrollData {
  id: string;
  staffName: string;
  month: number;
  year: number;
  baseGaji: number;
  tunjangan: number;
  uangMakan: number;
  bonus: number;
  bonusNote?: string;
  potongan: number;
  potonganNote?: string;
  totalBruto: number;
  totalNeto: number;
  bankName?: string;
  bankAccount?: string;
  isPaid: boolean;
  paymentDate?: string;
  payslipNotes?: string;
}

export default function PayslipPortal() {
  const [staffName, setStaffName] = useState('Bambang Prasetyo');
  const [staffPhone, setStaffPhone] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [position, setPosition] = useState('Staf Lapangan');
  const [payroll, setPayroll] = useState<PayrollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEstimate, setIsEstimate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const n = p.get('staff') || 'Bambang Prasetyo';
    const ph = p.get('phone') || '';
    const monthParam = p.get('month');
    const m = monthParam ? Number(monthParam.slice(5, 7)) : new Date().getMonth() + 1;
    const y = monthParam ? Number(monthParam.slice(0, 4)) : new Date().getFullYear();
    const prop = p.get('property') || 'Juragan Kost Pasteur (Depan RSHS)';
    const pos = p.get('position') || 'Staf Lapangan';
    setStaffName(n); setStaffPhone(ph); setMonth(m); setYear(y);
    setProperty(prop); setPosition(pos);
    fetchPayroll(n, ph, m, y);
  }, []);

  const fetchPayroll = async (name: string, phone: string, m: number, y: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: String(m), year: String(y) });
      if (name) params.set('staff', name);
      if (phone) params.set('phone', phone);
      const res = await fetch(`/api/payroll?${params}`);
      const data = await res.json();
      setPayroll(data.data || null);
      setIsEstimate(data.isEstimate || false);
    } catch {
      setPayroll(null);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `Rp ${(n || 0).toLocaleString('id-ID')}`;
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const monthLabel = `${monthNames[month]} ${year}`;

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-money-check-dollar text-xs" /><span>SLIP GAJI DIGITAL STAF</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Slip Gaji {monthLabel}</h1>
          <p className="text-xs text-slate-400 mt-1">{staffName} — {position}</p>
          {isEstimate && <p className="text-[10px] text-amber-500 font-bold mt-1">* Estimasi — slip resmi belum diterbitkan Owner</p>}
        </div>

        {loading ? (
          <div className="neu-card rounded-3xl p-10 text-center">
            <i className="fa-solid fa-spinner animate-spin text-2xl text-[#047857] mb-3 block" />
            <p className="text-xs text-slate-400">Memuat data gaji dari database...</p>
          </div>
        ) : payroll ? (
          <div className="neu-card rounded-3xl p-5 space-y-4">
            {/* Staff Info */}
            <div className="flex items-center gap-4 border-b border-slate-200/50 dark:border-white/5 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-2xl font-black shadow-lg">
                {payroll.staffName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-black text-slate-800 dark:text-white">{payroll.staffName}</div>
                <div className="text-xs text-slate-400">{position}</div>
                <div className="text-xs text-slate-400">{property}</div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Periode', monthLabel],
                ['Tgl. Bayar', payroll.isPaid ? `5 ${monthLabel}` : 'Belum dibayar'],
                ['Rekening', payroll.bankName && payroll.bankAccount ? `${payroll.bankName} ${payroll.bankAccount}` : '—'],
                ['Status', payroll.isPaid ? '✅ DIBAYAR' : '⏳ MENUNGGU'],
              ].map(([l, v]) => (
                <div key={l} className="p-2.5 rounded-xl neu-inset">
                  <div className="text-[9px] text-slate-400 uppercase font-black">{l}</div>
                  <div className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {/* Income */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Penghasilan</p>
              <div className="p-3 rounded-2xl neu-inset space-y-2">
                {[
                  ['Gaji Pokok', payroll.baseGaji],
                  ['Tunjangan Jabatan', payroll.tunjangan],
                  [`Uang Makan (${monthNames[payroll.month]})`, payroll.uangMakan],
                  ...(payroll.bonus > 0 ? [[payroll.bonusNote || 'Bonus Kinerja', payroll.bonus] as [string, number]] : []),
                ].map(([label, val]) => (
                  <div key={label as string} className="flex justify-between text-xs">
                    <span className="text-slate-500">{label as string}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{fmt(val as number)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-xs border-t border-slate-200/50 dark:border-white/5 pt-2">
                  <span className="font-black text-slate-600 dark:text-slate-300">Total Penghasilan</span>
                  <span className="font-black text-[#047857]">{fmt(payroll.totalBruto)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Potongan</p>
              <div className="p-3 rounded-2xl neu-inset">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{payroll.potonganNote || 'BPJS Ketenagakerjaan'}</span>
                  <span className="font-bold text-rose-500">−{fmt(payroll.potongan)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="p-4 rounded-2xl bg-[#047857] text-white text-center">
              <div className="text-xs font-bold opacity-80 mb-1">GAJI BERSIH DITERIMA</div>
              <div className="text-2xl font-black font-mono">{fmt(payroll.totalNeto)}</div>
              {payroll.bankName && <div className="text-xs opacity-70 mt-1">Transfer ke {payroll.bankName} {payroll.bankAccount}</div>}
            </div>

            {payroll.payslipNotes && (
              <p className="text-[10px] text-slate-400 text-center italic">{payroll.payslipNotes}</p>
            )}

            <button onClick={() => window.print()}
              className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
              <i className="fa-solid fa-print" /> Cetak / Simpan Slip Gaji
            </button>
          </div>
        ) : (
          <div className="neu-card rounded-3xl p-8 text-center space-y-3">
            <i className="fa-solid fa-file-circle-xmark text-2xl text-slate-400" />
            <p className="text-sm font-bold text-slate-500">Slip gaji {monthLabel} belum tersedia.</p>
            <p className="text-xs text-slate-400">Hubungi Owner untuk penerbitan slip gaji.</p>
          </div>
        )}

        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro — Dokumen Resmi {monthLabel}</p>
      </div>
    </div>
  );
}
