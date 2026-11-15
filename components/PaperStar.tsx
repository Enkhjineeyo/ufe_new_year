/**
 * Moodboard дээрх өлгөөтэй цаасан/мөнгөлөг одыг санаагаа авсан
 * олон талт (faceted) од. Цэвэр SVG — зураг файл шаардахгүй.
 */
interface PaperStarProps {
  points?: number;
  size?: number;
  className?: string;
}

export default function PaperStar({
  points = 6,
  size = 64,
  className,
}: PaperStarProps) {
  const c = 50;
  const outer = 48;
  const inner = points >= 7 ? 22 : 20;
  const step = Math.PI / points;
  const vertices = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + i * step;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  });

  const facets = vertices.map((v, i) => {
    const next = vertices[(i + 1) % vertices.length];
    const light = i % 2 === 0;
    return (
      <polygon
        key={i}
        points={`${c},${c} ${v[0].toFixed(2)},${v[1].toFixed(2)} ${next[0].toFixed(2)},${next[1].toFixed(2)}`}
        fill={light ? "url(#ps-light)" : "url(#ps-dark)"}
      />
    );
  });

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ps-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe3ea" />
        </linearGradient>
        <linearGradient id="ps-dark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#aab1be" />
          <stop offset="1" stopColor="#7e8694" />
        </linearGradient>
      </defs>
      {facets}
    </svg>
  );
}
