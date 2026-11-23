import "server-only";
import { ticketConfig, getTier, validateGuests, validateTable, vipEligible, vipIneligibleMessage, tableLabel, type TicketTier } from "@/data/tickets";
import { ticketStore, type Order, type PayMethod, type Ticket } from "./tickets-db";
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

/** VIP ширээ бүрийн үлдсэн суудал */
export async function vipTables(): Promise<{ no: number; remaining: number }[]> {
  const used = await ticketStore().tableUsage("vip");
  return ticketConfig.vip.tables.map((no) => ({ no, remaining: Math.max(0, ticketConfig.vip.seatsPerTable - (used[no] ?? 0)) }));
}

export class TicketError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const limitMessage = () =>
  `Танд идэвхтэй захиалга байна. Өөрийн болон найзуудынхаа тасалбарыг нэг захиалгаар авна. "Миний тасалбар" хэсгээс шалгана уу.`;

export async function placeOrder(
  email: string,
  tierId: string,
  method: PayMethod,
  guestsInput: unknown,
  baseUrl: string,
  tableInput?: unknown,
): Promise<Order> {
  const tier = getTier(tierId);
  if (!tier) throw new TicketError("Тасалбарын төрөл олдсонгүй.");
  if (tier.id === "vip" && !vipEligible(email)) throw new TicketError(vipIneligibleMessage(), 403);
  const tableNo = validateTable(tier.id, tableInput);
  if (typeof tableNo === "string") throw new TicketError(tableNo);
  if (method === "qpay" && !qpayEnabled()) throw new TicketError("QPay төлбөр одоогоор идэвхгүй байна.");
  if (method === "bank" && !bankEnabled()) throw new TicketError("Дансаар төлөх боломж одоогоор идэвхгүй байна.");
  const guests = validateGuests(guestsInput);
  if (typeof guests === "string") throw new TicketError(guests);
  const quantity = 1 + guests.length;

  const store = ticketStore();
  if ((await store.countActiveForEmail(email)) >= ticketConfig.maxOrdersPerStudent) throw new TicketError(limitMessage(), 409);
  const state = await tierState(tier);
  if (!state.open) {
    throw new TicketError(
      state.reason === "soldout" ? "Энэ ангиллын тасалбар дууссан." : state.reason === "ended" ? "Энэ ангиллын борлуулалт дууссан." : "Борлуулалт хараахан эхлээгүй.",
      409,
    );
  }
  if (state.remaining < quantity) {
    throw new TicketError(`Энэ ангилалд ${state.remaining} тасалбар л үлдсэн байна. Найзынхаа тоог багасгана уу.`, 409);
  }
  if (tableNo != null) {
    const left = (await vipTables()).find((t) => t.no === tableNo)?.remaining ?? 0;
    if (left < quantity) {
      throw new TicketError(left > 0 ? `${tableNo}-р ширээнд ${left} суудал л үлдсэн байна.` : `${tableLabel(tableNo)} дүүрсэн байна. Өөр ширээ сонгоно уу.`, 409);
    }
  }

  const expiresAt = new Date(
    Date.now() + (method === "qpay" ? ticketConfig.qpayExpiryMinutes * 60_000 : ticketConfig.bankExpiryHours * 3_600_000),
  );
  const created = await store.create(
    { email, tier: tier.id, guests, tableNo, amount: tier.price * quantity, method, expiresAt },
    { tierQuantity: tier.quantity, maxOrdersPerEmail: ticketConfig.maxOrdersPerStudent, seatsPerTable: ticketConfig.vip.seatsPerTable },
  );
  // Дээрх шалгалтын дараа өөр хүн сүүлийн тасалбаруудыг авсан байж болно
  if (created === "soldout") throw new TicketError("Энэ ангилалд хүрэлцэх тасалбар үлдээгүй байна.", 409);
  if (created === "limit") throw new TicketError(limitMessage(), 409);
  if (created === "tablefull") throw new TicketError(`${tableNo}-р ширээнд хүрэлцэх суудал үлдээгүй байна. Өөр ширээ сонгоно уу.`, 409);
  const order = created;

  if (method === "qpay") {
    try {
      const inv = await createInvoice({
        ref: order.ref,
        amount: order.amount,
        description: `СЭЗИС NEW YEAR 2027 — ${tier.name}${tableNo ? ` ${tableNo}-р ширээ` : ""} x${order.quantity} (${order.ref})`,
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
  // Цуцалсан/хугацаа дууссан захиалгын QPay нэхэмжлэлийг хүн төлчихсөн байж болно.
  // Мөнгө орсон бол тасалбар гаргана, эс бөгөөс төлсөн хүн тасалбаргүй үлдэнэ.
  if (order.status === "paid") return order;
  try {
    if (await isInvoicePaid(order.qpayInvoiceId, order.amount)) {
      return (await ticketStore().markPaid(order.ref, "qpay"))!;
    }
  } catch (e) {
    console.error("QPay check failed", e);
  }
  return order;
}

/** Нэг тасалбарын мэдээлэл (QR тасалбар зурахад) */
export function ticketDTO(o: Order, t: Ticket) {
  return {
    code: t.code,
    isGuest: t.isGuest,
    holder: t.isGuest ? (t.holderName ?? "Зочин") : displayName(o.email),
    /** Найзын тасалбар бол урьсан оюутан */
    invitedBy: t.isGuest ? displayName(o.email) : null,
    checkedInAt: t.checkedInAt,
  };
}
export type TicketDTO = ReturnType<typeof ticketDTO>;

/** Хэрэглэгчид буцаах захиалгын мэдээлэл */
export function orderDTO(o: Order) {
  const tier = getTier(o.tier);
  return {
    ref: o.ref,
    tier: o.tier,
    tierName: (tier?.name ?? o.tier) + (o.tableNo ? ` · ${tableLabel(o.tableNo)}` : ""),
    tableNo: o.tableNo,
    quantity: o.quantity,
    guests: o.guests.map((g) => g.name),
    amount: o.amount,
    unitPrice: tier?.price ?? Math.round(o.amount / o.quantity),
    method: o.method,
    status: o.status,
    expiresAt: o.expiresAt,
    createdAt: o.createdAt,
    paidAt: o.paidAt,
    ticketCode: o.status === "paid" ? o.ticketCode : null,
    tickets: o.status === "paid" ? o.tickets.map((t) => ticketDTO(o, t)) : [],
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
