import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

/** Gala урилгын хэв маягийн гарчиг: эгнээ шугам + од */
export default function SectionHeading({ eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="chrome-text mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        {title}
      </h2>
      <div className="mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
        <span className="hairline h-px flex-1" />
        <span className="text-sm text-silver">✦</span>
        <span className="hairline h-px flex-1" />
      </div>
      {subtitle && <p className="mt-6 text-base leading-relaxed text-silver sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
