import { getPrisma } from "#infrastructure/database/client";

async function main() {
  const prisma = getPrisma();
  console.log("Seeding roles...");

  const rolesToSeed = [
    {
      name: "superadmin",
      description: "System Owner / Super Administrator",
    },
    {
      name: "admin",
      description: "Institution Administrator",
    },
    {
      name: "teacher",
      description: "Teacher / Instructor",
    },
    {
      name: "student",
      description: "Student User",
    },
  ];

  for (const role of rolesToSeed) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: role,
      });
      console.log(`Created role: ${role.name}`);
    } else {
      console.log(`Role already exists: ${role.name}`);
    }
  }

  console.log("Seeding finished.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  const prisma = getPrisma();
  await prisma.$disconnect();
  process.exit(1);
});
