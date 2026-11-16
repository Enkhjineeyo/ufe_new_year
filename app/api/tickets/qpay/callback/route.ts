import { NextResponse, type NextRequest } from "next/server";
import { ticketStore } from "@/lib/tickets-db";
import { syncQpay } from "@/lib/tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * QPay төлбөр хийгдмэгц энэ хаягийг дуудна.
 * Callback-ийн агуулгад итгэхгүй — QPay API-аас төлбөрийг дахин шалгаж баталгаажуулна.
 */
async function handle(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref")?.toUpperCase();
  if (ref) {
    const order = await ticketStore().getByRef(ref);
    if (order) await syncQpay(order);
  }
  return NextResponse.json({ ok: true });
}
export const GET = handle;
export const POST = handle;
