import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthShell from "@/components/AuthShell";
import BuyForm from "@/components/tickets/BuyForm";
import { getSessionEmail } from "@/lib/session";
import { getTier, formatMNT, ticketConfig, vipEligible, vipIneligibleMessage } from "@/data/tickets";
import { bankEnabled, tierState, vipTables } from "@/lib/tickets";
import { qpayEnabled } from "@/lib/qpay";
import { ticketStore } from "@/lib/tickets-db";

export const metadata: Metadata = { title: "Тасалбар авах — СЭЗИС NEW YEAR 2027", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function BuyPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier: tierId } = await searchParams;
  const tier = getTier(tierId ?? "");
  if (!tier) redirect("/#tickets");
  const email = await getSessionEmail();
  if (!email) redirect(`/login?next=${encodeURIComponent(`/tickets/buy?tier=${tier.id}`)}`);

  let setupError: string | null = null;
  let mine: Awaited<ReturnType<ReturnType<typeof ticketStore>["listByEmail"]>> = [];
  let state: Awaited<ReturnType<typeof tierState>> = { open: false, remaining: 0 };
  let tables: Awaited<ReturnType<typeof vipTables>> | null = null;
  const isVip = tier.id === "vip";
  const ageBlocked = isVip && !vipEligible(email);
  try {
    mine = (await ticketStore().listByEmail(email)).filter((o) => o.status === "paid" || o.status === "pending");
    state = await tierState(tier);
    if (isVip) tables = await vipTables();
  } catch (e) {
    console.error(e);
    setupError = "Тасалбарын систем хараахан бэлэн болоогүй байна (өгөгдлийн сан холбогдоогүй). Удахгүй дахин оролдоно уу.";
  }
  const methods = { qpay: qpayEnabled(), bank: bankEnabled() };
  if (!setupError && !methods.qpay && !methods.bank) {
    setupError = "Төлбөрийн хэлбэр (QPay / данс) хараахан тохируулагдаагүй байна. Удахгүй нээгдэнэ.";
  }

  return (
    <>
      <Navbar />
      <AuthShell>
        <p className="eyebrow text-center">Checkout</p>
        <h1 className="chrome-text mt-3 text-center font-display text-3xl font-bold">{tier.name}</h1>
        <p className="mt-2 text-center font-display text-2xl font-bold text-white">{formatMNT(tier.price)}</p>
        <ul className="mx-auto mt-5 max-w-xs space-y-2">
          {tier.perks.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm text-silver">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric" aria-hidden="true" /> {p}
            </li>
          ))}
        </ul>
        <div className="glass mt-8 rounded-3xl p-6 sm:p-8">
          {setupError ? (
            <p className="text-center text-sm leading-relaxed text-amber-200">{setupError}</p>
          ) : ageBlocked ? (
            <div className="text-center">
              <p className="text-sm leading-relaxed text-amber-200">{vipIneligibleMessage()}</p>
              <a href="/tickets/buy?tier=regular" className="mt-4 inline-block rounded-full bg-electric px-6 py-3 font-display text-xs font-semibold tracking-[0.2em] text-white">
                REGULAR ТАСАЛБАР АВАХ
              </a>
            </div>
          ) : mine.length >= ticketConfig.maxOrdersPerStudent ? (
            <div className="text-center">
              <p className="text-sm text-silver">Танд идэвхтэй захиалга байна.</p>
              <a href={`/orders/${mine[0].ref}`} className="mt-4 inline-block rounded-full bg-electric px-6 py-3 font-display text-xs font-semibold tracking-[0.2em] text-white">
                ЗАХИАЛГАА ХАРАХ ({mine[0].ref})
              </a>
            </div>
          ) : !state.open ? (
            <p className="text-center text-sm text-silver">Энэ ангиллын тасалбар одоогоор зарагдахгүй байна.</p>
          ) : (
            <BuyForm
              tier={tier.id}
              price={tier.price}
              maxGuests={Math.max(0, Math.min(ticketConfig.maxGuests, state.remaining - 1))}
              methods={methods}
              tables={tables}
            />
          )}
        </div>
      </AuthShell>
    </>
  );
}
