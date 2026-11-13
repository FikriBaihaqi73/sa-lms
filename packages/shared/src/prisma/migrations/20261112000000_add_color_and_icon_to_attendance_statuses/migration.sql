-- AlterTable
ALTER TABLE "attendance_statuses" ADD COLUMN "color" VARCHAR(7) NOT NULL DEFAULT '#2563EB',
ADD COLUMN "icon" VARCHAR(50) NOT NULL DEFAULT 'check';

