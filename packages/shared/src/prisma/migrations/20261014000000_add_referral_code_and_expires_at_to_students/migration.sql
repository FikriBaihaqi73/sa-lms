-- TASK 0201: Add referral code and expiration date to students table.
-- Non-destructive: columns are nullable so existing student records are preserved.

-- AlterTable
ALTER TABLE "students" ADD COLUMN "referral_code" VARCHAR(100);
ALTER TABLE "students" ADD COLUMN "referral_expires_at" TIMESTAMP;
