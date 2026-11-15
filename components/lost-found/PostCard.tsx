"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, MessageCircle, Trash2, RotateCcw } from "lucide-react";
import { api, timeAgo } from "@/lib/client-utils";
import CommentThread from "./CommentThread";
import { KIND_LABEL, type Post } from "./types";

interface Props {
  post: Post;
  loggedIn: boolean;
  onChange: (p: Post) => void;
  onDelete: (id: number) => void;
}

export default function PostCard({ post, loggedIn, onChange, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggleResolved() {
    setBusy(true);
    try {
      const { post: p } = await api<{ post: Post }>(`/api/lost-found/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify({ resolved: !post.resolved }),
      });
      onChange(p);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm("Энэ постыг устгах уу?")) return;
    setBusy(true);
    try {
      await api(`/api/lost-found/${post.id}`, { method: "DELETE" });
      onDelete(post.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`overflow-hidden rounded-2xl border bg-ink/80 transition-colors ${post.resolved ? "border-white/[0.05] opacity-75" : "border-white/[0.08] hover:border-electric/30"}`}>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
        {post.imageUrl && (
          <a href={post.imageUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt={post.title}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover sm:h-32 sm:w-40"
            />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.2em] ${
                post.kind === "lost" ? "bg-[#ff8a9b]/15 text-[#ff8a9b]" : "bg-electric/15 text-[#8fa1ff]"
              }`}
            >
              {KIND_LABEL[post.kind]}
            </span>
            {post.resolved && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.2em] text-emerald-300">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> ЭЗЭНДЭЭ ОЧСОН
              </span>
            )}
            <span className="text-[0.68rem] text-silver/50">
              {post.author} · {timeAgo(post.createdAt)}
            </span>
          </div>
          <h3 className="mt-3 break-words font-display text-base font-semibold text-white sm:text-lg">{post.title}</h3>
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-silver">{post.body}</p>
          {post.location && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-silver/70">
              <MapPin className="h-3.5 w-3.5 text-electric" aria-hidden="true" />
              {post.location}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-5 py-3 sm:px-6">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-silver transition-colors hover:bg-white/5 hover:text-white"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Сэтгэгдэл ({post.commentCount})
        </button>
        {post.isMine && (
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={toggleResolved}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-silver transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              {post.resolved ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {post.resolved ? "Буцаах" : "Эзэндээ очсон"}
            </button>
            <button
              onClick={remove}
              disabled={busy}
              className="grid h-8 w-8 place-items-center rounded-full text-silver/60 transition-colors hover:bg-[#ff8a9b]/10 hover:text-[#ff8a9b] disabled:opacity-50"
              aria-label="Пост устгах"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {open && (
        <CommentThread
          postId={post.id}
          loggedIn={loggedIn}
          onCountChange={(d) => onChange({ ...post, commentCount: post.commentCount + d })}
        />
      )}
    </article>
  );
}
