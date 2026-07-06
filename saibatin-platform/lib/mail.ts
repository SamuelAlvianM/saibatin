import nodemailer from "nodemailer";

/**
 * Pengiriman email via SMTP (Nodemailer).
 * Konfigurasi lewat env: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM.
 * Jika env belum diisi (mis. saat dev), pengiriman di-skip tanpa membuat error —
 * fitur lain tetap berjalan normal.
 */

let transporter: nodemailer.Transporter | null = null;

export function mailEnabled(): boolean {
  return !!(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS);
}

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const port = Number(process.env.MAIL_PORT ?? 465);
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure: port === 465, // 465 = SSL, 587 = STARTTLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return transporter;
}

/** Base URL aplikasi untuk tautan di dalam email. */
export function appUrl(path = ""): string {
  const base =
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Kirim email. Tidak pernah melempar error — kegagalan dicatat di log server
 * agar respons API tetap sukses (email adalah efek samping, bukan syarat).
 */
export async function sendMail({ to, subject, html }: SendMailOptions): Promise<boolean> {
  if (!to || !to.includes("@")) return false;
  if (!mailEnabled()) {
    console.warn(`[mail] MAIL_* belum dikonfigurasi — skip kirim "${subject}" ke ${to}`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error(`[mail] Gagal kirim "${subject}" ke ${to}:`, err);
    return false;
  }
}
