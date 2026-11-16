import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { siteConfig } from "@/site.config";

/**
 * Өгөгдлийн сангүй (stateless) нэвтрэлт:
 *  1. Оюутан сургуулийн майлаа оруулна.
 *  2. Сервер HMAC-аар гарын үсэг зурсан, 15 минут хүчинтэй холбоос майл руу илгээнэ.
 *  3. Холбоос дээр дарахад httpOnly session cookie үүснэ.
 */

export const SESSION_COOKIE = "ufe_session";
export const COOLDOWN_COOKIE = "ufe_link_sent";

type TokenPayload = { email: string; purpose: "login" | "session"; exp: number; next?: string };

/** Нэвтэрсний дараа очих дотоод зам (жш: /tickets/buy?tier=vip) — гадны холбоос зөвшөөрөхгүй */
export function safeNext(v: unknown): string | undefined {
  return typeof v === "string" && /^\/(?!\/)[\w\-/?=&.%#]*$/.test(v) && v.length < 200 ? v : undefined;
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET орчны хувьсагч (≥32 тэмдэгт) тохируулаагүй байна.");
  }
  return "dev-only-secret-do-not-use-in-production-0000";
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");

function hmac(data: string) {
  return createHmac("sha256", getSecret()).update(data).digest();
}

export function signToken(payload: TokenPayload): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(hmac(body))}`;
}

export function verifyToken(token: string | undefined, purpose: TokenPayload["purpose"]): TokenPayload | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = hmac(body);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (payload.purpose !== purpose || typeof payload.email !== "string") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Майл хаягийг цэвэрлэж, зөвшөөрөгдсөн домэйн эсэхийг шалгана */
export function normalizeAllowedEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length > 120) return null;
  const match = /^([a-z0-9._-]+)@([a-z0-9.-]+)$/.exec(email);
  if (!match) return null;
  return siteConfig.auth.allowedDomains.includes(match[2]) ? email : null;
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

/** Холбоосны үндсэн хаяг — Host header-т найдахгүйн тулд орчны хувьсагчийг түрүүлж ашиглана */
export function getBaseUrl(requestOrigin: string) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return requestOrigin;
}

export const sessionCookieOptions = (maxAgeSeconds: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeSeconds,
});
