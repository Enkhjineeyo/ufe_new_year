/**
 * ТӨВ ТОХИРГООНЫ ФАЙЛ
 * Бүх компонент агуулгаа ЗӨВХӨН эндээс уншина.
 *   • Үйл ажиллагааны мэдээлэл → data/event.ts
 *   • Уран бүтээлчид           → data/artists.ts
 *   • Хамтрагчид              → data/sponsors.ts
 */
import { eventInfo } from "@/data/event";
import { artists } from "@/data/artists";
import { sponsors } from "@/data/sponsors";

export const siteConfig = {
  ...eventInfo,
  artists,
  sponsors,
  nav: [
    { label: "Countdown", href: "/#top" },
    { label: "Үдэш", href: "/#about" },
    { label: "Theme", href: "/#theme" },
    { label: "Artists", href: "/#artists" },
    { label: "Details", href: "/#details" },
    { label: "Lost & Found", href: "/#lost-found" },
    { label: "Partners", href: "/#partners" },
  ],
};

export type SiteConfig = typeof siteConfig;
