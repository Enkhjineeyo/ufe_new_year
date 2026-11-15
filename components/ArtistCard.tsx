import Image from "next/image";
import { ImageIcon } from "lucide-react";
import type { Artist } from "@/data/artists";
import PaperStar from "./PaperStar";

export default function ArtistCard({ artist, index }: { artist: Artist; index: number }) {
  return (
    <article className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink">
      {artist.image ? (
        <Image
          src={artist.image}
          alt={`${artist.name} — уран бүтээлч`}
          fill
          loading="lazy"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover grayscale-[35%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
        />
      ) : (
        // Зураг оруулаагүй үед харагдах placeholder
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_35%,rgba(83,109,255,0.22),transparent_60%)] p-4 text-center">
          <div className="opacity-70 transition-transform duration-700 group-hover:rotate-12">
            <PaperStar size={56} points={index % 2 ? 7 : 6} />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-silver/30 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-silver/70">
            <ImageIcon className="h-3 w-3" aria-hidden="true" />
            Image placeholder
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent transition-all duration-500 group-hover:ring-electric/60 group-hover:shadow-[inset_0_-80px_80px_-40px_rgba(83,109,255,0.35)]" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        {artist.category && (
          <span className="text-[0.55rem] font-semibold tracking-[0.24em] text-electric sm:text-[0.62rem]">
            {artist.category}
          </span>
        )}
        <h3 className="mt-1.5 font-display text-[0.8rem] font-bold leading-tight text-white [overflow-wrap:anywhere] min-[420px]:text-base sm:text-xl">
          {artist.name}
        </h3>
      </div>
    </article>
  );
}
