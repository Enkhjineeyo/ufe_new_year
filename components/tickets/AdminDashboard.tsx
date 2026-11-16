"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, RefreshCw, Search, X } from "lucide-react";
import { api } from "@/lib/client-utils";
import { formatMNT } from "@/data/tickets";

type Row = {
  ref: string; email: string; tier: string; amount: number; method: "qpay" | "bank"; status: string;
  createdAt: string; paidAt: string | null; ticketCode: string | null; checkedInAt: string | null; confirmedBy: string | null;
};
type Stat = { tier: string; name: string; quantity: number; paid: number; pending: number; checkedIn: number; revenue: number };

const STATUS: Record<string, string> = { pending: "Хүлээгдэж буй", paid: "Төлөгдсөн", cancelled: "Цуцалсан", expired: "Хугацаа дууссан" };
const COLOR: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-300", paid: "bg-emerald-400/15 text-emerald-300",
  cancelled: "bg-white/5 text-silver/60", expired: "bg-white/5 text-silver/60",
};
const fmt = (s: string) => new Date(s).toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [status, setStatus] = useState("pending");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [checkMsg, setCheckMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (q) qs.set("q", q);
    try {
      const d = await api<{ rows?: Row[]; orders: Row[]; stats: Stat[] }>(`/api/admin/orders?${qs}`);
      setRows(d.orders);
      setStats(d.stats);
    } finally {
      setLoading(false);
    }
  }, [status, q]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(ref: string, action: "confirm" | "cancel" | "recheck") {
    if (action === "confirm" && !confirm(`${ref} — Дансны хуулгад энэ кодтой, дүн таарсан гүйлгээ орсныг шалгасан уу?`)) return;
    if (action === "cancel" && !confirm(`${ref} захиалгыг цуцлах уу?`)) return;
    setBusy(ref + action);
    try {
      await api(`/api/admin/orders/${ref}`, { method: "POST", body: JSON.stringify({ action }) });
      await load();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function checkIn() {
    const c = code.trim().replace(/.*\/t\//, "").toUpperCase();
    if (!c) return;
    const { result } = await api<{ result: string }>("/api/admin/checkin", { method: "POST", body: JSON.stringify({ code: c }) });
    setCheckMsg(result === "ok" ? `✓ ${c} — оруулсан` : result === "already" ? `⚠ ${c} — өмнө нь орсон` : `✕ ${c} — хүчингүй`);
    setCode("");
    load();
  }

  const total = stats.reduce((s, x) => s + x.revenue, 0);

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.tier} className="rounded-2xl border border-white/[0.08] bg-ink/80 p-5">
            <p className="text-[0.62rem] font-semibold tracking-[0.25em] text-silver/60">{s.name}</p>
            <p className="mt-2 font-display text-2xl font-bold text-white">{s.paid}<span className="text-sm text-silver/50"> / {s.quantity}</span></p>
            <p className="mt-1 text-xs text-silver/70">Хүлээгдэж буй {s.pending} · Орсон {s.checkedIn}</p>
            <p className="mt-1 text-xs text-electric">{formatMNT(s.revenue)}</p>
          </div>
        ))}
        <div className="rounded-2xl border border-electric/40 bg-electric/10 p-5">
          <p className="text-[0.62rem] font-semibold tracking-[0.25em] text-silver/70">НИЙТ ОРЛОГО</p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{formatMNT(total)}</p>
          <p className="mt-1 text-xs text-silver/70">Төлөгдсөн {stats.reduce((s, x) => s + x.paid, 0)} тасалбар</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-ink/80 p-5">
        <p className="text-[0.62rem] font-semibold tracking-[0.25em] text-silver/60">ХААЛГАН ДЭЭР CHECK-IN</p>
        <p className="mt-1 text-xs text-silver/60">Утасныхаа камераар тасалбарын QR-ийг уншуулахад шалгах хуудас шууд нээгдэнэ. Эсвэл кодыг энд бичнэ.</p>
        <div className="mt-3 flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkIn()} placeholder="Тасалбарын код" className="min-w-0 flex-1 rounded-full border border-white/10 bg-night px-4 py-2.5 font-mono text-sm text-white focus:border-electric focus:outline-none" />
          <button onClick={checkIn} className="rounded-full bg-emerald-500 px-5 font-display text-xs font-bold tracking-[0.15em] text-night">CHECK-IN</button>
        </div>
        {checkMsg && <p className="mt-3 text-sm text-white">{checkMsg}</p>}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          {["pending", "paid", "", "cancelled", "expired"].map((s) => (
            <button key={s || "all"} onClick={() => setStatus(s)} className={`rounded-full px-4 py-2 text-xs font-semibold ${status === s ? "bg-white text-night" : "border border-white/10 text-silver"}`}>
              {s ? STATUS[s] : "Бүгд"}
            </button>
          ))}
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-silver/50" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Код, майл хайх" className="w-full rounded-full border border-white/10 bg-night py-2 pl-10 pr-4 text-sm text-white focus:border-electric focus:outline-none" />
          </div>
          <button onClick={load} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-silver" aria-label="Шинэчлэх">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/[0.03] text-[0.62rem] tracking-[0.2em] text-silver/60">
              <tr>
                <th className="p-3">КОД</th><th className="p-3">МАЙЛ</th><th className="p-3">ТӨРӨЛ</th><th className="p-3">ДҮН</th>
                <th className="p-3">ХЭЛБЭР</th><th className="p-3">ТӨЛӨВ</th><th className="p-3">ОГНОО</th><th className="p-3 text-right">ҮЙЛДЭЛ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ref} className="border-t border-white/[0.06] text-silver">
                  <td className="p-3 font-mono text-white">{r.ref}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3 uppercase">{r.tier}</td>
                  <td className="p-3">{formatMNT(r.amount)}</td>
                  <td className="p-3">{r.method === "qpay" ? "QPay" : "Данс"}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-semibold ${COLOR[r.status]}`}>{STATUS[r.status]}</span>
                    {r.checkedInAt && <span className="ml-1 text-[0.65rem] text-emerald-300">· орсон</span>}
                  </td>
                  <td className="p-3 text-xs">{fmt(r.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1.5">
                      {r.status === "pending" && r.method === "bank" && (
                        <button disabled={!!busy} onClick={() => act(r.ref, "confirm")} className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-night">
                          <Check className="h-3.5 w-3.5" /> Баталгаажуулах
                        </button>
                      )}
                      {r.method === "qpay" && r.status !== "paid" && r.status !== "cancelled" && (
                        <button disabled={!!busy} onClick={() => act(r.ref, "recheck")} className="rounded-full border border-white/15 px-3 py-1.5 text-xs">QPay шалгах</button>
                      )}
                      {r.status === "pending" && (
                        <button disabled={!!busy} onClick={() => act(r.ref, "cancel")} className="grid h-8 w-8 place-items-center rounded-full border border-white/15 text-silver hover:text-[#ff8a9b]" aria-label="Цуцлах">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {r.ticketCode && (
                        <a href={`/t/${r.ticketCode}`} className="rounded-full border border-white/15 px-3 py-1.5 text-xs">Тасалбар</a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-silver/50">Захиалга алга</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
