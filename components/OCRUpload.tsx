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
    <div className="bg-white/90 dark:bg-[#161224]/80 backdrop-blur-xl border border-black/5 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs text-slate-900 dark:text-white transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <i className="fa-solid fa-camera-retro text-purple-600 dark:text-purple-400 text-xs" /> Scan Struk AI (OCR)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Upload foto struk → GPT-4o Vision extract otomatis → simpan sebagai expense</p>
        </div>
        {(imagePreview || saved) && (
          <button
            onClick={reset}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all cursor-pointer"
          >
            <i className="fa-solid fa-rotate-left mr-1" /> Reset
          </button>
        )}
      </div>

      {saved && (
        <div className="p-4 bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <i className="fa-solid fa-circle-check" /> Expense berhasil disimpan dari hasil OCR!
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-100 dark:bg-rose-500/15 border border-rose-300 dark:border-rose-500/30 rounded-2xl text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <i className="fa-solid fa-circle-exclamation" /> {error}
        </div>
      )}

      {/* Upload area */}
      {!imagePreview && !saved && (
        <label className="block cursor-pointer">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <div className="border-2 border-dashed border-slate-300 dark:border-white/15 hover:border-purple-500 rounded-3xl p-10 text-center transition-all bg-slate-50 dark:bg-black/20 hover:bg-slate-100 dark:hover:bg-black/30">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl mx-auto mb-4 shadow-xs">
              <i className="fa-solid fa-cloud-arrow-up" />
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Klik untuk upload struk / nota pengeluaran</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">JPG, PNG, atau WebP • Maksimal 10MB</p>
          </div>
        </label>
      )}

      {/* Preview + OCR */}
      {imagePreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image preview */}
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/30">
              <img src={imagePreview} alt="Receipt preview" className="w-full h-56 object-contain" />
            </div>
            <button
              onClick={runOCR}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-purple-600 text-white font-bold text-xs rounded-xl shadow-md hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2"><i className="fa-solid fa-spinner fa-spin" /> Memproses OCR AI...</span>
              ) : (
                <span><i className="fa-solid fa-wand-magic-sparkles mr-2" /> Extract Data dengan AI</span>
              )}
            </button>
          </div>

          {/* OCR Result */}
          <div className="space-y-4">
            {loading && (
              <div className="h-full flex items-center justify-center py-8">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 rounded-full border-2 border-purple-500/30 border-t-purple-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Vision AI sedang membaca rincian struk...</p>
                </div>
              </div>
            )}
            {ocrResult && !loading && (
              <div className="space-y-3 animate-scale-in">
                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hasil Extract Otomatis</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200/80 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Vendor</span>
                    <span className="font-bold text-slate-900 dark:text-white">{ocrResult.vendor || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200/80 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tanggal</span>
                    <span className="font-bold text-slate-900 dark:text-white">{ocrResult.date || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200/80 dark:border-white/10">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Kategori</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">{CATEGORY_LABELS[ocrResult.category || ''] || ocrResult.category || '-'}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-500/30">
                    <span className="text-purple-800 dark:text-purple-300 font-bold">Total Tagihan</span>
                    <span className="font-black text-purple-900 dark:text-purple-200 text-sm">
                      {ocrResult.totalAmount ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(ocrResult.totalAmount) : '-'}
                    </span>
                  </div>
                  {ocrResult.items && ocrResult.items.length > 0 && (
                    <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200/80 dark:border-white/10 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Rincian Item:</span>
                      {ocrResult.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-[11px]">
                          <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                          <span className="text-slate-900 dark:text-white font-bold">Rp {item.amount?.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={saveExpense}
                  disabled={saving}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <i className="fa-solid fa-spinner fa-spin mr-2" /> : <i className="fa-solid fa-floppy-disk mr-2" />}
                  Simpan sebagai Pengeluaran Resmi
                </button>
              </div>
            )}
            {!ocrResult && !loading && (
              <div className="h-full flex items-center justify-center text-center py-8">
                <p className="text-xs text-slate-500 dark:text-slate-400">Klik &quot;Extract Data dengan AI&quot; untuk membaca struk secara otomatis.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
