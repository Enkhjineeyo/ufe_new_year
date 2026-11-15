import { siteConfig } from "@/site.config";
import { FacebookIcon, InstagramIcon } from "./SocialIcons";
import PaperStar from "./PaperStar";

export default function Footer() {
  const socials = [
    { label: "Instagram", href: siteConfig.socials.instagram, Icon: InstagramIcon },
    { label: "Facebook", href: siteConfig.socials.facebook, Icon: FacebookIcon },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] px-5 pb-10 pt-20 sm:px-8">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-[radial-gradient(ellipse_at_50%_100%,rgba(83,109,255,0.25),transparent_70%)]" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <PaperStar size={40} />
        <p className="mt-6 text-sm text-silver">{siteConfig.university}</p>
        <p className="chrome-text mt-3 font-display text-3xl font-bold tracking-tight sm:text-5xl">
          {siteConfig.title}
        </p>
        <p className="mt-4 text-xs font-semibold tracking-[0.3em] text-white">{siteConfig.dateLabel}</p>
        <p className="mt-2 font-display text-xs tracking-[0.35em] text-silver/70">{siteConfig.tagline}</p>

        <ul className="mt-10 flex gap-3">
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-11 w-11 place-items-center rounded-full border border-silver/20 text-silver transition-all duration-300 hover:border-electric hover:bg-electric/15 hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hairline mt-12 h-px w-full" aria-hidden="true" />
        <p className="mt-6 text-xs text-silver/50">
          © 2026 {siteConfig.universityEn}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
