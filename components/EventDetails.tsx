import { CalendarDays, Building2, MapPin, GraduationCap, Clock, ExternalLink, Map } from "lucide-react";
import { siteConfig } from "@/site.config";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const details = [
  { label: "DATE", value: siteConfig.dateShort, icon: CalendarDays },
  { label: "TIME", value: `${siteConfig.timeLabel} (UTC+8)`, icon: Clock },
  { label: "VENUE", value: siteConfig.venue, icon: Building2 },
  { label: "LOCATION", value: siteConfig.city, icon: MapPin },
  { label: "AUDIENCE", value: siteConfig.audience, icon: GraduationCap },
];

export default function EventDetails() {
  return (
    <section id="details" className="relative px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="Event details" title="ҮДШИЙН МЭДЭЭЛЭЛ" />

        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <dl className="divide-y divide-white/[0.07] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink/70">
              {details.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-4 p-5 sm:gap-5 sm:p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-electric/30 bg-electric/10 text-electric">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[0.65rem] font-semibold tracking-[0.3em] text-silver/60">{label}</dt>
                    <dd className="mt-1 font-display text-base font-semibold text-white sm:text-lg">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-ink/70">
              {siteConfig.mapEmbedUrl ? (
                <iframe
                  src={siteConfig.mapEmbedUrl}
                  title={`${siteConfig.venue} — газрын зураг`}
                  className="h-full min-h-[320px] w-full flex-1 grayscale invert-[0.9] hue-rotate-180"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                // Газрын зургийн placeholder — data/event.ts дотор mapEmbedUrl оруулна
                <div className="relative flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                  <div
                    className="absolute inset-0 opacity-[0.15]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(199,204,213,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(199,204,213,.5) 1px, transparent 1px)",
                      backgroundSize: "32px 32px",
                    }}
                    aria-hidden="true"
                  />
                  <span className="relative grid h-14 w-14 place-items-center rounded-full bg-electric shadow-[0_0_50px_rgba(83,109,255,0.8)]">
                    <Map className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                  <p className="relative font-display text-lg font-semibold text-white">{siteConfig.venue}</p>
                  <p className="relative text-sm text-silver/70">Map placeholder — Google Maps холбоос удахгүй нэмэгдэнэ.</p>
                </div>
              )}
              {siteConfig.mapUrl && (
                <a
                  href={siteConfig.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border-t border-white/[0.08] p-4 text-xs font-semibold tracking-[0.2em] text-white transition-colors hover:bg-electric/20"
                >
                  GOOGLE MAPS-Д НЭЭХ <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
