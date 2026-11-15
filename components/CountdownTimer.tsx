"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface CountdownTimerProps {
  /** ISO огноо, цагийн бүстэй: "2026-12-20T19:00:00+08:00" */
  target: string;
  startedMessage: string;
}

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function getParts(targetMs: number): Parts | null {
  const diff = targetMs - Date.now();
  if (diff <= 0) return null;
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function CountdownTimer({ target, startedMessage }: CountdownTimerProps) {
  // Сервер ба клиентийн цаг зөрөхөөс сэргийлж mount болсны дараа тооцоолно.
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    // Date.parse нь "+08:00" офсетийг уншдаг тул зочны цагийн бүсээс үл хамааран
    // Монголын цагаар 19:00 яг тооцогдоно.
    const targetMs = Date.parse(target);
    setParts(getParts(targetMs));
    setMounted(true);
    const id = window.setInterval(() => {
      const next = getParts(targetMs);
      setParts(next);
      if (!next) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (mounted && !parts) {
    return (
      <div className="glass mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl px-6 py-6 text-center" role="status">
        <Sparkles className="h-5 w-5 shrink-0 text-electric" aria-hidden="true" />
        <p className="font-display text-base font-semibold tracking-[0.12em] text-white sm:text-lg">
          {startedMessage}
        </p>
      </div>
    );
  }

  const units: [string, number | undefined][] = [
    ["DAYS", parts?.days],
    ["HOURS", parts?.hours],
    ["MINUTES", parts?.minutes],
    ["SECONDS", parts?.seconds],
  ];

  return (
    <div
      className="mx-auto grid max-w-3xl grid-cols-4 gap-2 sm:gap-4"
      role="timer"
      aria-live="off"
      aria-label="Үдэшлэг эхлэх хүртэлх хугацаа"
    >
      {units.map(([label, value], i) => (
        <div key={label} className="relative">
          <div className="glass relative overflow-hidden rounded-xl px-1 py-4 text-center sm:rounded-2xl sm:py-6">
            <div className="absolute inset-x-0 top-0 h-px hairline" />
            <span className="block font-display text-[1.65rem] font-semibold tabular-nums leading-none text-white min-[380px]:text-3xl sm:text-5xl md:text-6xl">
              {value === undefined ? "--" : label === "DAYS" ? String(value) : pad(value)}
            </span>
            <span className="mt-2 block text-[0.55rem] font-semibold tracking-[0.22em] text-silver/70 sm:mt-3 sm:text-xs sm:tracking-[0.3em]">
              {label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="absolute -right-[0.4rem] top-1/2 hidden -translate-y-1/2 font-display text-2xl text-electric/70 sm:-right-[0.65rem] sm:block" aria-hidden="true">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
