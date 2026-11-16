import { NextResponse } from "next/server";
import { ticketConfig } from "@/data/tickets";
import { bankEnabled, tierState } from "@/lib/tickets";
import { qpayEnabled } from "@/lib/qpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tiers = await Promise.all(
      ticketConfig.tiers.map(async (t) => ({ id: t.id, ...(await tierState(t)) })),
    );
    return NextResponse.json(
      { tiers, methods: { qpay: qpayEnabled(), bank: bankEnabled() } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Тасалбарын мэдээлэл ачаалж чадсангүй." }, { status: 500 });
  }
}
