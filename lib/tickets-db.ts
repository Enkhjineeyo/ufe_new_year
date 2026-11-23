import "server-only";
import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";
import { databaseUrl } from "./database-url";
import type { Guest } from "@/data/tickets";

/**
 * Тасалбарын захиалгын өгөгдлийн сан (Neon Postgres).
 * DATABASE_URL байхгүй үед (зөвхөн локал dev) санах ойд хадгална.
 *
 *   tk_orders  — нэг оюутны нэг захиалга (өөрийн 1 + найзуудын 0–2 тасалбар, нийт quantity)
 *   tk_tickets — захиалга төлөгдмөгц тасалбар бүрт нэг мөр, тус бүр өөрийн QR кодтой
 */
export type OrderStatus = "pending" | "paid" | "cancelled" | "expired";
export type PayMethod = "qpay" | "bank";

export interface Ticket {
  code: string;
  orderRef: string;
  /** 0 — оюутан өөрөө, 1..n — найз */
  idx: number;
  isGuest: boolean;
  holderName: string | null;
  holderPhone: string | null;
  checkedInAt: string | null;
}

export interface Order {
  ref: string;
  email: string;
  tier: string;
  /** Тасалбарын тоо (1 + найзын тоо) */
  quantity: number;
  guests: Guest[];
  /** VIP ширээний дугаар (бусад ангилалд null) */
  tableNo: number | null;
  amount: number;
  method: PayMethod;
  status: OrderStatus;
  expiresAt: string;
  createdAt: string;
  paidAt: string | null;
  /** Оюутны өөрийнх нь тасалбарын код */
  ticketCode: string | null;
  checkedInAt: string | null;
  confirmedBy: string | null;
  qpayInvoiceId: string | null;
  qpayQrImage: string | null;
  qpayShortUrl: string | null;
  qpayUrls: { name: string; description?: string; logo?: string; link: string }[] | null;
  /** Төлөгдсөн захиалгын бүх тасалбар (оюутан + найзууд) */
  tickets: Ticket[];
}

export interface QpayFields {
  invoiceId: string;
  qrImage: string | null;
  shortUrl: string | null;
  urls: Order["qpayUrls"];
}

export interface NewOrder {
  email: string;
  tier: string;
  guests: Guest[];
  tableNo: number | null;
  amount: number;
  method: PayMethod;
  expiresAt: Date;
}

/** Захиалга үүсгэх үеийн хязгаар: ангиллын нийт тасалбар, нэг оюутны идэвхтэй захиалгын тоо */
export interface OrderLimits {
  tierQuantity: number;
  maxOrdersPerEmail: number;
  /** Ширээ сонгосон бол нэг ширээний суудлын тоо */
  seatsPerTable?: number;
}

/**
 * "soldout" — ангилалд хүрэлцэх тасалбар үлдээгүй, "limit" — оюутанд идэвхтэй захиалга байна.
 * Шалгалт ба бичилт нэг transaction дотор хийгдэх тул зэрэг ирсэн хүсэлтүүд хэтрүүлж зарахгүй.
 */
export type CreateResult = Order | "soldout" | "limit" | "tablefull";

interface Store {
  create(o: NewOrder, limits: OrderLimits): Promise<CreateResult>;
  setQpay(ref: string, q: QpayFields): Promise<void>;
  getByRef(ref: string): Promise<Order | null>;
  /** Тасалбарын кодоор тасалбар ба түүний захиалгыг олно */
  getByTicket(code: string): Promise<{ order: Order; ticket: Ticket } | null>;
  listByEmail(email: string): Promise<Order[]>;
  listAll(opts: { status?: string; q?: string; limit?: number }): Promise<Order[]>;
  /** Төлөгдсөн болгож тасалбаруудыг гаргана (давтан дуудахад аюулгүй). Шинэчлэгдсэн захиалгыг буцаана */
  markPaid(ref: string, by: string): Promise<Order | null>;
  cancel(ref: string): Promise<void>;
  checkIn(code: string, by: string): Promise<"ok" | "already" | "invalid">;
  /** Тухайн ангилалд зарагдсан + хүлээгдэж буй (хугацаа дуусаагүй) тасалбарын тоо */
  countActive(tier: string): Promise<number>;
  /** Оюутны идэвхтэй захиалгын тоо */
  countActiveForEmail(email: string): Promise<number>;
  /** Ширээ бүрт эзлэгдсэн (зарагдсан + хүлээгдэж буй) суудлын тоо */
  tableUsage(tier: string): Promise<Record<number, number>>;
}

const ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rand = (n: number) => Array.from(randomBytes(n), (b) => ALPH[b % ALPH.length]).join("");
export const newRef = () => `UFE-${rand(6)}`;
const newTicketCode = () => rand(12);
/** Захиалга үүсгэх transaction-уудыг дараалуулах түгжээний түлхүүр (дурын тогтмол тоо) */
const ORDER_LOCK_KEY = 2027_1220;

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
      // Найзын тасалбарын өөрчлөлт: хуучин хүснэгтэд багана нэмнэ (хуучин захиалга = 1 тасалбар)
      await sql`ALTER TABLE tk_orders ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1`;
      await sql`ALTER TABLE tk_orders ADD COLUMN IF NOT EXISTS guests JSONB NOT NULL DEFAULT '[]'::jsonb`;
      // VIP ширээ сонголт
      await sql`ALTER TABLE tk_orders ADD COLUMN IF NOT EXISTS table_no INTEGER`;
      await sql`CREATE INDEX IF NOT EXISTS tk_orders_email_idx ON tk_orders(email)`;
      await sql`CREATE INDEX IF NOT EXISTS tk_orders_tier_idx ON tk_orders(tier, status)`;
      await sql`CREATE TABLE IF NOT EXISTS tk_tickets (
        code TEXT PRIMARY KEY,
        order_ref TEXT NOT NULL REFERENCES tk_orders(ref),
        idx INTEGER NOT NULL,
        is_guest BOOLEAN NOT NULL DEFAULT FALSE,
        holder_name TEXT,
        holder_phone TEXT,
        checked_in_at TIMESTAMPTZ,
        checked_in_by TEXT,
        UNIQUE (order_ref, idx)
      )`;
      // Өмнө нь зарагдсан тасалбаруудыг шинэ хүснэгт рүү хуулна (давтан ажиллахад аюулгүй)
      await sql`INSERT INTO tk_tickets (code, order_ref, idx, is_guest, checked_in_at, checked_in_by)
        SELECT ticket_code, ref, 0, FALSE, checked_in_at, checked_in_by FROM tk_orders
        WHERE status = 'paid' AND ticket_code IS NOT NULL
        ON CONFLICT DO NOTHING`;
    })().catch((e) => {
      ready = null;
      throw e;
    }));

  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  const toTicket = (r: Record<string, unknown>): Ticket => ({
    code: String(r.code),
    orderRef: String(r.order_ref),
    idx: Number(r.idx),
    isGuest: Boolean(r.is_guest),
    holderName: (r.holder_name as string) ?? null,
    holderPhone: (r.holder_phone as string) ?? null,
    checkedInAt: iso(r.checked_in_at),
  });
  const row = (r: Record<string, unknown>, tickets: Ticket[] = []): Order => {
    const own = tickets.find((t) => t.idx === 0);
    return effective({
      ref: String(r.ref),
      email: String(r.email),
      tier: String(r.tier),
      quantity: Number(r.quantity ?? 1),
      guests: (r.guests as Guest[]) ?? [],
      tableNo: r.table_no == null ? null : Number(r.table_no),
      amount: Number(r.amount),
      method: r.method as PayMethod,
      status: r.status as OrderStatus,
      expiresAt: iso(r.expires_at)!,
      createdAt: iso(r.created_at)!,
      paidAt: iso(r.paid_at),
      ticketCode: (r.ticket_code as string) ?? null,
      checkedInAt: own?.checkedInAt ?? iso(r.checked_in_at),
      confirmedBy: (r.confirmed_by as string) ?? null,
      qpayInvoiceId: (r.qpay_invoice_id as string) ?? null,
      qpayQrImage: (r.qpay_qr_image as string) ?? null,
      qpayShortUrl: (r.qpay_short_url as string) ?? null,
      qpayUrls: (r.qpay_urls as Order["qpayUrls"]) ?? null,
      tickets,
    });
  };
  /** Захиалгуудын тасалбарыг нэг дор ачаалж хавсаргана */
  async function withTickets(rows: Record<string, unknown>[]): Promise<Order[]> {
    const refs = rows.filter((r) => r.status === "paid").map((r) => String(r.ref));
    const byRef = new Map<string, Ticket[]>();
    if (refs.length) {
      const ts = await sql`SELECT * FROM tk_tickets WHERE order_ref = ANY(${refs}::text[]) ORDER BY order_ref, idx`;
      for (const t of ts.map((x) => toTicket(x as Record<string, unknown>))) {
        byRef.set(t.orderRef, [...(byRef.get(t.orderRef) ?? []), t]);
      }
    }
    return rows.map((r) => row(r, byRef.get(String(r.ref)) ?? []));
  }
  const ACTIVE = `(status = 'paid' OR (status = 'pending' AND expires_at > NOW()))`;

  return {
    async create(o, limits) {
      await ensure();
      const quantity = 1 + o.guests.length;
      // Бүх захиалгыг дарааллаар нь оруулахын тулд transaction-ий түгжээ авна.
      // Түгжээ авсны дараах INSERT бусад transaction-ий commit хийсэн мөрийг харж тоолно.
      const [, inserted] = await sql.transaction((tx) => [
        tx`SELECT pg_advisory_xact_lock(${ORDER_LOCK_KEY})`,
        tx`INSERT INTO tk_orders (ref, email, tier, quantity, guests, table_no, amount, method, expires_at)
          SELECT ${newRef()}, ${o.email}, ${o.tier}, ${quantity}, ${JSON.stringify(o.guests)}::jsonb, ${o.tableNo},
                 ${o.amount}, ${o.method}, ${o.expiresAt.toISOString()}
          WHERE (SELECT COALESCE(SUM(quantity), 0) FROM tk_orders WHERE tier = ${o.tier}
                   AND (status = 'paid' OR (status = 'pending' AND expires_at > NOW()))) + ${quantity} <= ${limits.tierQuantity}
            AND (SELECT COUNT(*) FROM tk_orders WHERE email = ${o.email}
                   AND (status = 'paid' OR (status = 'pending' AND expires_at > NOW()))) < ${limits.maxOrdersPerEmail}
            AND (${o.tableNo}::int IS NULL OR (SELECT COALESCE(SUM(quantity), 0) FROM tk_orders WHERE tier = ${o.tier}
                   AND table_no = ${o.tableNo}::int
                   AND (status = 'paid' OR (status = 'pending' AND expires_at > NOW()))) + ${quantity} <= ${limits.seatsPerTable ?? 0})
          RETURNING *`,
      ]);
      if (inserted[0]) return row(inserted[0] as Record<string, unknown>);
      // Аль хязгаарт хүрснийг тодорхойлж хэрэглэгчид зөв мессеж өгнө
      if ((await this.countActiveForEmail(o.email)) >= limits.maxOrdersPerEmail) return "limit";
      if (o.tableNo != null && limits.seatsPerTable) {
        const used = (await this.tableUsage(o.tier))[o.tableNo] ?? 0;
        if (used + quantity > limits.seatsPerTable) return "tablefull";
      }
      return "soldout";
    },
    async setQpay(ref, q) {
      await ensure();
      await sql`UPDATE tk_orders SET qpay_invoice_id = ${q.invoiceId}, qpay_qr_image = ${q.qrImage},
        qpay_short_url = ${q.shortUrl}, qpay_urls = ${JSON.stringify(q.urls ?? [])}::jsonb WHERE ref = ${ref}`;
    },
    async getByRef(ref) {
      await ensure();
      const r = await sql`SELECT * FROM tk_orders WHERE ref = ${ref}`;
      return r[0] ? (await withTickets(r as Record<string, unknown>[]))[0] : null;
    },
    async getByTicket(code) {
      await ensure();
      const t = await sql`SELECT * FROM tk_tickets WHERE code = ${code}`;
      if (!t[0]) return null;
      const ticket = toTicket(t[0] as Record<string, unknown>);
      const order = await this.getByRef(ticket.orderRef);
      return order ? { order, ticket } : null;
    },
    async listByEmail(email) {
      await ensure();
      const r = await sql`SELECT * FROM tk_orders WHERE email = ${email} ORDER BY id DESC LIMIT 20`;
      return withTickets(r as Record<string, unknown>[]);
    },
    async listAll({ status, q, limit = 300 }) {
      await ensure();
      const like = q ? `%${q.toLowerCase()}%` : null;
      const r = await sql.query(
        `SELECT * FROM tk_orders o
         WHERE ($1::text IS NULL OR status = $1)
           AND ($2::text IS NULL OR lower(ref) LIKE $2 OR lower(email) LIKE $2 OR lower(guests::text) LIKE $2
                OR EXISTS (SELECT 1 FROM tk_tickets t WHERE t.order_ref = o.ref AND lower(t.code) LIKE $2))
         ORDER BY id DESC LIMIT $3`,
        [status ?? null, like, limit],
      );
      return withTickets(r as Record<string, unknown>[]);
    },
    async markPaid(ref, by) {
      await ensure();
      const guestCodes = [newTicketCode(), newTicketCode(), newTicketCode()];
      await sql.transaction((tx) => [
        tx`UPDATE tk_orders SET status = 'paid', paid_at = NOW(), confirmed_by = ${by},
          ticket_code = COALESCE(ticket_code, ${newTicketCode()})
          WHERE ref = ${ref} AND status <> 'paid'`,
        // Оюутны өөрийн тасалбар
        tx`INSERT INTO tk_tickets (code, order_ref, idx, is_guest)
          SELECT ticket_code, ref, 0, FALSE FROM tk_orders WHERE ref = ${ref} AND status = 'paid'
          ON CONFLICT DO NOTHING`,
        // Найз бүрт тусдаа тасалбар
        tx`INSERT INTO tk_tickets (code, order_ref, idx, is_guest, holder_name, holder_phone)
          SELECT (${guestCodes}::text[])[g.ord], o.ref, g.ord, TRUE, g.v->>'name', g.v->>'phone'
          FROM tk_orders o, jsonb_array_elements(o.guests) WITH ORDINALITY AS g(v, ord)
          WHERE o.ref = ${ref} AND o.status = 'paid'
          ON CONFLICT DO NOTHING`,
      ]);
      return this.getByRef(ref);
    },
    async cancel(ref) {
      await ensure();
      await sql`UPDATE tk_orders SET status = 'cancelled' WHERE ref = ${ref} AND status <> 'paid'`;
    },
    async checkIn(code, by) {
      await ensure();
      const r = await sql`UPDATE tk_tickets t SET checked_in_at = NOW(), checked_in_by = ${by}
        FROM tk_orders o
        WHERE t.code = ${code} AND t.order_ref = o.ref AND o.status = 'paid' AND t.checked_in_at IS NULL
        RETURNING t.code`;
      if (r.length) return "ok";
      const found = await this.getByTicket(code);
      return found?.order.status === "paid" ? "already" : "invalid";
    },
    async countActive(tier) {
      await ensure();
      const r = await sql.query(`SELECT COALESCE(SUM(quantity), 0) AS n FROM tk_orders WHERE tier = $1 AND ${ACTIVE}`, [tier]);
      return Number(r[0]?.n ?? 0);
    },
    async countActiveForEmail(email) {
      await ensure();
      const r = await sql.query(`SELECT COUNT(*) AS n FROM tk_orders WHERE email = $1 AND ${ACTIVE}`, [email]);
      return Number(r[0]?.n ?? 0);
    },
    async tableUsage(tier) {
      await ensure();
      const r = await sql.query(
        `SELECT table_no, COALESCE(SUM(quantity), 0) AS n FROM tk_orders WHERE tier = $1 AND table_no IS NOT NULL AND ${ACTIVE} GROUP BY table_no`,
        [tier],
      );
      return Object.fromEntries(r.map((x) => [Number(x.table_no), Number(x.n)]));
    },
  };
}

