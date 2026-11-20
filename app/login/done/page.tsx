import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import AuthShell from "@/components/AuthShell";
import { safeNext } from "@/lib/auth";

export const metadata: Metadata = { title: "Нэвтэрлээ", robots: { index: false } };

/** Майлын холбоосоор нээгдсэн таб — анхны цонх автоматаар нэвтэрнэ */
export default async function LoginDonePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next) ?? "/pass";
  return (
    <>
      <Navbar />
      <AuthShell>
        <div className="glass rounded-3xl p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-300" aria-hidden="true" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">Амжилттай нэвтэрлээ</h1>
          <p className="mt-3 text-sm leading-relaxed text-silver">
            Нэвтрэх хүсэлт илгээсэн <b className="text-white">анхны цонх автоматаар нэвтэрсэн</b>. Тэр цонх руугаа буцаж үргэлжлүүлээрэй — энэ табыг хааж болно.
          </p>
          <a
            href={next}
            className="mt-6 inline-block rounded-full border border-silver/30 px-6 py-3 font-display text-[0.65rem] font-semibold tracking-[0.2em] text-white hover:border-electric"
          >
            ЭНЭ ЦОНХОНД ҮРГЭЛЖЛҮҮЛЭХ
          </a>
        </div>
      </AuthShell>
    </>
  );
}
