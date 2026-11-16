import { NextResponse, type NextRequest } from "next/server";
import { ticketStore } from "@/lib/tickets-db";
import { mockMarkPaid } from "@/lib/qpay";

/** ЗӨВХӨН локал туршилт (QPAY_MOCK=1): QPay төлбөр хийсэн мэт болгоно */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" || process.env.QPAY_MOCK !== "1") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const { ref } = (await req.json().catch(() => ({}))) as { ref?: string };
  const order = ref ? await ticketStore().getByRef(ref) : null;
  if (!order?.qpayInvoiceId) return NextResponse.json({ error: "not found" }, { status: 404 });
  mockMarkPaid(order.qpayInvoiceId);
  return NextResponse.json({ ok: true });
}
