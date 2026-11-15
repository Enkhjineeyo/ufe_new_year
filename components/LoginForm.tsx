"use client";

import { useState, type FormEvent } from "react";
import { Mail, ArrowRight, Loader2, MailCheck, AlertCircle } from "lucide-react";

interface LoginFormProps {
  placeholder: string;
  domains: string[];
  initialError?: string;
}

type State =
  | { step: "form"; error?: string }
  | { step: "sent"; sentTo: string; devLink?: string };

export default function LoginForm({ placeholder, domains, initialError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<State>({ step: "form", error: initialError });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        setState({
          step: "form",
          error: data.error ?? `Серверийн алдаа (${res.status}). Тохиргоог /api/health хаягаар шалгана уу.`,
        });
      else setState({ step: "sent", sentTo: data.sentTo, devLink: data.devLink });
    } catch {
      setState({ step: "form", error: "Сүлжээний алдаа. Дахин оролдоно уу." });
    } finally {
      setLoading(false);
    }
  }

  if (state.step === "sent") {
    return (
      <div className="text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-electric shadow-[0_0_50px_rgba(83,109,255,0.7)]">
          <MailCheck className="h-6 w-6 text-white" aria-hidden="true" />
        </span>
        <h2 className="mt-6 font-display text-xl font-bold text-white">Майлаа шалгана уу</h2>
        <p className="mt-3 text-sm leading-relaxed text-silver">
          <span className="font-semibold text-white">{state.sentTo}</span> хаяг руу нэвтрэх холбоос илгээлээ.
          Outlook-оо нээгээд <b className="text-white">“НЭВТРЭХ”</b> товч дээр дарна уу. Junk/Spam хавтсаа ч шалгаарай.
        </p>
        {state.devLink && (
          <a href={state.devLink} className="mt-5 block break-all rounded-lg border border-dashed border-electric/50 p-3 text-xs text-electric">
            [DEV] SMTP тохируулаагүй тул холбоос энд: дарж нэвтрэх
          </a>
        )}
        <button
          type="button"
          onClick={() => setState({ step: "form" })}
          className="mt-6 text-xs font-semibold tracking-[0.2em] text-silver/70 underline-offset-4 hover:text-white hover:underline"
        >
          ӨӨР МАЙЛ АШИГЛАХ
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="email" className="text-[0.65rem] font-semibold tracking-[0.3em] text-silver/70">
        СЭЗИС-ИЙН OUTLOOK МАЙЛ
      </label>
      <div className="relative mt-3">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-silver/50" aria-hidden="true" />
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "email-error" : "email-hint"}
          className="w-full rounded-xl border border-white/10 bg-night/70 py-4 pl-11 pr-4 text-base text-white placeholder:text-silver/35 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/30"
        />
      </div>
      {state.error ? (
        <p id="email-error" className="mt-3 flex items-start gap-2 text-sm text-[#ff8a9b]" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      ) : (
        <p id="email-hint" className="mt-3 text-xs text-silver/55">
          Зөвхөн {domains.map((d) => `@${d}`).join(", ")} хаягаар нэвтэрнэ.
        </p>
      )}
      <button
        type="submit"
        disabled={loading || !email}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-electric px-6 py-4 font-display text-xs font-semibold tracking-[0.2em] text-white shadow-[0_0_40px_-8px_rgba(83,109,255,0.9)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        {loading ? "ИЛГЭЭЖ БАЙНА..." : "НЭВТРЭХ ХОЛБООС АВАХ"}
      </button>
    </form>
  );
}
