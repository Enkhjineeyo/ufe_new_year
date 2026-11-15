import { siteConfig } from "@/site.config";
import type { Sponsor } from "@/data/sponsors";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const HEIGHT: Record<NonNullable<Sponsor["size"]>, string> = {
  sm: "max-h-10 sm:max-h-12",
  md: "max-h-12 sm:max-h-14",
  lg: "max-h-16 sm:max-h-20",
};

function SponsorLogo({ s }: { s: Sponsor }) {
  const h = HEIGHT[s.size ?? "md"];
  if (!s.logo) {
    return (
      <span className="rounded-lg border border-dashed border-silver/25 px-4 py-3 text-center font-display text-[0.65rem] font-medium tracking-[0.18em] text-silver/60 sm:text-xs">
        {s.name}
      </span>
    );
  }
  return (
    <span className="relative grid place-items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.logo}
        alt={s.name}
        loading="lazy"
        className={`${h} w-auto max-w-full object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-100 ${s.logoColor ? "group-hover:opacity-0" : ""}`}
      />
      {s.logoColor && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={s.logoColor}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`${h} absolute inset-0 m-auto w-auto max-w-full object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
        />
      )}
    </span>
  );
}

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
          <ul className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {siteConfig.sponsors.map((s) => (
              <li
                key={s.name}
                className="group grid aspect-[5/3] w-[calc(50%-0.375rem)] place-items-center rounded-2xl border border-white/[0.07] bg-night px-5 transition-all duration-500 hover:-translate-y-0.5 hover:border-electric/40 hover:bg-ink hover:shadow-[0_20px_50px_-25px_rgba(83,109,255,0.7)] sm:w-[calc(33.333%-0.7rem)] lg:w-[calc(20%-0.8rem)]"
                title={s.name}
              >
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} className="grid h-full w-full place-items-center">
                    <SponsorLogo s={s} />
                  </a>
                ) : (
                  <SponsorLogo s={s} />
                )}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
