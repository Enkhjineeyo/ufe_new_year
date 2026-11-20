"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Sparkles, Ticket } from "lucide-react";
import { ticketConfig, formatMNT, type TierId } from "@/data/tickets";
import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";

type TierState = { id: TierId; open: boolean; reason?: "soon" | "ended" | "soldout"; remaining: number };

const ICON = { early: Sparkles, regular: Ticket, vip: Crown } as const;
const REASON = { soon: "УДАХГҮЙ", ended: "ДУУССАН", soldout: "ДУУССАН" } as const;

export default function TicketsSection() {
  const [state, setState] = useState<Record<string, TierState> | null>(null);

  useEffect(() => {
    fetch("/api/tickets/tiers", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { tiers?: TierState[] }) => setState(Object.fromEntries((d.tiers ?? []).map((t) => [t.id, t]))))
      .catch(() => setState({}));
  }, []);

  return (
    <section id="tickets" className="relative overflow-hidden border-t border-white/[0.05] px-5 py-24 sm:px-8 sm:py-32">
      <div className="absolute left-1/2 top-1/3 -z-10 h-[420px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-electric/15 blur-[130px]" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Tickets"
          title="ТАСАЛБАР"
          subtitle="СЭЗИС-ийн Outlook майлаараа нэвтэрч, QPay эсвэл дансаар төлөөд QR тасалбараа шууд аваарай."
        />
        <ul className="grid gap-5 lg:grid-cols-3">
          {ticketConfig.tiers.map((t, i) => {
            const s = state?.[t.id];
            const Icon = ICON[t.id];
            const closed = s && !s.open;
            const vip = t.id === "vip";
            return (
              <li key={t.id}>
                <Reveal delay={i * 0.08} className="h-full">
                  <article
                    className={`relative flex h-full flex-col overflow-hidden rounded-3xl border p-7 transition-all duration-500 sm:p-8 ${
                      t.highlight
                        ? "border-electric/50 bg-gradient-to-b from-electric/20 via-ink to-ink shadow-[0_30px_80px_-30px_rgba(83,109,255,0.8)]"
                        : vip
                          ? "border-silver/30 bg-gradient-to-b from-white/[0.08] via-ink to-ink"
                          : "border-white/[0.08] bg-ink/80"
                    } ${closed ? "opacity-60" : "hover:-translate-y-1"}`}
                  >
                    {t.highlight && (
                      <span className="absolute right-5 top-5 rounded-full bg-electric px-3 py-1 text-[0.55rem] font-bold tracking-[0.2em] text-white">
                        POPULAR
                      </span>
                    )}
                    <Icon className={`h-6 w-6 ${vip ? "text-silver" : "text-electric"}`} aria-hidden="true" />
                    <h3 className={`mt-5 font-display text-xl font-bold tracking-[0.12em] ${vip ? "chrome-text" : "text-white"}`}>{t.name}</h3>
                    <p className="mt-4 font-display text-4xl font-bold text-white">{formatMNT(t.price)}</p>
                    <p className="mt-2 h-4 text-xs text-silver/60">
                      {t.salesEnd && !closed ? `${t.salesEnd.slice(5, 7)}/${t.salesEnd.slice(8, 10)}-ний өдрийг хүртэл` : ""}
                      {s?.open && s.remaining <= 30 ? ` · ${s.remaining} үлдсэн` : ""}
                    </p>
                    <ul className="mt-6 flex-1 space-y-3">
                      {t.perks.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-sm text-silver">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric" aria-hidden="true" />
                          {p}
                        </li>
                      ))}
                    </ul>
                    {closed ? (
                      <span className="mt-8 block rounded-full border border-white/10 py-3.5 text-center font-display text-xs font-semibold tracking-[0.2em] text-silver/60">
                        {REASON[s.reason ?? "soldout"]}
                      </span>
                    ) : (
                      <a
                        href={`/tickets/buy?tier=${t.id}`}
                        className={`mt-8 block rounded-full py-3.5 text-center font-display text-xs font-semibold tracking-[0.2em] transition-all ${
                          t.highlight
                            ? "bg-electric text-white shadow-[0_0_40px_-8px_rgba(83,109,255,0.9)] hover:brightness-110"
                            : "border border-silver/30 text-white hover:border-electric hover:bg-electric/15"
                        }`}
                      >
                        ТАСАЛБАР АВАХ
                      </a>
                    )}
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-center text-xs text-silver/60">
          СЭЗИС-ийн оюутан @ufe.edu.mn майлаараа нэвтэрч, өөртөө болон {ticketConfig.maxGuests} хүртэлх найздаа тасалбар авна
        </p>
      </div>
    </section>
  );
}
