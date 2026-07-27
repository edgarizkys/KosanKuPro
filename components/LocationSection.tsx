'use client';

export default function LocationSection() {
  return (
    <section id="location-section" className="reveal-scale">
      <div className="glass-panel rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-12 space-y-6 sm:space-y-8 border border-orchid-tint/8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
          <div className="space-y-5 max-w-md">
            <span className="text-[11px] font-bold uppercase tracking-widest text-orchid-gold">Lokasi</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">Strategis di Jantung Dago</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Jl. Ir. H. Juanda No. 128, Dago, Coblong, Bandung. 3 menit dari ITB, UNPAD Dipatiukur &amp; pusat kuliner Dago.
            </p>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orchid-violet/15 text-orchid-tint flex items-center justify-center"><i className="fa-solid fa-phone text-[10px]" /></div>
                +62 812-3456-7890
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orchid-violet/15 text-orchid-tint flex items-center justify-center"><i className="fa-solid fa-envelope text-[10px]" /></div>
                hello@kosanku.pro
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orchid-violet/15 text-orchid-tint flex items-center justify-center"><i className="fa-solid fa-clock text-[10px]" /></div>
                Operasional 24 Jam
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 h-56 sm:h-72 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15844.757048744043!2d107.6083818!3d-6.8903333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e657929a7d37%3A0x6b44a7719602a8db!2sDago%2C%20Coblong%2C%20Bandung%20City%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(0.9) hue-rotate(180deg) brightness(0.9) contrast(1.1)' }}
              allowFullScreen
              loading="lazy"
              title="KosanKu Pro Location"
            />
          </div>
        </div>
        <div className="border-t border-white/5 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-slate-500 gap-3 sm:gap-4">
          <p>&copy; 2026 KosanKu Pro. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-orchid-tint transition-colors">Privacy</a>
            <a href="#" className="hover:text-orchid-tint transition-colors">Terms</a>
            <a href="#" className="hover:text-orchid-tint transition-colors">Status</a>
          </div>
        </div>
      </div>
    </section>
  );
}
