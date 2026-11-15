import Image from "next/image";
import { Shirt, Sparkles } from "lucide-react";
import { siteConfig } from "@/site.config";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function ThemeSection() {
  const t = siteConfig.theme;
  return (
    <section id="theme" className="relative overflow-hidden border-t border-white/[0.05] px-5 py-24 sm:px-8 sm:py-32">
      <div className="absolute right-0 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-electric/15 blur-[120px]" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="The theme" title={t.name} subtitle={t.tagline} />

        <Reveal>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {t.images.map((img, i) => (
              <li
                key={img.src}
                className={`group relative aspect-[3/2] overflow-hidden rounded-2xl border border-white/[0.08] ${i === 1 ? "sm:-translate-y-4" : ""}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night/60 to-transparent" aria-hidden="true" />
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <Reveal className="h-full">
            <div className="h-full rounded-2xl border border-white/[0.08] bg-ink/70 p-6">
              <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-silver/60">ӨНГӨ</p>
              <ul className="mt-5 space-y-3">
                {t.colors.map((c) => (
                  <li key={c.name} className="flex items-center gap-3">
                    <span
                      className="h-9 w-9 shrink-0 rounded-full ring-1 ring-white/15"
                      style={{
                        background: "chrome" in c && c.chrome
                          ? "linear-gradient(135deg,#8a909c,#ffffff 35%,#7e8694 60%,#f4f6fa)"
                          : c.hex,
                      }}
                      aria-hidden="true"
                    />
                    <span className="font-display text-sm font-semibold text-white">{c.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="h-full">
            <div className="h-full rounded-2xl border border-electric/30 bg-gradient-to-b from-electric/15 to-ink/70 p-6">
              <p className="inline-flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.3em] text-silver/80">
                <Shirt className="h-3.5 w-3.5 text-electric" aria-hidden="true" /> DRESS CODE
              </p>
              <p className="mt-5 font-display text-2xl font-bold leading-snug text-white">
                {t.dressCode.join(" · ")}
              </p>
              <div className="mt-5 flex gap-2" aria-hidden="true">
                <span className="h-2 flex-1 rounded-full bg-black ring-1 ring-white/20" />
                <span className="h-2 flex-1 rounded-full bg-electric" />
                <span className="h-2 flex-1 rounded-full bg-gradient-to-r from-[#8a909c] via-white to-[#8a909c]" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.16} className="h-full">
            <div className="h-full rounded-2xl border border-white/[0.08] bg-ink/70 p-6">
              <p className="inline-flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.3em] text-silver/60">
                <Sparkles className="h-3.5 w-3.5 text-electric" aria-hidden="true" /> УУР АМЬСГАЛ
              </p>
              <p className="mt-5 font-display text-xl font-semibold leading-snug text-white">{t.vibe}</p>
              <p className="mt-4 text-sm italic text-silver">“{t.tagline}”</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
