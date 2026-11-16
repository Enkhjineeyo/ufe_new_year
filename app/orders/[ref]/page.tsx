import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthShell from "@/components/AuthShell";
import OrderView, { type OrderDTO } from "@/components/tickets/OrderView";
import { getSessionEmail } from "@/lib/session";
import { ticketStore } from "@/lib/tickets-db";
import { isAdmin, orderDTO, syncQpay } from "@/lib/tickets";

export const metadata: Metadata = { title: "Захиалга — СЭЗИС NEW YEAR 2027", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const ref = (await params).ref.toUpperCase();
  const email = await getSessionEmail();
  if (!email) redirect(`/login?next=${encodeURIComponent(`/orders/${ref}`)}`);
  let order = await ticketStore().getByRef(ref);
  if (!order || (order.email !== email && !isAdmin(email))) notFound();
  order = await syncQpay(order);
  return (
    <>
      <Navbar />
      <AuthShell>
        <OrderView
          initial={orderDTO(order) as OrderDTO}
          devMock={process.env.NODE_ENV !== "production" && process.env.QPAY_MOCK === "1"}
        />
        <p className="mt-6 text-center">
          <a href="/pass" className="text-xs font-semibold tracking-[0.2em] text-silver/70 hover:text-white">МИНИЙ ТАСАЛБАР →</a>
        </p>
      </AuthShell>
    </>
  );
}
