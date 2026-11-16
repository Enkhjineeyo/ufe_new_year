import type { Metadata } from "next";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthShell from "@/components/AuthShell";
import CheckInButton from "@/components/tickets/CheckInButton";
import { getSessionEmail } from "@/lib/session";
import { ticketStore } from "@/lib/tickets-db";
import { isAdmin } from "@/lib/tickets";
import { displayName } from "@/lib/lostfound";
import { getTier } from "@/data/tickets";

export const metadata: Metadata = { title: "Тасалбар шалгах", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Тасалбарын QR уншуулахад нээгдэх хуудас. Админ бол Check-in хийнэ. */
export default async function TicketVerifyPage({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const order = await ticketStore().getByTicket(code);
  const email = await getSessionEmail();
  const admin = isAdmin(email);
  const valid = order?.status === "paid";

  return (
    <>
      <Navbar />
      <AuthShell>
        <div className="glass rounded-3xl p-8 text-center">
          {valid ? (
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" aria-hidden="true" />
          ) : (
            <XCircle className="mx-auto h-14 w-14 text-[#ff8a9b]" aria-hidden="true" />
          )}
          <h1 className="mt-4 font-display text-2xl font-bold text-white">{valid ? "ХҮЧИНТЭЙ ТАСАЛБАР" : "ХҮЧИНГҮЙ ТАСАЛБАР"}</h1>
          {valid && order && (
            <>
              <p className="mt-3 inline-block rounded-full bg-electric px-4 py-1.5 font-display text-xs font-bold tracking-[0.2em] text-white">
                {getTier(order.tier)?.name ?? order.tier}
              </p>
              <p className="mt-3 text-sm text-silver">{admin ? order.email : displayName(order.email)}</p>
              <p className="mt-1 font-mono text-xs tracking-[0.2em] text-silver/60">{code}</p>
              {order.checkedInAt && (
                <p className="mt-4 text-sm font-semibold text-amber-300">
                  Орсон: {new Date(order.checkedInAt).toLocaleString("mn-MN", { timeZone: "Asia/Ulaanbaatar" })}
                </p>
              )}
              <div className="mt-6">
                {admin ? (
                  order.checkedInAt ? null : <CheckInButton code={code} />
                ) : (
                  <p className="inline-flex items-center gap-2 text-xs text-silver/60">
                    <ShieldAlert className="h-4 w-4" aria-hidden="true" /> Check-in-ийг зөвхөн зохион байгуулагч хийнэ.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </AuthShell>
    </>
  );
}
