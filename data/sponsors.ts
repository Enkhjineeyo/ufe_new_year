/**
 * ХАМТРАГЧ БАЙГУУЛЛАГУУД
 * Лого нэмэх: PNG (тунгалаг дэвсгэртэй) эсвэл SVG файлаа public/sponsors/ хавтсанд хийнэ.
 *   жишээ: { name: "Компанийн нэр", logo: "/sponsors/company.svg", url: "https://..." }
 * `logo` хоосон бол "Partner Logo 0X" placeholder харагдана.
 */
export interface Sponsor {
  name: string;
  logo: string;
  url?: string;
}

export const sponsors: Sponsor[] = Array.from({ length: 8 }, (_, i) => ({
  name: `Partner Logo ${String(i + 1).padStart(2, "0")}`,
  logo: "",
}));
