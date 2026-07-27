'use client';

import { useState, useRef } from 'react';

interface OCRResult {
  vendor?: string;
  date?: string;
  category?: string;
  totalAmount?: number;
  items?: { name: string; amount: number }[];
  notes?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  listrik: '⚡ Listrik',
  air: '💧 Air',
  internet: '🌐 Internet',
  perbaikan: '🔧 Perbaikan',
  lain_lain: '📦 Lain-lain',
};

export default function OCRUpload() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaved(false);
    setError(null);
    setOcrResult(null);
    setMimeType(file.type || 'image/jpeg');

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Strip data URL prefix to get raw base64
      setImageBase64(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const runOCR = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    setOcrResult(null);

    try {
      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setOcrResult(json.data);
      }
    } catch {
      setError('Gagal menghubungi server OCR.');
    } finally {
      setLoading(false);
    }
  };

  const saveExpense = async () => {
    if (!ocrResult) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: ocrResult.category || 'lain_lain',
          amount: ocrResult.totalAmount || 0,
          description: `${ocrResult.vendor || 'OCR'} - ${ocrResult.notes || 'Struk scan'}`,
          receiptUrl: imagePreview,
          date: ocrResult.date || undefined,
        }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else {
        setSaved(true);
        setImagePreview(null);
        setImageBase64(null);
        setOcrResult(null);
      }
    } catch {
      setError('Gagal menyimpan expense.');
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setImageBase64(null);
    setOcrResult(null);
    setError(null);
    setSaved(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <i className="fa-solid fa-camera-retro text-orchid-tint text-xs" /> Scan Struk AI (OCR)
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Upload foto struk → GPT-4o Vision extract otomatis → simpan sebagai expense</p>
        </div>
        {(imagePreview || saved) && (
          <button onClick={reset} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all">
            <i className="fa-solid fa-rotate-left mr-1" /> Reset
          </button>
        )}
      </div>

      {saved && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-check" /> Expense berhasil disimpan dari hasil OCR!
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation" /> {error}
        </div>
      )}

      {/* Upload area */}
      {!imagePreview && !saved && (
        <label className="block cursor-pointer">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <div className="border-2 border-dashed border-white/10 hover:border-orchid-tint/40 rounded-2xl p-10 text-center transition-all hover:bg-white/3">
            <div className="w-14 h-14 rounded-2xl bg-orchid-tint/10 text-orchid-tint flex items-center justify-center text-xl mx-auto mb-4">
              <i className="fa-solid fa-cloud-arrow-up" />
            </div>
            <p className="text-xs font-bold text-white mb-1">Klik untuk upload struk</p>
            <p className="text-[10px] text-slate-500">JPG, PNG, atau WebP • Maks 10MB</p>
          </div>
        </label>
      )}

      {/* Preview + OCR */}
      {imagePreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image preview */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-white/10">
              <img src={imagePreview} alt="Receipt preview" className="w-full h-56 object-contain bg-black/20" />
            </div>
            <button
              onClick={runOCR}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orchid-tint to-orchid-glow text-orchid-dark font-bold text-xs rounded-xl shadow-lg shadow-orchid-tint/20 hover:shadow-orchid-tint/40 hover:scale-[1.01] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin" /> Memproses OCR...</span>
              ) : (
                <span><i className="fa-solid fa-wand-magic-sparkles mr-2" /> Extract dengan AI</span>
              )}
            </button>
          </div>

          {/* OCR Result */}
          <div className="space-y-4">
            {loading && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-orchid-tint/30 border-t-orchid-tint animate-spin mx-auto" />
                  <p className="text-[11px] text-slate-400">GPT-4o Vision sedang membaca struk...</p>
                </div>
              </div>
            )}
            {ocrResult && !loading && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Extract</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                    <span className="text-slate-400">Vendor</span>
                    <span className="font-bold text-white">{ocrResult.vendor || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                    <span className="text-slate-400">Tanggal</span>
                    <span className="font-bold text-white">{ocrResult.date || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white/3 rounded-xl border border-white/5">
                    <span className="text-slate-400">Kategori</span>
                    <span className="font-bold text-orchid-tint">{CATEGORY_LABELS[ocrResult.category || ''] || ocrResult.category || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-orchid-tint/5 rounded-xl border border-orchid-tint/10">
                    <span className="text-orchid-tint font-semibold">Total</span>
                    <span className="font-black text-orchid-tint">
                      {ocrResult.totalAmount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ocrResult.totalAmount) : '-'}
                    </span>
                  </div>
                  {ocrResult.items && ocrResult.items.length > 0 && (
                    <div className="p-3 bg-white/3 rounded-xl border border-white/5 space-y-1">
                      <span className="text-slate-400 block mb-1">Item:</span>
                      {ocrResult.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span className="text-slate-300">{item.name}</span>
                          <span className="text-white font-semibold">Rp {item.amount?.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={saveExpense}
                  disabled={saving}
                  className="w-full py-3 bg-white text-orchid-dark font-bold text-xs rounded-xl hover:shadow-lg hover:shadow-white/20 transition-all disabled:opacity-50"
                >
                  {saving ? <i className="fa-solid fa-spinner fa-spin mr-2" /> : <i className="fa-solid fa-floppy-disk mr-2" />}
                  Simpan sebagai Expense
                </button>
              </div>
            )}
            {!ocrResult && !loading && (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-[11px] text-slate-500">Klik &quot;Extract dengan AI&quot; untuk membaca struk</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
