import { type NextRequest } from "next/server";
import QRCode from "qrcode";
import { getSessionEmail } from "@/lib/session";
import { ticketStore } from "@/lib/tickets-db";
import { getBaseUrl } from "@/lib/auth";
import { isAdmin } from "@/lib/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Тасалбарын QR (SVG) — зөвхөн эзэмшигч болон админ харна */
export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const email = await getSessionEmail();
  const code = (await ctx.params).code.toUpperCase();
  const found = await ticketStore().getByTicket(code);
  const order = found?.order;
  // Найзын тасалбарыг ч захиалсан оюутан харж, найздаа дамжуулна
  if (!email || !order || order.status !== "paid" || (order.email !== email && !isAdmin(email))) {
    return new Response("Not found", { status: 404 });
  }
  const svg = await QRCode.toString(`${getBaseUrl(req.nextUrl.origin)}/t/${code}`, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#08090D", light: "#FFFFFF" },
  });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "private, no-store" },
  });
}
