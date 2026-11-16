"use client";

import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { api } from "@/lib/client-utils";

export default function CheckInButton({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "already" | "invalid" | "error">("idle");
  async function go() {
    setState("busy");
    try {
      const { result } = await api<{ result: "ok" | "already" | "invalid" }>("/api/admin/checkin", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setState(result);
    } catch {
      setState("error");
    }
  }
  if (state === "ok") return <p className="rounded-2xl bg-emerald-400/15 p-4 text-center font-display font-bold text-emerald-300">✓ ОРУУЛЛАА</p>;
  if (state === "already") return <p className="rounded-2xl bg-amber-400/15 p-4 text-center font-display font-bold text-amber-300">⚠ ӨМНӨ НЬ ОРСОН</p>;
  if (state === "invalid") return <p className="rounded-2xl bg-[#ff8a9b]/15 p-4 text-center font-display font-bold text-[#ff8a9b]">✕ ХҮЧИНГҮЙ</p>;
  return (
    <button onClick={go} disabled={state === "busy"} className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-4 font-display text-sm font-bold tracking-[0.2em] text-night">
      {state === "busy" ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />} CHECK-IN
    </button>
  );
}
