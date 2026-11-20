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
  startsAt: "2026-12-20T18:00:00+08:00",
  dateLabel: "20 DECEMBER 2026",
  dateShort: "20.12.2026",
  timeLabel: "18:00",

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

  /** ҮДШИЙН ЗАГВАР (moodboard) — зургууд public/images/ дотор */
  theme: {
    name: "MIDNIGHT IN MOTION",
    tagline: "Where the Night Comes Alive.",
    vibe: "Modern, energetic, stylish.",
    colors: [
      { name: "Navy", hex: "#0E1A4F" },
      { name: "Electric Blue", hex: "#536DFF" },
      { name: "Chrome", hex: "#C7CCD5", chrome: true },
    ],
    dressCode: ["Black", "Blue", "Metallic"],
    images: [
      { src: "/images/moodboard-1.jpg", alt: "Хөх хөшиг, мөнгөлөг мод бүхий танхимын чимэглэл" },
      { src: "/images/moodboard-2.jpg", alt: "Хөх гэрэлтүүлэг, LED дэлгэцтэй тайз" },
      { src: "/images/moodboard-3.jpg", alt: "Disco бөмбөг, мөнгөлөг унжлагатай хөх чимэглэл" },
    ],
  },

  /** Танхимын бүдүүвч зургууд */
  venueMaps: [
    {
      src: "/images/floor-plan.webp",
      title: "ТАНХИМЫН БҮСЧЛЭЛ",
      caption: "Тайз, бүжгийн талбай, LED дэлгэц, 2-р давхрын VIP ширээ, Photobooth болон орох хаалга.",
      width: 2048,
      height: 1601,
    },
    {
      src: "/images/cloakroom.webp",
      title: "ХУВЦАСНЫ ХАДГАЛАМЖ",
      caption: "Орохдоо хувцсаа өгч, гарахдаа авах эгнээ тусдаа. Дугаартай өлгүүр болон түлхүүртэй локер.",
      width: 1467,
      height: 1076,
    },
  ],

  /**
   * НЭВТРЭХ ТОХИРГОО
   * Зөвхөн эдгээр домэйнтэй сургуулийн (Outlook) майлаар нэвтэрнэ.
   */
  auth: {
    allowedDomains: ["ufe.edu.mn"],
    emailPlaceholder: "b********@ufe.edu.mn",
    /** Баталгаажуулах холбоос хэдэн минут хүчинтэй байх */
    linkTtlMinutes: 15,
    /** Нэвтэрсэн төлөв хэдэн хоног хадгалагдах */
    sessionDays: 30,
  },

  startedMessage: "ҮДЭШ ЭХЭЛЛЭЭ — THE NIGHT IS ON!",
};

export type EventInfo = typeof eventInfo;
