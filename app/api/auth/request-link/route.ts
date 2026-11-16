import { NextResponse, type NextRequest } from "next/server";
import { COOLDOWN_COOKIE, getBaseUrl, maskEmail, normalizeAllowedEmail, safeNext, signToken } from "@/lib/auth";
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

  if (process.env.NODE_ENV === "production" && (process.env.AUTH_SECRET ?? "").length < 32) {
    console.error("AUTH_SECRET is missing or shorter than 32 characters");
    return NextResponse.json(
      { error: "Серверийн тохиргоо дутуу: AUTH_SECRET тохируулаагүй байна. (Vercel → Settings → Environment Variables)" },
      { status: 500 },
    );
  }
  if (process.env.NODE_ENV === "production" && !(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) {
    console.error("SMTP_HOST / SMTP_USER / SMTP_PASS missing");
    return NextResponse.json(
      { error: "Серверийн тохиргоо дутуу: майл илгээх SMTP тохиргоо хийгдээгүй байна." },
      { status: 500 },
    );
  }

  try {
    const token = signToken({
      email,
      purpose: "login",
      exp: Date.now() + siteConfig.auth.linkTtlMinutes * 60_000,
      next: safeNext((body as { next?: unknown })?.next),
    });
    const link = `${getBaseUrl(req.nextUrl.origin)}/api/auth/verify?token=${encodeURIComponent(token)}`;
    const { devLink } = await sendLoginLink(email, link);
    const res = NextResponse.json({ ok: true, sentTo: maskEmail(email), devLink });
    res.cookies.set(COOLDOWN_COOKIE, "1", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 });
    return res;
  } catch (err) {
    console.error("Mail send failed:", err);
    const code = (err as { code?: string; responseCode?: number })?.code;
    const hint =
      code === "EAUTH"
        ? "SMTP нэвтрэлт амжилтгүй (SMTP_USER / SMTP_PASS буруу — Gmail бол App Password ашиглана)."
        : code === "ETIMEDOUT" || code === "ECONNECTION" || code === "ESOCKET"
          ? "SMTP сервертэй холбогдож чадсангүй (SMTP_HOST / SMTP_PORT шалгана уу)."
          : "Майл илгээж чадсангүй. Дараа дахин оролдоно уу.";
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
