"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Loader2, QrCode } from "lucide-react";
import { api } from "@/lib/client-utils";

interface Props {
  tier: string;
  methods: { qpay: boolean; bank: boolean };
}

export default function BuyForm({ tier, methods }: Props) {
  const router = useRouter();
  const [method, setMethod] = useState<"qpay" | "bank" | null>(methods.qpay ? "qpay" : methods.bank ? "bank" : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!method) return;
    setBusy(true);
    setError(null);
    try {
      const { order } = await api<{ order: { ref: string } }>("/api/tickets/order", {
        method: "POST",
        body: JSON.stringify({ tier, method }),
      });
      router.push(`/orders/${order.ref}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const options = [
    { id: "qpay" as const, enabled: methods.qpay, icon: QrCode, title: "QPay", desc: "Банкны апп-аар QR уншуулж шууд төлнө. Тасалбар тэр даруй гарна." },
    { id: "bank" as const, enabled: methods.bank, icon: Landmark, title: "Дансаар шилжүүлэх", desc: "Гүйлгээний утгад захиалгын кодоо бичнэ. Зохион байгуулагч шалгасны дараа тасалбар гарна." },
  ];

  return (
    <div>
      <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-silver/70">ТӨЛБӨРИЙН ХЭЛБЭР</p>
      <div className="mt-3 grid gap-3" role="radiogroup">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={method === o.id}
            disabled={!o.enabled}
            onClick={() => setMethod(o.id)}
            className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              method === o.id ? "border-electric bg-electric/10" : "border-white/10 hover:border-white/25"
            }`}
          >
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${method === o.id ? "bg-electric text-white" : "bg-white/5 text-silver"}`}>
              <o.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-sm font-semibold text-white">
                {o.title} {!o.enabled && <span className="ml-1 text-[0.6rem] text-silver/60">(одоогоор идэвхгүй)</span>}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-silver/75">{o.desc}</span>
            </span>
          </button>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-[#ff8a9b]" role="alert">{error}</p>}
      <button
        onClick={submit}
        disabled={!method || busy}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-electric py-4 font-display text-xs font-semibold tracking-[0.2em] text-white shadow-[0_0_40px_-8px_rgba(83,109,255,0.9)] transition hover:brightness-110 disabled:opacity-40"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        ЗАХИАЛГА ҮҮСГЭХ
      </button>
    </div>
  );
}
