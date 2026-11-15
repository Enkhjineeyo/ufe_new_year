import Image from "next/image";
import { siteConfig } from "@/site.config";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function SponsorSection() {
  return (
    <section id="partners" className="relative border-t border-white/[0.05] bg-ink/40 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Partners & sponsors"
          title="OUR PARTNERS"
          subtitle="Хамтран ажиллаж буй байгууллагууддаа баярлалаа."
        />
        <Reveal>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] sm:grid-cols-3 lg:grid-cols-4">
            {siteConfig.sponsors.map((s) => {
              const content = s.logo ? (
                <Image
                  src={s.logo}
                  alt={s.name}
                  width={180}
                  height={72}
                  loading="lazy"
                  unoptimized={s.logo.endsWith(".svg")}
                  className="h-auto max-h-14 w-auto max-w-[75%] object-contain opacity-60 grayscale brightness-[1.8] transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100"
                />
              ) : (
                <span className="rounded-lg border border-dashed border-silver/25 px-4 py-3 text-center font-display text-[0.65rem] font-medium tracking-[0.18em] text-silver/60 transition-colors duration-500 group-hover:border-electric/60 group-hover:text-white sm:text-xs">
                  {s.name}
                </span>
              );
              return (
                <li key={s.name} className="group grid aspect-[5/3] place-items-center bg-night transition-colors duration-500 hover:bg-ink">
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="grid h-full w-full place-items-center" aria-label={s.name}>
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
