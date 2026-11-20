import { NextResponse } from "next/server";
import { databaseUrlSource } from "@/lib/database-url";

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
      DATABASE_URL: databaseUrlSource() ?? false,
      QPAY: has("QPAY_USERNAME") && has("QPAY_PASSWORD") && has("QPAY_INVOICE_CODE"),
      QPAY_BASE_URL: process.env.QPAY_BASE_URL ?? "https://merchant.qpay.mn (default)",
      ADMIN_EMAILS: (process.env.ADMIN_EMAILS ?? "").split(",").filter((s) => s.trim()).length,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
