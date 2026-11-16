import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminDashboard from "@/components/tickets/AdminDashboard";
import { getSessionEmail } from "@/lib/session";
import { isAdmin } from "@/lib/tickets";

export const metadata: Metadata = { title: "Админ — Тасалбар", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const email = await getSessionEmail();
  if (!email) redirect("/login?next=%2Fadmin");
  if (!isAdmin(email)) {
    return (
      <>
        <Navbar />
        <main className="grid min-h-[100svh] place-items-center px-5 text-center">
          <div>
            <h1 className="font-display text-2xl font-bold text-white">Хандах эрхгүй</h1>
            <p className="mt-2 text-sm text-silver">Энэ хуудас зөвхөн зохион байгуулагчдад зориулагдсан.</p>
          </div>
        </main>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8">
        <p className="eyebrow">Admin</p>
        <h1 className="chrome-text mt-2 font-display text-3xl font-bold">ТАСАЛБАРЫН УДИРДЛАГА</h1>
        <p className="mt-2 text-sm text-silver">{email}</p>
        <div className="mt-8">
          <AdminDashboard />
        </div>
      </main>
    </>
  );
}
