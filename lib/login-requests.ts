import "server-only";
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

/**
 * "Анхны таб нэвтрэх" механизм:
 *  1. Нэвтрэх холбоос хүсэхэд санамсаргүй rid үүсгэж анхны табын httpOnly cookie-д хадгална.
 *  2. Майл дээрх холбоос дарагдахад (өөр таб / утас) тэр rid-г "баталгаажсан" гэж тэмдэглэнэ.
 *  3. Анхны таб /api/auth/poll-оор шалгаж, баталгаажсан бол өөрөө нэвтэрнэ (нэг удаа).
 * DATABASE_URL байхгүй бол санах ойд хадгална (зөвхөн нэг сервер дээр ажиллана).
 */
export const LOGIN_RID_COOKIE = "ufe_login_rid";
export const newRid = () => randomBytes(24).toString("base64url");

type Row = { email: string; approvedAt: number | null; consumed: boolean; createdAt: number };
const mem = globalThis as unknown as { __lr?: Map<string, Row> };
const TTL_MS = 20 * 60_000;

function sqlOrNull() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  return url ? neon(url) : null;
}
let ready: Promise<unknown> | null = null;
type Sql = NonNullable<ReturnType<typeof sqlOrNull>>;
async function ensure(sql: Sql) {
  return (ready ??= sql`CREATE TABLE IF NOT EXISTS auth_requests (
      rid TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      approved_at TIMESTAMPTZ,
      consumed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`.catch((e) => {
    ready = null;
    throw e;
  }));
}

export async function createLoginRequest(rid: string, email: string) {
  const sql = sqlOrNull();
  if (!sql) {
    (mem.__lr ??= new Map()).set(rid, { email, approvedAt: null, consumed: false, createdAt: Date.now() });
    return;
  }
  await ensure(sql);
  await sql`INSERT INTO auth_requests (rid, email) VALUES (${rid}, ${email}) ON CONFLICT (rid) DO NOTHING`;
  // хуучин мөрүүдийг цэвэрлэнэ
  await sql`DELETE FROM auth_requests WHERE created_at < NOW() - INTERVAL '1 day'`;
}

/** Майлын холбоос дарагдсан → баталгаажуулна (email таарах ёстой) */
export async function approveLoginRequest(rid: string, email: string) {
  const sql = sqlOrNull();
  if (!sql) {
    const r = mem.__lr?.get(rid);
    if (r && r.email === email && !r.consumed) r.approvedAt = Date.now();
    return;
  }
  await ensure(sql);
  await sql`UPDATE auth_requests SET approved_at = NOW()
    WHERE rid = ${rid} AND email = ${email} AND consumed = FALSE AND created_at > NOW() - INTERVAL '20 minutes'`;
}

/** Анхны таб: баталгаажсан бол email буцааж, нэг удаа ашигласан гэж тэмдэглэнэ */
export async function consumeLoginRequest(rid: string): Promise<string | null> {
  const sql = sqlOrNull();
  if (!sql) {
    const r = mem.__lr?.get(rid);
    if (!r || r.consumed || !r.approvedAt || Date.now() - r.createdAt > TTL_MS) return null;
    r.consumed = true;
    return r.email;
  }
  await ensure(sql);
  const rows = await sql`UPDATE auth_requests SET consumed = TRUE
    WHERE rid = ${rid} AND consumed = FALSE AND approved_at IS NOT NULL AND created_at > NOW() - INTERVAL '20 minutes'
    RETURNING email`;
  return (rows[0]?.email as string | undefined) ?? null;
}
