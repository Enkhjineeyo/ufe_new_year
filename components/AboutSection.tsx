import { siteConfig } from "@/site.config";
import ExperienceCards from "./ExperienceCards";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32">
      <div className="absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-electric/10 blur-[120px]" aria-hidden="true" />
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="About the night" title={siteConfig.about.title} />

        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal>
            <div className="space-y-6 text-lg leading-relaxed text-silver sm:text-xl">
              {siteConfig.about.paragraphs.map((p, i) => (
                <p key={i} className={i === siteConfig.about.paragraphs.length - 1 ? "font-medium text-white" : ""}>
                  {p}
                </p>
              ))}
            </div>
            <figure className="mt-10 border-l border-electric/60 pl-5">
              <blockquote className="text-sm leading-relaxed text-silver/80 sm:text-base">
                {siteConfig.description[2]}
              </blockquote>
            </figure>
          </Reveal>
          <ExperienceCards />
        </div>
      </div>
    </section>
  );
}
