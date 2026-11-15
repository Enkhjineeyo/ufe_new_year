import PaperStar from "./PaperStar";

/** Утсан дээр дүүжлэгдэн найгах мөнгөлөг одод (moodboard-ийн санаа) */
const STARS = [
  { left: "4%", drop: 70, size: 54, points: 6, delay: "0s", hide: false },
  { left: "17%", drop: 170, size: 34, points: 7, delay: "-2s", hide: true },
  { left: "84%", drop: 110, size: 42, points: 6, delay: "-1s", hide: false },
  { left: "90%", drop: 220, size: 30, points: 7, delay: "-3.5s", hide: true },
  { left: "70%", drop: 60, size: 26, points: 6, delay: "-4.5s", hide: true },
];

export default function HangingStars() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[60%]" aria-hidden="true">
      {STARS.map((s, i) => (
        <div
          key={i}
          className={`absolute top-0 origin-top animate-sway ${s.hide ? "hidden md:block" : ""}`}
          style={{ left: s.left, animationDelay: s.delay }}
        >
          <div className="mx-auto w-px bg-gradient-to-b from-transparent via-silver/40 to-silver/60" style={{ height: s.drop }} />
          <div className="-mt-1 drop-shadow-[0_0_18px_rgba(199,204,213,0.45)]">
            <PaperStar size={s.size} points={s.points} />
          </div>
        </div>
      ))}
    </div>
  );
}
