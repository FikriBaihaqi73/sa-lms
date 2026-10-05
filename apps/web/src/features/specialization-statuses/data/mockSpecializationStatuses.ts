import type { SpecializationStatus, AccessCell } from '../types';

const on = (note?: string): AccessCell => (note ? { enabled: true, note } : { enabled: true });
const off: AccessCell = { enabled: false };
const ts = () => new Date().toISOString();

export const MOCK_SPECIALIZATION_STATUSES: SpecializationStatus[] = [
  {
    id: 'as-1', name: 'Aktif Normal', description: 'Mengikuti perkuliahan reguler dan KRS',
    code: 'AKT', badgeTone: 'blue', access: { krs: on(), lms: on(), prs: on() },
    billing: '100% BPP/UKT', studyCounted: true, studyLabel: 'Ya (+1)', pddikti: 'A (Aktif)', type: 'system',
  },
  {
    id: 'as-2', name: 'Cuti Akademik', description: 'Penghentian studi resmi berizin Dekanat',
    code: 'CUT', badgeTone: 'blue', access: { krs: off, lms: on('R'), prs: off },
    billing: '25% Retensi Cuti', billingSpecial: true, studyCounted: false, studyLabel: 'Tidak (0)', pddikti: 'C (Cuti)', type: 'system',
  },
  {
    id: 'as-3', name: 'MBKM / Magang Bersertifikat', description: 'Konversi 20 SKS rekognisi industri',
    code: 'MGN', badgeTone: 'blue', access: { krs: on('K'), lms: on(), prs: on('D') },
    billing: 'Subsidi Kampus (0%)', studyCounted: true, studyLabel: 'Ya (+1)', pddikti: 'M (MBKM)', type: 'dikti',
  },
  {
    id: 'as-4', name: 'Non-Aktif / Mangkir', description: 'Tidak registrasi ulang tanpa izin cuti',
    code: 'NON', badgeTone: 'red', access: { krs: off, lms: off, prs: off },
    billing: 'Hutang Akumulasi UKT', billingSpecial: true, studyCounted: true, studyLabel: 'Ya (+1)', pddikti: 'N (Non-Aktif)', type: 'system',
  },
  {
    id: 'as-5', name: 'Lulus / Alumni', description: 'Yudisium & telah terbit SK Rektor',
    code: 'LLS', badgeTone: 'blue', access: { krs: off, lms: on('A'), prs: off },
    billing: 'Bebas Tagihan', studyCounted: false, studyLabel: 'Tidak (0)', pddikti: 'L (Lulus)', type: 'system',
  },
  {
    id: 'as-6', name: 'Drop Out / Dikeluarkan', description: 'Melebihi masa studi atau pelanggaran kode etik',
    code: 'DO', badgeTone: 'red', access: { krs: off, lms: off, prs: off },
    billing: 'Tutup Billing', studyCounted: false, studyLabel: 'Tidak (0)', pddikti: 'D (Dikeluarkan)', type: 'system',
  },
  {
    id: 'as-7', name: 'Mengundurkan Diri', description: 'Pengajuan mandiri mahasiswa disetujui',
    code: 'KLR', badgeTone: 'gray', access: { krs: off, lms: off, prs: off },
    billing: 'Kliring Keuangan', studyCounted: false, studyLabel: 'Tidak (0)', pddikti: 'K (Keluar)', type: 'dikti',
  },
  {
    id: 'as-8', name: 'Double Degree Overseas', description: 'Perkuliahan di Universitas Mitra Luar Negeri',
    code: '2DG', badgeTone: 'blue', access: { krs: on('E'), lms: on(), prs: on() },
    billing: '50% UKT Pokok', billingSpecial: true, studyCounted: true, studyLabel: 'Ya (+1)', pddikti: 'A (Map to Aktif)', type: 'custom',
  },
].map((item) => ({ ...item, createdAt: ts(), updatedAt: ts() })) as SpecializationStatus[];

/** Lengkapi data dari API (id, name, description) dengan field mock yang belum ada di backend. */
export function enrichSpecializationStatus(item: SpecializationStatus): SpecializationStatus {
  const known = MOCK_SPECIALIZATION_STATUSES.find(
    (m) => m.name.toLowerCase() === item.name.toLowerCase() || m.id === item.id,
  );
  return {
    ...item,
    code: item.code ?? known?.code ?? item.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase(),
    badgeTone: item.badgeTone ?? known?.badgeTone ?? 'gray',
    access: item.access ?? known?.access ?? { krs: off, lms: off, prs: off },
    billing: item.billing ?? known?.billing ?? '-',
    billingSpecial: item.billingSpecial ?? known?.billingSpecial ?? false,
    studyCounted: item.studyCounted ?? known?.studyCounted ?? false,
    studyLabel: item.studyLabel ?? known?.studyLabel ?? 'Tidak (0)',
    pddikti: item.pddikti ?? known?.pddikti ?? '-',
    type: item.type ?? known?.type ?? 'custom',
  };
}
