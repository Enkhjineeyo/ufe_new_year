import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, safeNext, sessionCookieOptions, signToken, verifyToken } from "@/lib/auth";
import { approveLoginRequest } from "@/lib/login-requests";
import { siteConfig } from "@/site.config";

export const runtime = "nodejs";

/**
 * Майл дээрх "НЭВТРЭХ" холбоос.
 * • Анхны табыг (холбоос хүссэн цонх) баталгаажуулна → тэр таб автоматаар нэвтэрнэ.
 * • Энэ таб ч мөн нэвтэрч, "Нэвтэрлээ — анхны цонх руугаа буцна уу" хуудас харуулна.
 */
export async function GET(req: NextRequest) {
  const payload = verifyToken(req.nextUrl.searchParams.get("token") ?? undefined, "login");
  if (!payload) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }
  if (payload.rid) {
    try {
      await approveLoginRequest(payload.rid, payload.email);
    } catch (e) {
      console.error("approve login request failed", e);
    }
  }
  const maxAge = siteConfig.auth.sessionDays * 86_400;
  const session = signToken({ email: payload.email, purpose: "session", exp: Date.now() + maxAge * 1000 });
  const next = safeNext(payload.next) ?? "/pass";
  const res = NextResponse.redirect(new URL(`/login/done?next=${encodeURIComponent(next)}`, req.url));
  res.cookies.set(SESSION_COOKIE, session, sessionCookieOptions(maxAge));
  return res;
}
