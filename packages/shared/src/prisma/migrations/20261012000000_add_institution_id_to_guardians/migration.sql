-- TASK 0189: Add institution ownership to guardians.
-- Non-destructive: the column is added as NULLABLE so existing guardian rows
-- are preserved without inventing an institution owner. New guardians always
-- receive an institution_id from the authenticated admin at create time.
-- Legacy rows with NULL institution_id are invisible to institution-scoped
-- queries until an explicit data migration assigns them an owner.

-- AlterTable
ALTER TABLE "guardians" ADD COLUMN "institution_id" UUID;

-- CreateIndex
CREATE INDEX "guardians_institution_id_idx" ON "guardians"("institution_id");

-- AddForeignKey
ALTER TABLE "guardians" ADD CONSTRAINT "guardians_institution_id_fkey" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
