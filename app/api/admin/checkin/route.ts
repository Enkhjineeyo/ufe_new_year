import { NextResponse, type NextRequest } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { badOrigin, jsonError } from "@/lib/lostfound";
import { ticketStore } from "@/lib/tickets-db";
import { isAdmin } from "@/lib/tickets";

export const runtime = "nodejs";

/** Хаалган дээр тасалбар бүртгэх { code } */
export async function POST(req: NextRequest) {
  const blocked = badOrigin(req);
  if (blocked) return blocked;
  const email = await getSessionEmail();
  if (!email || !isAdmin(email)) return jsonError("Зөвхөн админ.", 403);
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code) return jsonError("Код оруулна уу.", 400);
  const result = await ticketStore().checkIn(code.trim().toUpperCase(), email);
  return NextResponse.json({ result });
}
