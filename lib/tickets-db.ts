import "server-only";
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

/**
 * Тасалбарын захиалгын өгөгдлийн сан (Neon Postgres).
 * DATABASE_URL байхгүй үед (зөвхөн локал dev) санах ойд хадгална.
 */
export type OrderStatus = "pending" | "paid" | "cancelled" | "expired";
export type PayMethod = "qpay" | "bank";

export interface Order {
  ref: string;
  email: string;
  tier: string;
  amount: number;
  method: PayMethod;
  status: OrderStatus;
  expiresAt: string;
  createdAt: string;
  paidAt: string | null;
  ticketCode: string | null;
  checkedInAt: string | null;
  confirmedBy: string | null;
  qpayInvoiceId: string | null;
  qpayQrImage: string | null;
  qpayShortUrl: string | null;
  qpayUrls: { name: string; description?: string; logo?: string; link: string }[] | null;
}

export interface QpayFields {
  invoiceId: string;
  qrImage: string | null;
  shortUrl: string | null;
  urls: Order["qpayUrls"];
}

interface Store {
  create(o: { email: string; tier: string; amount: number; method: PayMethod; expiresAt: Date }): Promise<Order>;
  setQpay(ref: string, q: QpayFields): Promise<void>;
  getByRef(ref: string): Promise<Order | null>;
  getByTicket(code: string): Promise<Order | null>;
  listByEmail(email: string): Promise<Order[]>;
  listAll(opts: { status?: string; q?: string; limit?: number }): Promise<Order[]>;
  /** Төлөгдсөн болгоно (давтан дуудахад аюулгүй). Шинэчлэгдсэн захиалгыг буцаана */
  markPaid(ref: string, by: string): Promise<Order | null>;
  cancel(ref: string): Promise<void>;
  checkIn(code: string, by: string): Promise<"ok" | "already" | "invalid">;
  /** Тухайн ангилалд зарагдсан + хүлээгдэж буй (хугацаа дуусаагүй) тоо */
  countActive(tier: string): Promise<number>;
  countActiveForEmail(email: string): Promise<number>;
}

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rand = (n: number) => Array.from(randomBytes(n), (b) => ALPH[b % ALPH.length]).join("");
export const newRef = () => `UFE-${rand(6)}`;
const newTicketCode = () => rand(12);

/** Хугацаа дууссан pending захиалгыг "expired" гэж харуулна */
const effective = (o: Order): Order =>
  o.status === "pending" && Date.parse(o.expiresAt) < Date.now() ? { ...o, status: "expired" } : o;

/* --------------------------------- Postgres -------------------------------- */
function pgStore(url: string): Store {
  const sql = neon(url);
  let ready: Promise<unknown> | null = null;
  const ensure = () =>
    (ready ??= (async () => {
      await sql`CREATE TABLE IF NOT EXISTS tk_orders (
        id BIGSERIAL PRIMARY KEY,
        ref TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        tier TEXT NOT NULL,
        amount INTEGER NOT NULL,
        method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        paid_at TIMESTAMPTZ,
        ticket_code TEXT UNIQUE,
        checked_in_at TIMESTAMPTZ,
        checked_in_by TEXT,
        confirmed_by TEXT,
        qpay_invoice_id TEXT,
        qpay_qr_image TEXT,
        qpay_short_url TEXT,
        qpay_urls JSONB
      )`;
      await sql`CREATE INDEX IF NOT EXISTS tk_orders_email_idx ON tk_orders(email)`;
      await sql`CREATE INDEX IF NOT EXISTS tk_orders_tier_idx ON tk_orders(tier, status)`;
    })().catch((e) => {
      ready = null;
      throw e;
    }));

  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  const row = (r: Record<string, unknown>): Order =>
    effective({
      ref: String(r.ref),
      email: String(r.email),
      tier: String(r.tier),
      amount: Number(r.amount),
      method: r.method as PayMethod,
      status: r.status as OrderStatus,
      expiresAt: iso(r.expires_at)!,
      createdAt: iso(r.created_at)!,
      paidAt: iso(r.paid_at),
      ticketCode: (r.ticket_code as string) ?? null,
      checkedInAt: iso(r.checked_in_at),
      confirmedBy: (r.confirmed_by as string) ?? null,
      qpayInvoiceId: (r.qpay_invoice_id as string) ?? null,
      qpayQrImage: (r.qpay_qr_image as string) ?? null,
      qpayShortUrl: (r.qpay_short_url as string) ?? null,
      qpayUrls: (r.qpay_urls as Order["qpayUrls"]) ?? null,
    });
  const ACTIVE = `(status = 'paid' OR (status = 'pending' AND expires_at > NOW()))`;

  return {
    async create(o) {
      await ensure();
      const rows = await sql`INSERT INTO tk_orders (ref, email, tier, amount, method, expires_at)
        VALUES (${newRef()}, ${o.email}, ${o.tier}, ${o.amount}, ${o.method}, ${o.expiresAt.toISOString()}) RETURNING *`;
      return row(rows[0] as Record<string, unknown>);
    },
    async setQpay(ref, q) {
      await ensure();
      await sql`UPDATE tk_orders SET qpay_invoice_id = ${q.invoiceId}, qpay_qr_image = ${q.qrImage},
        qpay_short_url = ${q.shortUrl}, qpay_urls = ${JSON.stringify(q.urls ?? [])}::jsonb WHERE ref = ${ref}`;
    },
    async getByRef(ref) {
      await ensure();
      const r = await sql`SELECT * FROM tk_orders WHERE ref = ${ref}`;
      return r[0] ? row(r[0] as Record<string, unknown>) : null;
    },
    async getByTicket(code) {
      await ensure();
      const r = await sql`SELECT * FROM tk_orders WHERE ticket_code = ${code}`;
      return r[0] ? row(r[0] as Record<string, unknown>) : null;
    },
    async listByEmail(email) {
      await ensure();
      const r = await sql`SELECT * FROM tk_orders WHERE email = ${email} ORDER BY id DESC LIMIT 20`;
      return r.map((x) => row(x as Record<string, unknown>));
    },
    async listAll({ status, q, limit = 300 }) {
      await ensure();
      const like = q ? `%${q.toLowerCase()}%` : null;
      const r = await sql.query(
        `SELECT * FROM tk_orders
         WHERE ($1::text IS NULL OR status = $1)
           AND ($2::text IS NULL OR lower(ref) LIKE $2 OR lower(email) LIKE $2 OR lower(coalesce(ticket_code,'')) LIKE $2)
         ORDER BY id DESC LIMIT $3`,
        [status ?? null, like, limit],
      );
      return (r as Record<string, unknown>[]).map(row);
    },
    async markPaid(ref, by) {
      await ensure();
      await sql`UPDATE tk_orders SET status = 'paid', paid_at = NOW(), confirmed_by = ${by},
        ticket_code = COALESCE(ticket_code, ${newTicketCode()})
        WHERE ref = ${ref} AND status <> 'paid'`;
      return this.getByRef(ref);
    },
    async cancel(ref) {
      await ensure();
      await sql`UPDATE tk_orders SET status = 'cancelled' WHERE ref = ${ref} AND status <> 'paid'`;
    },
    async checkIn(code, by) {
      await ensure();
      const r = await sql`UPDATE tk_orders SET checked_in_at = NOW(), checked_in_by = ${by}
        WHERE ticket_code = ${code} AND status = 'paid' AND checked_in_at IS NULL RETURNING ref`;
      if (r.length) return "ok";
      const o = await this.getByTicket(code);
      return o?.status === "paid" ? "already" : "invalid";
    },
    async countActive(tier) {
      await ensure();
      const r = await sql.query(`SELECT COUNT(*) AS n FROM tk_orders WHERE tier = $1 AND ${ACTIVE}`, [tier]);
      return Number(r[0]?.n ?? 0);
    },
    async countActiveForEmail(email) {
      await ensure();
      const r = await sql.query(`SELECT COUNT(*) AS n FROM tk_orders WHERE email = $1 AND ${ACTIVE}`, [email]);
      return Number(r[0]?.n ?? 0);
    },
  };
}

