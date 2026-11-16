import "server-only";
import { ticketConfig, getTier, type TicketTier } from "@/data/tickets";
import { ticketStore, type Order, type PayMethod } from "./tickets-db";
import { createInvoice, isInvoicePaid, qpayEnabled } from "./qpay";
import { displayName } from "./lostfound";

export const bankEnabled = () => Boolean(ticketConfig.bank.accountNumber.trim());

export function isAdmin(email: string | null): boolean {
  if (!email) return false;
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export type TierState = { open: boolean; reason?: "soon" | "ended" | "soldout"; remaining: number };

export async function tierState(t: TicketTier): Promise<TierState> {
  const now = Date.now();
  const sold = await ticketStore().countActive(t.id);
  const remaining = Math.max(0, t.quantity - sold);
  if (t.salesStart && now < Date.parse(t.salesStart)) return { open: false, reason: "soon", remaining };
  if (t.salesEnd && now > Date.parse(t.salesEnd)) return { open: false, reason: "ended", remaining };
  if (remaining <= 0) return { open: false, reason: "soldout", remaining: 0 };
  return { open: true, remaining };
}

export class TicketError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export async function placeOrder(email: string, tierId: string, method: PayMethod, baseUrl: string): Promise<Order> {
  const tier = getTier(tierId);
  if (!tier) throw new TicketError("Тасалбарын төрөл олдсонгүй.");
  if (method === "qpay" && !qpayEnabled()) throw new TicketError("QPay төлбөр одоогоор идэвхгүй байна.");
  if (method === "bank" && !bankEnabled()) throw new TicketError("Дансаар төлөх боломж одоогоор идэвхгүй байна.");

  const store = ticketStore();
  if ((await store.countActiveForEmail(email)) >= ticketConfig.maxPerStudent) {
    throw new TicketError(
      `Нэг оюутан ${ticketConfig.maxPerStudent} тасалбар авах эрхтэй. "Миний тасалбар" хэсгээс өмнөх захиалгаа шалгана уу.`,
      409,
    );
  }
  const state = await tierState(tier);
  if (!state.open) {
    throw new TicketError(
      state.reason === "soldout" ? "Энэ ангиллын тасалбар дууссан." : state.reason === "ended" ? "Энэ ангиллын борлуулалт дууссан." : "Борлуулалт хараахан эхлээгүй.",
      409,
    );
  }

  const expiresAt = new Date(
    Date.now() + (method === "qpay" ? ticketConfig.qpayExpiryMinutes * 60_000 : ticketConfig.bankExpiryHours * 3_600_000),
  );
  const order = await store.create({ email, tier: tier.id, amount: tier.price, method, expiresAt });

  if (method === "qpay") {
    try {
      const inv = await createInvoice({
        ref: order.ref,
        amount: order.amount,
        description: `СЭЗИС NEW YEAR 2027 — ${tier.name} (${order.ref})`,
        callbackUrl: `${baseUrl}/api/tickets/qpay/callback?ref=${encodeURIComponent(order.ref)}`,
      });
      await store.setQpay(order.ref, inv);
    } catch (e) {
      console.error(e);
      await store.cancel(order.ref);
      throw new TicketError("QPay нэхэмжлэл үүсгэж чадсангүй. Дахин оролдоно уу.", 502);
    }
  }
  return (await store.getByRef(order.ref))!;
}

/** QPay захиалгын төлбөрийг шалгаад төлөгдсөн бол тасалбар гаргана */
export async function syncQpay(order: Order): Promise<Order> {
  if (order.method !== "qpay" || !order.qpayInvoiceId) return order;
  if (order.status !== "pending" && order.status !== "expired") return order;
  try {
    if (await isInvoicePaid(order.qpayInvoiceId, order.amount)) {
      return (await ticketStore().markPaid(order.ref, "qpay"))!;
    }
  } catch (e) {
    console.error("QPay check failed", e);
  }
  return order;
}

/** Хэрэглэгчид буцаах захиалгын мэдээлэл */
export function orderDTO(o: Order) {
  const tier = getTier(o.tier);
  return {
    ref: o.ref,
    tier: o.tier,
    tierName: tier?.name ?? o.tier,
    amount: o.amount,
    method: o.method,
    status: o.status,
    expiresAt: o.expiresAt,
    createdAt: o.createdAt,
    paidAt: o.paidAt,
    ticketCode: o.status === "paid" ? o.ticketCode : null,
    checkedInAt: o.checkedInAt,
    holder: displayName(o.email),
    qpay:
      o.method === "qpay" && o.status === "pending"
        ? { qrImage: o.qpayQrImage, shortUrl: o.qpayShortUrl, urls: o.qpayUrls ?? [] }
        : null,
    bank:
      o.method === "bank" && o.status === "pending"
        ? { ...ticketConfig.bank, description: o.ref }
        : null,
  };
}
export type OrderDTO = ReturnType<typeof orderDTO>;
