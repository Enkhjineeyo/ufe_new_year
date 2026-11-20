import { CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { siteConfig } from "@/site.config";
import PaperStar from "../PaperStar";

interface Props {
  tierName: string;
  holder: string;
  ref_: string;
  ticketCode: string;
  checkedInAt?: string | null;
  /** Найзын тасалбар бол урьсан оюутан */
  invitedBy?: string | null;
}

/** QR тасалбар — хаалган дээр үзүүлнэ */
export default function TicketCard({ tierName, holder, ref_, ticketCode, checkedInAt, invitedBy }: Props) {
  return (
    <article className="relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-silver/20 bg-gradient-to-b from-ink to-night shadow-[0_30px_80px_-30px_rgba(83,109,255,0.7)]">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-electric/25 blur-3xl" aria-hidden="true" />
      <div className="relative p-6 text-center">
        <div className="flex items-center justify-between">
          <PaperStar size={26} />
          <span className="flex gap-1.5">
            {invitedBy && (
              <span className="rounded-full bg-amber-400/20 px-3 py-1 font-display text-[0.62rem] font-bold tracking-[0.2em] text-amber-200">ЗОЧИН</span>
            )}
            <span className="rounded-full bg-electric px-3 py-1 font-display text-[0.62rem] font-bold tracking-[0.2em] text-white">{tierName}</span>
          </span>
        </div>
        <h2 className="chrome-text mt-5 font-display text-2xl font-bold leading-tight">{siteConfig.title}</h2>
        <p className="mt-1 font-display text-[0.6rem] tracking-[0.3em] text-silver/70">{siteConfig.tagline}</p>
      </div>
      <div className="relative flex items-center" aria-hidden="true">
        <span className="-ml-3 h-6 w-6 rounded-full bg-night" />
        <span className="h-px flex-1 border-t border-dashed border-silver/25" />
        <span className="-mr-3 h-6 w-6 rounded-full bg-night" />
      </div>
      <div className="relative p-6 text-center">
        <div className="mx-auto w-56 rounded-2xl bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/tickets/qr/${ticketCode}`} alt={`Тасалбарын QR код ${ticketCode}`} className="h-auto w-full" />
        </div>
        <p className="mt-3 font-mono text-sm tracking-[0.25em] text-white">{ticketCode}</p>
        {checkedInAt ? (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> Орсон
          </p>
        ) : null}
        <dl className="mt-5 space-y-2 text-left text-xs text-silver">
          <div className="flex justify-between gap-3"><dt className="text-silver/55">Эзэмшигч</dt><dd className="font-semibold text-white">{holder}</dd></div>
          {invitedBy && <div className="flex justify-between gap-3"><dt className="text-silver/55">Урьсан</dt><dd className="text-white">{invitedBy}</dd></div>}
          <div className="flex justify-between gap-3"><dt className="text-silver/55">Захиалга</dt><dd className="font-mono text-white">{ref_}</dd></div>
          <div className="flex justify-between gap-3"><dt className="inline-flex items-center gap-1.5 text-silver/55"><CalendarDays className="h-3.5 w-3.5" />Огноо</dt><dd className="text-white">{siteConfig.dateShort} · {siteConfig.timeLabel}</dd></div>
          <div className="flex justify-between gap-3"><dt className="inline-flex items-center gap-1.5 text-silver/55"><MapPin className="h-3.5 w-3.5" />Байршил</dt><dd className="text-right text-white">{siteConfig.venue}</dd></div>
        </dl>
        <p className="mt-5 text-[0.68rem] leading-relaxed text-silver/55">
          {invitedBy
            ? "Энэ тасалбарыг найздаа screenshot хийж илгээгээрэй. Хаалган дээр QR-ийг уншуулж, иргэний үнэмлэхээр нэрийг тулгана. Нэг удаа л уншигдана."
            : "Хаалган дээр энэ QR-ийг үзүүлнэ. Screenshot хийж хадгалаарай. QR-ээ бусдад бүү дамжуулаарай, нэг удаа л уншигдана."}
        </p>
      </div>
    </article>
  );
}
