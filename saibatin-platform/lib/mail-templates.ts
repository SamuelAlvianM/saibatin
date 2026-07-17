import { appUrl } from "./mail";

/**
 * Template email HTML bergaya brand SAIBATIN (biru #1b4b72 → #2176bd).
 * Semua template mengembalikan { subject, html } siap kirim via sendMail.
 */

const ORG = "Disdukcapil Kabupaten Pesisir Barat";
const PORTAL = "Portal SAIBATIN";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function layout(judul: string, isi: string, cta?: { label: string; url: string }): string {
  return `<!DOCTYPE html>
<html lang="id">
<body style="margin:0;padding:0;background:#eef4fa;font-family:Segoe UI,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4fa;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(27,75,114,.12);">
        <tr>
          <td style="background:linear-gradient(135deg,#1b4b72 0%,#2176bd 100%);padding:28px 32px;">
            <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:.5px;">SAIBATIN</p>
            <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:12px;">${ORG}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;color:#1b4b72;font-size:18px;">${judul}</h1>
            <div style="color:#334155;font-size:14px;line-height:1.7;">${isi}</div>
            ${
              cta
                ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 8px;"><tr><td style="border-radius:10px;background:#2176bd;">
                     <a href="${cta.url}" style="display:inline-block;padding:12px 28px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:10px;">${cta.label}</a>
                   </td></tr></table>
                   <p style="margin:8px 0 0;color:#94a3b8;font-size:11px;text-align:center;">Jika tombol tidak berfungsi, salin tautan ini:<br/><a href="${cta.url}" style="color:#2176bd;word-break:break-all;">${cta.url}</a></p>`
                : ""
            }
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
              Email ini dikirim otomatis oleh ${PORTAL} — mohon tidak membalas email ini.<br/>
              &copy; ${new Date().getFullYear()} ${ORG}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export interface MailContent {
  subject: string;
  html: string;
}

/** Kode OTP verifikasi email saat pendaftaran (berlaku 5 menit). */
export function tplOtpEmail(kode: string): MailContent {
  return {
    subject: `${kode} — Kode Verifikasi Pendaftaran SAIBATIN`,
    html: layout(
      "Kode verifikasi email Anda",
      `<p>Gunakan kode berikut untuk memverifikasi alamat email Anda di ${PORTAL}:</p>
       <p style="text-align:center;margin:20px 0;">
         <span style="display:inline-block;padding:14px 28px;background:#eef4fa;border:1px dashed #2176bd;border-radius:12px;color:#1b4b72;font-size:28px;font-weight:700;letter-spacing:8px;">${esc(kode)}</span>
       </p>
       <p>Kode berlaku <strong>5 menit</strong>. <strong>JANGAN</strong> berikan
       kode ini kepada siapa pun, termasuk yang mengaku petugas.</p>
       <p style="color:#94a3b8;font-size:12px;">Abaikan email ini jika Anda tidak
       merasa mendaftar di ${PORTAL}.</p>`,
    ),
  };
}

/** Konfirmasi pendaftaran diterima — menunggu verifikasi petugas. */
export function tplRegistrasiDiterima(nama: string): MailContent {
  return {
    subject: "Pendaftaran Akun SAIBATIN Diterima — Menunggu Verifikasi",
    html: layout(
      "Pendaftaran Anda sudah kami terima",
      `<p>Halo <strong>${esc(nama)}</strong>,</p>
       <p>Terima kasih telah mendaftar di ${PORTAL}. Data Anda sedang
       <strong>diverifikasi oleh petugas</strong>. Anda akan menerima email
       pemberitahuan begitu akun disetujui atau ditolak.</p>
       <p>Proses verifikasi umumnya selesai dalam 1&ndash;2 hari kerja.</p>`,
    ),
  };
}

/** Akun disetujui/diaktifkan — bisa langsung login. */
export function tplAkunDisetujui(nama: string): MailContent {
  return {
    subject: "Akun SAIBATIN Anda Telah Disetujui ✅",
    html: layout(
      "Selamat! Akun Anda sudah aktif",
      `<p>Halo <strong>${esc(nama)}</strong>,</p>
       <p>Akun Anda di ${PORTAL} telah <strong style="color:#16a34a;">disetujui dan diaktifkan</strong>.
       Anda sekarang dapat masuk dan mengajukan permohonan layanan kependudukan secara online.</p>`,
      { label: "Masuk Sekarang", url: appUrl("/login") },
    ),
  };
}

