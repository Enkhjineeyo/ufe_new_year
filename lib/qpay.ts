import "server-only";
import QRCode from "qrcode";

/**
 * QPay Merchant API v2
 *   POST /v2/auth/token   (Basic auth)
 *   POST /v2/invoice      → invoice_id, qr_image, qPay_shortUrl, urls (банкны апп-ын холбоос)
 *   POST /v2/payment/check
 * Тохиргоо: QPAY_USERNAME, QPAY_PASSWORD, QPAY_INVOICE_CODE, QPAY_BASE_URL
 *   Sandbox: https://merchant-sandbox.qpay.mn   Production: https://merchant.qpay.mn
 * QPAY_MOCK=1 — зөвхөн локал туршилтад (production дээр ажиллахгүй).
 */
const BASE = (process.env.QPAY_BASE_URL ?? "https://merchant.qpay.mn").replace(/\/$/, "");
const isMock = () => process.env.QPAY_MOCK === "1" && process.env.NODE_ENV !== "production";

export const qpayEnabled = () =>
  isMock() || Boolean(process.env.QPAY_USERNAME && process.env.QPAY_PASSWORD && process.env.QPAY_INVOICE_CODE);

export interface Invoice {
  invoiceId: string;
  qrImage: string | null;
  shortUrl: string | null;
  urls: { name: string; description?: string; logo?: string; link: string }[];
}

let token: { value: string; exp: number } | null = null;

async function getToken(): Promise<string> {
  if (token && token.exp > Date.now() + 60_000) return token.value;
  const basic = Buffer.from(`${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`).toString("base64");
  const res = await fetch(`${BASE}/v2/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`QPay auth failed: ${res.status} ${await res.text()}`);
  const j = (await res.json()) as { access_token: string; expires_in?: number };
  // expires_in нь зарим үед unix timestamp (сек), зарим үед үргэлжлэх хугацаа байдаг
  const e = Number(j.expires_in ?? 0);
  const exp = e > 1e9 ? e * 1000 : Date.now() + (e || 3000) * 1000;
  token = { value: j.access_token, exp };
  return token.value;
}

async function qpay<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await getToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`QPay ${path} failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

/* --------------------------- mock (local dev only) -------------------------- */
const mockPaid = globalThis as unknown as { __qpayPaid?: Set<string> };
export const mockMarkPaid = (invoiceId: string) => (mockPaid.__qpayPaid ??= new Set()).add(invoiceId);

export async function createInvoice(opts: {
  ref: string;
  amount: number;
  description: string;
  callbackUrl: string;
}): Promise<Invoice> {
  if (isMock()) {
    const qr = await QRCode.toDataURL(`MOCK-QPAY:${opts.ref}:${opts.amount}`, { margin: 1, width: 320 });
    return {
      invoiceId: `MOCK-${opts.ref}`,
      qrImage: qr.replace(/^data:image\/png;base64,/, ""),
      shortUrl: null,
      urls: [{ name: "Mock bank", description: "Туршилтын төлбөр", link: "#" }],
    };
  }
  const j = await qpay<{
    invoice_id: string;
    qr_image?: string;
    qPay_shortUrl?: string;
    urls?: { name: string; description?: string; logo?: string; link: string }[];
  }>("/v2/invoice", {
    invoice_code: process.env.QPAY_INVOICE_CODE,
    sender_invoice_no: opts.ref,
    invoice_receiver_code: "terminal",
    invoice_description: opts.description,
    amount: opts.amount,
    callback_url: opts.callbackUrl,
  });
  return {
    invoiceId: j.invoice_id,
    qrImage: j.qr_image ?? null,
    shortUrl: j.qPay_shortUrl ?? null,
    urls: (j.urls ?? []).map((u) => ({ name: u.name, description: u.description, logo: u.logo, link: u.link })),
  };
}

/** Нэхэмжлэлийн төлбөр бүрэн төлөгдсөн эсэх (QPay-ээс шууд шалгана — callback-д итгэхгүй) */
export async function isInvoicePaid(invoiceId: string, amount: number): Promise<boolean> {
  if (isMock()) return mockPaid.__qpayPaid?.has(invoiceId) ?? false;
  const j = await qpay<{ count?: number; paid_amount?: number; rows?: { payment_status?: string; payment_amount?: string | number }[] }>(
    "/v2/payment/check",
    { object_type: "INVOICE", object_id: invoiceId, offset: { page_number: 1, page_limit: 100 } },
  );
  const paid = (j.rows ?? [])
    .filter((r) => r.payment_status === "PAID")
    .reduce((s, r) => s + Number(r.payment_amount ?? 0), 0);
  return Math.max(paid, Number(j.paid_amount ?? 0)) >= amount;
}
