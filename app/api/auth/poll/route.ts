import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signToken, verifyToken } from "@/lib/auth";
import { LOGIN_RID_COOKIE, consumeLoginRequest } from "@/lib/login-requests";
import { siteConfig } from "@/site.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Анхны таб 2–3 секунд тутам дуудна: майлын холбоос дарагдсан эсэхийг шалгаад нэвтрүүлнэ */
export async function GET(req: NextRequest) {
  // 1) Ижил хөтөч дээр холбоос нээгдсэн бол session cookie аль хэдийн байна
  if (verifyToken(req.cookies.get(SESSION_COOKIE)?.value, "session")) {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(LOGIN_RID_COOKIE);
    return res;
  }
  // 2) Өөр хөтөч / утсан дээр холбоос дарагдсан бол rid-ээр шалгана
  const rid = req.cookies.get(LOGIN_RID_COOKIE)?.value;
  if (!rid) return NextResponse.json({ ok: false, reason: "no-request" });
  let email: string | null = null;
  try {
    email = await consumeLoginRequest(rid);
  } catch (e) {
    console.error("poll failed", e);
  }
  if (!email) return NextResponse.json({ ok: false }, { headers: { "Cache-Control": "no-store" } });
  const maxAge = siteConfig.auth.sessionDays * 86_400;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, signToken({ email, purpose: "session", exp: Date.now() + maxAge * 1000 }), sessionCookieOptions(maxAge));
  res.cookies.delete(LOGIN_RID_COOKIE);
  return res;
}
