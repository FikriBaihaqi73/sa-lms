import type { Specialization } from '../types';

export const MOCK_SPECIALIZATIONS: Specialization[] = [
  {
    id: 'spec-1',
    name: 'Rekayasa Perangkat Lunak',
    description:
      'Fokus pada perancangan arsitektur software, pemrograman web & mobile modern, DevOps, serta pengujian perangkat lunak.',
  },
  {
    id: 'spec-2',
    name: 'Kecerdasan Buatan & Sains Data',
    description:
      'Bidang keahlian machine learning, deep learning, pengolahan bahasa alami (NLP), dan analisis big data.',
  },
  {
    id: 'spec-3',
    name: 'Jaringan Komputer & Keamanan Siber',
    description:
      'Konsentrasi keamanan sistem informasi, ethical hacking, cloud networking, dan administrasi infrastruktur jaringan.',
  },
  {
    id: 'spec-4',
    name: 'Sistem Informasi Enterprise',
    description:
      'Tata kelola teknologi informasi, integrasi proses bisnis, Enterprise Resource Planning (ERP), dan audit sistem informasi.',
  },
  {
    id: 'spec-5',
    name: 'Multimedia & Teknologi Game',
    description:
      'Pengembangan game digital, computer vision, pemodelan 3D, animasi digital, dan desain antarmuka pengguna (UI/UX).',
  },
  {
    id: 'spec-6',
    name: 'Internet of Things & Sistem Tertanam',
    description:
      'Perancangan mikrokontroler, smart devices, robotika, sensor networks, dan komputasi cerdas berbasis hardware.',
  },
];

// Compatibility exports
export const MOCK_SPECIALIZATION_STATUSES = MOCK_SPECIALIZATIONS;
export function enrichSpecializationStatus(item: Specialization): Specialization {
  return item;
}
