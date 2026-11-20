"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, RefreshCw, XCircle } from "lucide-react";
import { api } from "@/lib/client-utils";
import { formatMNT } from "@/data/tickets";
import TicketCard from "./TicketCard";

export interface OrderDTO {
  ref: string;
  tier: string;
  tierName: string;
  quantity: number;
  guests: string[];
  amount: number;
  unitPrice: number;
  method: "qpay" | "bank";
  status: "pending" | "paid" | "cancelled" | "expired";
  expiresAt: string;
  ticketCode: string | null;
  checkedInAt: string | null;
  holder: string;
  tickets: { code: string; isGuest: boolean; holder: string; invitedBy: string | null; checkedInAt: string | null }[];
  qpay: { qrImage: string | null; shortUrl: string | null; urls: { name: string; description?: string; logo?: string; link: string }[] } | null;
  bank: { bankName: string; accountNumber: string; accountName: string; iban: string; description: string } | null;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [ok, setOk] = useState(false);
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-[0.62rem] font-semibold tracking-[0.2em] text-silver/55">{label}</p>
        <p className="mt-0.5 break-all font-display text-sm font-semibold text-white">{value}</p>
      </div>
      <button
        onClick={() => navigator.clipboard.writeText(value).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); })}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-silver hover:text-white"
        aria-label={`${label} хуулах`}
      >
        {ok ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function useCountdown(iso: string) {
  const [left, setLeft] = useState(() => Date.parse(iso) - Date.now());
  useEffect(() => {
    const id = setInterval(() => setLeft(Date.parse(iso) - Date.now()), 1000);
    return () => clearInterval(id);
  }, [iso]);
  const s = Math.max(0, Math.floor(left / 1000));
  return s > 3600 ? `${Math.floor(s / 3600)} цаг ${Math.floor((s % 3600) / 60)} мин` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function OrderView({ initial, devMock }: { initial: OrderDTO; devMock?: boolean }) {
  const [order, setOrder] = useState(initial);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const left = useCountdown(order.expiresAt);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const d = await api<{ order: OrderDTO }>(`/api/tickets/order/${order.ref}`);
      setOrder(d.order);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }, [order.ref]);

  useEffect(() => {
    if (order.status !== "pending") return;
    const id = setInterval(refresh, order.method === "qpay" ? 4000 : 15000);
    return () => clearInterval(id);
  }, [order.status, order.method, refresh]);

  async function cancel() {
    if (!confirm("Захиалгаа цуцлах уу?")) return;
    try {
      await api(`/api/tickets/order/${order.ref}/cancel`, { method: "POST" });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (order.status === "paid" && order.tickets.length > 0) {
    return (
      <div>
        <p className="mb-6 text-center text-sm text-emerald-300">
          ✓ Төлбөр баталгаажлаа. {order.tickets.length > 1 ? `${order.tickets.length} тасалбар бэлэн! Найзуудынхаа тасалбарыг тус бүрд нь илгээгээрэй.` : "Таны тасалбар бэлэн!"}
        </p>
        <div className="space-y-6">
          {order.tickets.map((t) => (
            <TicketCard key={t.code} tierName={order.tierName} holder={t.holder} invitedBy={t.invitedBy} ref_={order.ref} ticketCode={t.code} checkedInAt={t.checkedInAt} />
          ))}
        </div>
      </div>
    );
  }

  if (order.status === "cancelled" || order.status === "expired") {
    return (
      <div className="glass rounded-3xl p-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-[#ff8a9b]" aria-hidden="true" />
        <h2 className="mt-4 font-display text-lg font-bold text-white">
          {order.status === "expired" ? "Захиалгын хугацаа дууссан" : "Захиалга цуцлагдсан"}
        </h2>
        <p className="mt-2 text-sm text-silver">Шинээр захиалга үүсгэж болно.</p>
        <a href="/#tickets" className="mt-6 inline-block rounded-full bg-electric px-6 py-3 font-display text-xs font-semibold tracking-[0.2em] text-white">
          ТАСАЛБАР РУУ БУЦАХ
        </a>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[0.62rem] font-semibold tracking-[0.3em] text-silver/60">{order.tierName} · {order.ref}</p>
          <p className="mt-1 font-display text-3xl font-bold text-white">{formatMNT(order.amount)}</p>
          {order.quantity > 1 && (
            <p className="mt-1 text-xs text-silver/70">
              {order.quantity} × {formatMNT(order.unitPrice)} · Өөрөө + {order.guests.join(", ")}
            </p>
          )}
        </div>
        <p className="text-xs text-silver/70">Хүчинтэй: <span className="font-semibold text-white">{left}</span></p>
      </div>

      {order.qpay && (
        <div className="mt-6 text-center">
          {order.qpay.qrImage && (
            <div className="mx-auto w-64 rounded-2xl bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`data:image/png;base64,${order.qpay.qrImage}`} alt="QPay төлбөрийн QR" className="h-auto w-full" />
            </div>
          )}
          <p className="mt-4 text-sm text-silver">Банкны апп-аараа QR-ийг уншуулж төлнө үү. Төлөгдмөгц тасалбар автоматаар гарна.</p>
          {order.qpay.urls.length > 0 && (
            <div className="mt-6 sm:hidden">
              <p className="text-[0.62rem] font-semibold tracking-[0.3em] text-silver/60">УТАСНААС ШУУД ТӨЛӨХ</p>
              <ul className="mt-3 grid grid-cols-3 gap-2">
                {order.qpay.urls.map((u) => (
                  <li key={u.name + u.link}>
                    <a href={u.link} className="flex h-full flex-col items-center gap-1.5 rounded-xl border border-white/10 p-2 text-[0.6rem] text-silver">
                      {u.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.logo} alt="" className="h-9 w-9 rounded-lg" loading="lazy" />
                      )}
                      <span className="line-clamp-2 text-center">{u.description || u.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {order.qpay.shortUrl && (
            <a href={order.qpay.shortUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-electric hover:underline">
              QPay хуудсаар төлөх <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {devMock && (
            <button
              onClick={async () => { await api("/api/tickets/dev/qpay-pay", { method: "POST", body: JSON.stringify({ ref: order.ref }) }); refresh(); }}
              className="mt-4 block w-full rounded-lg border border-dashed border-electric/50 p-2 text-xs text-electric"
            >
              [DEV] Төлбөр хийсэн мэт болгох
            </button>
          )}
        </div>
      )}

      {order.bank && (
        <div className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-night/60 px-4">
            <CopyRow label="БАНК" value={order.bank.bankName} />
            <CopyRow label="ДАНСНЫ ДУГААР" value={order.bank.accountNumber} />
            <CopyRow label="IBAN" value={order.bank.iban} />
            <CopyRow label="ДАНС ЭЗЭМШИГЧ" value={order.bank.accountName} />
            <CopyRow label="ДҮН" value={String(order.amount)} />
            <CopyRow label="ГҮЙЛГЭЭНИЙ УТГА (ЗААВАЛ)" value={order.bank.description} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-silver">
            Гүйлгээний утгад <b className="font-mono text-white">{order.ref}</b> кодыг заавал бичнэ үү. Зохион байгуулагч шилжүүлгийг шалгаж баталгаажуулмагц тасалбар энэ хуудсанд болон
            &quot;Миний тасалбар&quot; хэсэгт гарна.
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-[#ff8a9b]">{error}</p>}

      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={cancel} className="text-xs text-silver/60 hover:text-[#ff8a9b]">Захиалга цуцлах</button>
        <button
          onClick={refresh}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-full border border-silver/25 px-5 py-2.5 font-display text-[0.65rem] font-semibold tracking-[0.2em] text-white hover:border-electric"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          ТӨЛБӨР ШАЛГАХ
        </button>
      </div>
    </div>
  );
}
