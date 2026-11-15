import { NextResponse, type NextRequest } from "next/server";
import { COOLDOWN_COOKIE, getBaseUrl, maskEmail, normalizeAllowedEmail, signToken } from "@/lib/auth";
import { sendLoginLink } from "@/lib/mailer";
import { siteConfig } from "@/site.config";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Буруу хүсэлт." }, { status: 400 });
  }

  const email = normalizeAllowedEmail((body as { email?: unknown })?.email);
  if (!email) {
    return NextResponse.json(
      { error: `Зөвхөн СЭЗИС-ийн майл (@${siteConfig.auth.allowedDomains[0]}) ашиглана уу.` },
      { status: 400 },
    );
  }

  // Дахин илгээх хүсэлтийг 60 секундээр хязгаарлана
  if (req.cookies.get(COOLDOWN_COOKIE)) {
    return NextResponse.json({ error: "Түр хүлээгээд (1 минут) дахин оролдоно уу." }, { status: 429 });
  }

  const token = signToken({
    email,
    purpose: "login",
    exp: Date.now() + siteConfig.auth.linkTtlMinutes * 60_000,
  });
  const link = `${getBaseUrl(req.nextUrl.origin)}/api/auth/verify?token=${encodeURIComponent(token)}`;

  try {
    const { devLink } = await sendLoginLink(email, link);
    const res = NextResponse.json({ ok: true, sentTo: maskEmail(email), devLink });
    res.cookies.set(COOLDOWN_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 });
    return res;
  } catch (err) {
    console.error("Mail send failed:", err);
    return NextResponse.json({ error: "Майл илгээж чадсангүй. Дараа дахин оролдоно уу." }, { status: 500 });
  }
}
