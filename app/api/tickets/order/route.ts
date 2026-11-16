import { NextResponse, type NextRequest } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { badOrigin, jsonError } from "@/lib/lostfound";
import { getBaseUrl } from "@/lib/auth";
import { TicketError, orderDTO, placeOrder } from "@/lib/tickets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const blocked = badOrigin(req);
  if (blocked) return blocked;
  const email = await getSessionEmail();
  if (!email) return jsonError("Тасалбар авахын тулд нэвтэрнэ үү.", 401);
  const body = (await req.json().catch(() => ({}))) as { tier?: string; method?: string };
  const method = body.method === "qpay" || body.method === "bank" ? body.method : null;
  if (!method || !body.tier) return jsonError("Тасалбар болон төлбөрийн хэлбэрээ сонгоно уу.", 400);
  try {
    const order = await placeOrder(email, body.tier, method, getBaseUrl(req.nextUrl.origin));
    return NextResponse.json({ order: orderDTO(order) }, { status: 201 });
  } catch (e) {
    if (e instanceof TicketError) return jsonError(e.message, e.status);
    console.error(e);
    return jsonError("Захиалга үүсгэж чадсангүй.", 500);
  }
}
