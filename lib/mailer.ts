import "server-only";
import nodemailer from "nodemailer";
import { siteConfig } from "@/site.config";

const smtpConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

/**
 * Нэвтрэх холбоосыг майлаар илгээнэ.
 * SMTP тохируулаагүй үед (зөвхөн development) холбоосыг терминалд хэвлэнэ.
 */
export async function sendLoginLink(to: string, link: string): Promise<{ devLink?: string }> {
  if (!smtpConfigured()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP тохиргоо (SMTP_HOST, SMTP_USER, SMTP_PASS) хийгдээгүй байна.");
    }
    console.log(`\n[DEV] ${to} руу илгээх нэвтрэх холбоос:\n${link}\n`);
    return { devLink: link };
  }

  const port = Number(process.env.SMTP_PORT ?? 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  const minutes = siteConfig.auth.linkTtlMinutes;
  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? `"${siteConfig.title}" <${process.env.SMTP_USER}>`,
    to,
    subject: `${siteConfig.title} — Нэвтрэх холбоос`,
    text: `Сайн байна уу!\n\n${siteConfig.title} сайтад нэвтрэхийн тулд доорх холбоос дээр дарна уу (${minutes} минут хүчинтэй):\n\n${link}\n\nХэрэв та хүсэлт илгээгээгүй бол энэ майлыг үл тоомсорлоно уу.`,
    html: `
<div style="background:#08090D;padding:40px 16px;font-family:Arial,sans-serif;color:#ffffff">
  <div style="max-width:480px;margin:0 auto;background:#11141B;border:1px solid #2a2f3a;border-radius:16px;padding:32px;text-align:center">
    <p style="margin:0;color:#C7CCD5;font-size:12px;letter-spacing:4px">${siteConfig.university.toUpperCase()}</p>
    <h1 style="margin:16px 0 4px;font-size:26px">${siteConfig.title}</h1>
    <p style="margin:0 0 28px;color:#C7CCD5;font-size:12px;letter-spacing:4px">${siteConfig.tagline}</p>
    <p style="color:#C7CCD5;font-size:15px;line-height:1.6">Нэвтрэхийн тулд доорх товч дээр дарна уу.<br/>Холбоос <b style="color:#fff">${minutes} минут</b> хүчинтэй.</p>
    <a href="${link}" style="display:inline-block;margin:20px 0;padding:14px 32px;background:#536DFF;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:bold;letter-spacing:2px">НЭВТРЭХ</a>
    <p style="color:#7e8694;font-size:12px;line-height:1.6">Хэрэв та хүсэлт илгээгээгүй бол энэ майлыг үл тоомсорлоно уу.</p>
  </div>
</div>`,
  });
  return {};
}
