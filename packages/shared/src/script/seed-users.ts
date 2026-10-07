import { getPrisma } from "#infrastructure/database/client";


async function main() {
  const prisma = getPrisma();
  console.log("Seeding users...");

  // Default hash for 'password123' (bcrypt cost 10, verified with bcrypt.compare)
  const defaultPasswordHash =
    "$2b$10$Kfyik960ud5bgYIvzQnqj.5CPfOakYB0Y69Ta6JIoN5UqG6AQra66";

  // 1. Ensure at least one Institution exists
  let institution = await prisma.institution.findFirst();
  if (!institution) {
    institution = await prisma.institution.create({
      data: {
        name: "Default Institution",
        email: "contact@default.edu",
        address: "123 Default Street",
        phoneNumber: "1234567890",
        website: "www.default.edu",
      },
    });
    console.log(`Created default institution: ${institution.name}`);
  }

  // 2. Fetch all roles
  const roles = await prisma.role.findMany();
  if (roles.length === 0) {
    console.warn("No roles found. Please run seed-roles.ts first.");
    await prisma.$disconnect();
    return;
  }

  // 3. Create a user for each role
  for (const role of roles) {
    const email = `${role.name}@example.com`;
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Use transaction to ensure both Users and Profile are created together
      await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            email,
            password: defaultPasswordHash,
            is_active: true,
          },
        });

        await tx.profile.create({
          data: {
            userId: user.id,
            institutionId: institution!.id,
            roleId: role.id,
            fullName: `${role.name.charAt(0).toUpperCase() + role.name.slice(1)} User`,
            email: user.email,
          },
        });
      });
      console.log(`Created user with role ${role.name}: ${email} (Password: password123)`);
    } else {
      console.log(`User already exists for role ${role.name}: ${email}`);
    }
  }

  console.log("User seeding finished.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  const prisma = getPrisma();
  await prisma.$disconnect();
  process.exit(1);
});
