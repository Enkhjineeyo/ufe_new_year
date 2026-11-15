import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CalendarDays, Clock, MapPin, LogOut, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthShell from "@/components/AuthShell";
import PaperStar from "@/components/PaperStar";
import { getSessionEmail } from "@/lib/session";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: `Миний урилга — ${siteConfig.title}`,
  robots: { index: false },
};

export default async function PassPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/login");

  return (
    <>
      <Navbar />
      <AuthShell>
        <article className="relative overflow-hidden rounded-3xl border border-silver/15 bg-gradient-to-b from-ink to-night shadow-[0_30px_80px_-30px_rgba(83,109,255,0.6)]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-electric/25 blur-3xl" aria-hidden="true" />
          <div className="relative p-7 text-center sm:p-9">
            <PaperStar size={44} className="mx-auto" />
            <p className="eyebrow mt-5">Your invitation</p>
            <h1 className="chrome-text mt-3 font-display text-3xl font-bold leading-tight">{siteConfig.title}</h1>
            <p className="mt-2 font-display text-[0.7rem] tracking-[0.3em] text-silver/70">{siteConfig.tagline}</p>

            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-4 py-2 text-xs text-white">
              <BadgeCheck className="h-4 w-4 text-electric" aria-hidden="true" />
              <span className="break-all">{email}</span>
            </div>
          </div>

          <div className="relative flex items-center" aria-hidden="true">
            <span className="-ml-3 h-6 w-6 rounded-full bg-night" />
            <span className="h-px flex-1 border-t border-dashed border-silver/25" />
            <span className="-mr-3 h-6 w-6 rounded-full bg-night" />
          </div>

          <dl className="relative grid gap-4 p-7 text-sm sm:p-9">
            {[
              { icon: CalendarDays, label: "DATE", value: siteConfig.dateShort },
              { icon: Clock, label: "TIME", value: `${siteConfig.timeLabel} (UTC+8)` },
              { icon: MapPin, label: "VENUE", value: `${siteConfig.venue}, ${siteConfig.city}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 text-electric" aria-hidden="true" />
                <dt className="w-14 text-[0.62rem] font-semibold tracking-[0.25em] text-silver/60">{label}</dt>
                <dd className="font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </article>

        <form action="/api/auth/logout" method="post" className="mt-6 text-center">
          <button type="submit" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-silver/70 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden="true" /> ГАРАХ
          </button>
        </form>
      </AuthShell>
    </>
  );
}
