/**
 * ТАСАЛБАРЫН ТОХИРГОО — үнэ, тоо ширхэг, давуу тал, дансны мэдээллийг ЗӨВХӨН энд засна.
 * Үнэ: Early Bird 70,000₮ · Regular 80,000₮ · VIP 200,000₮ (240ш). Early Bird/Regular-ийн тоо, Early Bird дуусах огноог шалгаарай.
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
      price: 200000,
      quantity: 240,
      perks: ["2-р давхрын VIP бүсэд суудал", "Үдшийн бүх тоглолт, DJ set", "Finger foods", "Photobooth"],
    },
  ] satisfies TicketTier[],

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

export const getTier =(id: string) => ticketConfig.tiers.find((t) => t.id === id) as TicketTier | undefined;

export const formatMNT = (n: number) => `${n.toLocaleString("en-US")}${ticketConfig.currency}`;
