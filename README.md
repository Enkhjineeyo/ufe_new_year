# СЭЗИС NEW YEAR 2027 — Landing Page

**THE NIGHT TO REMEMBER.** · 20.12.2026 · Corporate Convention Centre

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · Lucide icons

---

## 1. Төслийн бүтэц (аль файл юу хийдэг)

```
ufe-new-year-2027/
├── site.config.ts            ← ТӨВ ТОХИРГОО (бүх компонент эндээс уншина)
├── data/
│   ├── event.ts              ← Огноо, байршил, текст, сошиал линк, нэвтрэх домэйн
│   ├── artists.ts            ← Уран бүтээлчид + зургийн зам
│   └── sponsors.ts           ← Хамтрагчид + логоны зам
├── app/
│   ├── layout.tsx            ← SEO, Open Graph, фонт
│   ├── page.tsx              ← Нүүр хуудас (бүх section-ийг угсарна)
│   ├── globals.css           ← Chrome текст, glass эффект
│   ├── login/page.tsx        ← Нэвтрэх хуудас (/login)
│   ├── pass/page.tsx         ← Нэвтэрсэн оюутны урилга (/pass)
│   └── api/lost-found/       ← Хаясан гээсэн зүйлс: пост, сэтгэгдэл, зураг
│   └── api/auth/
│       ├── request-link/     ← Майл руу нэвтрэх холбоос илгээнэ
│       ├── verify/           ← Майлын холбоос дээр дарахад нэвтрүүлнэ
│       └── logout/           ← Гарах
├── components/lost-found/    ← Хаясан гээсэн зүйлс хэсгийн компонентууд
├── components/               ← ThemeSection, Navbar, HeroSection, CountdownTimer, AboutSection,
│                                ExperienceCards, ArtistLineup, EventDetails,
│                                SponsorSection, Footer, LoginForm ...
├── lib/
│   ├── auth.ts               ← Токен гарын үсэг, домэйн шалгалт
│   ├── session.ts            ← Нэвтэрсэн хэрэглэгчийг унших
│   ├── mailer.ts             ← SMTP-ээр майл илгээх
│   └── db.ts                 ← Neon Postgres (постууд, сэтгэгдэл)
├── public/
│   ├── images/               ← Moodboard, танхимын бүдүүвч, хувцасны хадгаламж
│   ├── artists/              ← Уран бүтээлчдийн зураг энд
│   └── sponsors/             ← Хамтрагчдын лого энд
└── .env.example              ← Орчны хувьсагчийн загвар
```

---

## 2. Компьютер дээрээ ажиллуулах (VS Code)

