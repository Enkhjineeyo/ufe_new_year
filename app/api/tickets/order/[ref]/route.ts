import { NextResponse, type NextRequest } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { jsonError } from "@/lib/lostfound";
import { ticketStore } from "@/lib/tickets-db";
import { isAdmin, orderDTO, syncQpay } from "@/lib/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Захиалгын төлөв (QPay бол төлбөрийг шууд шалгана) */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ ref: string }> }) {
  const email = await getSessionEmail();
  if (!email) return jsonError("Нэвтэрнэ үү.", 401);
  const ref = (await ctx.params).ref.toUpperCase();
  let order = await ticketStore().getByRef(ref);
  if (!order || (order.email !== email && !isAdmin(email))) return jsonError("Захиалга олдсонгүй.", 404);
  order = await syncQpay(order);
  return NextResponse.json({ order: orderDTO(order) }, { headers: { "Cache-Control": "no-store" } });
}
