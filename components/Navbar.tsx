"use client";

import { useEffect, useState } from "react";
import { Menu, X, LogIn, Ticket } from "lucide-react";
import { siteConfig } from "@/site.config";
import PaperStar from "./PaperStar";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { loggedIn?: boolean }) => setLoggedIn(Boolean(d.loggedIn)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || open ? "border-b border-white/5 bg-night/75 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Үндсэн цэс">
        <a href="/#top" className="flex items-center gap-2.5" aria-label={siteConfig.title}>
          <PaperStar size={22} />
          <span className="whitespace-nowrap font-display text-[0.7rem] font-semibold tracking-[0.14em] text-white min-[400px]:text-sm sm:tracking-[0.18em]">
            {siteConfig.shortTitle}
          </span>
        </a>

        <ul className="hidden items-center gap-6 xl:flex xl:gap-8">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-silver/80 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
        <a
          href={loggedIn ? "/pass" : "/login"}
          aria-label={loggedIn ? "Миний тасалбар" : "Нэвтрэх"}
          className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-electric/50 bg-electric/15 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.18em] text-white transition-colors hover:bg-electric"
        >
          {loggedIn ? <Ticket className="h-3.5 w-3.5" aria-hidden="true" /> : <LogIn className="h-3.5 w-3.5" aria-hidden="true" />}
          <span className={loggedIn ? "hidden min-[440px]:inline" : ""}>{loggedIn ? "МИНИЙ ТАСАЛБАР" : "НЭВТРЭХ"}</span>
        </a>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full text-white xl:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Цэс хаах" : "Цэс нээх"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="h-[calc(100dvh-4rem)] bg-night/95 px-6 pt-10 xl:hidden">
          <ul className="flex flex-col gap-7">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-2xl font-semibold tracking-wide text-white"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
