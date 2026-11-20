import { NextResponse, type NextRequest } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { jsonError } from "@/lib/lostfound";
import { ticketStore } from "@/lib/tickets-db";
import { isAdmin } from "@/lib/tickets";
import { ticketConfig } from "@/data/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = await getSessionEmail();
  if (!isAdmin(email)) return jsonError("Зөвхөн админ.", 403);
  const status = req.nextUrl.searchParams.get("status") || undefined;
  const q = req.nextUrl.searchParams.get("q")?.trim() || undefined;
  const store = ticketStore();
  const orders = await store.listAll({ status, q });
  const all = await store.listAll({});
  const stats = ticketConfig.tiers.map((t) => {
    const paid = all.filter((o) => o.tier === t.id && o.status === "paid");
    return {
      tier: t.id,
      name: t.name,
      quantity: t.quantity,
      // Тоо бүгд тасалбараар (нэг захиалгад 1–3 тасалбар)
      paid: paid.reduce((s, o) => s + o.quantity, 0),
      pending: all.filter((o) => o.tier === t.id && o.status === "pending").reduce((s, o) => s + o.quantity, 0),
      checkedIn: paid.reduce((s, o) => s + o.tickets.filter((x) => x.checkedInAt).length, 0),
      revenue: paid.reduce((s, o) => s + o.amount, 0),
    };
  });
  return NextResponse.json(
    {
      stats,
      orders: orders.map((o) => ({
        ref: o.ref, email: o.email, tier: o.tier, quantity: o.quantity, amount: o.amount,
        guests: o.guests,
        tickets: o.tickets.map((x) => ({ code: x.code, holder: x.isGuest ? x.holderName : o.email, checkedInAt: x.checkedInAt })), method: o.method, status: o.status,
        createdAt: o.createdAt, paidAt: o.paidAt, ticketCode: o.ticketCode, checkedInAt: o.checkedInAt, confirmedBy: o.confirmedBy,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
