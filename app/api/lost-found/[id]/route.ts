import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/db";
import { getSessionEmail } from "@/lib/session";
import { badOrigin, jsonError, parseId, toPostDTO } from "@/lib/lostfound";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

async function ownPost(req: NextRequest, ctx: Ctx) {
  const blocked = badOrigin(req);
  if (blocked) return { error: blocked };
  const email = await getSessionEmail();
  if (!email) return { error: jsonError("Нэвтэрнэ үү.", 401) };
  const id = parseId((await ctx.params).id);
  if (!id) return { error: jsonError("Пост олдсонгүй.", 404) };
  const post = await getStore().getPost(id);
  if (!post) return { error: jsonError("Пост олдсонгүй.", 404) };
  if (post.author_email !== email) return { error: jsonError("Зөвхөн өөрийн постыг өөрчилнө.", 403) };
  return { id, email };
}

/** PATCH { resolved: boolean } — "Эзэндээ очсон" гэж тэмдэглэх */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const r = await ownPost(req, ctx);
  if ("error" in r) return r.error;
  const body = await req.json().catch(() => ({}));
  const store = getStore();
  await store.updateResolved(r.id, Boolean((body as { resolved?: unknown }).resolved));
  return NextResponse.json({ post: toPostDTO((await store.getPost(r.id))!, r.email) });
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const r = await ownPost(req, ctx);
  if ("error" in r) return r.error;
  await getStore().deletePost(r.id);
  return NextResponse.json({ ok: true });
}
