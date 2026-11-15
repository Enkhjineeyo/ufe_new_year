import { ChevronDown, MapPin, CalendarDays, GraduationCap } from "lucide-react";
import { siteConfig } from "@/site.config";
import Starfield from "./Starfield";
import FairyLights from "./FairyLights";
import HangingStars from "./HangingStars";
import CountdownTimer from "./CountdownTimer";

export default function HeroSection() {
  // "СЭЗИС NEW YEAR 2027" → "СЭЗИС" / "NEW YEAR" / "2027"
  const words = siteConfig.title.split(" ");
  const prefix = words[0];
  const year = words.length > 2 ? words[words.length - 1] : "";
  const middle = words.slice(1, year ? -1 : undefined).join(" ");
  return (
    <section
      id="top"
      className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-20 pt-40 sm:px-8 sm:pt-28"
    >
      {/* Дэвсгэр: шөнийн тэнгэр + хөх гэрлийн туяа */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_115%,rgba(83,109,255,0.38),transparent_65%),radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(83,109,255,0.16),transparent_70%)]" />
      <div className="absolute inset-0 -z-10">
        <Starfield />
      </div>
      <FairyLights strands={5} className="absolute left-0 top-0 -z-10 h-full w-[18%] opacity-60 sm:w-[14%]" />
      <FairyLights strands={5} className="absolute right-0 top-0 -z-10 h-full w-[18%] opacity-60 sm:w-[14%]" />
      <HangingStars />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-night to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        <p className="eyebrow inline-flex items-center gap-2 whitespace-nowrap rounded-full !tracking-[0.18em] sm:!tracking-[0.32em] border border-silver/15 bg-white/[0.03] px-4 py-2">
          <GraduationCap className="h-3.5 w-3.5 text-electric" aria-hidden="true" />
          {siteConfig.audienceShort}
        </p>

        <h1 className="mt-8 font-display font-extrabold leading-[0.9] tracking-tight">
          <span className="block text-[8vw] tracking-[0.18em] text-white sm:text-4xl md:text-5xl">
            {prefix}
          </span>
          <span className="chrome-text mt-2 block animate-shimmer text-[10.5vw] sm:text-7xl md:text-8xl lg:text-[7.5rem]">
            {middle}
          </span>
          {year && (
            <span className="mt-1 block bg-gradient-to-b from-white via-[#b9c4ff] to-electric bg-clip-text text-[19vw] text-transparent drop-shadow-[0_0_40px_rgba(83,109,255,0.45)] sm:text-[7.5rem] md:text-[9rem] lg:text-[11rem]">
              {year}
            </span>
          )}
        </h1>

        <p className="mt-7 font-display text-[0.8rem] font-medium tracking-[0.2em] min-[400px]:tracking-[0.3em] sm:text-lg sm:tracking-[0.42em] text-silver sm:text-lg">
          {siteConfig.tagline}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-xs font-semibold tracking-[0.22em] text-white/90 sm:flex-row sm:gap-8 sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-electric" aria-hidden="true" />
            {siteConfig.dateLabel}
          </span>
          <span className="hidden h-4 w-px bg-silver/30 sm:block" aria-hidden="true" />
          <span className="inline-flex items-center gap-2 uppercase">
            <MapPin className="h-4 w-4 text-electric" aria-hidden="true" />
            {siteConfig.venue}
          </span>
        </div>

        <div className="mt-12">
          <CountdownTimer target={siteConfig.startsAt} startedMessage={siteConfig.startedMessage} />
        </div>

        <a
          href="#details"
          className="group relative mt-12 inline-flex items-center gap-3 overflow-hidden whitespace-nowrap rounded-full border border-electric/60 bg-electric/15 px-7 py-4 font-display text-xs font-semibold tracking-[0.16em] sm:px-8 sm:tracking-[0.25em] text-white shadow-[0_0_40px_-8px_rgba(83,109,255,0.8)] transition-all duration-300 hover:bg-electric hover:shadow-[0_0_60px_-6px_rgba(83,109,255,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric sm:text-sm"
        >
          ҮДШИЙН ДЭЛГЭРЭНГҮЙ
          <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
