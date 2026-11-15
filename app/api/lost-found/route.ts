import { NextResponse, type NextRequest } from "next/server";
import { getStore, type PostKind } from "@/lib/db";
import { getSessionEmail } from "@/lib/session";
import { LIMITS, PAGE_SIZE, badOrigin, clean, jsonError, toPostDTO } from "@/lib/lostfound";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/lost-found?before=<id>&kind=lost|found — хамгийн сүүлийн 5 пост */
export async function GET(req: NextRequest) {
  const viewer = await getSessionEmail();
  const beforeRaw = Number(req.nextUrl.searchParams.get("before"));
  const before = Number.isSafeInteger(beforeRaw) && beforeRaw > 0 ? beforeRaw : undefined;
  const kindRaw = req.nextUrl.searchParams.get("kind");
  const kind = kindRaw === "lost" || kindRaw === "found" ? kindRaw : undefined;

  try {
    const rows = await getStore().listPosts({ before, kind, limit: PAGE_SIZE + 1 });
    const page = rows.slice(0, PAGE_SIZE);
    return NextResponse.json(
      {
        posts: page.map((p) => toPostDTO(p, viewer)),
        nextCursor: rows.length > PAGE_SIZE ? page[page.length - 1].id : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error(e);
    return jsonError("Постуудыг ачаалж чадсангүй.", 500);
  }
}

/** POST /api/lost-found — шинэ пост (нэвтэрсэн хэрэглэгч) */
export async function POST(req: NextRequest) {
  const blocked = badOrigin(req);
  if (blocked) return blocked;
  const email = await getSessionEmail();
  if (!email) return jsonError("Пост оруулахын тулд нэвтэрнэ үү.", 401);

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return jsonError("Буруу хүсэлт.", 400);
  }

  const kind: PostKind | null = data.kind === "lost" || data.kind === "found" ? data.kind : null;
  const title = clean(data.title, LIMITS.title);
  const body = clean(data.body, LIMITS.body);
  const location = clean(data.location, LIMITS.location);
  let image: string | null = null;
  if (typeof data.image === "string" && data.image) {
    if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(data.image) || data.image.length > LIMITS.image) {
      return jsonError("Зураг буруу эсвэл хэт том байна.", 400);
    }
    image = data.image;
  }
  if (!kind) return jsonError("Гээсэн эсвэл олсон эсэхээ сонгоно уу.", 400);
  if (title.length < 3) return jsonError("Гарчиг дор хаяж 3 тэмдэгт байна.", 400);
  if (body.length < 5) return jsonError("Тайлбараа дэлгэрэнгүй бичнэ үү.", 400);

  try {
    const store = getStore();
    if ((await store.countRecent("posts", email, 60)) >= LIMITS.postsPerHour) {
      return jsonError("Нэг цагт хамгийн ихдээ 5 пост оруулна. Түр хүлээнэ үү.", 429);
    }
    const post = await store.createPost({ kind, title, body, location, image, authorEmail: email });
    return NextResponse.json({ post: toPostDTO(post, email) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return jsonError("Пост хадгалж чадсангүй.", 500);
  }
}
