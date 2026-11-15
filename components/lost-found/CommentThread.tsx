"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Send, Trash2 } from "lucide-react";
import { api, timeAgo } from "@/lib/client-utils";
import type { Comment } from "./types";

interface Props {
  postId: number;
  loggedIn: boolean;
  onCountChange: (delta: number) => void;
}

export default function CommentThread({ postId, loggedIn, onCountChange }: Props) {
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ comments: Comment[] }>(`/api/lost-found/${postId}/comments`)
      .then((d) => setComments(d.comments))
      .catch((e) => setError((e as Error).message));
  }, [postId]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { comment } = await api<{ comment: Comment }>(`/api/lost-found/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body: text }),
      });
      setComments((c) => [...(c ?? []), comment]);
      onCountChange(1);
      setText("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    try {
      await api(`/api/lost-found/comments/${id}`, { method: "DELETE" });
      setComments((c) => (c ?? []).filter((x) => x.id !== id));
      onCountChange(-1);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="border-t border-white/[0.07] bg-night/40 px-5 py-4 sm:px-6">
      {comments === null && !error && <Loader2 className="mx-auto h-4 w-4 animate-spin text-silver/60" aria-label="Ачаалж байна" />}
      {comments && comments.length === 0 && <p className="text-center text-xs text-silver/50">Одоохондоо сэтгэгдэл алга.</p>}
      <ul className="space-y-3">
        {comments?.map((c) => (
          <li key={c.id} className="group flex gap-3">
            <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-electric/20 text-[0.6rem] font-bold uppercase text-electric">
              {c.author.slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1 rounded-xl bg-white/[0.04] px-3.5 py-2.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.68rem] text-silver/60">
                <span className="font-semibold text-silver">{c.author}</span>
                {c.isPostAuthor && <span className="rounded bg-electric/20 px-1.5 text-[0.58rem] font-semibold text-electric">ЗОХИОГЧ</span>}
                <span>· {timeAgo(c.createdAt)}</span>
                {c.isMine && (
                  <button onClick={() => remove(c.id)} className="ml-auto text-silver/40 hover:text-[#ff8a9b]" aria-label="Сэтгэгдэл устгах">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <p className="mt-1 whitespace-pre-line break-words text-sm text-white/90">{c.body}</p>
            </div>
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-xs text-[#ff8a9b]" role="alert">{error}</p>}

      {loggedIn ? (
        <form onSubmit={send} className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            placeholder="Сэтгэгдэл бичих..."
            aria-label="Сэтгэгдэл"
            className="min-w-0 flex-1 rounded-full border border-white/10 bg-night/70 px-4 py-2.5 text-sm text-white placeholder:text-silver/35 focus:border-electric focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-electric text-white disabled:opacity-40"
            aria-label="Илгээх"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-center text-xs text-silver/60">
          Сэтгэгдэл бичихийн тулд{" "}
          <a href="/login" className="font-semibold text-electric hover:underline">
            нэвтэрнэ үү
          </a>
          .
        </p>
      )}
    </div>
  );
}
