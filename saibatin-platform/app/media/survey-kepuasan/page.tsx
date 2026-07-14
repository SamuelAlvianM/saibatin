import { redirect } from 'next/navigation';

/**
 * Survey Kepuasan Masyarakat dipindah ke halaman Hubungi Kami (Google Form,
 * seperti portal lama). Redirect dipertahankan untuk tautan/bookmark lama.
 */
export default function SurveyKepuasanPage() {
  redirect('/hubungi-kami#survei');
}
