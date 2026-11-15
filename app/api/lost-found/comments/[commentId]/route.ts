import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/db";
import { getSessionEmail } from "@/lib/session";
import { badOrigin, jsonError, parseId } from "@/lib/lostfound";

export const runtime = "nodejs";

/** Өөрийн бичсэн сэтгэгдлийг устгах */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ commentId: string }> }) {
  const blocked = badOrigin(req);
  if (blocked) return blocked;
  const email = await getSessionEmail();
  if (!email) return jsonError("Нэвтэрнэ үү.", 401);
  const id = parseId((await ctx.params).commentId);
  const store = getStore();
  const comment = id ? await store.getComment(id) : null;
  if (!comment) return jsonError("Сэтгэгдэл олдсонгүй.", 404);
  if (comment.author_email !== email) return jsonError("Зөвхөн өөрийн сэтгэгдлийг устгана.", 403);
  await store.deleteComment(comment.id);
  return NextResponse.json({ ok: true });
}
