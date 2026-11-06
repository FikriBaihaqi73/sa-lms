import { getPrisma } from "#infrastructure/database/client";

const defaultStatuses = [
  { name: "Hadir", description: "Siswa hadir mengikuti pembelajaran." },
  { name: "Izin", description: "Siswa tidak hadir dengan izin." },
  { name: "Sakit", description: "Siswa tidak hadir karena sakit." },
  { name: "Alpa", description: "Siswa tidak hadir tanpa keterangan." },
];

async function main() {
  const prisma = getPrisma();
  const institutions = await prisma.institution.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });

  for (const institution of institutions) {
    for (const status of defaultStatuses) {
      await prisma.attendanceStatuses.upsert({
        where: {
          institution_id_name: {
            institution_id: institution.id,
            name: status.name,
          },
        },
        update: {},
        create: {
          institution_id: institution.id,
          name: status.name,
          description: status.description,
        },
      });
    }
    console.log(`Ensured default attendance statuses for: ${institution.name}`);
  }

  await prisma.$disconnect();
}

main().catch(async (error: unknown) => {
  console.error(error);
  const prisma = getPrisma();
  await prisma.$disconnect();
  process.exit(1);
});
