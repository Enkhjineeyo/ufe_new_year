import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";
import { getSessionEmail } from "@/lib/session";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: `Нэвтрэх — ${siteConfig.title}`,
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionEmail()) redirect("/pass");
  const { error } = await searchParams;

  return (
    <>
      <Navbar />
      <AuthShell>
        <div className="text-center">
          <p className="eyebrow">Students only</p>
          <h1 className="chrome-text mt-4 font-display text-4xl font-bold tracking-tight">НЭВТРЭХ</h1>
          <p className="mt-4 text-sm leading-relaxed text-silver">
            Сургуулийн Outlook майлаа оруулахад баталгаажуулах холбоос илгээгдэнэ.
          </p>
        </div>
        <div className="glass mt-8 rounded-2xl p-6 sm:p-8">
          <LoginForm
            placeholder={siteConfig.auth.emailPlaceholder}
            domains={siteConfig.auth.allowedDomains}
            initialError={error === "expired" ? "Холбоосын хугацаа дууссан эсвэл буруу байна. Дахин авна уу." : undefined}
          />
        </div>
      </AuthShell>
    </>
  );
}
