import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthShell from "@/components/AuthShell";
import BuyForm from "@/components/tickets/BuyForm";
import { getSessionEmail } from "@/lib/session";
import { getTier, formatMNT, ticketConfig } from "@/data/tickets";
import { bankEnabled, tierState } from "@/lib/tickets";
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

  const mine = (await ticketStore().listByEmail(email)).filter((o) => o.status === "paid" || o.status === "pending");
  const state = await tierState(tier);

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
          {mine.length >= ticketConfig.maxPerStudent ? (
            <div className="text-center">
              <p className="text-sm text-silver">Танд идэвхтэй захиалга байна.</p>
              <a href={`/orders/${mine[0].ref}`} className="mt-4 inline-block rounded-full bg-electric px-6 py-3 font-display text-xs font-semibold tracking-[0.2em] text-white">
                ЗАХИАЛГАА ХАРАХ ({mine[0].ref})
              </a>
            </div>
          ) : !state.open ? (
            <p className="text-center text-sm text-silver">Энэ ангиллын тасалбар одоогоор зарагдахгүй байна.</p>
          ) : (
            <BuyForm tier={tier.id} methods={{ qpay: qpayEnabled(), bank: bankEnabled() }} />
          )}
        </div>
      </AuthShell>
    </>
  );
}
