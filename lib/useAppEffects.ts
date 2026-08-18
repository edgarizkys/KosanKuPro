'use client';

import { useEffect } from 'react';

export function useAppEffects() {
  useEffect(() => {
    // Particles
    const c = document.getElementById('particlesContainer');
    if (c && c.children.length === 0) {
      const colors = ['rgba(226,217,226,0.2)', 'rgba(142,110,149,0.2)', 'rgba(218,165,32,0.15)'];
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const s = Math.random() * 5 + 2;
        const col = colors[Math.floor(Math.random() * colors.length)];
        p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;background:${col};animation-duration:${Math.random() * 20 + 12}s;animation-delay:${Math.random() * 12}s;`;
        c.appendChild(p);
      }
    }

    // Cursor glow
    const glow = document.getElementById('cursorGlow');
    let mx = 0, my = 0, gx = 0, gy = 0;
    let rafId: number;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const loop = () => {
      gx += (mx - gx) * 0.06;
      gy += (my - gy) * 0.06;
      if (glow) { glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; }
      rafId = requestAnimationFrame(loop);
    };
    document.addEventListener('mousemove', onMove);
    rafId = requestAnimationFrame(loop);

    // Scroll reveal observer with dynamic support for new nodes
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('active');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    const observeElements = () => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-diagonal, .stagger-item').forEach((el) => {
        obs.observe(el);
      });
    };

    observeElements();

    // Re-scan when new DOM elements appear
    const mutObs = new MutationObserver(() => {
      observeElements();
    });
    mutObs.observe(document.body, { childList: true, subtree: true });

    // Ripple
    const onRipple = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('.ripple-effect');
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span');
      rip.className = 'ripple';
      const size = Math.max(r.width, r.height);
      rip.style.width = rip.style.height = size + 'px';
      rip.style.left = (e.clientX - r.left - size / 2) + 'px';
      rip.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(rip);
      setTimeout(() => rip.remove(), 700);
    };
    document.addEventListener('click', onRipple);

    // Magnetic buttons
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    const magneticHandlers: Array<{ el: Element; move: (e: Event) => void; leave: () => void }> = [];
    magneticBtns.forEach((btn) => {
      const move = (e: Event) => {
        const me = e as MouseEvent;
        const r = (btn as HTMLElement).getBoundingClientRect();
        const x = me.clientX - r.left - r.width / 2;
        const y = me.clientY - r.top - r.height / 2;
        (btn as HTMLElement).style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      };
      const leave = () => { (btn as HTMLElement).style.transform = ''; };
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', leave);
      magneticHandlers.push({ el: btn, move, leave });
    });

    // Scroll handling: Scroll progress bar + Parallax on Hero & Background
    const progressBar = document.getElementById('scrollProgressBar');
    const heroText = document.querySelector('.hero-parallax-text') as HTMLElement | null;
    const heroHouse = document.querySelector('.hero-parallax-house') as HTMLElement | null;
    const ambientGlows = document.querySelectorAll('.ambient-glow');

    const onScrollUpdate = () => {
      const y = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Update progress bar
      if (progressBar && docHeight > 0) {
        const progress = Math.min(100, Math.max(0, (y / docHeight) * 100));
        progressBar.style.width = `${progress}%`;
      }

      // Parallax on Hero elements (smooth 60fps)
      if (y < 800) {
        if (heroText) {
          heroText.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
          heroText.style.opacity = `${Math.max(0, 1 - y / 650)}`;
        }
        if (heroHouse) {
          heroHouse.style.transform = `translate3d(0, ${y * 0.06}px, 0) scale(${1 + y * 0.0001})`;
        }
      }

      // Ambient glows parallax
      ambientGlows.forEach((glow, idx) => {
        const speed = idx === 0 ? 0.08 : -0.08;
        (glow as HTMLElement).style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    };

    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    onScrollUpdate(); // Initial call

    // Navbar scroll
    let last = 0;
    const h = document.querySelector('header');
    const onScrollNavbar = () => {
      const cur = window.pageYOffset;
      if (!h) return;
      if (cur > last && cur > 80) { h.classList.add('navbar-hidden'); h.classList.remove('navbar-visible'); }
      else { h.classList.remove('navbar-hidden'); h.classList.add('navbar-visible'); }
      last = cur;
    };
    window.addEventListener('scroll', onScrollNavbar, { passive: true });

    // Parallax orbs
    const orbs = document.querySelectorAll('.parallax-orb');
    const onParallax = () => {
      const y = window.pageYOffset;
      orbs.forEach((o, i) => { (o as HTMLElement).style.transform = `translate3d(0, ${y * (i + 1) * 0.03}px, 0)`; });
    };
    window.addEventListener('scroll', onParallax, { passive: true });

    // Spotlight cards
    const spotCards = document.querySelectorAll('.spotlight-card');
    const spotHandlers: Array<{ el: Element; move: (e: Event) => void }> = [];
    spotCards.forEach((card) => {
      const move = (e: Event) => {
        const me = e as MouseEvent;
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = ((me.clientX - rect.left) / rect.width) * 100;
        const y = ((me.clientY - rect.top) / rect.height) * 100;
        (card as HTMLElement).style.setProperty('--spot-x', x + '%');
        (card as HTMLElement).style.setProperty('--spot-y', y + '%');
      };
      card.addEventListener('mousemove', move);
      spotHandlers.push({ el: card, move });
    });

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onRipple);
      window.removeEventListener('scroll', onScrollUpdate);
      window.removeEventListener('scroll', onScrollNavbar);
      window.removeEventListener('scroll', onParallax);
      obs.disconnect();
      mutObs.disconnect();
      magneticHandlers.forEach(({ el, move, leave }) => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); });
      spotHandlers.forEach(({ el, move }) => { el.removeEventListener('mousemove', move); });
    };
  }, []);
}
