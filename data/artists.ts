/**
 * УРАН БҮТЭЭЛЧДИЙН ЖАГСААЛТ
 * Зураг нэмэх: зургаа public/artists/ хавтсанд хийгээд `image`-д замыг бичнэ.
 *   жишээ: image: "/artists/ginjin.jpg"
 * `image` хоосон ("") бол зураг оруулах placeholder харагдана.
 * Зөвхөн албан ёсны / зөвшөөрөлтэй зураг ашиглаарай.
 */
export type ArtistCategory = "LIVE PERFORMANCE" | "DJ SET";

export interface Artist {
  name: string;
  image: string;
  category?: ArtistCategory;
}

export const artists: Artist[] = [
  { name: "Ginjin", image: "", category: "LIVE PERFORMANCE" },
  { name: "Becca", image: "", category: "LIVE PERFORMANCE" },
  { name: "Wasabies", image: "", category: "LIVE PERFORMANCE" },
  { name: "Friutybaachka & Bektor", image: "", category: "LIVE PERFORMANCE" },
  { name: "Morningstar", image: "", category: "LIVE PERFORMANCE" },
  { name: "Vande", image: "", category: "LIVE PERFORMANCE" },
  { name: "Gangaa", image: "", category: "LIVE PERFORMANCE" },
  { name: "AM-C", image: "", category: "LIVE PERFORMANCE" },
];
