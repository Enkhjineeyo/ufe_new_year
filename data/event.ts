/**
 * ҮЙЛ АЖИЛЛАГААНЫ ҮНДСЭН МЭДЭЭЛЭЛ
 * Огноо, байршил, сошиал холбоосыг ЗӨВХӨН энд өөрчилнө.
 */
export const eventInfo = {
  title: "СЭЗИС NEW YEAR 2027",
  shortTitle: "СЭЗИС NY 2027",
  tagline: "THE NIGHT TO REMEMBER.",
  university: "Санхүү Эдийн Засгийн Их Сургууль",
  universityEn: "University of Finance and Economics",

  /** Countdown зорилтот хугацаа — Монголын цаг (UTC+8) */
  startsAt: "2026-12-20T19:00:00+08:00",
  dateLabel: "20 DECEMBER 2026",
  dateShort: "20.12.2026",
  timeLabel: "19:00",

  venue: "Corporate Convention Centre",
  city: "Ulaanbaatar, Mongolia",
  audience: "Exclusively for University of Finance and Economics students.",
  audienceShort: "EXCLUSIVELY FOR UFE STUDENTS",

  /** Google Maps холбоосыг энд тавина (хоосон бол placeholder харагдана) */
  mapUrl: "",
  /** Google Maps → Share → Embed a map → src="..." доторх URL */
  mapEmbedUrl: "",

  description: [
    "Хичээлийн завгүй өдрүүдээ түр мартаж, найз нөхөдтэйгөө нэгэн үдшийг мартагдашгүй дурсамж болгон өнгөрүүлээрэй.",
    "Шинэ хүмүүстэй танилцаж, найз нөхөдтэйгөө хөгжилдөж, амьд хөгжмийн тоглолт болон DJ performance-оор дүүрэн онцгой үдшийг хамтдаа бүтээцгээе.",
    "Энэ үдэш бол зүгээр нэг шинэ жилийн баяр биш. Энэ бол СЭЗИС-ийн оюутнуудын хамтын дурсамж, шинэ танил, шинэ мэдрэмжийн эхлэл юм.",
  ],

  about: {
    title: "ЭНЭ ҮДЭШ БИДНИЙХ",
    paragraphs: [
      "Дурсамж бүтээж, шинэ хүмүүстэй танилцаж, найз нөхөдтэйгөө нэгэн үдшийг мартагдашгүй өнгөрүүлэх боломж.",
      "Амьд хөгжмийн тоглолт, DJ set, амтат finger foods болон гэнэтийн олон сюрприз таныг хүлээж байна.",
      "СЭЗИС-ийн оюутнууд бид нэгэн үдшийг хамтдаа бүтээцгээе.",
    ],
  },

  highlights: [
    { title: "LIVE ARTIST PERFORMANCE", icon: "mic" },
    { title: "EXCLUSIVE DJ SET", icon: "disc" },
    { title: "FINGER FOODS", icon: "food" },
    { title: "UNFORGETTABLE MEMORIES", icon: "camera" },
    { title: "NEW CONNECTIONS", icon: "users" },
    { title: "SPECIAL SURPRISES", icon: "gift" },
  ] as const,

  /** Сошиал холбоос — өөрийн хуудасны линкээр солино */
  socials: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },

  /**
   * НЭВТРЭХ ТОХИРГОО
   * Зөвхөн эдгээр домэйнтэй сургуулийн (Outlook) майлаар нэвтэрнэ.
   */
  auth: {
    allowedDomains: ["ufe.edu.mn", "ufenu.edu.mn"],
    emailPlaceholder: "b********@ufe.edu.mn",
    /** Баталгаажуулах холбоос хэдэн минут хүчинтэй байх */
    linkTtlMinutes: 15,
    /** Нэвтэрсэн төлөв хэдэн хоног хадгалагдах */
    sessionDays: 30,
  },

  startedMessage: "ҮДЭШ ЭХЭЛЛЭЭ — THE NIGHT IS ON!",
};

export type EventInfo = typeof eventInfo;
