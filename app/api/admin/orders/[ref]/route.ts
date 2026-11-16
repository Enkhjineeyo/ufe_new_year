import { NextResponse, type NextRequest } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { badOrigin, jsonError } from "@/lib/lostfound";
import { ticketStore } from "@/lib/tickets-db";
import { isAdmin, syncQpay } from "@/lib/tickets";

export const runtime = "nodejs";

/** { action: "confirm" | "cancel" | "recheck" } — дансаар төлсөн захиалгыг баталгаажуулах гэх мэт */
export async function POST(req: NextRequest, ctx: { params: Promise<{ ref: string }> }) {
  const blocked = badOrigin(req);
  if (blocked) return blocked;
  const email = await getSessionEmail();
  if (!email || !isAdmin(email)) return jsonError("Зөвхөн админ.", 403);
  const ref = (await ctx.params).ref.toUpperCase();
  const store = ticketStore();
  const order = await store.getByRef(ref);
  if (!order) return jsonError("Захиалга олдсонгүй.", 404);
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action === "confirm") {
    if (order.status === "cancelled") return jsonError("Цуцлагдсан захиалга.", 409);
    await store.markPaid(ref, email);
  } else if (action === "cancel") {
    if (order.status === "paid") return jsonError("Төлөгдсөн захиалгыг цуцлахгүй.", 409);
    await store.cancel(ref);
  } else if (action === "recheck") {
    await syncQpay(order);
  } else return jsonError("Буруу үйлдэл.", 400);
  return NextResponse.json({ ok: true });
}