/* ------------------------------ In-memory (dev) ---------------------------- */
const g = globalThis as unknown as { __tk?: Order[] };
function memStore(): Store {
  const db = (g.__tk ??= []);
  const find = (ref: string) => db.find((o) => o.ref === ref);
  const active = (o: Order) => effective(o).status === "paid" || effective(o).status === "pending";
  const view = (o: Order) => effective({ ...o, checkedInAt: o.tickets.find((t) => t.idx === 0)?.checkedInAt ?? null });
  return {
    async create(o, limits) {
      // Node нэг thread-тэй, энд await байхгүй тул шалгалт ба бичилт салшгүй
      const quantity = 1 + o.guests.length;
      if (db.filter((x) => x.email === o.email && active(x)).length >= limits.maxOrdersPerEmail) return "limit";
      const used = db.filter((x) => x.tier === o.tier && active(x)).reduce((s, x) => s + x.quantity, 0);
      if (used + quantity > limits.tierQuantity) return "soldout";
      if (o.tableNo != null && limits.seatsPerTable) {
        const atTable = db.filter((x) => x.tier === o.tier && x.tableNo === o.tableNo && active(x)).reduce((s, x) => s + x.quantity, 0);
        if (atTable + quantity > limits.seatsPerTable) return "tablefull";
      }
      const order: Order = {
        ref: newRef(), email: o.email, tier: o.tier, quantity, guests: o.guests, tableNo: o.tableNo, amount: o.amount, method: o.method,
        status: "pending", expiresAt: o.expiresAt.toISOString(), createdAt: new Date().toISOString(), paidAt: null,
        ticketCode: null, checkedInAt: null, confirmedBy: null, qpayInvoiceId: null, qpayQrImage: null,
        qpayShortUrl: null, qpayUrls: null, tickets: [],
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
      return o ? view(o) : null;
    },
    async getByTicket(code) {
      for (const o of db) {
        const ticket = o.tickets.find((t) => t.code === code);
        if (ticket) return { order: view(o), ticket };
      }
      return null;
    },
    async listByEmail(email) {
      return db.filter((o) => o.email === email).reverse().map(view);
    },
    async listAll({ status, q }) {
      const s = q?.toLowerCase();
      return db
        .map(view)
        .filter(
          (o) =>
            (!status || o.status === status) &&
            (!s || [o.ref, o.email, JSON.stringify(o.guests), ...o.tickets.map((t) => t.code)].some((v) => v.toLowerCase().includes(s))),
        )
        .reverse();
    },
    async markPaid(ref, by) {
      const o = find(ref);
      if (o && o.status !== "paid") {
        const own = o.ticketCode ?? newTicketCode();
        Object.assign(o, {
          status: "paid", paidAt: new Date().toISOString(), confirmedBy: by, ticketCode: own,
          tickets: [
            { code: own, orderRef: ref, idx: 0, isGuest: false, holderName: null, holderPhone: null, checkedInAt: null },
            ...o.guests.map((gst, i) => ({
              code: newTicketCode(), orderRef: ref, idx: i + 1, isGuest: true, holderName: gst.name, holderPhone: gst.phone, checkedInAt: null,
            })),
          ],
        });
      }
      return o ? view(o) : null;
    },
    async cancel(ref) {
      const o = find(ref);
      if (o && o.status !== "paid") o.status = "cancelled";
    },
    async checkIn(code) {
      for (const o of db) {
        const t = o.tickets.find((x) => x.code === code);
        if (!t) continue;
        if (o.status !== "paid") return "invalid";
        if (t.checkedInAt) return "already";
        t.checkedInAt = new Date().toISOString();
        return "ok";
      }
      return "invalid";
    },
    async countActive(tier) {
      return db.filter((o) => o.tier === tier && active(o)).reduce((s, o) => s + o.quantity, 0);
    },
    async countActiveForEmail(email) {
      return db.filter((o) => o.email === email && active(o)).length;
    },
    async tableUsage(tier) {
      const out: Record<number, number> = {};
      for (const o of db) if (o.tier === tier && o.tableNo != null && active(o)) out[o.tableNo] = (out[o.tableNo] ?? 0) + o.quantity;
      return out;
    },
  };
}

let store: Store | null = null;
export function ticketStore(): Store {
  if (store) return store;
  const url = databaseUrl();
  if (url) return (store = pgStore(url));
  if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL тохируулаагүй байна.");
  return (store = memStore());
}
