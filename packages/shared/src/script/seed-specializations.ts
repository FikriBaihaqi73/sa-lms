import { getPrisma } from "#infrastructure/database/client";

const specializationsData = [
  {
    name: "Rekayasa Perangkat Lunak",
    description:
      "Fokus pada perancangan arsitektur software, pemrograman web & mobile modern, DevOps, serta pengujian perangkat lunak.",
  },
  {
    name: "Kecerdasan Buatan & Sains Data",
    description:
      "Bidang keahlian machine learning, deep learning, pengolahan bahasa alami (NLP), dan analisis big data.",
  },
  {
    name: "Jaringan Komputer & Keamanan Siber",
    description:
      "Konsentrasi keamanan sistem informasi, ethical hacking, cloud networking, dan administrasi infrastruktur jaringan.",
  },
  {
    name: "Sistem Informasi Enterprise",
    description:
      "Tata kelola teknologi informasi, integrasi proses bisnis, Enterprise Resource Planning (ERP), dan audit sistem informasi.",
  },
  {
    name: "Multimedia & Teknologi Game",
    description:
      "Pengembangan game digital, computer vision, pemodelan 3D, animasi digital, dan desain antarmuka pengguna (UI/UX).",
  },
  {
    name: "Internet of Things & Sistem Tertanam",
    description:
      "Perancangan mikrokontroler, smart devices, robotika, sensor networks, dan komputasi cerdas berbasis hardware.",
  },
];

async function main() {
  const prisma = getPrisma();
  console.log("Seeding specializations (Peminatan / Konsentrasi / Keahlian)...");

  for (const item of specializationsData) {
    const existing = await prisma.specializations.findFirst({
      where: { name: item.name, deleted_at: null },
    });

    if (!existing) {
      const created = await prisma.specializations.create({
        data: {
          name: item.name,
          description: item.description,
        },
      });
      console.log(`+ Created specialization: "${created.name}"`);
    } else {
      console.log(`= Specialization already exists: "${existing.name}"`);
    }
  }

  console.log("Specializations seeding finished.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  const prisma = getPrisma();
  await prisma.$disconnect();
  process.exit(1);
});
