'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: 'Halo! 👋 Selamat datang di KosanKu Pro.\nAda yang bisa kami bantu? Tanya seputar kamar, harga, fasilitas, atau cara booking.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || typing) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setTyping(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages.slice(-10) }),
      });
      const json = await res.json();
      const reply = json.data?.reply || 'Maaf, pesan belum terkirim. Silakan coba lagi ya.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Ups, koneksi lagi gangguan. Coba kirim ulang ya.' }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {open && (
        <div
          id="waChatBox"
          className="mb-3 sm:mb-4 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col border border-slate-200/10"
          style={{ height: 'min(500px, calc(100vh - 120px))', background: 'linear-gradient(180deg, #1e1b2e 0%, #151222 100%)' }}
        >
          {/* Header */}
          <div className="relative px-5 py-4 flex items-center justify-between shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-base shadow-lg shadow-black/20">
                  <i className="fa-solid fa-headset" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-purple-700 rounded-full shadow-sm" />
              </div>
              <div>
                <h4 className="font-bold text-[13px] text-white tracking-wide">Admin KosanKu</h4>
                <span className="text-[10px] text-white/70 font-medium">Online &bull; Siap Membantu</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="relative w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/20 transition-all flex items-center justify-center">
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-xs scrollbar-none">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-2 mt-0.5 shrink-0 shadow-sm">
                    <i className="fa-solid fa-headset text-[8px] text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 text-[11px] leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-medium rounded-2xl rounded-br-md shadow-md shadow-indigo-500/20'
                    : 'bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] text-slate-200 rounded-2xl rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-2 mt-0.5 shrink-0 shadow-sm">
                  <i className="fa-solid fa-headset text-[8px] text-white" />
                </div>
                <div className="px-4 py-3 bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] rounded-2xl rounded-bl-md">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2.5 space-y-1.5 shrink-0">
              <button
                onClick={() => sendMessage('Kamar apa saja yang tersedia?')}
                className="w-full text-left px-3.5 py-2.5 bg-white/[0.05] hover:bg-indigo-500/15 border border-white/[0.08] hover:border-indigo-400/30 rounded-xl text-[11px] text-slate-300 hover:text-indigo-300 font-medium transition-all flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-[10px]"><i className="fa-solid fa-bed" /></span>
                Lihat Kamar Tersedia
              </button>
              <button
                onClick={() => sendMessage('Berapa harga kamar yang ada?')}
                className="w-full text-left px-3.5 py-2.5 bg-white/[0.05] hover:bg-purple-500/15 border border-white/[0.08] hover:border-purple-400/30 rounded-xl text-[11px] text-slate-300 hover:text-purple-300 font-medium transition-all flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-lg bg-purple-500/15 flex items-center justify-center text-[10px]"><i className="fa-solid fa-tag" /></span>
                Info Harga & Fasilitas
              </button>
              <button
                onClick={() => sendMessage('Bagaimana cara booking kamar?')}
                className="w-full text-left px-3.5 py-2.5 bg-white/[0.05] hover:bg-fuchsia-500/15 border border-white/[0.08] hover:border-fuchsia-400/30 rounded-xl text-[11px] text-slate-300 hover:text-fuchsia-300 font-medium transition-all flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-lg bg-fuchsia-500/15 flex items-center justify-center text-[10px]"><i className="fa-solid fa-calendar-check" /></span>
                Cara Booking
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/[0.06] shrink-0 bg-black/20">
            <div className="flex gap-2 items-end">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl text-white text-[12px] outline-none focus:border-indigo-400/40 focus:bg-white/[0.08] transition-all placeholder-slate-500"
              />
              <button
                onClick={() => sendMessage()}
                disabled={typing || !input.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-30 disabled:shadow-none hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200"
              >
                <i className="fa-solid fa-paper-plane text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 text-white text-xl sm:text-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 magnetic-btn"
      >
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-comment-dots'} transition-transform duration-200`} />
      </button>
    </div>
  );
}
