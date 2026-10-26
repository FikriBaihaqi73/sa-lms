-- DropForeignKey
ALTER TABLE "Teachers" DROP CONSTRAINT "Teachers_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "students" DROP CONSTRAINT "students_profile_id_fkey";

-- AlterTable
ALTER TABLE "Teachers" ALTER COLUMN "profile_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "profile_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Teachers" ADD CONSTRAINT "Teachers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
