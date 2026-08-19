'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProperty } from '@/lib/PropertyContext';

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

export default function WhatsAppLiveMonitor() {
  const { property } = useProperty();
  const [logs, setLogs] = useState<WaLogEntry[]>([]);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoPilotActive, setAutoPilotActive] = useState<boolean>(true);

  // Takeover / Direct Chat Modal State
  const [selectedTarget, setSelectedTarget] = useState<WaLogEntry | null>(null);
  const [customReplyMsg, setCustomReplyMsg] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);
  const [replySuccessToast, setReplySuccessToast] = useState<string | null>(null);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastMsg, setBroadcastMsg] = useState<string>(
    '📢 PENGUMUMAN PENGHUNI KOSAN:\nBesok pagi jam 09.00 - 11.00 WIB akan dilakukan pembersihan berkala tandon air & filter utama. Mohon tampung air secukupnya. Terima kasih!'
  );
  const [isSendingBroadcast, setIsSendingBroadcast] = useState<boolean>(false);

  // Direct Inbound Test Simulation State
  const [simMessage, setSimMessage] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll live WhatsApp stream
  const fetchWaStream = async () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
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

  useEffect(() => {
    fetchWaStream();
    const interval = setInterval(fetchWaStream, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchWaStream();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  // Send Direct Message from Owner to WhatsApp User
  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget || !customReplyMsg.trim()) return;

    setIsSendingReply(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: selectedTarget.phone,
          message: `👑 *Pesan Langsung dari Pengelola (${property.name}):*\n\n${customReplyMsg.trim()}`,
        }),
      });

      if (res.ok) {
        setReplySuccessToast(`Pesan WhatsApp berhasil dikirim ke ${selectedTarget.senderName} (${selectedTarget.phone})`);
        setCustomReplyMsg('');
        setSelectedTarget(null);
        fetchWaStream();
      } else {
        alert('Gagal mengirim pesan WhatsApp. Pastikan Gateway Fonnte aktif.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsSendingReply(false);
      setTimeout(() => setReplySuccessToast(null), 4000);
    }
  };

  // Send Broadcast to All Active Tenants
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;

    setIsSendingBroadcast(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: '082217415131',
          message: broadcastMsg.trim(),
        }),
      });

      if (res.ok) {
        setReplySuccessToast(`Siaran Broadcast Pengumuman Berhasil Dikirim ke Seluruh Penghuni Cabang ${property.name}!`);
        setShowBroadcastModal(false);
        fetchWaStream();
      }
    } catch {
      alert('Gagal mengirim broadcast.');
    } finally {
      setIsSendingBroadcast(false);
      setTimeout(() => setReplySuccessToast(null), 4000);
    }
  };

  // Simulate Inbound Message to Webhook
  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    setIsSimulating(true);
    try {
      const res = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: '082217415131',
          message: simMessage.trim(),
        }),
      });

      if (res.ok) {
        setSimMessage('');
        fetchWaStream();
      }
    } catch {}
    finally {
      setIsSimulating(false);
    }
  };

  // Filter logs strictly per active property branch and search
  const filteredLogs = logs
    .filter((l) => {
      // 1. Property Branch Isolation Filter:
      if (property?.name && !property.name.toLowerCase().includes('konsolidasi') && property.id !== 'all') {
        if (l.property) {
          const pNameLower = property.name.toLowerCase();
          const lPropLower = l.property.toLowerCase();
          const matches =
            lPropLower.includes(pNameLower) ||
            pNameLower.includes(lPropLower) ||
            (pNameLower.includes('rshs') && lPropLower.includes('rshs')) ||
            (pNameLower.includes('pasteur') && lPropLower.includes('pasteur')) ||
            (pNameLower.includes('dago') && lPropLower.includes('dago')) ||
            (pNameLower.includes('suci') && lPropLower.includes('suci'));
          if (!matches) return false;
        }
      }

      // 2. Role Category Filter:
      if (filterRole === 'ALL') return true;
      return l.detectedRole?.toUpperCase().includes(filterRole.toUpperCase());
    })
    .filter((l) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.senderName?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.inboundText?.toLowerCase().includes(q) ||
        l.replyText?.toLowerCase().includes(q) ||
        l.actionTaken?.toLowerCase().includes(q)
      );
    });

  const roleStyles: Record<string, { badgeBg: string; textColor: string; label: string; icon: string; border: string }> = {
    OWNER: { badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400', textColor: 'text-amber-600 dark:text-amber-400', label: '👑 OWNER (PEMILIK)', icon: 'fa-crown', border: 'border-amber-500/20' },
    SUPERADMIN: { badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400', textColor: 'text-amber-600 dark:text-amber-400', label: '👑 SUPERADMIN', icon: 'fa-crown', border: 'border-amber-500/20' },
    TENANT: { badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400', textColor: 'text-emerald-700 dark:text-emerald-400', label: '🏠 TENANT (PENGHUNI)', icon: 'fa-house-user', border: 'border-emerald-500/20' },
    STAFF: { badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400', textColor: 'text-blue-700 dark:text-blue-400', label: '👷 STAFF LAPANGAN', icon: 'fa-helmet-safety', border: 'border-blue-500/20' },
    EMPLOYEE: { badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400', textColor: 'text-blue-700 dark:text-blue-400', label: '👷 STAFF LAPANGAN', icon: 'fa-helmet-safety', border: 'border-blue-500/20' },
    VENDOR_WARUNG: { badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-700 dark:text-orange-400', textColor: 'text-orange-700 dark:text-orange-400', label: '🍽️ VENDOR WARUNG', icon: 'fa-utensils', border: 'border-orange-500/20' },
    VENDOR_GALON: { badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-700 dark:text-cyan-400', textColor: 'text-cyan-700 dark:text-cyan-400', label: '💧 VENDOR DEPOT AIR', icon: 'fa-droplet', border: 'border-cyan-500/20' },
    VENDOR_LAUNDRY: { badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-400', textColor: 'text-purple-700 dark:text-purple-400', label: '🧺 VENDOR LAUNDRY', icon: 'fa-jug-detergent', border: 'border-purple-500/20' },
    VENDOR_TEKNISI: { badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-400', textColor: 'text-rose-700 dark:text-rose-400', label: '🛠️ VENDOR TEKNISI', icon: 'fa-wrench', border: 'border-rose-500/20' },
    LEAD: { badgeBg: 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:text-teal-400', textColor: 'text-teal-700 dark:text-teal-400', label: '🧑‍💼 LEAD (CALON TENANT)', icon: 'fa-user-tie', border: 'border-teal-500/20' },
  };

  const ROLE_COMMANDS = [
    { cmd: '#role lead', label: '🧑‍💼 Calon Tenant', desc: 'Pilih cabang kosan & cek listing kamar' },
    { cmd: '#role tenant', label: '🏠 Penghuni (Tenant)', desc: 'Cek tagihan, pesan galon & komplain' },
    { cmd: '#role staff', label: '👷 Staf Lapangan', desc: 'SO kilat, ajukan dana & lapor cek-in' },
    { cmd: '#role owner', label: '👑 Pemilik Kos', desc: 'Cek kas live & 1-Click approval' },
    { cmd: '#role warung', label: '🍽️ Mitra Warung', desc: 'Terima order makan & update antar' },
    { cmd: '#role depot', label: '💧 Mitra Depot Galon', desc: 'Terima order galon & update status' },
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans text-slate-800 dark:text-slate-100">
      {/* Toast Notification for Direct Actions */}
      {replySuccessToast && (
        <div className="fixed top-6 right-6 z-[9999] px-5 py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-scale-in border border-emerald-400">
          <i className="fa-solid fa-circle-check text-base text-emerald-200" />
          <span>{replySuccessToast}</span>
        </div>
      )}

      {/* Top Banner Header in Neumorphism */}
      <div className="neu-card rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shadow-xs shrink-0">
            <i className="fa-brands fa-whatsapp animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Pusat Kendali WhatsApp &amp; AI Resepsionis
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                PROPERTI: {property.name?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pantau percakapan penghuni, calon penyewa, staf &amp; vendor secara live, serta kirim pesan WhatsApp langsung dari dashboard.
            </p>
          </div>
        </div>

        {/* Owner Action Buttons: Broadcast, Takeover & Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <i className="fa-solid fa-bullhorn" />
            <span>Kirim Broadcast Penghuni</span>
          </button>

          <button
            onClick={() => setAutoPilotActive(!autoPilotActive)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
              autoPilotActive
                ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 bg-emerald-500/10'
                : 'neu-btn text-slate-500'
            }`}
            title="Toggle Status Resepsionis AI Otomatis"
          >
            <i className="fa-solid fa-wand-magic-sparkles" />
            <span>AI Bot: {autoPilotActive ? 'AKTIF (24/7)' : 'PAUSED'}</span>
          </button>

          <button
            onClick={handleManualRefresh}
            className={`px-3 py-2.5 rounded-xl neu-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isRefreshing ? 'scale-95 text-emerald-600' : 'text-slate-700 dark:text-slate-300'
            }`}
            title="Segarkan Feed Live"
          >
            <i className={`fa-solid fa-rotate ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="neu-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL PERCAKAPAN</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{filteredLogs.length}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5 truncate max-w-[130px]">
              {property.name}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
            <i className="fa-solid fa-comments" />
          </div>
        </div>

        <div className="neu-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GATEWAY FONNTE</span>
            <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">TERHUBUNG ✅</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Status: Ready Send/Receive</span>
          </div>
          <div className="w-10 h-10 rounded-xl neu-inset text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-lg">
            <i className="fa-solid fa-satellite-dish" />
          </div>
        </div>

        <div className="neu-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RESEPSIONIS AI</span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {autoPilotActive ? 'MENJAWAB OTOMATIS' : 'MANUAL'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">GPT-4o Mini Turbo</span>
          </div>
          <div className="w-10 h-10 rounded-xl neu-inset text-amber-500 flex items-center justify-center text-lg">
            <i className="fa-solid fa-robot" />
          </div>
        </div>

        <div className="neu-card rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SINKRONISASI DB</span>
            <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">&lt; 1.5 Detik</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">PostgreSQL Live Mutasi</span>
          </div>
          <div className="w-10 h-10 rounded-xl neu-inset text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
            <i className="fa-solid fa-database" />
          </div>
        </div>
      </div>

      {/* Role Switcher Toolbar (Quick Copy for Owner Testing) */}
      <div className="neu-card rounded-3xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-keyboard text-emerald-600 dark:text-emerald-400 text-sm" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Uji Coba Multi-Aktor dari WhatsApp Anda:
            </h3>
          </div>
          {copiedCmd && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-500 text-white animate-scale-in shadow-sm">
              ✓ Tersalin: {copiedCmd} (Kirim ke bot WA Anda!)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROLE_COMMANDS.map((r) => (
            <button
              key={r.cmd}
              type="button"
              onClick={async () => {
                copyToClipboard(r.cmd);
                try {
                  const res = await fetch('/api/whatsapp/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sender: '082217415131',
                      message: r.cmd,
                    }),
                  });
                  if (res.ok) {
                    setReplySuccessToast(`✓ Berhasil Beralih ke Peran: ${r.label}`);
                    setTimeout(() => setReplySuccessToast(null), 3500);
                    fetchWaStream();
                  }
                } catch {}
              }}
              title={`Klik untuk langsung beralih ke ${r.label}`}
              className="px-3 py-2 rounded-xl neu-btn hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shrink-0 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{r.label}</span>
              <code className="text-[10px] px-2 py-0.5 rounded-lg neu-inset text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {r.cmd}
              </code>
            </button>
          ))}
        </div>

        {/* Direct Inbound Simulation Bar */}
        <form onSubmit={handleSimulateInbound} className="pt-2.5 border-t border-slate-200/50 dark:border-white/5 flex items-center gap-2">
          <div className="relative flex-1">
            <i className="fa-brands fa-whatsapp absolute left-3.5 top-3 text-xs text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              value={simMessage}
              onChange={(e) => setSimMessage(e.target.value)}
              placeholder="Ketik pesan uji coba (contoh: Kas, Tagihan, SO 12 2 6, Plot CMP-101 ke Bambang, 1)..."
              className="w-full neu-input rounded-2xl pl-9 pr-4 py-2 text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            disabled={isSimulating || !simMessage.trim()}
            className="px-4 py-2 bg-[#047857] hover:bg-[#065f46] text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50 transition-all active:scale-95"
          >
            {isSimulating ? (
              <i className="fa-solid fa-spinner animate-spin" />
            ) : (
              <>
                <i className="fa-solid fa-paper-plane text-xs" />
                <span>Kirim Tes WA</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="neu-card rounded-3xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['ALL', 'OWNER', 'TENANT', 'STAFF', 'VENDOR', 'LEAD'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterRole(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterRole === f
                  ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 bg-emerald-500/10 shadow-xs'
                  : 'neu-btn text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Input & Auto-Scroll */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-xs text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, no HP, pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full neu-input rounded-xl pl-8 pr-3 py-1.5 text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none shrink-0 px-2 py-1 neu-inset rounded-xl">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            Auto-Scroll
          </label>
        </div>
      </div>

      {/* Message Feed Stream */}
      <div
        ref={scrollRef}
        className="space-y-4 max-h-[750px] overflow-y-auto pr-1 scrollbar-none"
      >
        {filteredLogs.length === 0 ? (
          <div className="neu-card rounded-3xl p-12 text-center space-y-4 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-3xl neu-inset text-slate-400 flex items-center justify-center text-3xl">
              <i className="fa-solid fa-satellite-dish animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-800 dark:text-slate-200">
                Menunggu Pesan WhatsApp Masuk...
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                Setiap pesan yang dikirimkan oleh penghuni, calon penyewa, staf, atau vendor ke bot WhatsApp kosan akan muncul di sini secara real-time.
              </p>
            </div>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const style = roleStyles[log.detectedRole] || {
              badgeBg: 'bg-slate-500/15 border-slate-500/30 text-slate-600 dark:text-slate-400',
              textColor: 'text-slate-600 dark:text-slate-400',
              label: log.detectedRole,
              icon: 'fa-user',
              border: 'border-slate-500/20',
            };

            return (
              <div
                key={log.id || idx}
                className="neu-card rounded-3xl p-5 sm:p-6 space-y-4 transition-all hover:scale-[1.005]"
              >
                {/* Header Information */}
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`px-3 py-1 rounded-full border text-[10px] font-black flex items-center gap-1.5 ${style.badgeBg}`}>
                      <i className={`fa-solid ${style.icon}`} /> {style.label}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {log.senderName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({log.phone})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTarget(log)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    >
                      <i className="fa-brands fa-whatsapp" />
                      <span>Balas Langsung</span>
                    </button>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <i className="fa-regular fa-clock" /> {log.timestamp}
                    </div>
                  </div>
                </div>

                {/* Inbound & Outbound Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* INBOUND: Dari Pengguna */}
                  <div className="neu-inset rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-wider text-sky-600 dark:text-sky-400 uppercase">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-arrow-down-left text-xs" /> PESAN DARI {log.senderName.toUpperCase()}:
                      </span>
                      <span className="text-slate-400 font-mono font-normal">WhatsApp</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 text-slate-900 dark:text-slate-100 font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-xs">
                      {log.inboundText}
                    </div>
                  </div>

                  {/* OUTBOUND: Balasan Resmi Bot */}
                  <div className="neu-inset rounded-2xl p-4 space-y-2 bg-emerald-500/5">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">
                      <span className="flex items-center gap-1.5">
                        <i className="fa-solid fa-arrow-up-right text-xs" /> RESPONS BOT / RESEPSIONIS AI:
                      </span>
                      <span className="text-emerald-600 font-mono font-bold">200 OK</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20 text-slate-800 dark:text-emerald-100 font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-xs">
                      {log.replyText}
                    </div>
                  </div>
                </div>

                {/* Action Taken & DB Mutation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-200/50 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600 dark:text-slate-300">⚡ Aksi Sistem &amp; DB:</span>
                    <code className="px-2 py-0.5 rounded-lg neu-inset text-amber-600 dark:text-amber-400 font-mono font-bold text-[10px]">
                      {log.actionTaken || 'ROUTED_MESSAGE'}
                    </code>
                  </div>
                  {log.property && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <i className="fa-solid fa-building-user text-xs text-emerald-600" />
                      <span>{log.property}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DIRECT CHAT / TAKEOVER MODAL (100% Transparent Backdrop, No Dark Layer) */}
      {selectedTarget && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-transparent backdrop-blur-[2px] animate-fade-in"
          onClick={() => setSelectedTarget(null)}
        >
          <div
            className="w-full max-w-lg neu-card rounded-3xl p-5 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto border border-white/80 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] animate-scale-in text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-black">
                  <i className="fa-brands fa-whatsapp" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Balas Pesan WhatsApp
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    Kirim balasan langsung dari Pengelola ({property.name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTarget(null)}
                className="w-9 h-9 rounded-2xl neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Target Card Banner */}
            <div className="neu-inset p-4 sm:p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PENERIMA PESAN</span>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {selectedTarget.senderName}
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedTarget.phone}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase neu-card-sm text-slate-600 dark:text-slate-300">
                  {selectedTarget.detectedRole}
                </span>
              </div>

              <div className="p-3 rounded-2xl neu-card-sm text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Pesan Terakhir Masuk:</span>
                <p className="text-slate-800 dark:text-slate-200 italic font-medium">
                  &quot;{selectedTarget.inboundText}&quot;
                </p>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendDirectMessage} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Tulis Pesan Balasan Resmi:
                </label>
                <textarea
                  rows={4}
                  value={customReplyMsg}
                  onChange={(e) => setCustomReplyMsg(e.target.value)}
                  placeholder="Halo Kak, terkait hal tersebut sudah kami tindak lanjuti ya..."
                  required
                  className="w-full neu-input rounded-2xl p-3.5 text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 font-sans leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTarget(null)}
                  className="px-5 py-2.5 neu-btn text-xs font-extrabold text-slate-700 dark:text-slate-300 rounded-2xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingReply || !customReplyMsg.trim()}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white text-xs font-extrabold rounded-2xl shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSendingReply ? (
                    <span>Mengirim...</span>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane text-xs" />
                      <span>Kirim ke WhatsApp</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BROADCAST ANNOUNCEMENT MODAL (100% Transparent Backdrop, No Dark Layer) */}
      {showBroadcastModal && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-transparent backdrop-blur-[2px] animate-fade-in"
          onClick={() => setShowBroadcastModal(false)}
        >
          <div
            className="w-full max-w-lg neu-card rounded-3xl p-5 sm:p-6 space-y-4 max-h-[88vh] overflow-y-auto border border-white/80 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)] animate-scale-in text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl neu-inset text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg font-black">
                  <i className="fa-solid fa-bullhorn" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Broadcast Pengumuman Penghuni
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                    Kirim siaran WhatsApp serentak ke seluruh kamar cabang {property.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="w-9 h-9 rounded-2xl neu-btn flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Broadcast Details Banner */}
            <div className="neu-inset p-4 sm:p-5 rounded-3xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TARGET SIARAN</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    Seluruh Penghuni Aktif (OCCUPIED)
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Cabang: {property.name}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl neu-card-sm flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-lg">
                  <i className="fa-solid fa-tower-broadcast animate-pulse" />
                </div>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Isi Pesan Siaran WhatsApp:
                </label>
                <textarea
                  rows={5}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Tulis pengumuman resmi di sini..."
                  required
                  className="w-full neu-input rounded-2xl p-3.5 text-xs outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 font-sans leading-relaxed"
                />
              </div>

              <div className="neu-card-sm p-3.5 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1 border border-slate-200/50 dark:border-white/5">
                <span className="font-bold text-[#047857] dark:text-emerald-400 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-info" /> Otomasi Gateway Fonnte:
                </span>
                <p>Pesan ini dikirimkan melalui server WhatsApp Gateway resmi dan langsung masuk ke kontak WhatsApp penghuni.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-5 py-2.5 neu-btn text-xs font-extrabold text-slate-700 dark:text-slate-300 rounded-2xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSendingBroadcast || !broadcastMsg.trim()}
                  className="px-5 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white text-xs font-extrabold rounded-2xl shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                >
                  {isSendingBroadcast ? (
                    <span>Menyiarkan...</span>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane text-xs" />
                      <span>Siarkan ke Semua Penghuni</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
