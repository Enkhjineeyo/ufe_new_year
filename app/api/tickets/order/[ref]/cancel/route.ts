import { NextResponse, type NextRequest } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { badOrigin, jsonError } from "@/lib/lostfound";
import { ticketStore } from "@/lib/tickets-db";
import { syncQpay } from "@/lib/tickets";

export const runtime = "nodejs";

/** Хүлээгдэж буй захиалгаа цуцлах (өөр ангилал сонгох гэх мэт) */
export async function POST(req: NextRequest, ctx: { params: Promise<{ ref: string }> }) {
  const blocked = badOrigin(req);
  if (blocked) return blocked;
  const email = await getSessionEmail();
  if (!email) return jsonError("Нэвтэрнэ үү.", 401);
  const ref = (await ctx.params).ref.toUpperCase();
  const store = ticketStore();
  const order = await store.getByRef(ref);
  if (!order || order.email !== email) return jsonError("Захиалга олдсонгүй.", 404);
  // Цуцлахын өмнө төлөгдсөн эсэхийг шалгана
  const fresh = await syncQpay(order);
  if (fresh.status === "paid") return jsonError("Төлбөр төлөгдсөн тул цуцлах боломжгүй.", 409);
  await store.cancel(ref);
  return NextResponse.json({ ok: true });
}
