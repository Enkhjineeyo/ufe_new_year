/**
 * ТАСАЛБАРЫН ТОХИРГОО — үнэ, тоо ширхэг, давуу тал, дансны мэдээллийг ЗӨВХӨН энд засна.
 * Үнэ: Early Bird 70,000₮ · Regular 80,000₮ · VIP 250,000₮ (14 ширээ × 10 суудал, зөвхөн 21+). Early Bird/Regular-ийн тоо, Early Bird дуусах огноог шалгаарай.
 */
export type TierId = "early" | "regular" | "vip";

export interface TicketTier {
  id: TierId;
  name: string;
  /** Үнэ (₮) */
  price: number;
  /** Нийт зарах тоо */
  quantity: number;
  /** Зарагдаж эхлэх / дуусах хугацаа (Монголын цаг, заавал биш) */
  salesStart?: string;
  salesEnd?: string;
  perks: string[];
  highlight?: boolean;
}

export const ticketConfig = {
  currency: "₮",
  /** Нэг оюутан хэдэн идэвхтэй захиалгатай байж болох (өөрийн + найзуудын тасалбар нэг захиалгад) */
  maxOrdersPerStudent: 1,
  /** Оюутан өөртөө 1 тасалбар + хамгийн ихдээ хэдэн найздаа тасалбар авч болох */
  maxGuests: 2,
  /** QPay нэхэмжлэл хүчинтэй хугацаа (минут) */
  qpayExpiryMinutes: 30,
  /** Дансаар шилжүүлэх захиалгыг хүлээх хугацаа (цаг) */
  bankExpiryHours: 48,

  tiers: [
    {
      id: "early",
      name: "EARLY BIRD",
      price: 70000,
      quantity: 150,
      salesEnd: "2026-11-30T23:59:59+08:00",
      perks: ["Үдшийн бүх тоглолт, DJ set", "Finger foods", "Хямд үнэ — тоо хязгаартай"],
    },
    {
      id: "regular",
      name: "REGULAR",
      price: 80000,
      quantity: 400,
      perks: ["Үдшийн бүх тоглолт, DJ set", "Finger foods", "Photobooth"],
      highlight: true,
    },
    {
      id: "vip",
      name: "VIP",
      price: 250000,
      /** VIP-ийн нийт тоо = ширээний тоо × суудал (доорх vip тохиргооноос) */
      quantity: 14 * 10,
      perks: ["Зөвхөн 21+ (b23 ба түүнээс өмнөх код)", "2-р давхрын VIP ширээгээ өөрөө сонгоно", "Үдшийн бүх тоглолт, DJ set", "Finger foods", "Photobooth"],
    },
  ] satisfies TicketTier[],

  /**
   * VIP — ширээ сонгох ба насны хязгаар.
   * Ширээний тоо/суудлыг өөрчилбөл дээрх VIP quantity-г (tables.length × seatsPerTable) мөн тааруулна.
   */
  vip: {
    tables: Array.from({ length: 14 }, (_, i) => i + 1),
    seatsPerTable: 10,
    /** Оюутны кодын элссэн он (b23 → 23). Үүнээс хойш элссэн (b24, b25, b26...) оюутан VIP авахгүй */
    maxEntryYear: 23,
  },

  /**
   * ДАНСААР ТӨЛӨХ — дансны дугаар хоосон бол "Дансаар" сонголт харагдахгүй.
   * Гүйлгээний утгад захиалгын код (жш: UFE-7K3Q9M) бичүүлнэ.
   */
  bank: {
    bankName: "Хаан банк",
    accountNumber: "5175335963",
    accountName: "Баттулга Энхжин",
    iban: "MN650005005175335963",
  },
};

/** Нэг захиалгад авах дээд тоо: оюутан өөрөө + найзууд */
export const maxTicketsPerOrder = 1 + ticketConfig.maxGuests;

export interface Guest {
  name: string;
  phone: string;
}

/** Найзын мэдээллийг шалгаж цэвэрлэнэ. Алдаатай бол мессеж буцаана. */
export function validateGuests(input: unknown): Guest[] | string {
  if (input == null) return [];
  if (!Array.isArray(input)) return "Найзын мэдээлэл буруу байна.";
  if (input.length > ticketConfig.maxGuests) return `Хамгийн ихдээ ${ticketConfig.maxGuests} найзтайгаа ирэх боломжтой.`;
  const out: Guest[] = [];
  for (const [i, g] of input.entries()) {
    const name = String((g as Guest)?.name ?? "").trim().replace(/\s+/g, " ");
    const phone = String((g as Guest)?.phone ?? "").replace(/[\s-]/g, "");
    if (name.length < 2 || name.length > 60) return `${i + 1}-р найзын овог нэрийг бичнэ үү.`;
    if (!/^\+?\d{8,12}$/.test(phone)) return `${i + 1}-р найзын утасны дугаар буруу байна (8 оронтой).`;
    out.push({ name, phone });
  }
  return out;
}

/** Майлаас оюутны элссэн оныг гаргана: b23xxxxx@ufe.edu.mn → 23. Олдохгүй бол null */
export function entryYear(email: string): number | null {
  const m = /^b(\d{2})/i.exec(email.trim());
  return m ? Number(m[1]) : null;
}

/** VIP авах эрхтэй эсэх (21+): b23 ба түүнээс өмнө элссэн оюутан */
export function vipEligible(email: string): boolean {
  const y = entryYear(email);
  return y !== null && y <= ticketConfig.vip.maxEntryYear;
}

export const vipIneligibleMessage = () =>
  `VIP тасалбарыг зөвхөн 21 ба түүнээс дээш насныхан авна: оюутны код b${ticketConfig.vip.maxEntryYear} болон түүнээс өмнөх оюутан авах боломжтой.`;

/** Ширээний дугаарыг шалгана. VIP биш бол null */
export function validateTable(tierId: string, input: unknown): number | null | string {
  if (tierId !== "vip") return null;
  const n = Number(input);
  if (!Number.isInteger(n) || !ticketConfig.vip.tables.includes(n)) return "VIP ширээгээ сонгоно уу.";
  return n;
}

export const tableLabel = (n: number | null | undefined) => (n ? `${n}-р ширээ` : "");

export const getTier =(id: string) => ticketConfig.tiers.find((t) => t.id === id) as TicketTier | undefined;

export const formatMNT = (n: number) => `${n.toLocaleString("en-US")}${ticketConfig.currency}`;
