import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { jsonError } from "@/lib/lostfound";
import { ticketStore } from "@/lib/tickets-db";
import { orderDTO, syncQpay } from "@/lib/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getSessionEmail();
  if (!email) return jsonError("Нэвтэрнэ үү.", 401);
  const orders = await Promise.all((await ticketStore().listByEmail(email)).map(syncQpay));
  return NextResponse.json({ orders: orders.map(orderDTO) }, { headers: { "Cache-Control": "no-store" } });
}
