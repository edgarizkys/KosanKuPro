'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function VendorDispatchMagicPortal() {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data)) {
          const found = json.data.find((o: any) => o.id.toLowerCase() === id.toLowerCase());
          if (found) {
            setOrderData(found);
          }
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id') || 'REQ-9901';
      setOrderId(id);

      // Fallback from query params initially
      setOrderData({
        id,
        item: params.get('item') || 'Refill Air Galon Aqua 19L (1x)',
        roomNumber: params.get('room') || 'EKS-01',
        tenantName: params.get('tenant') || 'dr. Rizky Pratama, Sp.A',
        vendorName: params.get('vendor') || 'Depot Air & Gas Suci',
        notes: params.get('notes') || '',
        status: params.get('status') || 'PENDING_DISPATCH',
        property: 'Juragan Kost Pasteur (Depan RSHS Bandung)',
      });

      loadOrder(id);
    }
  }, [loadOrder]);

  const handleUpdateStatus = async (newStatus: 'PROCESSING' | 'DELIVERED') => {
    if (!orderId) return;
    setIsUpdating(true);
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: newStatus,
          vendorName: orderData?.vendorName,
        }),
      });

      const cmdText = newStatus === 'DELIVERED' ? `Selesai ${orderId}` : `Diantar ${orderId}`;
      await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: '085712345678',
          message: cmdText,
        }),
      });

      setOrderData((prev: any) => ({ ...prev, status: newStatus }));
      setToastMessage(
        newStatus === 'DELIVERED'
          ? '✓ Status Berhasil: Selesai Diserahkan ke Kamar'
          : '✓ Status Berhasil: Kurir Sedang Mengantar'
      );
    } catch {
      setToastMessage('Gagal memperbarui status');
    } finally {
      setIsUpdating(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const status = orderData?.status || 'PENDING_DISPATCH';

  return (
    <div className="min-h-screen neu-bg text-slate-800 dark:text-slate-100 p-4 sm:p-6 flex flex-col items-center justify-center font-sans antialiased">
      <div className="max-w-md w-full space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl neu-card-sm text-[#047857] dark:text-emerald-400 text-xs font-black">
            <i className="fa-solid fa-store text-xs" />
            <span>PORTAL MITRA VENDOR</span>
          </div>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl neu-inset font-bold text-slate-600 dark:text-slate-300">
            #{orderId}
          </span>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-3 rounded-2xl bg-[#047857] text-white text-xs font-bold shadow-md flex items-center gap-2 animate-scale-in">
            <i className="fa-solid fa-circle-check text-sm" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Main Delivery Card */}
        <div className="neu-card rounded-3xl p-5 sm:p-6 space-y-5">
          {/* Location & Tenant Info */}
          <div className="flex items-start justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                TUJUAN PENGANTARAN
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-[#047857] dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
                  Kamar {orderData?.roomNumber || 'EKS-01'}
                </span>
                <span className="text-xs font-black text-slate-800 dark:text-white">
                  {orderData?.tenantName || 'Penghuni Kos'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {orderData?.property || 'Juragan Kost Pasteur (Depan RSHS)'}
              </p>
            </div>
            <a
              href={`https://wa.me/6282217415131`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl neu-btn hover:text-[#047857] dark:hover:text-emerald-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 text-slate-700 dark:text-slate-200"
            >
              <i className="fa-brands fa-whatsapp text-sm text-emerald-600" />
              <span>Chat</span>
            </a>
          </div>

          {/* Item Details */}
          <div className="p-4 rounded-2xl neu-inset space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Item Pesanan</span>
              <span className="text-[#047857] dark:text-emerald-400 font-bold text-[10px]">
                {orderData?.vendorName || 'Mitra KosanKu'}
              </span>
            </div>
            <p className="text-sm font-black text-slate-800 dark:text-white">
              {orderData?.item || 'Memuat data pesanan...'}
            </p>
            {orderData?.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/50 dark:border-white/5">
                💬 {orderData.notes}
              </p>
            )}
          </div>

          {/* Status Tracker */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              STATUS PENGANTARAN
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`p-3 rounded-2xl text-center transition-all ${
                  status === 'PENDING_DISPATCH'
                    ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black'
                    : 'neu-inset text-slate-400'
                }`}
              >
                <i className="fa-solid fa-box text-xs block mb-1" />
                <span className="text-[10px] font-bold block">Disiapkan</span>
              </div>
              <div
                className={`p-3 rounded-2xl text-center transition-all ${
                  status === 'PROCESSING' || status === 'DELIVERING'
                    ? 'neu-card-sm border-2 border-blue-600 text-blue-600 dark:text-blue-400 font-black'
                    : 'neu-inset text-slate-400'
                }`}
              >
                <i className="fa-solid fa-motorcycle text-xs block mb-1" />
                <span className="text-[10px] font-bold block">Diantar</span>
              </div>
              <div
                className={`p-3 rounded-2xl text-center transition-all ${
                  status === 'DELIVERED'
                    ? 'neu-card-sm border-2 border-[#047857] text-[#047857] dark:text-emerald-400 font-black'
                    : 'neu-inset text-slate-400'
                }`}
              >
                <i className="fa-solid fa-circle-check text-xs block mb-1" />
                <span className="text-[10px] font-bold block">Selesai</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200/50 dark:border-white/5">
            <button
              type="button"
              disabled={isUpdating || status === 'PROCESSING' || status === 'DELIVERED'}
              onClick={() => handleUpdateStatus('PROCESSING')}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                status === 'PROCESSING'
                  ? 'neu-inset text-blue-600 dark:text-blue-400 font-black cursor-default'
                  : status === 'DELIVERED'
                  ? 'neu-inset text-slate-400 opacity-50 cursor-not-allowed'
                  : 'neu-btn text-slate-700 dark:text-slate-200 hover:text-[#047857] dark:hover:text-emerald-400 active:scale-95'
              }`}
            >
              {isUpdating ? (
                <i className="fa-solid fa-spinner animate-spin" />
              ) : (
                <>
                  <i className="fa-solid fa-motorcycle text-xs" />
                  <span>1. Kurir Berangkat Antar ke Kamar</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isUpdating || status === 'DELIVERED'}
              onClick={() => handleUpdateStatus('DELIVERED')}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                status === 'DELIVERED'
                  ? 'neu-inset text-[#047857] dark:text-emerald-400 font-black cursor-default'
                  : 'bg-[#047857] hover:bg-[#065f46] text-white active:scale-95'
              }`}
            >
              {isUpdating ? (
                <i className="fa-solid fa-spinner animate-spin" />
              ) : (
                <>
                  <i className="fa-solid fa-circle-check text-xs" />
                  <span>2. Sudah Tiba & Diserahkan di Pintu Kamar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-center text-slate-400 font-semibold">
          Sinkronisasi Database KosanKu Pro & Auto-Notifikasi WhatsApp
        </p>
      </div>
    </div>
  );
}
