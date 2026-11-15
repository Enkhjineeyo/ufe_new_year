import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/db";
import { getSessionEmail } from "@/lib/session";
import { LIMITS, badOrigin, clean, jsonError, parseId, toCommentDTO } from "@/lib/lostfound";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const id = parseId((await ctx.params).id);
  const store = getStore();
  const post = id ? await store.getPost(id) : null;
  if (!post) return jsonError("Пост олдсонгүй.", 404);
  const viewer = await getSessionEmail();
  const comments = await store.listComments(post.id);
  return NextResponse.json(
    { comments: comments.map((c) => toCommentDTO(c, viewer, post.author_email)) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const blocked = badOrigin(req);
  if (blocked) return blocked;
  const email = await getSessionEmail();
  if (!email) return jsonError("Сэтгэгдэл бичихийн тулд нэвтэрнэ үү.", 401);

  const id = parseId((await ctx.params).id);
  const store = getStore();
  const post = id ? await store.getPost(id) : null;
  if (!post) return jsonError("Пост олдсонгүй.", 404);

  const data = await req.json().catch(() => ({}));
  const body = clean((data as { body?: unknown }).body, LIMITS.comment);
  if (body.length < 1) return jsonError("Сэтгэгдэл хоосон байна.", 400);
  if ((await store.countRecent("comments", email, 60)) >= LIMITS.commentsPerHour) {
    return jsonError("Хэт олон сэтгэгдэл бичлээ. Түр хүлээнэ үү.", 429);
  }
  const comment = await store.addComment(post.id, email, body);
  return NextResponse.json({ comment: toCommentDTO(comment, email, post.author_email) }, { status: 201 });
}