/** Akun ditolak — beri alasan + ajak mendaftar ulang dengan data diperbaiki. */
export function tplAkunDitolak(nama: string, alasan?: string): MailContent {
  return {
    subject: "Pendaftaran Akun SAIBATIN Ditolak",
    html: layout(
      "Pendaftaran akun Anda belum dapat disetujui",
      `<p>Halo <strong>${esc(nama)}</strong>,</p>
       <p>Mohon maaf, pendaftaran akun Anda di ${PORTAL} <strong style="color:#dc2626;">ditolak</strong>.</p>
       ${
         alasan
           ? `<p style="background:#fef2f2;border-left:3px solid #dc2626;padding:10px 14px;border-radius:6px;">
              <strong>Alasan:</strong> ${esc(alasan)}</p>`
           : ""
       }
       <p>Anda dapat <strong>mendaftar kembali</strong> dengan data yang sudah
       diperbaiki sesuai catatan di atas.</p>`,
      { label: "Daftar Ulang", url: appUrl("/register") },
    ),
  };
}

/** Tautan reset password. */
export function tplResetPassword(nama: string, resetUrl: string): MailContent {
  return {
    subject: "Reset Password Akun SAIBATIN",
    html: layout(
      "Permintaan reset password",
      `<p>Halo <strong>${esc(nama)}</strong>,</p>
       <p>Kami menerima permintaan reset password untuk akun Anda. Klik tombol
       di bawah untuk membuat password baru. Jika Anda tidak merasa meminta
       reset password, abaikan email ini — akun Anda tetap aman.</p>`,
      { label: "Reset Password", url: resetUrl },
    ),
  };
}

/** Permohonan layanan disetujui/selesai. */
export function tplPermohonanSelesai(
  nama: string,
  noregister: string,
  jenis: string,
  catatan?: string,
): MailContent {
  return {
    subject: `Permohonan ${noregister} Telah Disetujui ✅`,
    html: layout(
      "Permohonan Anda telah disetujui",
      `<p>Halo <strong>${esc(nama)}</strong>,</p>
       <p>Permohonan Anda telah <strong style="color:#16a34a;">SELESAI diproses dan disetujui</strong>:</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f0fdf4;border-radius:10px;margin:8px 0;">
         <tr><td style="padding:14px 18px;font-size:13px;color:#334155;line-height:1.8;">
           <strong>No. Register:</strong> ${esc(noregister)}<br/>
           <strong>Jenis Layanan:</strong> ${esc(jenis)}
         </td></tr>
       </table>
       ${catatan ? `<p><strong>Catatan petugas:</strong> ${esc(catatan)}</p>` : ""}
       <p>Silakan cek detail dan dokumen hasil pada halaman riwayat permohonan Anda.</p>`,
      { label: "Lihat Riwayat Permohonan", url: appUrl("/riwayat") },
    ),
  };
}

/** Permohonan layanan ditolak — alasan + ajakan mengajukan revisi. */
export function tplPermohonanDitolak(
  nama: string,
  noregister: string,
  jenis: string,
  catatan?: string,
): MailContent {
  return {
    subject: `Permohonan ${noregister} Ditolak — Anda Dapat Mengajukan Revisi`,
    html: layout(
      "Permohonan Anda belum dapat disetujui",
      `<p>Halo <strong>${esc(nama)}</strong>,</p>
       <p>Mohon maaf, permohonan berikut <strong style="color:#dc2626;">DITOLAK</strong>:</p>
       <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#fef2f2;border-radius:10px;margin:8px 0;">
         <tr><td style="padding:14px 18px;font-size:13px;color:#334155;line-height:1.8;">
           <strong>No. Register:</strong> ${esc(noregister)}<br/>
           <strong>Jenis Layanan:</strong> ${esc(jenis)}
         </td></tr>
       </table>
       ${
         catatan
           ? `<p style="background:#fef2f2;border-left:3px solid #dc2626;padding:10px 14px;border-radius:6px;">
              <strong>Alasan penolakan:</strong> ${esc(catatan)}</p>`
           : ""
       }
       <p>Anda dapat <strong>mengajukan permohonan kembali (revisi)</strong> dengan
       melengkapi/memperbaiki berkas sesuai alasan penolakan di atas.</p>`,
      { label: "Ajukan Revisi Permohonan", url: appUrl("/permohonan-online") },
    ),
  };
}
