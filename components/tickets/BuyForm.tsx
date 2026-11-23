"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Armchair, Landmark, Loader2, Minus, Plus, QrCode, UserPlus } from "lucide-react";
import { api } from "@/lib/client-utils";
import { formatMNT } from "@/data/tickets";

interface Props {
  tier: string;
  price: number;
  /** Энэ ангилалд авч болох найзын дээд тоо (тохиргоо ба үлдэгдлээс хамаарна) */
  maxGuests: number;
  methods: { qpay: boolean; bank: boolean };
  /** VIP бол ширээ бүрийн үлдсэн суудал, бусад ангилалд null */
  tables?: { no: number; remaining: number }[] | null;
}

type GuestInput = { name: string; phone: string };

const inputCls =
  "w-full rounded-xl border border-white/10 bg-night px-4 py-3 text-sm text-white placeholder:text-silver/40 focus:border-electric focus:outline-none";

export default function BuyForm({ tier, price, maxGuests: tierMaxGuests, methods, tables }: Props) {
  const router = useRouter();
  const [table, setTable] = useState<number | null>(null);
  const tableLeft = tables && table != null ? (tables.find((t) => t.no === table)?.remaining ?? 0) : null;
  // Ширээ сонгосон бол тухайн ширээний үлдсэн суудлаас хэтрэхгүй
  const maxGuests = tableLeft != null ? Math.max(0, Math.min(tierMaxGuests, tableLeft - 1)) : tierMaxGuests;
  const [count, setCount] = useState(1);
  const [guests, setGuests] = useState<GuestInput[]>([]);
  const [method, setMethod] = useState<"qpay" | "bank" | null>(methods.qpay ? "qpay" : methods.bank ? "bank" : null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function changeCount(next: number) {
    const n = Math.min(Math.max(next, 1), 1 + maxGuests);
    setCount(n);
    // Тоог нэмэхэд хоосон мөр нэмж, багасгахад сүүлийнхийг хасна (бичсэн нэрс хадгалагдана)
    setGuests((g) => Array.from({ length: n - 1 }, (_, i) => g[i] ?? { name: "", phone: "" }));
  }

  const setGuest = (i: number, field: keyof GuestInput, value: string) =>
    setGuests((g) => g.map((x, j) => (j === i ? { ...x, [field]: value } : x)));

  function pickTable(no: number) {
    setTable(no);
    const left = tables?.find((t) => t.no === no)?.remaining ?? 0;
    if (count > left) changeCountTo(Math.max(1, left));
  }
  function changeCountTo(n: number) {
    setCount(n);
    setGuests((g) => Array.from({ length: n - 1 }, (_, i) => g[i] ?? { name: "", phone: "" }));
  }

  const guestsComplete = guests.every((g) => g.name.trim().length >= 2 && g.phone.replace(/\D/g, "").length >= 8);

  async function submit() {
    if (!method) return;
    if (tables && table == null) {
      setError("VIP ширээгээ сонгоно уу.");
      return;
    }
    if (!guestsComplete) {
      setError("Найз бүрийн овог нэр, утасны дугаарыг бөглөнө үү.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { order } = await api<{ order: { ref: string } }>("/api/tickets/order", {
        method: "POST",
        body: JSON.stringify({ tier, method, guests, table }),
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
      {tables && (
        <fieldset className="mb-6">
          <legend className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.3em] text-silver/70">
            <Armchair className="h-3.5 w-3.5" aria-hidden="true" /> VIP ШИРЭЭ СОНГОХ
          </legend>
          <p className="mt-2 text-xs leading-relaxed text-silver/70">
            2-р давхрын VIP бүс. Таны болон найзуудын тань суудал нэг ширээнд байна.{" "}
            <a href="/#details" className="underline hover:text-white">Байршлын зураг</a>
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="VIP ширээ">
            {tables.map((t) => {
              const full = t.remaining <= 0;
              const on = table === t.no;
              return (
                <button
                  key={t.no}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={full}
                  onClick={() => pickTable(t.no)}
                  className={`rounded-xl border px-1 py-2.5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                    on ? "border-electric bg-electric/15" : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <span className="block font-display text-base font-bold text-white">{t.no}</span>
                  <span className="block text-[0.6rem] text-silver/70">{full ? "Дүүрсэн" : `${t.remaining} суудал`}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="text-[0.65rem] font-semibold tracking-[0.3em] text-silver/70">ТАСАЛБАРЫН ТОО</p>
      <div className="mt-3 flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-4">
        <div>
          <p className="font-display text-sm font-semibold text-white">
            {count === 1 ? "Зөвхөн өөртөө" : `Өөртөө + ${count - 1} найздаа`}
          </p>
          <p className="mt-1 text-xs text-silver/70">
            {maxGuests > 0
              ? `СЭЗИС-ийн оюутан ${maxGuests} хүртэлх найзтайгаа ирж болно.${tables ? " VIP найз мөн 21+ байх ёстой." : ""}`
              : tableLeft != null ? "Энэ ширээнд найзын суудал үлдээгүй." : "Энэ ангилалд найзын тасалбар үлдээгүй."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeCount(count - 1)}
            disabled={count <= 1}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white disabled:opacity-30"
            aria-label="Тасалбар хасах"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-5 text-center font-display text-lg font-bold text-white" aria-live="polite">{count}</span>
          <button
            type="button"
            onClick={() => changeCount(count + 1)}
            disabled={count >= 1 + maxGuests}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white disabled:opacity-30"
            aria-label="Тасалбар нэмэх"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {guests.length > 0 && (
        <fieldset className="mt-6">
          <legend className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.3em] text-silver/70">
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> НЭМЭЛТ ТАСАЛБАР ХЭНД ЗОРИУЛАГДСАН БЭ?
          </legend>
          <p className="mt-2 text-xs leading-relaxed text-silver/70">
            Найз бүрт нэртэй тусдаа QR тасалбар гарна. Хаалган дээр иргэний үнэмлэхээр нэрийг нь тулгана.
          </p>
          <div className="mt-3 space-y-3">
            {guests.map((g, i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-4">
                <p className="mb-3 font-display text-xs font-semibold text-white">{i + 1}-р найз</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="sr-only">{i + 1}-р найзын овог нэр</span>
                    <input
                      value={g.name}
                      onChange={(e) => setGuest(i, "name", e.target.value)}
                      placeholder="Овог нэр"
                      autoComplete="off"
                      maxLength={60}
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">{i + 1}-р найзын утасны дугаар</span>
                    <input
                      value={g.phone}
                      onChange={(e) => setGuest(i, "phone", e.target.value)}
                      placeholder="Утас (99112233)"
                      inputMode="tel"
                      autoComplete="off"
                      maxLength={15}
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
      )}

      <p className="mt-6 text-[0.65rem] font-semibold tracking-[0.3em] text-silver/70">ТӨЛБӨРИЙН ХЭЛБЭР</p>
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

      <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-silver">
          {count} × {formatMNT(price)}
        </span>
        <span className="font-display text-xl font-bold text-white">{formatMNT(price * count)}</span>
      </div>

      {error && <p className="mt-4 text-sm text-[#ff8a9b]" role="alert">{error}</p>}
      <button
        onClick={submit}
        disabled={!method || busy || (tables != null && table == null)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-electric py-4 font-display text-xs font-semibold tracking-[0.2em] text-white shadow-[0_0_40px_-8px_rgba(83,109,255,0.9)] transition hover:brightness-110 disabled:opacity-40"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        ЗАХИАЛГА ҮҮСГЭХ
      </button>
    </div>
  );
}
