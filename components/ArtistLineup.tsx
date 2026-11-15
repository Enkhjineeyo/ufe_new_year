import { siteConfig } from "@/site.config";
import ArtistCard from "./ArtistCard";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function ArtistLineup() {
  return (
    <section id="artists" className="relative border-y border-white/[0.05] bg-ink/40 px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Line-up"
          title="THE ARTISTS"
          subtitle="Энэ үдшийн уур амьсгалыг бүрдүүлэх уран бүтээлчид."
        />
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {siteConfig.artists.map((artist, i) => (
            <li key={artist.name}>
              <Reveal delay={(i % 4) * 0.07}>
                <ArtistCard artist={artist} index={i} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
