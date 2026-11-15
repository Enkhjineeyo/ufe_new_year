"use client";

import { useRef, useState, type FormEvent } from "react";
import { ImagePlus, Loader2, Send, X, MapPin } from "lucide-react";
import { api, compressImage } from "@/lib/client-utils";
import type { Post, PostKind } from "./types";

export default function PostComposer({ userName, onCreated }: { userName: string; onCreated: (p: Post) => void }) {
  const [kind, setKind] = useState<PostKind>("lost");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setError(null);
    try {
      setImage(await compressImage(file));
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { post } = await api<{ post: Post }>("/api/lost-found", {
        method: "POST",
        body: JSON.stringify({ kind, title, body, location, image }),
      });
      onCreated(post);
      setTitle("");
      setBody("");
      setLocation("");
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-white/10 bg-night/70 px-4 py-3 text-sm text-white placeholder:text-silver/35 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/30";

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-silver/70">
          <span className="font-semibold text-white">{userName}</span> нэрээр нийтлэгдэнэ
        </p>
        <div className="inline-flex rounded-full border border-white/10 bg-night/60 p-1" role="radiogroup" aria-label="Постын төрөл">
          {(["lost", "found"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={`rounded-full px-4 py-1.5 text-[0.65rem] font-semibold tracking-[0.18em] transition-colors ${
                kind === k ? (k === "lost" ? "bg-[#ff8a9b] text-night" : "bg-electric text-white") : "text-silver/70 hover:text-white"
              }`}
            >
              {k === "lost" ? "ГЭЭСЭН" : "ОЛСОН"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <input
          className={input}
          placeholder={kind === "lost" ? "Юу гээсэн бэ? (жш: Хар өнгийн AirPods)" : "Юу олсон бэ? (жш: Цэнхэр түрийвч)"}
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Гарчиг"
          required
        />
        <textarea
          className={`${input} min-h-[96px] resize-y`}
          placeholder="Дэлгэрэнгүй тайлбар, таних тэмдэг, холбогдох арга..."
          value={body}
          maxLength={1000}
          onChange={(e) => setBody(e.target.value)}
          aria-label="Тайлбар"
          required
        />
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-silver/40" aria-hidden="true" />
          <input
            className={`${input} pl-10`}
            placeholder="Хаана? (жш: Photobooth-ийн орчим, VIP 12-р ширээ)"
            value={location}
            maxLength={80}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Байршил"
          />
        </div>
      </div>

      {image && (
        <div className="relative mt-3 inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Сонгосон зураг" className="h-28 w-28 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-night text-white ring-1 ring-white/20"
            aria-label="Зургийг хасах"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-[#ff8a9b]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs font-semibold text-silver transition-colors hover:border-electric/60 hover:text-white">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Зураг
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <button
          type="submit"
          disabled={busy || title.trim().length < 3 || body.trim().length < 5}
          className="inline-flex items-center gap-2 rounded-full bg-electric px-6 py-2.5 font-display text-[0.65rem] font-semibold tracking-[0.18em] text-white shadow-[0_0_30px_-8px_rgba(83,109,255,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
          НИЙТЛЭХ
        </button>
      </div>
    </form>
  );
}
