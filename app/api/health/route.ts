import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Тохиргоо шалгах: https://<таны-сайт>/api/health
 * Утгуудыг БИШ, зөвхөн тохируулсан эсэхийг (true/false) харуулна.
 */
export async function GET() {
  const has = (k: string) => Boolean(process.env[k]);
  return NextResponse.json(
    {
      AUTH_SECRET: (process.env.AUTH_SECRET ?? "").length >= 32,
      SMTP_HOST: has("SMTP_HOST"),
      SMTP_PORT: process.env.SMTP_PORT ?? "587 (default)",
      SMTP_USER: has("SMTP_USER"),
      SMTP_PASS: has("SMTP_PASS"),
      MAIL_FROM: has("MAIL_FROM"),
      DATABASE_URL: has("DATABASE_URL") || has("POSTGRES_URL"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
