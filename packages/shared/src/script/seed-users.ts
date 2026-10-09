import { getPrisma } from "#infrastructure/database/client";
import bcrypt from "bcrypt";

async function main() {
  const prisma = getPrisma();
  console.log("Seeding users...");

  // Password plaintext yang mudah dibaca di kode
  const plainPassword = "password123";

  // Di-hash secara dinamis saat seed dijalankan agar masuk ke DB dalam bentuk hash bcrypt yang valid
  const defaultPasswordHash = await bcrypt.hash(plainPassword, 10);

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

  // 3. Create or update user for each role
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
      console.log(
        `Created user with role ${role.name}: ${email} (Password: ${plainPassword})`,
      );
    } else {
      await prisma.users.update({
        where: { id: existingUser.id },
        data: {
          password: defaultPasswordHash,
          is_active: true,
        },
      });
      console.log(
        `Updated password for role ${role.name}: ${email} (Password: ${plainPassword})`,
      );
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
