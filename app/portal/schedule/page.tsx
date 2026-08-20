'use client';
import React, { useState, useEffect } from 'react';

interface ScheduleDay {
  id: string;
  dayOfWeek: number;
  dayName?: string;
  shift: string;
  startTime: string;
  endTime: string;
  tasks: string[];
  status: string;
  staffName: string;
}

export default function StaffSchedulePortal() {
  const [staffName, setStaffName] = useState('Bambang Prasetyo');
  const [staffPhone, setStaffPhone] = useState('');
  const [week, setWeek] = useState('');
  const [property, setProperty] = useState('Juragan Kost Pasteur (Depan RSHS)');
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDefault, setIsDefault] = useState(false);

  const weekDayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const n = p.get('staff') || 'Bambang Prasetyo';
    const ph = p.get('phone') || '';
    const w = p.get('week') || '';
    const prop = p.get('property') || 'Juragan Kost Pasteur (Depan RSHS)';
    setStaffName(n); setStaffPhone(ph); setWeek(w); setProperty(prop);

    // Compute Monday of current week if not given
    let weekParam = w;
    if (!weekParam) {
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      now.setDate(diff);
      weekParam = now.toISOString().slice(0, 10);
      setWeek(weekParam);
    }

    fetchSchedule(n, ph, weekParam);
  }, []);

  const fetchSchedule = async (name: string, phone: string, w: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ week: w });
      if (name) params.set('staff', name);
      if (phone) params.set('phone', phone);
      const res = await fetch(`/api/staff-schedule?${params}`);
      const data = await res.json();
      setSchedule(data.data || []);
      setIsDefault(data.isDefault || false);
    } catch {
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { cls: string; label: string }> = {
    SELESAI: { cls: 'bg-emerald-500/15 text-[#047857] border-emerald-500/20', label: '✅ Selesai' },
    PROSES: { cls: 'bg-blue-500/15 text-blue-600 border-blue-500/20', label: '🔄 Dikerjakan' },
    RENCANA: { cls: 'bg-slate-200 text-slate-500 border-slate-300 dark:bg-white/10 dark:text-slate-400 dark:border-white/10', label: '📅 Rencana' },
    LIBUR: { cls: 'bg-amber-500/15 text-amber-600 border-amber-500/20', label: '🌴 Libur' },
  };

  const shiftColor: Record<string, string> = {
    PAGI: 'text-amber-500', SORE: 'text-blue-500', PIKET: 'text-purple-500', LIBUR: 'text-slate-400',
  };

  const todayDow = new Date().getDay() === 0 ? 7 : new Date().getDay(); // Mon=1 … Sun=7

  const weekLabel = week ? new Date(week).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-amber-600 text-xs font-black mb-3">
            <i className="fa-solid fa-calendar-week text-xs" /><span>JADWAL SHIFT STAF LAPANGAN</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">Jadwal Minggu Ini</h1>
          <p className="text-xs text-slate-400 mt-1">{staffName} • {property}</p>
          {week && <p className="text-[10px] text-slate-400 mt-0.5">Minggu {weekLabel}</p>}
          {isDefault && <p className="text-[10px] text-amber-500 mt-1 font-bold">* Jadwal template — belum diinput Owner</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Pagi', val: schedule.filter(s => s.shift === 'PAGI').length, color: 'text-amber-500', icon: 'fa-sun' },
            { label: 'Sore', val: schedule.filter(s => s.shift === 'SORE').length, color: 'text-blue-500', icon: 'fa-moon' },
            { label: 'Libur', val: schedule.filter(s => s.shift === 'LIBUR').length, color: 'text-[#047857]', icon: 'fa-tree' },
          ].map(s => (
            <div key={s.label} className="neu-inset rounded-2xl p-3 text-center">
              <i className={`fa-solid ${s.icon} text-lg ${s.color} mb-1 block`} />
              <div className={`text-lg font-black ${s.color}`}>{s.val}</div>
              <div className="text-[10px] text-slate-400">Shift {s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="neu-card rounded-3xl p-10 text-center">
            <i className="fa-solid fa-spinner animate-spin text-2xl text-[#047857] mb-3 block" />
            <p className="text-xs text-slate-400">Memuat jadwal dari database...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((day) => {
              const dow = day.dayOfWeek;
              const isToday = dow === todayDow;
              const dayName = day.dayName || weekDayNames[dow] || `Hari ${dow}`;
              const sc = statusConfig[day.status] || statusConfig['RENCANA'];
              return (
                <div key={day.id} className={`neu-card rounded-2xl p-4 ${isToday ? 'border border-[#047857]/30' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isToday && <div className="w-2 h-2 rounded-full bg-[#047857] animate-pulse" />}
                      <div>
                        <div className="text-sm font-black text-slate-800 dark:text-white">
                          {dayName} {isToday && <span className="text-[10px] text-[#047857] font-black">(HARI INI)</span>}
                        </div>
                        <div className={`text-xs font-bold ${shiftColor[day.shift] || 'text-slate-400'}`}>
                          <i className="fa-solid fa-clock mr-1" />
                          {day.shift} — {day.startTime !== '—' ? `${day.startTime} – ${day.endTime}` : '—'}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${sc.cls}`}>{sc.label}</span>
                  </div>
                  {day.shift !== 'LIBUR' && day.tasks.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {day.tasks.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0" />
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[10px] text-center text-slate-400 pb-4">KosanKu Pro — Sistem Jadwal Staf Digital</p>
      </div>
    </div>
  );
}
