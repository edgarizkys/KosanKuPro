'use client';
import React, { useState, useEffect } from 'react';

export default function VendorCatalogPortal() {
  const [vendor, setVendor] = useState('Depot Air & Gas Suci');
  const [category, setCategory] = useState('SEMUA');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [ordered, setOrdered] = useState(false);
  const [room, setRoom] = useState('EKS-01');
  const [tenant, setTenant] = useState('');
  const [loading, setLoading] = useState(false);

  const catalog = [
    { id: 'galon', cat: 'AIR', name: 'Refill Air Galon Aqua 19L', price: 20000, unit: 'galon', icon: '💧' },
    { id: 'galon5', cat: 'AIR', name: 'Refill Galon Le Minerale 19L', price: 22000, unit: 'galon', icon: '💧' },
    { id: 'gas3', cat: 'GAS', name: 'Gas LPG 3 Kg', price: 25000, unit: 'tabung', icon: '🔥' },
    { id: 'gas12', cat: 'GAS', name: 'Gas LPG 12 Kg', price: 165000, unit: 'tabung', icon: '🔥' },
    { id: 'laundry5', cat: 'LAUNDRY', name: 'Laundry Kiloan 5 Kg', price: 35000, unit: 'kg', icon: '👕' },
    { id: 'laundry10', cat: 'LAUNDRY', name: 'Laundry Express 3 Jam', price: 50000, unit: 'paket', icon: '👔' },
    { id: 'nasi', cat: 'WARUNG', name: 'Nasi Goreng Spesial', price: 18000, unit: 'porsi', icon: '🍳' },
    { id: 'mie', cat: 'WARUNG', name: 'Mie Goreng Telur', price: 15000, unit: 'porsi', icon: '🍜' },
    { id: 'ayam', cat: 'WARUNG', name: 'Nasi Ayam Kecap', price: 22000, unit: 'porsi', icon: '🍗' },
    { id: 'kopi', cat: 'WARUNG', name: 'Kopi Susu Kekinian', price: 12000, unit: 'gelas', icon: '☕' },
  ];

  const categories = ['SEMUA', 'AIR', 'GAS', 'LAUNDRY', 'WARUNG'];
  const filtered = category === 'SEMUA' ? catalog : catalog.filter(i => i.cat === category);
  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = catalog.reduce((a, item) => a + (cart[item.id] || 0) * item.price, 0);
  const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    if (p.get('vendor')) setVendor(p.get('vendor')!);
    if (p.get('room')) setRoom(p.get('room')!);
    if (p.get('tenant')) setTenant(p.get('tenant')!);
  }, []);

  const addCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeCart = (id: string) => setCart(prev => { const n = { ...prev }; if (n[id] > 1) n[id]--; else delete n[id]; return n; });

  const handleOrder = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const items = catalog.filter(i => cart[i.id]).map(i => `${i.name} (${cart[i.id]}x)`).join(', ');
    try {
      await fetch('/api/activity', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'SUPPLY_ORDER', payload: { tenantName: tenant || 'Penghuni Kos', roomNumber: room, item: items, vendor, amount: totalPrice } }),
      });
    } catch {}
    setOrdered(true);
    setLoading(false);
  };

  if (ordered) return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="max-w-md w-full neu-card rounded-3xl p-8 text-center space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-[#047857] text-white flex items-center justify-center text-3xl mx-auto shadow-lg">🛵</div>
        <div><h2 className="text-xl font-black text-slate-800 dark:text-white">Pesanan Diterima!</h2>
          <p className="text-xs text-slate-500 mt-2">Pesanan Anda dari <strong className="text-[#047857]">{vendor}</strong> sedang diproses dan akan segera dikirim ke Kamar {room}.</p></div>
        <p className="text-2xl font-black text-[#047857] font-mono">{fmt(totalPrice)}</p>
        <button onClick={() => window.open(`https://wa.me/6282217415131?text=Halo%20KosanKu%20Pro,%20saya%20pesan%20dari%20${encodeURIComponent(vendor)}`, '_blank')}
          className="w-full py-3.5 rounded-2xl neu-btn font-black text-sm text-[#047857] flex items-center justify-center gap-2 cursor-pointer">
          <i className="fa-brands fa-whatsapp" /> Cek Status Pesanan via WA
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center font-sans antialiased">
      <div className="max-w-md w-full space-y-5">
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] text-xs font-black mb-3">
            <i className="fa-solid fa-store text-xs" /><span>KATALOG MITRA VENDOR</span>
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white">{vendor}</h1>
          <p className="text-xs text-slate-400 mt-1">Kamar {room} — Pengiriman ke pintu kamar</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${category === c ? 'neu-card text-[#047857]' : 'neu-inset text-slate-500'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className="neu-card rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{item.icon}</div>
                <div>
                  <div className="text-xs font-black text-slate-800 dark:text-white">{item.name}</div>
                  <div className="text-sm font-black text-[#047857] font-mono">{fmt(item.price)}<span className="text-[10px] text-slate-400 font-normal">/{item.unit}</span></div>
                </div>
              </div>
              {cart[item.id] ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => removeCart(item.id)} className="w-7 h-7 rounded-xl neu-btn text-slate-600 dark:text-slate-300 font-black cursor-pointer flex items-center justify-center">−</button>
                  <span className="w-6 text-center text-sm font-black text-[#047857]">{cart[item.id]}</span>
                  <button onClick={() => addCart(item.id)} className="w-7 h-7 rounded-xl neu-btn-primary text-xs font-black cursor-pointer flex items-center justify-center">+</button>
                </div>
              ) : (
                <button onClick={() => addCart(item.id)} className="px-3 py-1.5 rounded-xl neu-btn text-xs font-black text-[#047857] cursor-pointer">+ Tambah</button>
              )}
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        {totalItems > 0 && (
          <div className="sticky bottom-4 neu-card rounded-3xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-slate-400">{totalItems} item dipilih</div>
                <div className="text-lg font-black text-[#047857] font-mono">{fmt(totalPrice)}</div>
              </div>
              <button onClick={handleOrder} disabled={loading}
                className="px-5 py-3 rounded-2xl neu-btn-primary text-sm font-black flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50">
                {loading ? <i className="fa-solid fa-spinner animate-spin" /> : <><i className="fa-solid fa-basket-shopping" /> Pesan Sekarang</>}
              </button>
            </div>
          </div>
        )}
        <div className="pb-24" />
      </div>
    </div>
  );
}