/* ------------------------------ In-memory (dev) ---------------------------- */
const g = globalThis as unknown as { __tk?: Order[] };
function memStore(): Store {
  const db = (g.__tk ??= []);
  const find = (ref: string) => db.find((o) => o.ref === ref);
  const active = (o: Order) => effective(o).status === "paid" || effective(o).status === "pending";
  return {
    async create(o) {
      const order: Order = {
        ref: newRef(), email: o.email, tier: o.tier, amount: o.amount, method: o.method, status: "pending",
        expiresAt: o.expiresAt.toISOString(), createdAt: new Date().toISOString(), paidAt: null, ticketCode: null,
        checkedInAt: null, confirmedBy: null, qpayInvoiceId: null, qpayQrImage: null, qpayShortUrl: null, qpayUrls: null,
      };
      db.push(order);
      return order;
    },
    async setQpay(ref, q) {
      const o = find(ref);
      if (o) Object.assign(o, { qpayInvoiceId: q.invoiceId, qpayQrImage: q.qrImage, qpayShortUrl: q.shortUrl, qpayUrls: q.urls });
    },
    async getByRef(ref) {
      const o = find(ref);
      return o ? effective(o) : null;
    },
    async getByTicket(code) {
      const o = db.find((x) => x.ticketCode === code);
      return o ? effective(o) : null;
    },
    async listByEmail(email) {
      return db.filter((o) => o.email === email).reverse().map(effective);
    },
    async listAll({ status, q }) {
      const s = q?.toLowerCase();
      return db
        .map(effective)
        .filter((o) => (!status || o.status === status) && (!s || [o.ref, o.email, o.ticketCode ?? ""].some((v) => v.toLowerCase().includes(s))))
        .reverse();
    },
    async markPaid(ref, by) {
      const o = find(ref);
      if (o && o.status !== "paid") Object.assign(o, { status: "paid", paidAt: new Date().toISOString(), confirmedBy: by, ticketCode: o.ticketCode ?? newTicketCode() });
      return o ? effective(o) : null;
    },
    async cancel(ref) {
      const o = find(ref);
      if (o && o.status !== "paid") o.status = "cancelled";
    },
    async checkIn(code) {
      const o = db.find((x) => x.ticketCode === code);
      if (!o || o.status !== "paid") return "invalid";
      if (o.checkedInAt) return "already";
      o.checkedInAt = new Date().toISOString();
      return "ok";
    },
    async countActive(tier) {
      return db.filter((o) => o.tier === tier && active(o)).length;
    },
    async countActiveForEmail(email) {
      return db.filter((o) => o.email === email && active(o)).length;
    },
  };
}

let store: Store | null = null;
export function ticketStore(): Store {
  if (store) return store;
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (url) return (store = pgStore(url));
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL тохируулаагүй байна.");
  return (store = memStore());
}
