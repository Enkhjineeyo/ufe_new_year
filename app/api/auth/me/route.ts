import { NextResponse } from "next/server";
import { getSessionEmail } from "@/lib/session";
import { displayName } from "@/lib/lostfound";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getSessionEmail();
  return NextResponse.json(
    { loggedIn: Boolean(email), name: email ? displayName(email) : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
