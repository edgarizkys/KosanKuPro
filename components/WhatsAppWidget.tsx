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
    <div className="fixed bottom-[5.5rem] right-4 sm:bottom-6 sm:right-6 z-50">
      {open && (
        <div
          id="waChatBox"
          className="mb-3 sm:mb-4 w-[calc(100vw-2rem)] sm:w-[360px] max-w-[360px] rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col neu-card text-slate-900 dark:text-white"
          style={{ height: 'min(500px, calc(100vh - 120px))' }}
        >
          {/* Header */}
          <div className="relative px-5 py-4 flex items-center justify-between shrink-0 overflow-hidden bg-gradient-to-r from-[#047857] to-teal-700">
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-base shadow-md">
                  <i className="fa-solid fa-headset" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-teal-800 rounded-full shadow-sm" />
              </div>
              <div>
                <h4 className="font-bold text-[13px] text-white tracking-wide">AI Assistant KosanKu</h4>
                <span className="text-[10px] text-emerald-200 font-medium">Online &bull; Siap Membantu</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="relative w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer">
              <i className="fa-solid fa-xmark text-sm" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-xs scrollbar-none neu-inset">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#047857] flex items-center justify-center mr-2 mt-0.5 shrink-0 shadow-sm">
                    <i className="fa-solid fa-headset text-[8px] text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3.5 py-2.5 text-[11px] leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-[#047857] text-white font-medium rounded-2xl rounded-br-md shadow-md'
                    : 'neu-card-sm text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-md'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-[#047857] flex items-center justify-center mr-2 mt-0.5 shrink-0 shadow-sm">
                  <i className="fa-solid fa-headset text-[8px] text-white" />
                </div>
                <div className="px-4 py-3 neu-card-sm rounded-2xl rounded-bl-md">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && (
            <div className="px-4 py-2 space-y-1.5 shrink-0">
              <button
                onClick={() => sendMessage('Kamar apa saja yang tersedia?')}
                className="w-full text-left px-3.5 py-2 neu-btn rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-[10px]"><i className="fa-solid fa-bed" /></span>
                Lihat Kamar Tersedia
              </button>
              <button
                onClick={() => sendMessage('Berapa harga kamar yang ada?')}
                className="w-full text-left px-3.5 py-2 neu-btn rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-[10px]"><i className="fa-solid fa-tag" /></span>
                Info Harga & Fasilitas
              </button>
              <button
                onClick={() => sendMessage('Bagaimana cara booking kamar?')}
                className="w-full text-left px-3.5 py-2 neu-btn rounded-xl text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="w-6 h-6 rounded-lg neu-inset text-[#047857] dark:text-emerald-400 flex items-center justify-center text-[10px]"><i className="fa-solid fa-calendar-check" /></span>
                Cara Booking
              </button>
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-200/60 dark:border-white/5 shrink-0">
            <div className="flex gap-2 items-end">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ketik pesan..."
                className="flex-1 px-4 py-2.5 neu-input rounded-xl text-slate-900 dark:text-white text-[12px] outline-none focus:border-emerald-500 transition-all placeholder-slate-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={typing || !input.trim()}
                className="w-10 h-10 rounded-xl neu-btn text-[#047857] dark:text-emerald-400 flex items-center justify-center text-sm disabled:opacity-30 hover:scale-105 transition-all duration-200 cursor-pointer"
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
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full neu-btn text-[#047857] dark:text-emerald-400 text-xl sm:text-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-comment-dots'} transition-transform duration-200`} />
      </button>
    </div>
  );
}
