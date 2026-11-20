import "server-only";
import { neon } from "@neondatabase/serverless";
import { databaseUrl } from "./database-url";

/**
 * "Хаясан гээсэн зүйлс" өгөгдлийн сан.
 * • Vercel → Storage → Neon (Postgres) холбоход DATABASE_URL автоматаар нэмэгдэнэ.
 * • Хүснэгтүүд анхны хүсэлтээр автоматаар үүснэ.
 * • DATABASE_URL байхгүй үед (зөвхөн локал development) санах ойд хадгална.
 */

export type PostKind = "lost" | "found";

export interface PostRow {
  id: number;
  kind: PostKind;
  title: string;
  body: string;
  location: string;
  has_image: boolean;
  author_email: string;
  resolved: boolean;
  created_at: string;
  comment_count: number;
}

export interface CommentRow {
  id: number;
  post_id: number;
  author_email: string;
  body: string;
  created_at: string;
}

export interface NewPost {
  kind: PostKind;
  title: string;
  body: string;
  location: string;
  image: string | null;
  authorEmail: string;
}

interface Store {
  listPosts(opts: { before?: number; limit: number; kind?: PostKind }): Promise<PostRow[]>;
  getPost(id: number): Promise<PostRow | null>;
  getImage(id: number): Promise<string | null>;
  createPost(p: NewPost): Promise<PostRow>;
  updateResolved(id: number, resolved: boolean): Promise<void>;
  deletePost(id: number): Promise<void>;
  listComments(postId: number): Promise<CommentRow[]>;
  getComment(id: number): Promise<CommentRow | null>;
  addComment(postId: number, authorEmail: string, body: string): Promise<CommentRow>;
  deleteComment(id: number): Promise<void>;
  countRecent(table: "posts" | "comments", email: string, sinceMinutes: number): Promise<number>;
}


/* ----------------------------- Postgres (Neon) ---------------------------- */

function createPgStore(url: string): Store {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const ensure = () =>
    (ready ??= (async () => {
      await sql`CREATE TABLE IF NOT EXISTS lf_posts (
        id BIGSERIAL PRIMARY KEY,
        kind TEXT NOT NULL CHECK (kind IN ('lost','found')),
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        image TEXT,
        author_email TEXT NOT NULL,
        resolved BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS lf_comments (
        id BIGSERIAL PRIMARY KEY,
        post_id BIGINT NOT NULL REFERENCES lf_posts(id) ON DELETE CASCADE,
        author_email TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS lf_comments_post_idx ON lf_comments(post_id)`;
    })().catch((e) => {
      ready = null;
      throw e;
    }));

  const toPost = (r: Record<string, unknown>): PostRow => ({
    id: Number(r.id),
    kind: r.kind as PostKind,
    title: String(r.title),
    body: String(r.body),
    location: String(r.location ?? ""),
    has_image: Boolean(r.has_image),
    author_email: String(r.author_email),
    resolved: Boolean(r.resolved),
    created_at: new Date(r.created_at as string).toISOString(),
    comment_count: Number(r.comment_count ?? 0),
  });
  const toComment = (r: Record<string, unknown>): CommentRow => ({
    id: Number(r.id),
    post_id: Number(r.post_id),
    author_email: String(r.author_email),
    body: String(r.body),
    created_at: new Date(r.created_at as string).toISOString(),
  });

  const SELECT = `p.id, p.kind, p.title, p.body, p.location, (p.image IS NOT NULL) AS has_image,
    p.author_email, p.resolved, p.created_at,
    (SELECT COUNT(*) FROM lf_comments c WHERE c.post_id = p.id) AS comment_count`;

  return {
    async listPosts({ before, limit, kind }) {
      await ensure();
      const rows = await sql.query(
        `SELECT ${SELECT} FROM lf_posts p
         WHERE ($1::bigint IS NULL OR p.id < $1) AND ($2::text IS NULL OR p.kind = $2)
         ORDER BY p.id DESC LIMIT $3`,
        [before ?? null, kind ?? null, limit],
      );
      return (rows as Record<string, unknown>[]).map(toPost);
    },
    async getPost(id) {
      await ensure();
      const rows = await sql.query(`SELECT ${SELECT} FROM lf_posts p WHERE p.id = $1`, [id]);
      return rows[0] ? toPost(rows[0] as Record<string, unknown>) : null;
    },
    async getImage(id) {
      await ensure();
      const rows = await sql`SELECT image FROM lf_posts WHERE id = ${id}`;
      return (rows[0]?.image as string | null) ?? null;
    },
    async createPost(p) {
      await ensure();
      const rows = await sql`INSERT INTO lf_posts (kind, title, body, location, image, author_email)
        VALUES (${p.kind}, ${p.title}, ${p.body}, ${p.location}, ${p.image}, ${p.authorEmail})
        RETURNING id`;
      return (await this.getPost(Number(rows[0].id)))!;
    },
    async updateResolved(id, resolved) {
      await ensure();
      await sql`UPDATE lf_posts SET resolved = ${resolved} WHERE id = ${id}`;
    },
    async deletePost(id) {
      await ensure();
      await sql`DELETE FROM lf_posts WHERE id = ${id}`;
    },
    async listComments(postId) {
      await ensure();
      const rows = await sql`SELECT * FROM lf_comments WHERE post_id = ${postId} ORDER BY id ASC LIMIT 200`;
      return rows.map((r) => toComment(r as Record<string, unknown>));
    },
    async getComment(id) {
      await ensure();
      const rows = await sql`SELECT * FROM lf_comments WHERE id = ${id}`;
      return rows[0] ? toComment(rows[0] as Record<string, unknown>) : null;
    },
    async addComment(postId, authorEmail, body) {
      await ensure();
      const rows = await sql`INSERT INTO lf_comments (post_id, author_email, body)
        VALUES (${postId}, ${authorEmail}, ${body}) RETURNING *`;
      return toComment(rows[0] as Record<string, unknown>);
    },
    async deleteComment(id) {
      await ensure();
      await sql`DELETE FROM lf_comments WHERE id = ${id}`;
    },
    async countRecent(table, email, sinceMinutes) {
      await ensure();
      const t = table === "posts" ? "lf_posts" : "lf_comments";
      const rows = await sql.query(
        `SELECT COUNT(*) AS n FROM ${t} WHERE author_email = $1 AND created_at > NOW() - ($2 || ' minutes')::interval`,
        [email, String(sinceMinutes)],
      );
      return Number(rows[0]?.n ?? 0);
    },
  };
}

