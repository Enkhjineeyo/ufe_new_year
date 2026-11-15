import { Mic2, Disc3, UtensilsCrossed, Camera, Users, Gift, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/site.config";
import Reveal from "./Reveal";

const ICONS: Record<string, LucideIcon> = {
  mic: Mic2,
  disc: Disc3,
  food: UtensilsCrossed,
  camera: Camera,
  users: Users,
  gift: Gift,
};

export default function ExperienceCards() {
  return (
    <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3">
      {siteConfig.highlights.map((item, i) => {
        const Icon = ICONS[item.icon] ?? Gift;
        return (
          <li key={item.title}>
            <Reveal delay={i * 0.06} className="h-full">
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-ink/80 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-electric/40 hover:shadow-[0_20px_60px_-25px_rgba(83,109,255,0.7)] sm:p-7">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-electric/0 blur-3xl transition-all duration-500 group-hover:bg-electric/25" aria-hidden="true" />
                <span className="font-display text-xs text-silver/40">{String(i + 1).padStart(2, "0")}</span>
                <div className="mt-6 grid h-12 w-12 place-items-center rounded-xl border border-silver/15 bg-white/[0.03] text-silver transition-colors duration-500 group-hover:border-electric/50 group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-6 font-display text-sm font-semibold leading-snug tracking-[0.14em] text-white sm:text-base">
                  {item.title}
                </h3>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
