/**
 * Хөшигний fairy lights — босоо утсан дээрх гэрэлт цэгүүд.
 * Detereministic (random биш) учир hydration асуудалгүй.
 */
interface FairyLightsProps {
  strands?: number;
  className?: string;
}

export default function FairyLights({ strands = 7, className = "" }: FairyLightsProps) {
  return (
    <div className={`pointer-events-none flex justify-between ${className}`} aria-hidden="true">
      {Array.from({ length: strands }, (_, i) => {
        const length = 45 + ((i * 37) % 50); // 45–95%
        const bulbs = Math.round(length / 7);
        return (
          <div key={i} className="relative w-px" style={{ height: `${length}%` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-silver/25 to-transparent" />
            {Array.from({ length: bulbs }, (_, j) => (
              <span
                key={j}
                className="absolute left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-[#fff6dc] shadow-[0_0_6px_2px_rgba(255,236,190,0.55)] animate-twinkle"
                style={{
                  top: `${(j / bulbs) * 100}%`,
                  animationDelay: `${((i * 7 + j * 3) % 30) / 10}s`,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
