/**
 * УРАН БҮТЭЭЛЧДИЙН ЖАГСААЛТ
 * Зургууд: public/artists/ (900×1200, 3:4 харьцаа)
 * Зураг солих: шинэ зургаа public/artists/ хавтсанд хийгээд `image`-ийн замыг өөрчилнө.
 * `image` хоосон ("") бол placeholder харагдана.
 */
export type ArtistCategory = "LIVE PERFORMANCE" | "DJ SET";

export interface Artist {
  name: string;
  image: string;
  category?: ArtistCategory;
}

export const artists: Artist[] = [
  { name: "Ginjin", image: "/artists/ginjin.jpg", category: "LIVE PERFORMANCE" },
  { name: "Becca", image: "/artists/becca.jpg", category: "LIVE PERFORMANCE" },
  { name: "Wasabies", image: "/artists/wasabies.jpg", category: "LIVE PERFORMANCE" },
  { name: "Friutybaachka & Bektor", image: "/artists/fruitybaachka-bektor.jpg", category: "LIVE PERFORMANCE" },
  { name: "Morningstar", image: "/artists/morningstar.jpg", category: "LIVE PERFORMANCE" },
  { name: "Vande", image: "/artists/vande.jpg", category: "LIVE PERFORMANCE" },
  { name: "Gangaa", image: "/artists/gangaa.jpg", category: "LIVE PERFORMANCE" },
  { name: "AM-C", image: "/artists/am-c.jpg", category: "LIVE PERFORMANCE" },
];
