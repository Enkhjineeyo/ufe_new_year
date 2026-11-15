"use client";

import { useEffect, useRef } from "react";

/**
 * Хөнгөн canvas оддын тэнгэр. Таб нуугдахад зогсоно,
 * prefers-reduced-motion үед хөдөлгөөнгүй зурна.
 */
export default function Starfield({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    type Star = { x: number; y: number; r: number; p: number; s: number; blue: boolean };
    let stars: Star[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((w * h) / 6500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.15 + 0.2,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.9 + 0.3,
        blue: Math.random() < 0.18,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        const a = reduce ? 0.7 : 0.35 + 0.65 * Math.abs(Math.sin(st.p + (t / 1000) * st.s));
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fillStyle = st.blue
          ? `rgba(140,160,255,${a})`
          : `rgba(235,240,250,${a})`;
        ctx.fill();
        if (st.r > 1.1) {
          ctx.fillStyle = `rgba(255,255,255,${a * 0.25})`;
          ctx.fillRect(st.x - st.r * 3, st.y - 0.25, st.r * 6, 0.5);
          ctx.fillRect(st.x - 0.25, st.y - st.r * 3, 0.5, st.r * 6);
        }
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none h-full w-full ${className}`} aria-hidden="true" />;
}
