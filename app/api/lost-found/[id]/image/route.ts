import { type NextRequest } from "next/server";
import { getStore } from "@/lib/db";
import { parseId } from "@/lib/lostfound";

export const runtime = "nodejs";

/** Постын зургийг файл болгон буцаана (кэштэй) */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const id = parseId((await ctx.params).id);
  const dataUrl = id ? await getStore().getImage(id) : null;
  const m = dataUrl && /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!m) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(m[2], "base64"), {
    headers: {
      "Content-Type": m[1],
      "Cache-Control": "public, max-age=86400, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
