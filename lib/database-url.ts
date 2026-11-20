/**
 * Postgres холбох хаяг.
 * Vercel → Neon холбоход "Custom Prefix"-ээс хамаарч хувьсагчийн нэр өөр өөр үүсдэг
 * (DATABASE_URL, DATABASE_POSTGRES_URL, STORAGE_URL ...). Аль нь байгааг нь хайж олно.
 */
const CANDIDATES = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "DATABASE_DATABASE_URL",
  "DATABASE_POSTGRES_URL",
  "STORAGE_URL",
  "STORAGE_DATABASE_URL",
  "STORAGE_POSTGRES_URL",
];

export function databaseUrl(): string | undefined {
  for (const k of CANDIDATES) {
    const v = process.env[k]?.trim();
    if (v && /^postgres(ql)?:\/\//.test(v)) return v;
  }
  return undefined;
}

/** Аль хувьсагчаас уншсаныг харуулна (утгыг биш, зөвхөн нэрийг) */
export function databaseUrlSource(): string | null {
  return CANDIDATES.find((k) => /^postgres(ql)?:\/\//.test(process.env[k]?.trim() ?? "")) ?? null;
}
