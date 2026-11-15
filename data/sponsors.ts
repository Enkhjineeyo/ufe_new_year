/**
 * ХАМТРАГЧ БАЙГУУЛЛАГУУД
 * • logo      — цагаан (monochrome) хувилбар, үндсэндээ харагдана
 * • logoColor — өнгөт хувилбар, хулганаар заахад гарна (заавал биш)
 * Лого: public/sponsors/ (SVG эсвэл тунгалаг PNG)
 */
export interface Sponsor {
  name: string;
  logo: string;
  logoColor?: string;
  url?: string;
  /** Логоны өндрийг тохируулах (дугуй/дөрвөлжин логонд том утга) */
  size?: "sm" | "md" | "lg";
}

export const sponsors: Sponsor[] = [
  {
    name: "The Corporate Hotel & Convention Centre",
    logo: "/sponsors/corporate.svg",
    size: "lg",
  },
  {
    name: "EON Clublex",
    logo: "/sponsors/eon-clublex.svg",
    logoColor: "/sponsors/eon-clublex-color.svg",
    size: "lg",
  },
  {
    name: "Uni Service Solution",
    logo: "/sponsors/uni-service-solution.svg",
    logoColor: "/sponsors/uni-service-solution-color.svg",
    size: "md",
  },
  {
    name: "Tino",
    logo: "/sponsors/tino.svg",
    logoColor: "/sponsors/tino-color.svg",
    size: "lg",
  },
  {
    name: "Bluefin Catering Service",
    logo: "/sponsors/bluefin.svg",
    logoColor: "/sponsors/bluefin-color.svg",
    size: "sm",
  },
];
