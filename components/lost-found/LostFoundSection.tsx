"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Loader2, LogIn, PackageSearch } from "lucide-react";
import { api } from "@/lib/client-utils";
import SectionHeading from "../SectionHeading";
import PostComposer from "./PostComposer";
import PostCard from "./PostCard";
import type { Post, PostKind } from "./types";

type Filter = "all" | PostKind;
const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "БҮГД" },
  { key: "lost", label: "ГЭЭСЭН" },
  { key: "found", label: "ОЛСОН" },
];

export default function LostFoundSection() {
  const [me, setMe] = useState<{ loggedIn: boolean; name: string | null } | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (f: Filter, before?: number) => {
    const qs = new URLSearchParams();
    if (before) qs.set("before", String(before));
    if (f !== "all") qs.set("kind", f);
    return api<{ posts: Post[]; nextCursor: number | null }>(`/api/lost-found?${qs}`);
  }, []);

  useEffect(() => {
    api<{ loggedIn: boolean; name: string | null }>("/api/auth/me")
      .then(setMe)
      .catch(() => setMe({ loggedIn: false, name: null }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    load(filter)
      .then((d) => {
        if (cancelled) return;
        setPosts(d.posts);
        setCursor(d.nextCursor);
      })
      .catch((e) => !cancelled && setError((e as Error).message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [filter, load]);

  async function seeMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const d = await load(filter, cursor);
      setPosts((p) => [...p, ...d.posts]);
      setCursor(d.nextCursor);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <section id="lost-found" className="relative border-t border-white/[0.05] px-5 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Lost & Found"
          title="ХАЯСАН ГЭЭСЭН ЗҮЙЛС"
          subtitle="Үдэшлэг дээр юм гээсэн эсвэл олсон бол энд нийтлээрэй. Сэтгэгдлээр холбогдож, эзэнд нь хүргэцгээе."
        />

        {me?.loggedIn && me.name ? (
          <PostComposer userName={me.name} onCreated={(p) => (filter === "all" || filter === p.kind) && setPosts((list) => [p, ...list])} />
        ) : me ? (
          <div className="glass flex flex-col items-center gap-4 rounded-2xl p-6 text-center sm:flex-row sm:text-left">
            <PackageSearch className="h-8 w-8 shrink-0 text-electric" aria-hidden="true" />
            <p className="flex-1 text-sm text-silver">
              Пост нийтлэх, сэтгэгдэл бичихийн тулд СЭЗИС-ийн Outlook майлаараа нэвтэрнэ үү.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-electric px-5 py-2.5 font-display text-[0.65rem] font-semibold tracking-[0.18em] text-white"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" /> НЭВТРЭХ
            </a>
          </div>
        ) : null}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xs font-semibold tracking-[0.25em] text-silver/70">СҮҮЛИЙН ПОСТУУД</h3>
          <div className="inline-flex rounded-full border border-white/10 p-1" role="tablist" aria-label="Шүүлтүүр">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-[0.6rem] font-semibold tracking-[0.15em] transition-colors sm:px-4 ${
                  filter === f.key ? "bg-white text-night" : "text-silver/70 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4" aria-live="polite">
          {loading && <Loader2 className="mx-auto mt-8 h-6 w-6 animate-spin text-silver/60" aria-label="Ачаалж байна" />}
          {!loading && error && <p className="text-center text-sm text-[#ff8a9b]">{error}</p>}
          {!loading && !error && posts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-silver/60">
              Одоохондоо пост алга. ✦
            </p>
          )}
          {!loading &&
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                loggedIn={Boolean(me?.loggedIn)}
                onChange={(np) => setPosts((list) => list.map((x) => (x.id === np.id ? np : x)))}
                onDelete={(id) => setPosts((list) => list.filter((x) => x.id !== id))}
              />
            ))}
        </div>

        {!loading && cursor && (
          <div className="mt-8 text-center">
            <button
              onClick={seeMore}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-silver/25 px-7 py-3 font-display text-[0.65rem] font-semibold tracking-[0.22em] text-white transition-colors hover:border-electric hover:bg-electric/15 disabled:opacity-50"
            >
              {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
              SEE MORE
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
