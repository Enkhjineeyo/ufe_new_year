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
  /** Нэг оюутан нийт хэдэн тасалбар авах эрхтэй */
  maxPerStudent: 1,
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
    bankName: "",
    accountNumber: "",
    accountName: "",
    iban: "",
  },
};

export const getTier = (id: string) => ticketConfig.tiers.find((t) => t.id === id) as TicketTier | undefined;

export const formatMNT = (n: number) => `${n.toLocaleString("en-US")}${ticketConfig.currency}`;
