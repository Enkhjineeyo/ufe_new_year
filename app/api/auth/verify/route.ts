import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions, signToken, verifyToken } from "@/lib/auth";
import { siteConfig } from "@/site.config";

export const runtime = "nodejs";

/** Майл дээрх холбоос энд ирнэ → session cookie үүсгээд /pass руу шилжүүлнэ */
export async function GET(req: NextRequest) {
  const payload = verifyToken(req.nextUrl.searchParams.get("token") ?? undefined, "login");
  if (!payload) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }
  const maxAge = siteConfig.auth.sessionDays * 86_400;
  const session = signToken({ email: payload.email, purpose: "session", exp: Date.now() + maxAge * 1000 });
  const res = NextResponse.redirect(new URL("/pass", req.url));
  res.cookies.set(SESSION_COOKIE, session, sessionCookieOptions(maxAge));
  return res;
}