/* ------------------------- In-memory (локал dev only) ------------------------ */

type MemPost = Omit<PostRow, "has_image" | "comment_count"> & { image: string | null };
const mem = globalThis as unknown as {
  __lf?: { posts: MemPost[]; comments: CommentRow[]; seq: number };
};

function createMemoryStore(): Store {
  const db = (mem.__lf ??= { posts: [], comments: [], seq: 0 });
  const view = (p: MemPost): PostRow => {
    const { image, ...rest } = p;
    return {
      ...rest,
      has_image: Boolean(image),
      comment_count: db.comments.filter((c) => c.post_id === p.id).length,
    };
  };
  return {
    async listPosts({ before, limit, kind }) {
      return db.posts
        .filter((p) => (before ? p.id < before : true) && (kind ? p.kind === kind : true))
        .sort((a, b) => b.id - a.id)
        .slice(0, limit)
        .map(view);
    },
    async getPost(id) {
      const p = db.posts.find((x) => x.id === id);
      return p ? view(p) : null;
    },
    async getImage(id) {
      return db.posts.find((x) => x.id === id)?.image ?? null;
    },
    async createPost(p) {
      const row: MemPost = {
        id: ++db.seq,
        kind: p.kind,
        title: p.title,
        body: p.body,
        location: p.location,
        image: p.image,
        author_email: p.authorEmail,
        resolved: false,
        created_at: new Date().toISOString(),
      };
      db.posts.push(row);
      return view(row);
    },
    async updateResolved(id, resolved) {
      const p = db.posts.find((x) => x.id === id);
      if (p) p.resolved = resolved;
    },
    async deletePost(id) {
      db.posts = db.posts.filter((x) => x.id !== id);
      db.comments = db.comments.filter((c) => c.post_id !== id);
    },
    async listComments(postId) {
      return db.comments.filter((c) => c.post_id === postId);
    },
    async getComment(id) {
      return db.comments.find((c) => c.id === id) ?? null;
    },
    async addComment(postId, authorEmail, body) {
      const c: CommentRow = { id: ++db.seq, post_id: postId, author_email: authorEmail, body, created_at: new Date().toISOString() };
      db.comments.push(c);
      return c;
    },
    async deleteComment(id) {
      db.comments = db.comments.filter((c) => c.id !== id);
    },
    async countRecent(table, email, sinceMinutes) {
      const since = Date.now() - sinceMinutes * 60_000;
      const list = table === "posts" ? db.posts : db.comments;
      return list.filter((x) => x.author_email === email && Date.parse(x.created_at) > since).length;
    },
  };
}

let store: Store | null = null;

export function getStore(): Store {
  if (store) return store;
  const url = databaseUrl();
  if (url) return (store = createPgStore(url));
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL тохируулаагүй байна. Vercel → Storage → Neon холбоно уу.");
  }
  console.warn("[DEV] DATABASE_URL байхгүй — постуудыг санах ойд түр хадгалж байна.");
  return (store = createMemoryStore());
}
