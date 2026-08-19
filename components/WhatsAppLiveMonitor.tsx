'use client';

import React, { useState, useEffect, useRef } from 'react';

interface WaLogEntry {
  id: string;
  timestamp: string;
  date: string;
  phone: string;
  senderName: string;
  detectedRole: string;
  inboundText: string;
  replyText: string;
  actionTaken?: string;
  property?: string;
}

export default function WhatsAppLiveMonitor({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<WaLogEntry[]>([]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll live WhatsApp stream every 1500ms
  useEffect(() => {
    const fetchWaStream = async () => {
      try {
        const res = await fetch('/api/activity?type=wa_live_stream');
        if (res.ok) {
          const json = await res.json();
          if (json?.data && Array.isArray(json.data)) {
            setLogs(json.data);
          }
        }
      } catch {}
    };

    fetchWaStream();
    const interval = setInterval(fetchWaStream, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  if (!isOpen) return null;

  const filteredLogs = filterRole === 'ALL'
    ? logs
    : logs.filter((l) => l.detectedRole?.toUpperCase().includes(filterRole.toUpperCase()));

  const roleBadges: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    OWNER: { bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300', text: 'text-amber-400', label: 'OWNER (PEMILIK)', icon: 'fa-crown' },
    SUPERADMIN: { bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300', text: 'text-amber-400', label: 'SUPERADMIN', icon: 'fa-crown' },
    TENANT: { bg: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300', text: 'text-emerald-400', label: 'TENANT (PENGHUNI)', icon: 'fa-house-user' },
    STAFF: { bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300', text: 'text-blue-400', label: 'STAFF LAPANGAN', icon: 'fa-helmet-safety' },
    EMPLOYEE: { bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300', text: 'text-blue-400', label: 'STAFF LAPANGAN', icon: 'fa-helmet-safety' },
    VENDOR_WARUNG: { bg: 'bg-orange-500/20 border-orange-500/40 text-orange-300', text: 'text-orange-400', label: 'VENDOR WARUNG', icon: 'fa-utensils' },
    VENDOR_GALON: { bg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300', text: 'text-cyan-400', label: 'VENDOR DEPOT AIR/GAS', icon: 'fa-droplet' },
    VENDOR_LAUNDRY: { bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300', text: 'text-purple-400', label: 'VENDOR LAUNDRY', icon: 'fa-jug-detergent' },
    VENDOR_TEKNISI: { bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300', text: 'text-rose-400', label: 'VENDOR TEKNISI', icon: 'fa-wrench' },
    LEAD: { bg: 'bg-teal-500/20 border-teal-500/40 text-teal-300', text: 'text-teal-400', label: 'LEAD (CALON TENANT)', icon: 'fa-user-tie' },
  };

  const ROLE_COMMANDS = [
    { cmd: '#role lead', label: '🧑‍💼 Mode Calon Tenant', desc: 'Pilih cabang kos & cek kamar' },
    { cmd: '#role tenant', label: '🏠 Mode Penghuni', desc: 'Tagihan, komplain, pesan galon' },
    { cmd: '#role staff', label: '👷 Mode Staf', desc: 'SO cepat, ajukan dana, cek-in' },
    { cmd: '#role owner', label: '👑 Mode Owner', desc: 'Cek kas, 1-Click approval' },
    { cmd: '#role warung', label: '🍽️ Mode Warung', desc: 'Order makanan & update antar' },
    { cmd: '#role depot', label: '💧 Mode Depot Galon', desc: 'Order galon & gas LPG' },
    { cmd: '#role laundry', label: '🧺 Mode Laundry', desc: 'Cek kuota cuci & status' },
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-end bg-black/60 backdrop-blur-md animate-fade-in p-2 sm:p-6">
      <div
        className="w-full max-w-2xl h-[92vh] rounded-3xl bg-[#0d1117] border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.15)',
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-lg shadow-lg">
                <i className="fa-brands fa-whatsapp animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0d1117] rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0d1117] rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                  Live WhatsApp API Stream Monitor
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  REAL-TIME POLLING
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Memantau pesan asli masuk dari WhatsApp Anda &amp; mutasi DB live
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Role Switcher Toolbar: Copy to Clipboard */}
        <div className="px-4 py-3 bg-[#161b22]/90 border-b border-slate-800/80 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <i className="fa-solid fa-copy text-emerald-400" /> Klik untuk Salin Perintah ke WhatsApp Anda:
            </span>
            {copiedCmd && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-black animate-scale-in">
                ✅ Tersalin: {copiedCmd} (Tinggal Paste di WA!)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {ROLE_COMMANDS.map((r) => (
              <button
                key={r.cmd}
                onClick={() => copyToClipboard(r.cmd)}
                title={r.desc}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 text-xs font-bold text-slate-200 hover:text-emerald-300 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{r.label}</span>
                <code className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-emerald-400 font-mono">
                  {r.cmd}
                </code>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="px-4 py-2 bg-[#0d1117] border-b border-slate-800/60 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-500 font-bold text-[10px] uppercase mr-1">Filter:</span>
            {['ALL', 'OWNER', 'TENANT', 'STAFF', 'VENDOR', 'LEAD'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterRole(f)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  filterRole === f
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              Auto-Top
            </label>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              {filteredLogs.length} Pesan Terdeteksi
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-none"
        >
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-slate-800/60 border border-slate-700 text-slate-500 flex items-center justify-center text-2xl">
                <i className="fa-solid fa-satellite-dish animate-pulse" />
              </div>
              <h4 className="font-bold text-slate-300 text-sm">Menunggu Pesan WhatsApp Masuk...</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Kirim pesan apa saja dari nomor WhatsApp Anda ke bot KosanKu Pro. Pesan dan responsnya akan muncul seketika di sini!
              </p>
            </div>
          ) : (
            filteredLogs.map((log, idx) => {
              const badge = roleBadges[log.detectedRole] || {
                bg: 'bg-slate-800 border-slate-700 text-slate-300',
                text: 'text-slate-400',
                label: log.detectedRole,
                icon: 'fa-user',
              };

              return (
                <div
                  key={log.id || idx}
                  className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
                >
                  {/* Top Bar Info */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black flex items-center gap-1.5 ${badge.bg}`}>
                        <i className={`fa-solid ${badge.icon}`} /> {badge.label}
                      </span>
                      <span className="text-xs font-bold text-white">
                        {log.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({log.phone})
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      ⏱️ {log.timestamp}
                    </span>
                  </div>

                  {/* Message Inbound & Outbound Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* INBOUND: Pesan dari User */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1 text-sky-400">
                          <i className="fa-solid fa-arrow-down-left" /> PESAN MASUK DARI HP ANDA:
                        </span>
                      </div>
                      <p className="text-slate-100 font-sans text-xs whitespace-pre-wrap bg-slate-800/40 p-2 rounded-lg border border-slate-700/50">
                        {log.inboundText}
                      </p>
                    </div>

                    {/* OUTBOUND: Balasan Bot KosanKu Pro */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400">
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-arrow-up-right" /> BALASAN RESMI BOT WA:
                        </span>
                      </div>
                      <p className="text-emerald-200 font-sans text-xs whitespace-pre-wrap bg-black/40 p-2 rounded-lg border border-emerald-500/20">
                        {log.replyText}
                      </p>
                    </div>
                  </div>

                  {/* Action Summary & DB Mutation */}
                  {log.actionTaken && (
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-bolt text-amber-400" /> Aksi Sistem: <code className="text-amber-300 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{log.actionTaken}</code>
                      </span>
                      {log.property && (
                        <span className="text-slate-500">
                          🏢 {log.property}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#161b22] border-t border-slate-800 flex items-center justify-between text-xs shrink-0 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-300">Gateway WhatsApp Fonnte Siap Menerima Pesan</span>
          </div>
          <span className="text-[10px] text-slate-500">KosanKu Pro Unified Multi-Actor Stream</span>
        </div>
      </div>
    </div>
  );
}
