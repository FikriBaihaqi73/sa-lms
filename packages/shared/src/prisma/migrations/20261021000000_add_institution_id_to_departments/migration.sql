-- AlterTable
ALTER TABLE "Departments" ADD COLUMN "institution_id" UUID;

-- CreateIndex
CREATE INDEX "Departments_institution_id_idx" ON "Departments"("institution_id");

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
