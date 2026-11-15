import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { CommentRow, PostKind, PostRow } from "./db";

export const PAGE_SIZE = 5;
export const LIMITS = {
  title: 80,
  body: 1000,
  location: 80,
  comment: 500,
  /** base64 data URL-ийн дээд хэмжээ (~1.1MB зураг) */
  image: 1_500_000,
  postsPerHour: 5,
  commentsPerHour: 30,
};

/** Нийтэд харагдах нэр: b23*****@ufe.edu.mn */
export function displayName(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 3)}${"*".repeat(Math.max(local.length - 3, 3))}@${domain}`;
}

export interface PostDTO {
  id: number;
  kind: PostKind;
  title: string;
  body: string;
  location: string;
  imageUrl: string | null;
  author: string;
  isMine: boolean;
  resolved: boolean;
  createdAt: string;
  commentCount: number;
}

export interface CommentDTO {
  id: number;
  body: string;
  author: string;
  isMine: boolean;
  isPostAuthor: boolean;
  createdAt: string;
}

export function toPostDTO(p: PostRow, viewer: string | null): PostDTO {
  return {
    id: p.id,
    kind: p.kind,
    title: p.title,
    body: p.body,
    location: p.location,
    imageUrl: p.has_image ? `/api/lost-found/${p.id}/image` : null,
    author: displayName(p.author_email),
    isMine: viewer === p.author_email,
    resolved: p.resolved,
    createdAt: p.created_at,
    commentCount: p.comment_count,
  };
}

export function toCommentDTO(c: CommentRow, viewer: string | null, postAuthor: string): CommentDTO {
  return {
    id: c.id,
    body: c.body,
    author: displayName(c.author_email),
    isMine: viewer === c.author_email,
    isPostAuthor: c.author_email === postAuthor,
    createdAt: c.created_at,
  };
}

export const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\r\n/g, "\n").trim().slice(0, max) : "";

export function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

/** Өөр сайтаас ирсэн хүсэлтийг (CSRF) хаана */
export function badOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ error: "Зөвшөөрөгдөөгүй хүсэлт." }, { status: 403 });
  }
  return null;
}

export const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status });