**Шаардлага:** [Node.js 20+](https://nodejs.org) (LTS), [VS Code](https://code.visualstudio.com), [Git](https://git-scm.com)

1. `ufe-new-year-2027.zip`-ийг задлаад, хавтсаа VS Code-оор нээнэ: **File → Open Folder…**
2. VS Code дотор терминал нээнэ: **Terminal → New Terminal** (эсвэл `` Ctrl + ` ``)
3. Сангуудаа суулгана:
   ```bash
   npm install
   ```
4. Орчны хувьсагчийн файл үүсгэнэ (`.env.example`-ийг хуулж `.env.local` нэртэй болгоно):
   ```bash
   # Windows PowerShell
   copy .env.example .env.local
   # macOS / Linux
   cp .env.example .env.local
   ```
   Локал дээр SMTP хоосон байж болно — тэр үед нэвтрэх холбоос **терминалд хэвлэгдэж**, хуудсан дээр `[DEV]` холбоос гарч ирнэ.
5. Ажиллуулна:
   ```bash
   npm run dev
   ```
   Хөтөч дээр **http://localhost:3000** нээнэ.
6. Production build шалгах:
   ```bash
   npm run build
   npm start
   ```

---

## 3. GitHub дээр project үүсгэх

1. https://github.com/new → Repository name: `ufe-new-year-2027` → **Private** эсвэл Public → **Create repository** (README нэмэхгүй).
2. VS Code терминал дээр (төслийн хавтас дотроо):
   ```bash
   git init
   git add .
   git commit -m "СЭЗИС New Year 2027 landing page"
   git branch -M main
   git remote add origin https://github.com/<ТАНЫ-USERNAME>/ufe-new-year-2027.git
   git push -u origin main
   ```
   > `.env.local` файл `.gitignore`-д орсон тул нууц үг GitHub руу **явахгүй**.

---

## 4. Vercel дээр deploy хийх

1. https://vercel.com → **Continue with GitHub**-ээр нэвтэрнэ.
2. **Add New… → Project** → `ufe-new-year-2027` repo-г **Import**.
3. Framework: **Next.js** (автоматаар танина). Build command, output-ийг өөрчлөхгүй.
4. **Environment Variables** хэсэгт дараахыг нэмнэ:

   | Нэр | Утга |
   |---|---|
   | `AUTH_SECRET` | 32+ тэмдэгттэй санамсаргүй мөр (доор үзнэ үү) |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | илгээгч Gmail хаяг |
   | `SMTP_PASS` | Gmail **App Password** (16 тэмдэгт) |
   | `MAIL_FROM` | `СЭЗИС NEW YEAR 2027 <илгээгч@gmail.com>` |

   `AUTH_SECRET` үүсгэх: терминал дээр `openssl rand -base64 32` эсвэл
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

5. **Deploy** дарна.
6. **Өгөгдлийн сан холбох** ("Хаясан гээсэн зүйлс" хэсэгт заавал хэрэгтэй):
   Vercel → төсөл → **Storage** → **Create Database** → **Neon (Serverless Postgres)** → Free → **Create** → төсөлдөө **Connect**.
   `DATABASE_URL` автоматаар нэмэгдэнэ. Хүснэгтүүд анхны пост оруулахад **автоматаар үүснэ** — SQL бичих шаардлагагүй.
   Холбосны дараа **Redeploy** хийнэ.

> Хэрэв Vercel "No Output Directory named public" гэж алдаа өгвөл: **Settings → Build and Deployment → Framework Preset = Next.js** болгоод Output Directory override-ийг унтраана (төсөлд `vercel.json` нэмсэн тул ихэнхдээ шаардлагагүй). 1–2 минутын дараа `https://ufe-new-year-2027.vercel.app` маягийн линк гарна.
8. Цаашид `git push` хийх бүрт Vercel автоматаар шинэчилнэ.

> Environment Variables-ийг deploy хийсний дараа нэмсэн/өөрчилсөн бол **Deployments → ⋯ → Redeploy** хийнэ.

---

## 5. Нэвтрэх систем (Outlook майлаар баталгаажуулах)

**Урсгал:**
1. Оюутан `/login` хуудсанд сургуулийн майлаа (`b********@ufe.edu.mn`) оруулна.
2. Зөвхөн `data/event.ts → auth.allowedDomains` дахь домэйн зөвшөөрөгдөнө (бусад нь татгалзана).
3. Тухайн Outlook хаяг руу **15 минут хүчинтэй** “НЭВТРЭХ” товчтой майл очно.
4. Товч дарахад 30 хоног хадгалагдах session үүсч, `/pass` (хувийн урилга) хуудас нээгдэнэ.

**Gmail App Password авах (майл илгээгч):**
1. Илгээгч болох Gmail дээр **2-Step Verification** асаана.
2. https://myaccount.google.com/apppasswords → нэр өгөөд **Create** → гарсан 16 тэмдэгтийг `SMTP_PASS`-д хийнэ.

> Хэрэв сургуулийн IT зөвшөөрвөл Outlook/Office 365 SMTP (`smtp.office365.com`, port `587`) ашиглаж болно. Олон байгууллага үүнийг хаадаг тул Gmail App Password хамгийн найдвартай.

**Домэйн өөрчлөх:** `data/event.ts` →
```ts
auth: { allowedDomains: ["ufe.edu.mn"], ... }
```

---

## 6. Хаясан гээсэн зүйлс (Lost & Found)

- Нүүр хуудасны `#lost-found` хэсэгт байрлана. **Хэн ч уншиж болно**, харин **пост нийтлэх, сэтгэгдэл бичих** нь зөвхөн нэвтэрсэн оюутанд.
- Пост: Гээсэн / Олсон, гарчиг, тайлбар, байршил, 1 зураг (хөтөч дээр автоматаар ~1000px болж жижгэрнэ).
- Хамгийн сүүлийн **5 пост** харагдаж, **SEE MORE** дарахад дараагийн 5 нь ачаалагдана. Бүгд / Гээсэн / Олсон шүүлтүүртэй.
- Зохиогч өөрийн постыг **"Эзэндээ очсон"** гэж тэмдэглэх, устгах; өөрийн сэтгэгдлийг устгах боломжтой.
- Майл хаяг бүрэн харагдахгүй (`b23******@ufe.edu.mn`).
- Хамгаалалт: цагт 5 пост / 30 сэтгэгдэл, өөр сайтаас ирэх хүсэлтийг хаана.
- Локал дээр `DATABASE_URL` байхгүй бол постууд санах ойд түр хадгалагдана (сервер дахин асахад арилна).

## 7. Агуулга засах

| Юуг | Хаана |
|---|---|
| Огноо, цаг (countdown) | `data/event.ts` → `startsAt: "2026-12-20T18:00:00+08:00"` |
| Байршил, Google Maps | `data/event.ts` → `mapUrl`, `mapEmbedUrl` |
| Instagram / Facebook | `data/event.ts` → `socials` |
| Theme (Midnight in Motion), dress code | `data/event.ts` → `theme` |
| Танхимын бүдүүвч зургууд | `public/images/` + `data/event.ts` → `venueMaps` |
| Уран бүтээлчийн зураг | Зургаа `public/artists/ginjin.jpg` гэж хийгээд `data/artists.ts` → `image: "/artists/ginjin.jpg"` |
| Хамтрагчийн лого | `public/sponsors/logo.svg` → `data/sponsors.ts` дотор `{ name, logo: "/sponsors/logo.svg", url }` |

- Уран бүтээлчийн зураг **3:4 босоо** харьцаатай байвал хамгийн гоё харагдана.
- Зөвхөн албан ёсны / зөвшөөрөлтэй зураг ашиглаарай. `image: ""` бол placeholder харагдана.
- Google Maps embed: Maps → газраа сонгох → **Share → Embed a map** → `src="…"` доторх URL-ийг `mapEmbedUrl`-д хийнэ.

### Drive-аас уран бүтээлчдийн зургийг нэмэх
1. Drive хавтаснаас зургуудаа татаж авна (хавтас дээр баруун товч → **Download**).
2. Зургуудаа дараах нэрээр `public/artists/` хавтсанд хийнэ (жижиг үсэг, хоосон зайгүй):
   `ginjin.jpg`, `becca.jpg`, `wasabies.jpg`, `fruitybaachka-bektor.jpg`, `morningstar.jpg`, `vande.jpg`, `gangaa.jpg`, `am-c.jpg`
3. `data/artists.ts` дотор тус бүрийн `image: ""`-ийг `image: "/artists/ginjin.jpg"` гэх мэтээр солино.
4. `git add . && git commit -m "Add artist photos" && git push`

---

## 8. Тасалбар борлуулалт (Early Bird / Regular / VIP)

**Урсгал:** Оюутан @ufe.edu.mn майлаар нэвтэрнэ → ангиллаа сонгоно → тасалбарын тоог (1–3) сонгоно. 1-ээс олон бол **"Нэмэлт тасалбар хэнд зориулагдсан бэ?"** гэж асууж найз бүрийн овог нэр, утсыг бөглүүлнэ → QPay эсвэл дансаар төлнө → төлбөр баталгаажмагц **QR тасалбар** `/orders/<код>` болон `/pass` ("Миний тасалбар") хуудсанд гарна → хаалган дээр админ QR уншуулж **check-in** хийнэ.

### Тохиргоо
| Юуг | Хаана |
|---|---|
| Үнэ, тоо ширхэг, давуу тал, Early Bird дуусах огноо | `data/tickets.ts` → `tiers` (Early Bird 70,000₮ · Regular 80,000₮ · VIP 200,000₮, 240ш) |
| Найзын тоо (оюутан өөрөө + N найз) | `data/tickets.ts` → `maxGuests` (одоо 2) |
| Нэг оюутны идэвхтэй захиалгын тоо | `data/tickets.ts` → `maxOrdersPerStudent` (одоо 1) |
| Дансны мэдээлэл | `data/tickets.ts` → `bank` (дансны дугаар хоосон бол "Дансаар" сонголт идэвхгүй) |

### Vercel Environment Variables
| Нэр | Тайлбар |
|---|---|
| `DATABASE_URL` | **Заавал.** Vercel → Storage → Neon холбоход автоматаар нэмэгдэнэ |
| `ADMIN_EMAILS` | Админуудын майл, таслалаар: `b23fa1251@ufe.edu.mn,b24xx0000@ufe.edu.mn` |
| `QPAY_USERNAME` / `QPAY_PASSWORD` / `QPAY_INVOICE_CODE` | QPay merchant-аас авна (байхгүй бол QPay сонголт идэвхгүй) |
| `QPAY_BASE_URL` | Туршилт: `https://merchant-sandbox.qpay.mn` · Бодит: `https://merchant.qpay.mn` (default) |

### Хуудсууд
- `/#tickets` — тасалбарын хэсэг · `/tickets/buy?tier=vip` — худалдан авах
- `/orders/<UFE-XXXXXX>` — төлбөр / QR тасалбар · `/pass` — миний тасалбар
- `/admin` — **админ**: борлуулалтын тоо, орлого, дансаар төлсөн захиалгыг баталгаажуулах, check-in
- `/t/<код>` — тасалбарын QR уншуулахад нээгдэнэ (админ бол CHECK-IN товч гарна)

### Найзтайгаа ирэх
- Нэг захиалгад оюутны өөрийн 1 + найзын 2 хүртэлх тасалбар орно. Үнэ = тасалбарын үнэ × тоо.
- Төлбөр баталгаажмагц тасалбар бүрт **тусдаа QR** гарна (`tk_tickets` хүснэгт). Оюутан найзынхаа тасалбарыг screenshot хийж илгээнэ.
- Хаалган дээр найзын QR-ийг уншуулахад "ЗОЧИН", нэр, утас, урьсан оюутан харагдана. Нэрийг иргэний үнэмлэхээр тулгана.
- Ангиллын үлдэгдэл тасалбараар тоологдоно (3 тасалбартай захиалга = 3).
- Хуучин хүснэгт анхны хүсэлтээр автоматаар шинэчлэгдэж, өмнө зарагдсан тасалбарууд `tk_tickets` руу хуулагдана.

### Аюулгүй байдал
- QPay callback-д итгэхгүй — төлбөрийг QPay API-аас (`/v2/payment/check`) дахин шалгаж баталгаажуулна.
- QR тасалбарыг зөвхөн эзэмшигч болон админ харна. Тасалбар нэг удаа л check-in хийгдэнэ.
- Дансаар төлсөн захиалгыг админ банкны хуулгаас **гүйлгээний утга (UFE-XXXXXX) ба дүнг** тулгаж баталгаажуулна.
- Локал туршилт: `.env.local`-д `QPAY_MOCK=1` бол QPay-г дуурайлгана (production дээр ажиллахгүй).
