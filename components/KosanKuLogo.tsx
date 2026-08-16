'use client';

interface KosanKuLogoProps {
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export default function KosanKuLogo({
  size = 'md',
  subtitle = 'Property Management',
  onClick,
  className = '',
}: KosanKuLogoProps) {
  const sizeMap = {
    sm: {
      icon: 'w-8 h-8 sm:w-9 sm:h-9',
      title: 'text-sm sm:text-base',
      sub: 'text-[8px]',
      badge: 'px-1.5 py-0.5 text-[9px]',
    },
    md: {
      icon: 'w-10 h-10 sm:w-11 sm:h-11',
      title: 'text-base sm:text-lg',
      sub: 'text-[9px] sm:text-[10px]',
      badge: 'px-2 py-0.5 text-[10px]',
    },
    lg: {
      icon: 'w-12 h-12 sm:w-14 sm:h-14',
      title: 'text-xl sm:text-2xl',
      sub: 'text-[10px] sm:text-xs',
      badge: 'px-2.5 py-0.5 text-xs',
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer group select-none ${className}`}
    >
      {/* Full-Frame Squircle Emblem Container */}
      <div
        className={`${currentSize.icon} rounded-2xl bg-[#120e20] p-1 flex items-center justify-center neu-card-sm group-hover:scale-105 transition-all duration-300 relative overflow-hidden border border-amber-500/20 shadow-md`}
      >
        <img
          src="/images/kosanku_logo.svg"
          alt="KosanKu Pro Logo Emblem"
          className="w-full h-full object-contain rounded-xl group-hover:scale-110 transition-transform duration-300"
        />
        {/* Subtle Ambient Gold Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-amber-500/20 pointer-events-none" />
      </div>

      {/* Typography & Subtitle */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`${currentSize.title} font-black tracking-tight text-slate-900 dark:text-white leading-none`}>
            KosanKu
          </span>
          <span
            className={`${currentSize.badge} rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-black shadow-2xs tracking-wider uppercase leading-none`}
          >
            PRO
          </span>
        </div>
        {subtitle && (
          <p className={`${currentSize.sub} text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase mt-1`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
